/**
 * POST /api/convert — Document-to-Markdown OCR conversion via Mistral.
 *
 * Accepts three document sources (at least one must be provided):
 *   • fileData  — inline base64 data URL (image, pdf, office file encoded as data:)
 *   • rawText   — plain-text string (text/source files)
 *   • documentUrl — public HTTPS URL
 *   • fileUrl   — already-uploaded R2 public URL (no SSRF check needed)
 *
 * Authentication: session required.
 * Points: balance is checked up-front, but only deducted on successful conversion
 * (based on actual pages_processed). Failed / mock / unconfigured conversions cost 0.
 *
 * Error codes documented in README:
 *   400 invalid_json | unsupported_source_type | document_required
 *   401 unauthorized
 *   402 points_insufficient
 *   413 url_too_large
 *   415 unsupported_url_format
 *   422 invalid_url | url_blocked | url_unreachable | document_url_required
 *   503 mistral_not_configured | conversion_failed
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { expireSubscriptionIfNeeded } from '@/lib/subscription'
import { getMistralClient, MISTRAL_OCR_MODEL, IS_MOCK } from '@/lib/mistral'
import { deductPoints, PointsAction } from '@/lib/points'
import type { BlockAnalysis } from '@/components/newhome/ConversionWorkspace'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

type SourceType = 'image' | 'pdf' | 'text' | 'document'

interface ConvertPayload {
  fileName?: string
  fileSize?: number
  mimeType?: string
  sourceType?: SourceType
  /** Inline base64 data URL (image, pdf, office). */
  fileData?: string
  /** Raw text string for plain-text uploads. */
  rawText?: string
  /** Remote URL to download. */
  documentUrl?: string
  /** Pre-signed / R2 public URL (already uploaded). */
  fileUrl?: string
  pageCount?: number
  /** Internal: R2 upload key (not used for OCR). */
  uploadKey?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function error(code: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: code, ...extra }, { status })
}

const SSRF_BLOCKED_HOSTS = new Set([
  'localhost', '127.0.0.1', '0.0.0.0', '::1',
  '169.254.169.254',  // AWS metadata
  'metadata.google.internal', 'metadata.goog',
  '100.100.100.100',  // Azure metadata
])

const MAX_URL_BYTES = 50 * 1024 * 1024 // 50 MB
const POINTS_PER_PAGE = 1

function inferSourceType(fileName: string): SourceType {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg', 'jpeg', 'png', 'avif', 'tiff', 'gif', 'heic', 'bmp', 'webp'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['txt', 'md', 'tex', 'csv', 'xml', 'json', 'epub', 'rtf', 'odt', 'bib', 'fb2', 'ipynb', 'opml'].includes(ext)) return 'text'
  return 'document'
}

function estimatePages(fileSize: number, sourceType: SourceType): number {
  if (sourceType === 'image') return 1
  if (sourceType === 'text') return 1
  if (sourceType === 'pdf') return Math.max(1, Math.round(fileSize / (80 * 1024)))
  return 1
}

async function probeUrlSize(url: string): Promise<number | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(url, {
      method: 'HEAD',
      signal: ctrl.signal,
      redirect: 'follow',
    })
    clearTimeout(timer)
    const cl = res.headers.get('content-length')
    if (cl) return Number(cl)

    // HEAD may not support range; fallback to GET first 1 MB
    const res2 = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-1048575' },
      signal: AbortSignal.timeout(8000),
    })
    const contentRange = res2.headers.get('content-range')
    if (contentRange) {
      const total = contentRange.split('/').pop()
      if (total && total !== '*') return Number(total)
    }
    const received = Number(res2.headers.get('content-length')) || 0
    if (received > 0) return received
    // All else: read body partially
    const buf = await res2.arrayBuffer()
    return buf.byteLength
  } catch {
    return null
  }
}

