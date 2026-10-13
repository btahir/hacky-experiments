import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export function loadLocalEnv() {
  const file = path.join(root, '.env.local')
  if (!existsSync(file)) return
  if (process.platform !== 'win32' && (statSync(file).mode & 0o077)) {
    throw new Error('Keep .env.local private: chmod 600 .env.local')
  }
  process.loadEnvFile(file)
}

export function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name}; configure it in the ignored .env.local file`)
  return value
}
