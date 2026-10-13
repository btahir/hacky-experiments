import { lstat, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'

const identifier = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/)
export const experimentSlugSchema = z.string().max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const nonEmptyText = z.string().refine((value) => value.trim().length > 0, 'Must not be blank')

// Date.parse accepts impossible dates such as February 30. Check calendar fields
// separately and require a timezone so publication metadata never depends on the host.
function isTimestamp(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(Z|[+-](\d{2}):(\d{2}))$/.exec(value)
  if (!match) return false
  const [, year, month, day, hour, minute, second, zone, zoneHour, zoneMinute] = match
  const y = Number(year)
  const m = Number(month)
  const days = [31, y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return y > 0 && m >= 1 && m <= 12 && Number(day) >= 1 && Number(day) <= days[m - 1]
    && Number(hour) < 24 && Number(minute) < 60 && Number(second || 0) < 60
    && (zone === 'Z' || (Number(zoneHour) <= 14 && Number(zoneMinute) < 60 && (Number(zoneHour) !== 14 || Number(zoneMinute) === 0)))
    && Number.isFinite(Date.parse(value))
}

const timestamp = z.string().refine(isTimestamp, 'Expected a quoted ISO timestamp with a timezone and valid calendar date')
const webUrl = z.string().url().refine((value) => {
  const url = new URL(value)
  return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
}, 'Expected an HTTP(S) URL without credentials')

export const experimentFrontmatterSchema = z.object({
  id: identifier,
  title: nonEmptyText,
  slug: experimentSlugSchema,
  description: nonEmptyText,
  publishDate: timestamp,
  updatedAt: timestamp.optional(),
  status: z.enum(['published', 'draft']),
  heroImage: identifier,
  projectUrl: webUrl.optional(),
  repositoryUrl: webUrl.optional(),
  tags: z.array(nonEmptyText).refine((values) => new Set(values).size === values.length, 'Tags must be unique').optional(),
}).strict()

// Restrict object keys to portable, URL-safe paths. In particular, a key must not
// escape the local media directory when it is used by the download/upload tools.
export const mediaKeySchema = z.string().min(1).max(1024).refine(
  (value) => value.split('/').every((segment) => /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(segment)),
  'Expected a relative object key with URL-safe path segments',
)

export const mediaAssetSchema = z.object({
  key: mediaKeySchema,
  fileName: z.string().min(1).refine((value) => !/[\\/\x00-\x1f\x7f]/.test(value) && !['.', '..'].includes(value), 'Expected a filename, not a path'),
  contentType: z.string().regex(/^image\/[a-zA-Z0-9.+-]+$/),
  size: z.number().int().positive().safe(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  width: z.number().int().positive().max(100000),
  height: z.number().int().positive().max(100000),
  title: z.string(),
  description: z.string(),
  status: z.enum(['published', 'draft']),
}).strict()

export const mediaManifestSchema = z.object({
  version: z.literal(1),
  assets: z.record(identifier, mediaAssetSchema),
}).strict()

function validated(schema, value, location) {
  const result = schema.safeParse(value)
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.') || 'document'}: ${issue.message}`)
    throw new Error(`${location}: ${issues.join('; ')}`)
  }
  return result.data
}

/** Parse ordinary Markdown only. Language-selecting frontmatter is forbidden. */
export function parseExperimentDocument(source, filename = '<experiment>') {
  if (typeof source !== 'string' || !/^---\r?\n/.test(source)) {
    throw new Error(`${filename}: Expected YAML frontmatter beginning with --- on its own line`)
  }
  if (!/^---\s*$/m.test(source.slice(source.indexOf('\n') + 1))) {
    throw new Error(`${filename}: YAML frontmatter is missing its closing delimiter`)
  }
  let parsed
  try {
    parsed = matter(source, { language: 'yaml' })
  } catch {
    throw new Error(`${filename}: Unable to parse YAML frontmatter`)
  }
  const metadata = validated(experimentFrontmatterSchema, parsed.data, filename)
  if (filename !== '<experiment>' && path.basename(filename) !== `${metadata.slug}.md`) {
    throw new Error(`${filename}: Filename must match the experiment slug`)
  }
  if (!parsed.content.trim()) throw new Error(`${filename}: Markdown body must not be empty`)
  return { ...metadata, body: parsed.content }
}

export function parseMediaManifest(value, filename = 'content/media.json') {
  const manifest = validated(mediaManifestSchema, value, filename)
  const keys = new Map()
  for (const asset of Object.values(manifest.assets)) {
    const identity = JSON.stringify([asset.sha256, asset.size, asset.contentType, asset.width, asset.height])
    if (keys.has(asset.key) && keys.get(asset.key) !== identity) {
      throw new Error(`${filename}: Multiple assets assign conflicting bytes or dimensions to the same object key`)
    }
    keys.set(asset.key, identity)
  }
  return manifest
}

/** A public HTTPS origin/prefix, or a root-relative local preview path. */
export function normalizeMediaBaseUrl(baseUrl = '/media') {
  if (typeof baseUrl !== 'string' || !baseUrl || baseUrl.trim() !== baseUrl || /[\\?#\x00-\x20\x7f]/.test(baseUrl)) {
    throw new Error('NEXT_PUBLIC_MEDIA_BASE_URL must be an HTTPS URL or a root-relative media path without credentials, query or fragment')
  }
  let pathname
  let result
  if (baseUrl.startsWith('/') && !baseUrl.startsWith('//')) {
    pathname = baseUrl
    result = baseUrl
  } else {
    if (!/^https:\/\/[^/]+/.test(baseUrl)) {
      throw new Error('NEXT_PUBLIC_MEDIA_BASE_URL must use an absolute HTTPS URL')
    }
    let url
    try { url = new URL(baseUrl) } catch { throw new Error('NEXT_PUBLIC_MEDIA_BASE_URL must be an HTTPS URL or a root-relative media path') }
    if (url.protocol !== 'https:' || url.username || url.password) {
      throw new Error('NEXT_PUBLIC_MEDIA_BASE_URL must use HTTPS and must not contain credentials')
    }
    // Examine the original path as URL() would otherwise remove ../ segments.
    pathname = baseUrl.slice(baseUrl.indexOf('://') + 3).replace(/^[^/]*/, '')
    result = `${url.origin}${pathname}`
  }
  const prefix = pathname.replace(/^\//, '').replace(/\/$/, '')
  if (prefix && !mediaKeySchema.safeParse(prefix).success) {
    throw new Error('NEXT_PUBLIC_MEDIA_BASE_URL contains an unsafe path prefix')
  }
  return result.replace(/\/$/, '')
}

export function resolveMediaUrl(key, baseUrl = '/media') {
  validated(mediaKeySchema, key, 'Media key')
  return `${normalizeMediaBaseUrl(baseUrl)}/${key}`
}

/**
 * Validate every record before filtering, so malformed unpublished data cannot
 * conceal a broken export. Publication is explicit: imported posts may already
 * be public even when their displayed publication date is in the future.
 */
export function assembleExperiments(documents, manifest, { mediaBaseUrl = '/media' } = {}) {
  const media = parseMediaManifest(manifest)
  const baseUrl = normalizeMediaBaseUrl(mediaBaseUrl)
  const ids = new Set()
  const slugs = new Set()
  const documentsSchema = experimentFrontmatterSchema.extend({ body: nonEmptyText })
  return documents.map((input) => {
    const post = validated(documentsSchema, input, 'Experiment')
    if (ids.has(post.id)) throw new Error(`Duplicate experiment id: ${post.id}`)
    if (slugs.has(post.slug)) throw new Error(`Duplicate experiment slug: ${post.slug}`)
    ids.add(post.id)
    slugs.add(post.slug)
    const asset = Object.hasOwn(media.assets, post.heroImage) ? media.assets[post.heroImage] : undefined
    if (!asset) throw new Error(`${post.slug}: Hero asset is missing from content/media.json`)
    if (post.status === 'published' && asset.status !== 'published') {
      throw new Error(`${post.slug}: A published experiment cannot reference a draft hero asset`)
    }
    return {
      ...post,
      sys: { id: post.id },
      heroImage: {
        id: post.heroImage,
        title: asset.title,
        description: asset.description,
        url: resolveMediaUrl(asset.key, baseUrl),
        width: asset.width,
        height: asset.height,
      },
    }
  }).filter((post) => post.status === 'published')
    .sort((left, right) => Date.parse(right.publishDate) - Date.parse(left.publishDate) || left.slug.localeCompare(right.slug))
}

async function assertRegularFile(filename) {
  const stat = await lstat(filename)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${filename}: Expected a regular file, not a directory or symlink`)
}

export async function readExperimentCollection({ rootDir = process.cwd(), mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '/media' } = {}) {
  const directory = path.join(rootDir, 'content', 'experiments')
  const directoryStat = await lstat(directory)
  if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink()) {
    throw new Error('content/experiments must be a regular directory, not a symlink')
  }
  const manifestPath = path.join(rootDir, 'content', 'media.json')
  await assertRegularFile(manifestPath)
  let manifest
  try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')) } catch { throw new Error('content/media.json must contain valid JSON') }
  const filenames = (await readdir(directory)).filter((filename) => filename !== '.gitkeep').sort()
  if (!filenames.length) throw new Error('content/experiments contains no Markdown experiments')
  const documents = await Promise.all(filenames.map(async (filename) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(filename)) {
      throw new Error(`content/experiments/${filename}: Expected a lowercase hyphenated .md filename`)
    }
    const fullPath = path.join(directory, filename)
    await assertRegularFile(fullPath)
    return parseExperimentDocument(await readFile(fullPath, 'utf8'), filename)
  }))
  return assembleExperiments(documents, manifest, { mediaBaseUrl })
}
