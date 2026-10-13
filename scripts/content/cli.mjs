import { parseArgs } from 'node:util'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { parseMediaManifest, parseExperimentDocument, readExperimentCollection, mediaAssetSchema, experimentSlugSchema, normalizeMediaBaseUrl } from '../../lib/content/core.mjs'
import { loadLocalEnv, root } from './env.mjs'
import { createStorage, uploadAsset, downloadAsset, publicBytes, stageLocalAsset, localBytes, sha256, mapAssets } from './storage.mjs'

const manifestPath = path.join(root, 'content/media.json')
const readManifest = async () => parseMediaManifest(JSON.parse(await readFile(manifestPath, 'utf8')))
const serialize = (fields, body) => `---\n${Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}\n---\n\n${body.trim()}\n`

async function main() {
  loadLocalEnv()
  const mediaBase = normalizeMediaBaseUrl(process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '/media')
  const externalMedia = mediaBase.startsWith('https://')
  if (!externalMedia && mediaBase !== '/media') throw new Error('Local build-time images use /media; leave NEXT_PUBLIC_MEDIA_BASE_URL unset or set an HTTPS CDN URL')
  const { positionals, values } = parseArgs({ allowPositionals: true, options: {
    title: { type: 'string' }, description: { type: 'string' }, hero: { type: 'string' }, id: { type: 'string' },
    files: { type: 'boolean' }, 'verify-public': { type: 'boolean' },
  } })
  const [command = 'help', argument] = positionals
  if (command === 'help') {
    console.log('Commands: prepare, validate [--files], upload [asset-id] [--verify-public], verify-assets, pull-assets, add-image <file> --id <id> [--title <text>] [--description <text>], new <slug> --title <text> --description <text> --hero <asset-id>, publish <slug>')
    return
  }
  if (command === 'prepare') {
    const posts = await readExperimentCollection({ rootDir: root })
    if (externalMedia) {
      console.log(JSON.stringify({ prepared: true, publishedExperiments: posts.length, media: 'external CDN' }))
      return
    }
    const manifest = await readManifest()
    let storage
    const results = await mapAssets(manifest.assets, async (asset) => {
      let bytes
      try { bytes = await localBytes(asset) }
      catch (error) {
        if (!error.message.startsWith('Missing local image')) throw error
        storage ||= createStorage()
        bytes = await downloadAsset(storage, asset)
      }
      await stageLocalAsset(asset, bytes, { backup: false })
      return { verified: true }
    })
    console.log(JSON.stringify({ prepared: true, publishedExperiments: posts.length, images: results.length, media: '/media' }))
    return
  }
  if (command === 'validate') {
    const posts = await readExperimentCollection({ rootDir: root })
    const manifest = await readManifest()
    if (values.files) await mapAssets(manifest.assets, async (asset) => { await localBytes(asset); return { verified: true } })
    console.log(JSON.stringify({ valid: true, publishedExperiments: posts.length, assets: Object.keys(manifest.assets).length, localFilesChecked: Boolean(values.files) }))
    return
  }
  if (['upload', 'verify-assets', 'pull-assets'].includes(command)) {
    const manifest = await readManifest()
    const assets = argument ? { [argument]: manifest.assets[argument] } : manifest.assets
    if (argument && !assets[argument]) throw new Error('Unknown asset ID')
    const storage = command === 'upload' || !externalMedia ? createStorage() : null
    const results = await mapAssets(assets, async (asset) => {
      const uploaded = command === 'upload' ? await uploadAsset(storage, asset) : {}
      if (command !== 'upload' || values['verify-public']) {
        const bytes = externalMedia ? await publicBytes(asset) : await downloadAsset(storage, asset)
        if (command === 'pull-assets') await stageLocalAsset(asset, bytes)
      }
      return { ...uploaded, verified: true }
    })
    console.log(JSON.stringify({ command, count: results.length, results }, null, 2))
    return
  }
  if (command === 'add-image') {
    if (!argument || !values.id || values.id.length > 128 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.id)) throw new Error('Provide an image path and lowercase hyphenated --id of at most 128 characters')
    const bytes = await readFile(path.resolve(argument))
    const metadata = await sharp(bytes, { animated: true }).metadata()
    if (metadata.format === 'heif' && metadata.compression !== 'av1') throw new Error('Convert HEIC/HEVC images to PNG, JPEG or AVIF before uploading')
    const extension = { png: 'png', jpeg: 'jpg', webp: 'webp', avif: 'avif', heif: 'avif', gif: 'gif' }[metadata.format]
    if (!extension || !metadata.width || !metadata.height) throw new Error('Supported image formats: PNG, JPEG, WebP, AVIF and GIF')
    const hash = sha256(bytes)
    const asset = mediaAssetSchema.parse({
      key: `images/${values.id}.${hash.slice(0, 16)}.${extension}`, fileName: path.basename(argument),
      contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`, size: bytes.length, sha256: hash,
      width: metadata.autoOrient?.width || metadata.width, height: metadata.pageHeight || metadata.autoOrient?.height || metadata.height,
      title: values.title || values.id, description: values.description || '', status: 'published',
    })
    const manifest = await readManifest()
    if (manifest.assets[values.id] && manifest.assets[values.id].sha256 !== hash) throw new Error('Asset ID already exists; choose a new ID for replacement bytes')
    manifest.assets[values.id] = asset
    parseMediaManifest(manifest)
    await stageLocalAsset(asset, bytes)
    await uploadAsset(createStorage(), asset)
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
    console.log(JSON.stringify({ id: values.id, key: asset.key, uploaded: true }))
    return
  }
  if (command === 'new') {
    experimentSlugSchema.parse(argument)
    if (!values.title || !values.description || !values.hero) throw new Error('Provide --title, --description and --hero')
    const manifest = await readManifest()
    if (!manifest.assets[values.hero]) throw new Error('Upload the hero first; --hero must name an existing asset')
    const source = serialize({ id: argument, slug: argument, title: values.title, description: values.description, publishDate: new Date().toISOString(), status: 'draft', heroImage: values.hero }, 'Write the experiment here.')
    parseExperimentDocument(source, `${argument}.md`)
    const directory = path.join(root, 'content/experiments')
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, `${argument}.md`), source, { flag: 'wx' })
    console.log(JSON.stringify({ draft: `content/experiments/${argument}.md`, note: 'Draft source can be public in Git; it is excluded from the published site.' }))
    return
  }
  if (command === 'publish') {
    experimentSlugSchema.parse(argument)
    const file = path.join(root, 'content/experiments', `${argument}.md`)
    const document = parseExperimentDocument(await readFile(file, 'utf8'), file)
    const manifest = await readManifest()
    const asset = manifest.assets[document.heroImage]
    if (!asset) throw new Error('Hero asset is missing')
    if (externalMedia) await publicBytes(asset)
    else await downloadAsset(createStorage(), asset)
    const { body, ...fields } = document
    const source = serialize({ ...fields, status: 'published' }, body)
    parseExperimentDocument(source, file)
    await writeFile(file, source)
    console.log(JSON.stringify({ file: `content/experiments/${argument}.md`, status: 'published', deployed: false, next: 'Review the diff, build, commit and deploy. This command only prepares the content.' }))
    return
  }
  throw new Error('Unknown content command; run npm run content -- help')
}

main().catch((error) => {
  // Validation errors describe fields, not their values. SDK errors are sanitized in storage.mjs.
  console.error(error.name === 'ZodError' ? 'Invalid content command or media metadata' : error.message)
  process.exitCode = 1
})
