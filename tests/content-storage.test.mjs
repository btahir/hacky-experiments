import test from 'node:test'
import assert from 'node:assert/strict'
import { validateBytes, sha256 } from '../scripts/content/storage.mjs'

const bytes = Buffer.from('original image fixture')
const asset = { key: 'images/hero.abc.png', fileName: 'hero.png', contentType: 'image/png', size: bytes.length, sha256: sha256(bytes), width: 100, height: 50, title: '', description: '', status: 'published' }

test('upload verification checks bytes, not just length or file extension', () => {
  assert.doesNotThrow(() => validateBytes(asset, bytes))
  const corrupted = Buffer.from(bytes); corrupted[0] ^= 1
  assert.throws(() => validateBytes(asset, corrupted), /do not match/)
})

test('local asset paths cannot escape their root', () => {
  for (const key of ['../secret', '/secret', 'images/../../secret', 'images/%2e%2e/secret']) {
    assert.throws(() => validateBytes({ ...asset, key }, bytes))
  }
})
