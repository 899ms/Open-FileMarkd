import { PutObjectCommand } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import { getR2Config } from '@/lib/r2'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { expireSubscriptionIfNeeded } from '@/lib/subscription'
import { getUploadLimitBytes } from '@/lib/upload-limits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_EXTENSIONS = new Set([
  'pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'csv', 'txt', 'epub',
  'xml', 'rtf', 'odt', 'bib', 'fb2', 'ipynb', 'tex', 'opml', 'jpg', 'jpeg',
  'png', 'avif', 'tiff', 'gif', 'heic', 'bmp', 'webp',
])

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/rtf',
  'application/epub+zip',
  'application/json',
  'application/xml',
  'application/vnd.apple.inst+xml',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'text/xml',
  'image/jpeg',
  'image/png',
  'image/avif',
  'image/tiff',
  'image/gif',
  'image/heic',
  'image/bmp',
  'image/webp',
])

function errorResponse(error: string, status: number, details: Record<string, unknown> = {}) {
  return NextResponse.json({ success: false, error, ...details }, { status })
}

function safeFileName(name: string) {
  const normalized = name.normalize('NFKC').replace(/[^a-zA-Z0-9._-]/g, '_')
  return normalized.replace(/\.{2,}/g, '.').replace(/^\.+/, '').slice(0, 120) || 'file'
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return errorResponse('unauthorized', 401)
  }

  await expireSubscriptionIfNeeded(session.user.id)

  const user = await db
    .select({
      subscriptionStatus: users.subscriptionStatus,
      subscriptionPlan: users.subscriptionPlan,
      subscriptionCurrentPeriodEnd: users.subscriptionCurrentPeriodEnd,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user[0]) {
    return errorResponse('user_not_found', 404)
  }

  const maxFileSize = getUploadLimitBytes(user[0])
  const r2 = getR2Config()
  if (!r2) {
    return errorResponse('r2_not_configured', 503)
  }

  const contentLength = Number(request.headers.get('content-length'))
  // Allow a small multipart envelope overhead while rejecting obviously
  // oversized requests before formData() buffers the body.
  if (Number.isFinite(contentLength) && contentLength > maxFileSize + 2 * 1024 * 1024) {
    return errorResponse('file_too_large', 413, { maxFileSize })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return errorResponse('invalid_multipart_body', 400)
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return errorResponse('file_required', 400)
  }

  if (file.size <= 0) {
    return errorResponse('empty_file', 400)
  }

  if (file.size > maxFileSize) {
    return errorResponse('file_too_large', 413, { maxFileSize })
  }

  const originalName = file.name || 'file'
  const extension = originalName.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_EXTENSIONS.has(extension) && !ALLOWED_MIME_TYPES.has(file.type)) {
    return errorResponse('unsupported_file_type', 415)
  }

  const filename = safeFileName(originalName)
  const datePrefix = new Date().toISOString().slice(0, 10)
  const key = `uploads/${datePrefix}/${crypto.randomUUID()}-${filename}`

  try {
    const body = Buffer.from(await file.arrayBuffer())
    const uploaded = await r2.client.send(new PutObjectCommand({
      Bucket: r2.bucketName,
      Key: key,
      Body: body,
      ContentLength: body.byteLength,
      ContentType: file.type || 'application/octet-stream',
      Metadata: {
        originalName: filename,
        uploadedAt: new Date().toISOString(),
      },
    }))

    return NextResponse.json({
      success: true,
      key,
      size: body.byteLength,
      etag: uploaded.ETag || null,
      url: r2.publicUrl ? `${r2.publicUrl}/${key}` : null,
    })
  } catch (error) {
    console.error('R2 upload failed:', error)
    return errorResponse('upload_failed', 502)
  }
}
