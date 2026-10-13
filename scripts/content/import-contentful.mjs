#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { chmod, lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { assembleExperiments, experimentSlugSchema, parseExperimentDocument, parseMediaManifest } from '../../lib/content/core.mjs'
import { richTextToMarkdown } from './converter.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const EXTENSIONS = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' }

function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`)
  return value
}

function safeId(value, label) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(value)) throw new Error(`${label} must be a safe identifier`)
  return value
}

export function serializeExperiment(metadata, body) {
  const frontmatter = Object.entries(metadata).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')
  const output = `---\n${frontmatter}\n---\n\n${body.trimEnd()}\n`
  parseExperimentDocument(output, `${metadata.slug}.md`)
  return output
}

async function ensureParentsWithin(directory, rootDir) {
  const root = path.resolve(rootDir)
  const relative = path.relative(root, directory)
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('Export destination escapes the selected repository')
  let current = root
  for (const segment of ['', ...relative.split(path.sep).filter(Boolean)]) {
    if (segment) {
      current = path.join(current, segment)
      await mkdir(current, { recursive: true })
    }
    const stat = await lstat(current)
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Export directories must not be symlinks')
  }
}

export async function writeUnchangedOrNew(filename, bytes, { overwrite = false, mode = 0o644, rootDir } = {}) {
  if (rootDir) await ensureParentsWithin(path.dirname(filename), rootDir)
  let existing
  try {
    const stat = await lstat(filename)
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${path.basename(filename)} is not a regular file`)
    existing = await readFile(filename)
  } catch (error) { if (error.code !== 'ENOENT') throw error }
  const data = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes)
  if (existing?.equals(data)) return false
  if (existing && !overwrite) throw new Error(`${path.basename(filename)} differs from the export; review it and use --overwrite explicitly`)
  await mkdir(path.dirname(filename), { recursive: true })
  await writeFile(filename, data, { mode })
  await chmod(filename, mode)
  return true
}

async function ensureDirectory(directory, mode = 0o755, rootDir = ROOT) {
  await ensureParentsWithin(directory, rootDir)
  await mkdir(directory, { recursive: true, mode })
  const stat = await lstat(directory)
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Export directories must not be symlinks')
  await chmod(directory, mode)
}

async function getJson(url, token) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, redirect: 'error', signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`Contentful read failed with HTTP ${response.status}`)
  return response.json()
}

function originalAssetUrl(file) {
  const raw = requireString(file.url, 'Asset URL')
  const url = new URL(raw.startsWith('//') ? `https:${raw}` : raw)
  if (url.protocol !== 'https:' || url.username || url.password || !/^(images|assets|downloads)\.(ctfassets\.net|contentful\.com)$/.test(url.hostname)) {
    throw new Error('Asset source must be a public Contentful HTTPS CDN URL')
  }
  return url.href
}

function assertNoContentfulMedia(body, slug) {
  if (/(?:images|assets|downloads|videos)\.(?:ctfassets\.net|contentful\.com)/i.test(body)) {
    throw new Error(`${slug}: Body contains a Contentful CDN link that requires an explicit asset mapping`)
  }
}