function isUrlAllowed(url: string): boolean {
  try {
    const u = new URL(url)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    if (SSRF_BLOCKED_HOSTS.has(u.hostname.toLowerCase())) return false
    return true
  } catch {
    return false
  }
}

// ─── Mock output (used when MISTRAL_OCR_MOCK=true or no API key) ─────────────

function mockResult(payload: ConvertPayload) {
  const fileName = payload.fileName ?? 'document'
  const sourceType = payload.sourceType ?? inferSourceType(fileName)
  const pages = payload.pageCount ?? estimatePages(payload.fileSize ?? 0, sourceType)

  const mockMarkdown = sourceType === 'text'
    ? (payload.rawText ?? '')
    : `# ${fileName}\n\n> Mock OCR output — set ` +
      `\`MISTRAL_API_KEY\` to enable real conversion.\n\n` +
      `Document: **${fileName}**\n` +
      `Type: ${sourceType}\n` +
      `Estimated pages: ${pages}\n`

  const avgConf = 0.94 + Math.random() * 0.05
  return {
    pages: [{
      index: 0,
      markdown: mockMarkdown,
      images: [],
      dimensions: null,
      blocks: null,
      confidenceScores: null,
    }],
    model: MISTRAL_OCR_MODEL,
    usageInfo: { pagesProcessed: pages },
    result: buildResult(mockMarkdown, avgConf, fileName, sourceType, pages),
  }
}

// ─── Result builder ───────────────────────────────────────────────────────────

