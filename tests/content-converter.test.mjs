import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, stat, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import sharp from 'sharp'
import { richTextToMarkdown } from '../scripts/content/converter.mjs'
import { importContentful, serializeExperiment, writeUnchangedOrNew } from '../scripts/content/import-contentful.mjs'
import { parseExperimentDocument } from '../lib/content/core.mjs'

const text = (value, marks = []) => ({ nodeType: 'text', value, marks: marks.map((type) => ({ type })), data: {} })
const block = (nodeType, content, data = {}) => ({ nodeType, content, data })
const document = (...content) => block('document', content)
const paragraph = (...content) => block('paragraph', content)
const render = (source) => renderToStaticMarkup(React.createElement(ReactMarkdown, null, richTextToMarkdown(source)))

test('literal Markdown syntax and HTML in source prose stay literal text', () => {
  const html = render(document(paragraph(text('# Not a heading, **not bold**, [not a link](url), <script>x</script> & text.'))))
  assert.equal(html, '<p># Not a heading, **not bold**, [not a link](url), &lt;script&gt;x&lt;/script&gt; &amp; text.</p>')
})

test('marks preserve whitespace and inline code delimiters without changing neighboring text', () => {
  const html = render(document(paragraph(text('Before'), text(' bold ', ['bold']), text('after: '), text('`literal`', ['code']), text('.'))))
  assert.equal(html, '<p>Before <strong>bold</strong> after: <code>`literal`</code>.</p>')
})

test('a code-only multiline paragraph becomes a fenced block without losing its line breaks', () => {
  const value = 'const a = 1;\n\nif (a) {\n  run();\n}'
  assert.equal(render(document(paragraph(text(value, ['code'])))), `<pre><code>${value}\n</code></pre>`)
})

test('headings, nested lists and quotes retain their semantic structure', () => {
  const source = document(block('heading-2', [text('A mechanism')]), block('unordered-list', [
    block('list-item', [paragraph(text('First')), block('ordered-list', [block('list-item', [paragraph(text('Nested'))])])]),
    block('list-item', [paragraph(text('Second'))]),
  ]), block('blockquote', [paragraph(text('A quotation.'))]))
  const html = render(source)
  assert.match(html, /<h2>A mechanism<\/h2>/)
  assert.match(html, /<ul>\n<li>First\n<ol>\n<li>Nested<\/li>/)
  assert.match(html, /<blockquote>\n<p>A quotation\.<\/p>/)
})

test('hyperlink whitespace repair retains its browser destination and records evidence', () => {
  const normalizations = []
  const output = richTextToMarkdown(document(paragraph(block('hyperlink', [text('Video')], { uri: ' https://youtu.be/example ' }))), { onNormalization: (item) => normalizations.push(item) })
  assert.equal(output, '[Video](https://youtu.be/example)\n')
  assert.equal(normalizations.length, 1)
  assert.equal(normalizations[0].kind, 'trim-hyperlink-whitespace')
  assert.equal(normalizations[0].from, ' https://youtu.be/example ')
})

test('unsupported embeds, marks and executable URLs fail instead of disappearing', () => {
  assert.throws(() => richTextToMarkdown(document(block('embedded-asset-block', []))), /Unsupported block node/)
  assert.throws(() => richTextToMarkdown(document(paragraph(text('Underlined', ['underline'])))), /Unsupported text mark/)
  assert.throws(() => richTextToMarkdown(document(paragraph(block('hyperlink', [text('Unsafe')], { uri: 'javascript:alert(1)' })))), /Unsupported hyperlink protocol/)
  assert.throws(() => richTextToMarkdown(document(paragraph(text('Before: '), text('two\nlines', ['code'])))), /Multiline inline code/)
  assert.throws(() => richTextToMarkdown(document(paragraph(block('embedded-entry-inline', [])))), /Unsupported inline node/)
})

test('frontmatter serialization keeps strings, timezone and punctuation intact', () => {
  const source = serializeExperiment({ id: 'entry-1', title: 'Title: "quoted"', slug: 'example', description: 'Description\nwith a line.', publishDate: '2021-07-12T00:00-07:00', status: 'published', heroImage: 'hero-1' }, 'Body.\n')
  const parsed = parseExperimentDocument(source, 'example.md')
  assert.equal(parsed.title, 'Title: "quoted"')
  assert.equal(parsed.description, 'Description\nwith a line.')
  assert.equal(parsed.publishDate, '2021-07-12T00:00-07:00')
})

