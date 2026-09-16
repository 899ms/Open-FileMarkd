/**
 * Mistral client singleton for OCR operations.
 * Reads MISTRAL_API_KEY from env; MISTRAL_OCR_MODEL is passed per-request.
 */
import { Mistral } from '@mistralai/mistralai'

let _client: Mistral | null = null

export function getMistralClient(): Mistral | null {
  const apiKey = process.env.MISTRAL_API_KEY?.trim()
  if (!apiKey) return null
  if (!_client) {
    _client = new Mistral({ apiKey })
  }
  return _client
}

export const MISTRAL_OCR_MODEL =
  process.env.MISTRAL_OCR_MODEL?.trim() ?? 'mistral-ocr-latest'

export const IS_MOCK =
  process.env.MISTRAL_OCR_MOCK === 'true' ||
  !process.env.MISTRAL_API_KEY?.trim()
