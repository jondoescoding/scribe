import { describe, expect, it } from 'vitest'
import { getModelDownloadUrl, resolveModelPath } from '../src/models.js'
import { MODELS_DIR } from '../src/paths.js'
import { join } from 'node:path'

describe('resolveModelPath', () => {
  it('returns absolute path unchanged', () => {
    const abs = 'C:/some/path/model.bin'
    expect(resolveModelPath(abs)).toBe(abs)
  })

  it('resolves model name to models dir', () => {
    const result = resolveModelPath('ggml-small')
    expect(result).toBe(join(MODELS_DIR, 'ggml-small.bin'))
  })

  it('appends .bin if missing', () => {
    const result = resolveModelPath('ggml-tiny')
    expect(result).toMatch(/\.bin$/)
  })

  it('does not double .bin', () => {
    const result = resolveModelPath('ggml-tiny.bin')
    expect(result).toBe(join(MODELS_DIR, 'ggml-tiny.bin'))
  })
})

describe('getModelDownloadUrl', () => {
  it('builds correct HuggingFace URL', () => {
    const url = getModelDownloadUrl('ggml-small')
    expect(url).toBe(
      'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin'
    )
  })
})