export async function importContentful({ rootDir = ROOT, expectedCount, overwrite = false } = {}) {
  const envPath = path.join(rootDir, '.env.local')
  try {
    const stat = await lstat(envPath)
    if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077)) throw new Error('.env.local must be a regular file with mode 600')
    process.loadEnvFile(envPath)
  } catch (error) { if (error.code !== 'ENOENT') throw error }
  const space = safeId(process.env.CONTENTFUL_SPACE_ID, 'CONTENTFUL_SPACE_ID')
  const environment = safeId(process.env.CONTENTFUL_ENVIRONMENT || 'master', 'CONTENTFUL_ENVIRONMENT')
  const contentType = safeId(process.env.CONTENTFUL_CONTENT_TYPE || 'hackyBlog', 'CONTENTFUL_CONTENT_TYPE')
  const locale = process.env.CONTENTFUL_LOCALE || 'en-US'
  const token = requireString(process.env.CONTENTFUL_ACCESS_TOKEN, 'CONTENTFUL_ACCESS_TOKEN')
  const endpoint = `https://cdn.contentful.com/spaces/${space}/environments/${environment}`
  const entries = []
  const assets = new Map()
  const pages = []
  let total
  do {
    const url = new URL(`${endpoint}/entries`)
    for (const [key, value] of Object.entries({ content_type: contentType, locale, include: '1', limit: '1000', skip: String(entries.length), order: 'sys.id' })) url.searchParams.set(key, value)
    const page = await getJson(url, token)
    if (!Number.isSafeInteger(page.total) || !Array.isArray(page.items)) throw new Error('Contentful returned a malformed collection')
    if (total !== undefined && total !== page.total) throw new Error('Contentful collection changed during export; run again')
    total = page.total
    if (!page.items.length && entries.length < total) throw new Error('Contentful pagination stopped before all entries were read')
    entries.push(...page.items)
    for (const asset of page.includes?.Asset || []) assets.set(asset.sys.id, asset)
    pages.push(page)
  } while (entries.length < total)
  if (!entries.length || entries.length !== total || (expectedCount !== undefined && entries.length !== expectedCount)) {
    throw new Error(`Published experiment count mismatch: received ${entries.length}, expected ${expectedCount ?? total}`)
  }

  const local = path.join(rootDir, '.content-local')
  await ensureDirectory(local, 0o700, rootDir)
  await ensureDirectory(path.join(local, 'contentful'), 0o700, rootDir)
  await ensureDirectory(path.join(local, 'assets'), 0o700, rootDir)
  await ensureDirectory(path.join(rootDir, 'content'), 0o755, rootDir)
  await ensureDirectory(path.join(rootDir, 'content', 'experiments'), 0o755, rootDir)
  await ensureDirectory(path.join(rootDir, 'public', 'media'), 0o755, rootDir)

  // Raw provider data and old CDN URLs are kept only in ignored export evidence.
  await writeUnchangedOrNew(path.join(local, 'contentful', 'published.json'), `${JSON.stringify({ pages }, null, 2)}\n`, { overwrite, mode: 0o600, rootDir })
  const documents = []
  const markdownFiles = []
  const media = { version: 1, assets: {} }
  const mapping = []
  const normalizations = []
  let totalBytes = 0
  for (const entry of entries) {
    const fields = entry.fields || {}
    const id = safeId(entry.sys?.id, 'Entry ID')
    const slug = experimentSlugSchema.parse(fields.slug)
    if (entry.sys?.contentType?.sys?.id !== contentType) throw new Error(`${slug}: Wrong Contentful content type`)
    const heroId = safeId(fields.heroImage?.sys?.id, `${slug} hero ID`)
    let hero = assets.get(heroId)
    if (!hero) {
      const url = new URL(`${endpoint}/assets/${heroId}`)
      url.searchParams.set('locale', locale)
      hero = await getJson(url, token)
      assets.set(heroId, hero)
    }
    const file = hero.fields?.file
    if (!file || !EXTENSIONS[file.contentType]) throw new Error(`${slug}: Unsupported or missing hero image`)
    const oldUrl = originalAssetUrl(file)
    let assetRecord = media.assets[heroId]
    if (!assetRecord) {
      const response = await fetch(oldUrl, { redirect: 'error', signal: AbortSignal.timeout(60000) })
      if (!response.ok) throw new Error(`${slug}: Asset download failed with HTTP ${response.status}`)
      const bytes = Buffer.from(await response.arrayBuffer())
      if (bytes.length !== file.details?.size) throw new Error(`${slug}: Downloaded asset size differs from Contentful metadata`)
      const measured = await sharp(bytes, { animated: true }).metadata()
      const width = measured.width
      const height = measured.pageHeight || measured.height
      if (file.details?.image && (width !== file.details.image.width || height !== file.details.image.height)) throw new Error(`${slug}: Downloaded image dimensions differ from Contentful metadata`)
      if (!file.details?.image) normalizations.push({ slug, kind: 'derive-image-dimensions', assetId: heroId, width, height })
      if (measured.mediaType !== file.contentType) throw new Error(`${slug}: Downloaded image format differs from Contentful metadata`)
      const sha256 = createHash('sha256').update(bytes).digest('hex')
      const key = `experiments/${slug}/hero.${sha256.slice(0, 16)}.${EXTENSIONS[file.contentType]}`
      assetRecord = { key, fileName: file.fileName, contentType: file.contentType, size: bytes.length, sha256, width, height,
        title: hero.fields.title || '', description: hero.fields.description || '', status: 'published' }
      media.assets[heroId] = assetRecord
      const localAsset = path.join(local, 'assets', key)
      await writeUnchangedOrNew(localAsset, bytes, { overwrite, mode: 0o600, rootDir })
      const previewAsset = path.join(rootDir, 'public', 'media', key)
      await writeUnchangedOrNew(previewAsset, bytes, { overwrite, rootDir })
      totalBytes += bytes.length
      mapping.push({ id: heroId, oldUrl, key, sha256 })
    }
    const body = richTextToMarkdown(fields.body, { onNormalization: (item) => normalizations.push({ slug, ...item }) })
    assertNoContentfulMedia(body, slug)
    const metadata = { id, title: fields.title, slug, description: fields.description, publishDate: fields.publishDate, status: 'published', heroImage: heroId }
    const markdown = serializeExperiment(metadata, body)
    documents.push(parseExperimentDocument(markdown, `${slug}.md`))
    markdownFiles.push({ filename: path.join(rootDir, 'content', 'experiments', `${slug}.md`), markdown })
  }
  parseMediaManifest(media)
  assembleExperiments(documents, media)
  const exportedNames = new Set(markdownFiles.map(({ filename }) => path.basename(filename)))
  for (const name of await readdir(path.join(rootDir, 'content', 'experiments'))) {
    if (name !== '.gitkeep' && !exportedNames.has(name)) throw new Error(`${name} is absent from the published export; review and archive it explicitly before importing`)
  }
  // Check all existing content before writing any Markdown, so overwrite refusal
  // cannot leave half the collection updated.
  for (const { filename, markdown } of markdownFiles) {
    try {
      const previous = await readFile(filename, 'utf8')
      if (previous !== markdown && !overwrite) throw new Error(`${path.basename(filename)} differs from the export; use --overwrite explicitly`)
    } catch (error) { if (error.code !== 'ENOENT') throw error }
  }
  const manifestText = `${JSON.stringify(media, null, 2)}\n`
  const manifestPath = path.join(rootDir, 'content', 'media.json')
  try {
    const previous = await readFile(manifestPath, 'utf8')
    if (previous !== manifestText && !overwrite) throw new Error('content/media.json differs from the export; use --overwrite explicitly')
  } catch (error) { if (error.code !== 'ENOENT') throw error }
  for (const { filename, markdown } of markdownFiles) await writeUnchangedOrNew(filename, markdown, { overwrite, rootDir })
  await writeUnchangedOrNew(manifestPath, manifestText, { overwrite, rootDir })
  await writeUnchangedOrNew(path.join(local, 'contentful', 'asset-map.json'), `${JSON.stringify(mapping, null, 2)}\n`, { overwrite, mode: 0o600, rootDir })
  const report = { experiments: documents.length, assets: Object.keys(media.assets).length, bytes: totalBytes, slugs: documents.map((document) => document.slug).sort(), normalizations }
  await writeUnchangedOrNew(path.join(local, 'contentful', 'import-report.json'), `${JSON.stringify(report, null, 2)}\n`, { overwrite, mode: 0o600, rootDir })
  return report
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  let expectedCount
  let overwrite = false
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--overwrite') overwrite = true
    else if (args[index] === '--expected-count') {
      expectedCount = Number(args[++index])
      if (!Number.isSafeInteger(expectedCount) || expectedCount < 1) throw new Error('--expected-count requires a positive integer')
    } else throw new Error('Usage: node scripts/content/import-contentful.mjs [--expected-count N] [--overwrite]')
  }
  try {
    const report = await importContentful({ expectedCount, overwrite })
    console.log(JSON.stringify({ experiments: report.experiments, assets: report.assets, bytes: report.bytes, previewMedia: 'public/media' }, null, 2))
  } catch (error) {
    console.error(`Import failed: ${error.message}`)
    process.exitCode = 1
  }
}