test('repeat exports are idempotent and differing files require explicit overwrite', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'content-import-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const filename = path.join(directory, 'example.md')
  assert.equal(await writeUnchangedOrNew(filename, 'original'), true)
  assert.equal(await writeUnchangedOrNew(filename, 'original'), false)
  await assert.rejects(writeUnchangedOrNew(filename, 'changed'), /use --overwrite explicitly/)
  assert.equal(await readFile(filename, 'utf8'), 'original')
  assert.equal(await writeUnchangedOrNew(filename, 'changed', { overwrite: true }), true)
  const linked = path.join(directory, 'linked.md')
  await symlink(filename, linked)
  await assert.rejects(writeUnchangedOrNew(linked, 'changed', { overwrite: true }), /not a regular file/)
  const linkedDirectory = path.join(directory, 'redirected')
  await symlink(directory, linkedDirectory)
  await assert.rejects(writeUnchangedOrNew(path.join(linkedDirectory, 'outside.md'), 'content', { rootDir: directory }), /directories must not be symlinks/)
  await assert.rejects(writeUnchangedOrNew(path.join(directory, '..', 'outside.md'), 'content', { rootDir: directory }), /escapes the selected repository/)
})

test('scoped importer exports verified original bytes, creates no public source URLs and safely repeats', async (t) => {
  const rootDir = await mkdtemp(path.join(tmpdir(), 'content-import-integration-'))
  t.after(() => rm(rootDir, { recursive: true, force: true }))
  const variables = { CONTENTFUL_SPACE_ID: 'example-space', CONTENTFUL_ENVIRONMENT: 'master', CONTENTFUL_CONTENT_TYPE: 'hackyBlog', CONTENTFUL_LOCALE: 'en-US', CONTENTFUL_ACCESS_TOKEN: 'test-only-token' }
  const previous = Object.fromEntries(Object.keys(variables).map((key) => [key, process.env[key]]))
  Object.assign(process.env, variables)
  t.after(() => { for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value } })
  const bytes = await sharp({ create: { width: 3, height: 2, channels: 3, background: 'white' } }).png().toBuffer()
  const originalFetch = globalThis.fetch
  t.after(() => { globalThis.fetch = originalFetch })
  globalThis.fetch = async (input, options) => {
    const url = new URL(input)
    if (url.hostname === 'images.ctfassets.net') {
      assert.equal(options.headers, undefined, 'Provider credentials must never be forwarded to the asset CDN')
      return new Response(bytes, { headers: { 'content-type': 'image/png' } })
    }
    assert.equal(url.hostname, 'cdn.contentful.com')
    assert.equal(options.headers.Authorization, 'Bearer test-only-token')
    assert.equal(url.searchParams.get('content_type'), 'hackyBlog')
    return Response.json({ total: 1, items: [{ sys: { id: 'entry-1', contentType: { sys: { id: 'hackyBlog' } } }, fields: {
      title: 'An example', slug: 'example', description: 'A description.', publishDate: '2024-02-29T00:00-07:00',
      heroImage: { sys: { id: 'asset-1' } }, body: document(paragraph(text('Preserved body.'))),
    } }], includes: { Asset: [{ sys: { id: 'asset-1' }, fields: {
      title: 'Original image', file: { url: '//images.ctfassets.net/example/image.png', fileName: 'original.png', contentType: 'image/png', details: { size: bytes.length, image: { width: 3, height: 2 } } },
    } }] } })
  }
  const first = await importContentful({ rootDir, expectedCount: 1 })
  assert.equal(first.experiments, 1)
  assert.equal(first.assets, 1)
  assert.equal(first.bytes, bytes.length)
  const manifestText = await readFile(path.join(rootDir, 'content', 'media.json'), 'utf8')
  assert.doesNotMatch(manifestText, /ctfassets|test-only-token|example-space/)
  const key = JSON.parse(manifestText).assets['asset-1'].key
  assert.deepEqual(await readFile(path.join(rootDir, 'public', 'media', key)), bytes)
  assert.deepEqual(await readFile(path.join(rootDir, '.content-local', 'assets', key)), bytes)
  assert.equal((await stat(path.join(rootDir, '.content-local', 'contentful', 'published.json'))).mode & 0o777, 0o600)
  assert.equal((await stat(path.join(rootDir, '.content-local'))).mode & 0o777, 0o700)
  assert.deepEqual(await importContentful({ rootDir, expectedCount: 1 }), first)
  await assert.rejects(importContentful({ rootDir, expectedCount: 2 }), /count mismatch/)
})
