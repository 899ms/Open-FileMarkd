import { S3Client } from '@aws-sdk/client-s3'

export interface R2Config {
  client: S3Client
  bucketName: string
  publicUrl?: string
}

let client: S3Client | null = null

/** Returns the configured R2 client without throwing during build-time imports. */
export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
  const bucketName = process.env.R2_BUCKET_NAME?.trim()

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return null
  }

  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  const publicUrl = process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, '')

  return { client, bucketName, publicUrl: publicUrl || undefined }
}
