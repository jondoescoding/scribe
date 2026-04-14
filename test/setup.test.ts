import { describe, expect, it } from 'vitest'
import { getRequiredFiles } from '../src/setup.js'

describe('getRequiredFiles', () => {
  it('returns whisper-cli.exe and all DLLs', () => {
    const files = getRequiredFiles()
    expect(files).toContain('whisper-cli.exe')
    expect(files).toContain('whisper.dll')
    expect(files).toContain('ggml.dll')
    expect(files).toContain('ggml-base.dll')
    expect(files).toContain('ggml-cpu.dll')
    expect(files).toHaveLength(5)
  })
})
