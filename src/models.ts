import { createWriteStream, existsSync, readdirSync, statSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { HUGGINGFACE_MODEL_BASE, MODELS_DIR } from './paths.js'

export function resolveModelPath(model: string): string {
  if (isAbsolute(model)) return model
  const name = model.endsWith('.bin') ? model : `${model}.bin`
  return join(MODELS_DIR, name)
}

export function getModelDownloadUrl(model: string): string {
  const name = model.endsWith('.bin') ? model : `${model}.bin`
  return `${HUGGINGFACE_MODEL_BASE}/${name}`
}

export function modelExists(model: string): boolean {
  return existsSync(resolveModelPath(model))
}

export function listLocalModels(): Array<{ name: string; size: string }> {
  if (!existsSync(MODELS_DIR)) return []
  return readdirSync(MODELS_DIR)
    .filter((f) => f.endsWith('.bin'))
    .map((f) => {
      const stats = statSync(join(MODELS_DIR, f))
      const sizeMb = (stats.size / 1024 / 1024).toFixed(1)
      return { name: f.replace('.bin', ''), size: `${sizeMb} MB` }
    })
}

export async function downloadModel(model: string): Promise<string> {
  await mkdir(MODELS_DIR, { recursive: true })
  const dest = resolveModelPath(model)
  const url = getModelDownloadUrl(model)

  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok || !res.body) {
    throw new Error(`Could not download model from ${url}. HTTP ${res.status}`)
  }

  const total = Number(res.headers.get('content-length') || 0)
  let downloaded = 0

  const reader = res.body.getReader()
  const writable = createWriteStream(dest)

  const readable = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        controller.close()
        return
      }
      downloaded += value.byteLength
      if (total > 0) {
        const pct = ((downloaded / total) * 100).toFixed(1)
        process.stderr.write(`\rDownloading ${model}... ${pct}%`)
      }
      controller.enqueue(value)
    },
  })

  await pipeline(Readable.fromWeb(readable as any), writable)
  process.stderr.write('\n')
  return dest
}

export async function ensureModel(model: string): Promise<string> {
  const path = resolveModelPath(model)
  if (existsSync(path)) return path
  console.error(`Model ${model} not found locally. Downloading...`)
  return downloadModel(model)
}
