import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  assembleExperiments,
  normalizeMediaBaseUrl,
  parseExperimentDocument,
  parseMediaManifest,
  readExperimentCollection,
  resolveMediaUrl,
} from '../lib/content/core.mjs'

const metadata = {
  id: 'entry-1', title: 'An experiment', slug: 'an-experiment', description: 'A useful summary.',
  publishDate: '2024-02-29T09:30:00-08:00', status: 'published', heroImage: 'hero-1',
}
const asset = {
  key: 'experiments/an-experiment/hero.abc123.png', fileName: 'hero image.png', contentType: 'image/png',
  size: 42, sha256: 'a'.repeat(64), width: 1536, height: 1024, title: '', description: '', status: 'published',
}
const manifest = () => ({ version: 1, assets: { 'hero-1': { ...asset } } })
const markdown = (changes = {}, body = 'A **real** experiment.\n\n[Source](https://example.com/project)\n') =>
  `---\n${JSON.stringify({ ...metadata, ...changes }, null, 2)}\n---\n${body}`
const document = (changes = {}) => parseExperimentDocument(markdown(changes))

async function fixture(t) {
  const rootDir = await mkdtemp(path.join(tmpdir(), 'content-reader-'))
  t.after(() => rm(rootDir, { recursive: true, force: true }))
  await mkdir(path.join(rootDir, 'content', 'experiments'), { recursive: true })
  await writeFile(path.join(rootDir, 'content', 'media.json'), JSON.stringify(manifest()))
  await writeFile(path.join(rootDir, 'content', 'experiments', 'an-experiment.md'), markdown())
  return rootDir
}

test('Markdown conversion preserves prose, original timestamp and optional author metadata', () => {
  const body = '## Mechanism\n\n- **Bold** and `inline code`\n- [Project](https://example.com?a=1&b=2)\n\n> A quotation.\n'
  const post = parseExperimentDocument(markdown({ tags: ['tools'], projectUrl: 'https://example.com' }, body), 'an-experiment.md')
  assert.equal(post.body, body)
  assert.equal(post.publishDate, metadata.publishDate)
  assert.deepEqual(post.tags, ['tools'])
  assert.equal(post.projectUrl, 'https://example.com')
  assert.equal(post.updatedAt, undefined)
  assert.equal(document({ publishDate: '2024-02-29T09:30-08:00' }).publishDate, '2024-02-29T09:30-08:00')
})

test('publication is explicit: draft content is excluded while an already-published future date is retained', () => {
  const posts = assembleExperiments([
    document(),
    document({ id: 'entry-2', slug: 'future-display-date', publishDate: '2099-01-01T00:00:00Z' }),
    document({ id: 'draft-1', slug: 'confidential-draft', status: 'draft' }),
  ], manifest())
  assert.deepEqual(posts.map((post) => post.slug), ['future-display-date', 'an-experiment'])
  assert.equal(JSON.stringify(posts).includes('confidential-draft'), false)
  assert.equal(posts[0].heroImage.url, `/media/${asset.key}`)
})

test('invalid calendar dates, missing zones and unquoted YAML dates fail validation', () => {
  for (const publishDate of ['2023-02-29T00:00:00Z', '2024-02-30T00:00:00Z', '2024-13-01T00:00:00Z', '2024-01-01', '2024-01-01T00:00:00', '2024-01-01T24:00:00Z']) {
    assert.throws(() => document({ publishDate }), /publishDate/)
  }
  const yamlWithDate = markdown().replace(JSON.stringify(metadata.publishDate), metadata.publishDate)
  assert.throws(() => parseExperimentDocument(yamlWithDate), /Unable to parse YAML|publishDate/)
  assert.throws(() => document({ updatedAt: '2024-02-30T00:00:00Z' }), /updatedAt/)
})

test('unknown fields, empty required prose and missing frontmatter cannot silently enter a build', () => {
  assert.throws(() => document({ statu: 'published' }), /Unrecognized key/)
  assert.throws(() => document({ title: '  ' }), /title/)
  assert.throws(() => parseExperimentDocument(markdown({}, ' \n')), /body must not be empty/)
  assert.throws(() => parseExperimentDocument('No metadata'), /YAML frontmatter/)
  assert.throws(() => parseExperimentDocument('---\ntitle: Incomplete'), /closing delimiter/)
  assert.throws(() => parseExperimentDocument(markdown(), 'wrong-name.md'), /Filename must match/)
})

