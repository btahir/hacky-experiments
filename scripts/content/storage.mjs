import { createHash } from 'node:crypto'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { S3Client, HeadObjectCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { mediaAssetSchema, normalizeMediaBaseUrl, resolveMediaUrl } from '../../lib/content/core.mjs'
import { requiredEnv, root } from './env.mjs'

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

export function createStorage() {
  const endpoint = process.env.R2_ENDPOINT || `https://${requiredEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`
  const url = new URL(endpoint)
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('R2_ENDPOINT must be an HTTPS origin without credentials, paths or query parameters')
  }
  return {
    bucket: requiredEnv('R2_PUBLIC_BUCKET'),
    client: new S3Client({
      region: 'auto', endpoint,
      credentials: { accessKeyId: requiredEnv('R2_ACCESS_KEY_ID'), secretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY') },
      maxAttempts: 3,
    }),
  }
}

function storageError(operation, error) {
  // Never print SDK request objects, signed URLs or credentials.
  const code = /^[A-Za-z0-9]+$/.test(error.name || '') ? error.name : 'StorageError'
  return new Error(`${operation} failed: ${code}${error.$metadata?.httpStatusCode ? ` (HTTP ${error.$metadata.httpStatusCode})` : ''}`)
}

export function validateBytes(asset, bytes) {
  mediaAssetSchema.parse(asset)
  if (bytes.length !== asset.size || sha256(bytes) !== asset.sha256) {
    throw new Error(`Image bytes do not match the manifest: ${asset.key}`)
  }
}

export async function localBytes(asset) {
  mediaAssetSchema.parse(asset)
  for (const directory of ['.content-local/assets', 'public/media']) {
    try {
      const bytes = await readFile(path.join(root, directory, asset.key))
      validateBytes(asset, bytes)
      return bytes
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  throw new Error(`Missing local image ${asset.key}; import, add or pull the asset first`)
}

export async function uploadAsset(storage, asset) {
  const bytes = await localBytes(asset)
  let existing
  try { existing = await storage.client.send(new HeadObjectCommand({ Bucket: storage.bucket, Key: asset.key })) }
  catch (error) { if (error.$metadata?.httpStatusCode !== 404) throw storageError('Read image metadata', error) }
  if (existing) {
    if (existing.Metadata?.sha256 !== asset.sha256 || existing.ContentLength !== asset.size) {
      throw new Error(`Refusing to overwrite an existing image with different bytes: ${asset.key}`)
    }
  } else {
    try {
      await storage.client.send(new PutObjectCommand({
        Bucket: storage.bucket, Key: asset.key, Body: bytes,
        ContentType: asset.contentType, CacheControl: 'public, max-age=31536000, immutable',
        Metadata: { sha256: asset.sha256 }, IfNoneMatch: '*',
      }))
    } catch (error) { throw storageError('Upload image', error) }
  }
  try {
    const stored = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: asset.key }))
    validateBytes(asset, await stored.Body.transformToByteArray())
  } catch (error) { throw storageError('Verify stored image', error) }
  return { key: asset.key, result: existing ? 'already-uploaded' : 'uploaded', verified: true }
}

export async function publicBytes(asset) {
  mediaAssetSchema.parse(asset)
  const base = normalizeMediaBaseUrl(requiredEnv('NEXT_PUBLIC_MEDIA_BASE_URL'))
  if (!base.startsWith('https://')) throw new Error('Public media verification requires an HTTPS media base URL')
  const response = await fetch(resolveMediaUrl(asset.key, base), { redirect: 'error', signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`Public image returned HTTP ${response.status}: ${asset.key}`)
  const type = response.headers.get('content-type')?.split(';')[0]
  if (type !== asset.contentType) throw new Error(`Wrong public content type for ${asset.key}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  validateBytes(asset, bytes)
  return bytes
}

export async function downloadAsset(storage, asset) {
  mediaAssetSchema.parse(asset)
  let bytes
  try {
    const stored = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: asset.key }))
    bytes = await stored.Body.transformToByteArray()
  } catch (error) { throw storageError('Download image', error) }
  validateBytes(asset, bytes)
  return bytes
}

export async function stageLocalAsset(asset, bytes, { backup = true } = {}) {
  validateBytes(asset, bytes)
  for (const directory of backup ? ['.content-local/assets', 'public/media'] : ['public/media']) {
    const target = path.join(root, directory, asset.key)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, bytes)
  }
}

export async function mapAssets(assets, action) {
  const entries = Object.entries(assets)
  const results = []
  let cursor = 0
  await Promise.all(Array.from({ length: Math.min(4, entries.length) }, async () => {
    while (cursor < entries.length) {
      const [id, asset] = entries[cursor++]
      results.push({ id, ...await action(asset) })
    }
  }))
  return results.sort((a, b) => a.id.localeCompare(b.id))
}