function buildResult(
  markdown: string,
  avgConfidence: number,
  fileName: string,
  sourceType: SourceType,
  pageCount: number,
  mistralBlocks?: unknown[],
): {
  id: string
  fileName: string
  fileSize: number
  format: string
  markdownText: string
  confidence: number
  wordCount: number
  charCount: number
  readingTimeMinutes: number
  blocksCount: { headers: number; paragraphs: number; tables: number; equations: number; lists: number }
  blocks: BlockAnalysis[]
  detectedLanguage: string
  timeElapsedMs: number
  sourceType: SourceType
} {
  const words = markdown.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const charCount = markdown.length
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200))

  const blocks: BlockAnalysis[] = []
  let headers = 0, paragraphs = 0, tables = 0, equations = 0, lists = 0

  if (mistralBlocks && Array.isArray(mistralBlocks)) {
    let order = 1
    for (const b of mistralBlocks) {
      const block = b as { type?: string; content?: string; confidence_scores?: { average_block_confidence_score?: number } }
      const rawType = block.type ?? 'text'
      const label: BlockAnalysis['type'] =
        rawType === 'title' || rawType === 'header'
          ? 'Header'
          : rawType === 'equation'
          ? 'Equation'
          : rawType === 'table'
          ? 'Table'
          : rawType === 'list'
          ? 'List'
          : rawType === 'code'
          ? 'Code'
          : rawType === 'footer' || rawType === 'signature' || rawType === 'image'
          ? 'Metadata'
          : 'Paragraph'

      blocks.push({
        id: `b${order}`,
        type: label as BlockAnalysis['type'],
        readingOrder: order++,
        confidence: block.confidence_scores?.average_block_confidence_score ?? avgConfidence,
        content: block.content ?? '',
      })

      if (label === 'Header') headers++
      else if (label === 'Paragraph') paragraphs++
      else if (label === 'Table') tables++
      else if (label === 'Equation') equations++
      else if (label === 'List') lists++
    }
  } else {
    // Fallback: parse markdown for approximate block analysis
    const lines = markdown.split('\n')
    let order = 1
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      if (/^#{1,6}\s/.test(trimmed)) {
        blocks.push({ id: `b${order}`, type: 'Header', readingOrder: order++, confidence: avgConfidence, content: trimmed })
        headers++
      } else if (/^\|.+\|$/.test(trimmed)) {
        blocks.push({ id: `b${order}`, type: 'Table', readingOrder: order++, confidence: avgConfidence, content: trimmed })
        tables++
      } else if (/^\$[\s\S]*?\$|^\$\$[\s\S]*?\$\$$/.test(trimmed)) {
        blocks.push({ id: `b${order}`, type: 'Equation', readingOrder: order++, confidence: avgConfidence, content: trimmed })
        equations++
      } else if (/^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
        blocks.push({ id: `b${order}`, type: 'List', readingOrder: order++, confidence: avgConfidence, content: trimmed })
        lists++
      } else {
        blocks.push({ id: `b${order}`, type: 'Paragraph', readingOrder: order++, confidence: avgConfidence, content: trimmed })
        paragraphs++
      }
    }
  }

  const ext = fileName.split('.').pop()?.toUpperCase() ?? 'DOC'
  return {
    id: crypto.randomUUID(),
    fileName,
    fileSize: 0,
    format: ext,
    markdownText: markdown,
    confidence: Math.min(1, avgConfidence),
    wordCount,
    charCount,
    readingTimeMinutes,
    blocksCount: { headers, paragraphs, tables, equations, lists },
    blocks,
    detectedLanguage: 'auto',
    timeElapsedMs: Math.round(400 + pageCount * 200),
    sourceType,
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Auth
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return error('unauthorized', 401)
  }

  await expireSubscriptionIfNeeded(session.user.id)

  // 2. Parse body
  let payload: ConvertPayload
  try {
    payload = await request.json()
  } catch {
    return error('invalid_json', 400)
  }

  // 3. Validate document source
  const hasFileData = typeof payload.fileData === 'string' && payload.fileData.length > 0
  const hasRawText = typeof payload.rawText === 'string' && payload.rawText.length > 0
  const hasDocumentUrl = typeof payload.documentUrl === 'string' && payload.documentUrl.length > 0
  const hasFileUrl = typeof payload.fileUrl === 'string' && payload.fileUrl.length > 0

  if (!hasFileData && !hasRawText && !hasDocumentUrl && !hasFileUrl) {
    return error('document_required', 422, {
      message: 'At least one of fileData, rawText, documentUrl, or fileUrl must be provided.',
    })
  }

  const sourceType = payload.sourceType ?? inferSourceType(payload.fileName ?? 'document')

  // 4. URL validation & SSRF checks
  if (hasDocumentUrl) {
    const url = payload.documentUrl!
    if (!isUrlAllowed(url)) {
      return error('invalid_url', 422, { message: 'URL is not allowed or has unsupported extension.' })
    }
    const size = await probeUrlSize(url)
    if (size === null) {
      return error('url_unreachable', 502, { message: 'Could not reach the provided URL.' })
    }
    if (size > MAX_URL_BYTES) {
      return error('url_too_large', 413, {
        message: `URL content (${Math.round(size / 1024 / 1024)} MB) exceeds 50 MB limit.`,
        maxFileSize: MAX_URL_BYTES,
      })
    }
  }

  // 5. Points pre-check
  const userRow = await db
    .select({ points: users.points, giftedPoints: users.giftedPoints, purchasedPoints: users.purchasedPoints })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  const user = userRow[0]
  if (!user) return error('unauthorized', 401)

  const estimatedPages = payload.pageCount ?? estimatePages(payload.fileSize ?? 0, sourceType)
  const estimatedCost = estimatedPages * POINTS_PER_PAGE

  if ((user.points ?? 0) < estimatedCost) {
    return error('points_insufficient', 402, {
      message: `Insufficient points. Required: ${estimatedCost}, Available: ${user.points ?? 0}`,
      required: estimatedCost,
      available: user.points ?? 0,
      estimatedPages,
    })
  }

  // 6. Mock mode (no real API key) — mock is free, no points charged
  if (IS_MOCK) {
    const mock = mockResult(payload)
    return NextResponse.json(mock, { status: 200 })
  }

  // 7. Build Mistral request
  const mistral = getMistralClient()
  if (!mistral) {
    // No points charged — client is not configured
    return error('mistral_not_configured', 503)
  }

  let document: Record<string, unknown>
  if (hasFileData) {
    document = { type: 'document_url', documentUrl: payload.fileData, documentName: payload.fileName }
  } else if (hasRawText) {
    // For plain text, just return as-is and charge POINTS_PER_PAGE on success
    const textResult = {
      pages: [{
        index: 0,
        markdown: payload.rawText!,
        images: [],
        dimensions: null,
        blocks: null,
        confidenceScores: null,
      }],
      model: MISTRAL_OCR_MODEL,
      usageInfo: { pagesProcessed: 1 },
    }
    await deductPoints(
      session.user.id,
      POINTS_PER_PAGE,
      `AI smart conversion (${payload.fileName ?? 'text'})`,
      PointsAction.AI_CONVERSION,
    )
    return NextResponse.json({
      ...textResult,
      result: buildResult(payload.rawText!, 1.0, payload.fileName ?? 'text', 'text', 1),
    })
  } else if (hasDocumentUrl) {
    document = { type: 'document_url', documentUrl: payload.documentUrl!, documentName: payload.fileName }
  } else {
    document = { type: 'document_url', documentUrl: payload.fileUrl!, documentName: payload.fileName }
  }

  // 9. Call Mistral OCR
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ocrResponse: any
  try {
    ocrResponse = await mistral.ocr.process({
      model: MISTRAL_OCR_MODEL,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document: document as any,
      // Request per-page blocks for block-level analysis
      includeBlocks: true,
      // Extract headers/footers separately
      extractHeader: true,
      extractFooter: true,
    })
  } catch (err) {
    console.error('[convert] Mistral OCR error:', err)
    // No points charged — conversion failed
    return error('conversion_failed', 503, {
      message: err instanceof Error ? err.message : 'Unknown Mistral error',
    })
  }

  // Handle the response which may be in Result form
  let result: { pages: unknown[]; model: string; usageInfo: { pagesProcessed: number } }
  if (ocrResponse && typeof ocrResponse === 'object' && 'ok' in (ocrResponse as object)) {
    const r = ocrResponse as { ok: boolean; value?: unknown; error?: unknown }
    if (!r.ok) {
      const errMsg = r.error instanceof Error ? r.error.message : String(r.error)
      // No points charged — conversion failed
      return error('conversion_failed', 503, { message: errMsg })
    }
    result = r.value as typeof result
  } else {
    result = ocrResponse as typeof result
  }

  // 9. Final points charge — only on successful conversion
  const actualPages = result.usageInfo?.pagesProcessed ?? estimatedPages
  const actualCost = actualPages * POINTS_PER_PAGE

  await deductPoints(
    session.user.id,
    actualCost,
    `AI smart conversion (${actualPages} pages, ${payload.fileName ?? 'document'})`,
    PointsAction.AI_CONVERSION,
  )

  // 11. Build response
  const allMarkdown = (result.pages as Array<{ markdown?: string }>)
    .map(p => p.markdown ?? '')
    .join('\n\n---\n\n')

  const pageConfidences = (result.pages as Array<{ confidenceScores?: { averagePageConfidenceScore?: number } }>)
    .map(p => p.confidenceScores?.averagePageConfidenceScore ?? 0.97)
  const avgConfidence = pageConfidences.length
    ? pageConfidences.reduce((a, b) => a + b, 0) / pageConfidences.length
    : 0.97

  const allBlocks = (result.pages as Array<{ blocks?: unknown[] }>)
    .flatMap(p => p.blocks ?? [])

  const fileName = payload.fileName ?? 'document'

  return NextResponse.json({
    pages: result.pages,
    model: result.model,
    usageInfo: result.usageInfo,
    // Full Mistral pages (with headers, footers, blocks, tables, images)
    _mistralPages: result.pages,
    result: buildResult(allMarkdown, avgConfidence, fileName, sourceType, actualPages, allBlocks),
  })
}