test('frontmatter cannot select the executable JavaScript engine', () => {
  delete globalThis.__contentReaderExecuted
  assert.throws(() => parseExperimentDocument('---javascript\n(globalThis.__contentReaderExecuted = true)\n---\nBody'), /YAML frontmatter/)
  assert.equal(globalThis.__contentReaderExecuted, undefined)
  assert.throws(() => parseExperimentDocument('---\nvalue: !!js/function >\n  function() { return 1 }\n---\nBody'), /Unable to parse YAML/)
})

test('duplicate slugs and IDs fail instead of silently dropping or shadowing posts', () => {
  assert.throws(() => assembleExperiments([document(), document({ id: 'entry-2' })], manifest()), /Duplicate experiment slug/)
  assert.throws(() => assembleExperiments([document(), document({ slug: 'other-post' })], manifest()), /Duplicate experiment id/)
})

test('public experiments cannot reference missing or private media', () => {
  assert.throws(() => assembleExperiments([document()], { version: 1, assets: {} }), /Hero asset is missing/)
  const privateManifest = manifest()
  privateManifest.assets['hero-1'].status = 'draft'
  assert.throws(() => assembleExperiments([document()], privateManifest), /cannot reference a draft/)
  assert.throws(() => assembleExperiments([document({ heroImage: 'constructor' })], manifest()), /Hero asset is missing/)
  assert.throws(() => assembleExperiments([document({ status: 'draft', heroImage: 'missing' })], manifest()), /Hero asset is missing/)
})

test('manifest validation prevents malformed checksums and conflicting object identities', () => {
  const invalid = manifest()
  invalid.assets['hero-1'].sha256 = 'incomplete'
  assert.throws(() => parseMediaManifest(invalid), /sha256/)
  const conflict = manifest()
  conflict.assets['hero-2'] = { ...asset, sha256: 'b'.repeat(64) }
  assert.throws(() => parseMediaManifest(conflict), /conflicting bytes/)
  conflict.assets['hero-2'] = { ...asset, title: 'Different caption, same bytes' }
  assert.equal(Object.keys(parseMediaManifest(conflict).assets).length, 2)
})

test('asset keys are safe as both URL paths and local mirror filenames', () => {
  for (const key of ['../private.png', '/absolute.png', 'images/../private.png', 'images\\private.png', 'https://other.test/file.png', 'images/%2e%2e/file.png', 'images/file.png?token=value', 'images//file.png', '.hidden/file.png']) {
    assert.throws(() => resolveMediaUrl(key), /relative object key/)
  }
  assert.equal(resolveMediaUrl(asset.key, 'https://media.example.com/prefix/'), `https://media.example.com/prefix/${asset.key}`)
})

test('media base configuration rejects credentials, redirects, ambiguous paths and insecure origins', () => {
  for (const base of ['//other.test/media', 'http://media.example.com', 'https://user:password@example.com', 'https://example.com/?secret=value', 'https://example.com/#fragment', 'https://example.com/a/../private', 'https://example.com/%2e%2e/private', '/media/../private', 'https:example.com', ' /media']) {
    assert.throws(() => normalizeMediaBaseUrl(base), /NEXT_PUBLIC_MEDIA_BASE_URL/)
  }
  assert.equal(normalizeMediaBaseUrl('/media/'), '/media')
  assert.equal(normalizeMediaBaseUrl('https://media.example.com/'), 'https://media.example.com')
})

test('file reader loads the collection and ignores the separate private draft directory', async (t) => {
  const rootDir = await fixture(t)
  await mkdir(path.join(rootDir, '.content-local', 'drafts'), { recursive: true })
  await writeFile(path.join(rootDir, '.content-local', 'drafts', 'private.md'), 'A confidential malformed draft')
  const posts = await readExperimentCollection({ rootDir, mediaBaseUrl: 'https://media.example.com' })
  assert.equal(posts.length, 1)
  assert.equal(posts[0].sys.id, metadata.id)
  assert.equal(posts[0].heroImage.url, `https://media.example.com/${asset.key}`)
  await writeFile(path.join(rootDir, 'content', 'experiments', 'an-experiment.md'), markdown({ title: 'An edited experiment' }))
  assert.equal((await readExperimentCollection({ rootDir }))[0].title, 'An edited experiment')
})

test('file reader rejects symlinks and unrecognized content instead of following or omitting it', async (t) => {
  const rootDir = await fixture(t)
  const directory = path.join(rootDir, 'content', 'experiments')
  await writeFile(path.join(directory, 'nested.txt'), 'Unexpected content')
  await assert.rejects(readExperimentCollection({ rootDir }), /Expected a lowercase hyphenated .md filename/)
  await rm(path.join(directory, 'nested.txt'))
  await symlink(path.join(directory, 'an-experiment.md'), path.join(directory, 'linked.md'))
  await assert.rejects(readExperimentCollection({ rootDir }), /not a directory or symlink/)
})
