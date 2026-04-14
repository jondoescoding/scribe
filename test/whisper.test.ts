import { describe, expect, it } from 'vitest'
import { buildWhisperArgs } from '../src/whisper.js'

describe('buildWhisperArgs', () => {
  it('builds basic args with txt output', () => {
    const args = buildWhisperArgs({
      modelPath: 'C:/models/ggml-small.bin',
      audioPath: 'C:/tmp/audio.wav',
      format: 'txt',
      language: 'auto',
      outputFile: 'C:/out/result',
    })
    expect(args).toEqual([
      '-m', 'C:/models/ggml-small.bin',
      '-f', 'C:/tmp/audio.wav',
      '-l', 'auto',
      '-otxt',
      '-of', 'C:/out/result',
      '-np',
    ])
  })

  it('builds args for srt output', () => {
    const args = buildWhisperArgs({
      modelPath: 'C:/models/ggml-small.bin',
      audioPath: 'C:/tmp/audio.wav',
      format: 'srt',
      language: 'en',
      outputFile: 'C:/out/result',
    })
    expect(args).toContain('-osrt')
    expect(args).toContain('-np')
  })

  it('builds args for vtt output', () => {
    const args = buildWhisperArgs({
      modelPath: 'C:/models/ggml-small.bin',
      audioPath: 'C:/tmp/audio.wav',
      format: 'vtt',
      language: 'en',
      outputFile: 'C:/out/result',
    })
    expect(args).toContain('-ovtt')
  })

  it('builds args for json output', () => {
    const args = buildWhisperArgs({
      modelPath: 'C:/models/ggml-small.bin',
      audioPath: 'C:/tmp/audio.wav',
      format: 'json',
      language: 'en',
      outputFile: 'C:/out/result',
    })
    expect(args).toContain('-oj')
  })

  it('uses stdout when no outputFile given', () => {
    const args = buildWhisperArgs({
      modelPath: 'C:/models/ggml-small.bin',
      audioPath: 'C:/tmp/audio.wav',
      format: 'txt',
      language: 'auto',
    })
    expect(args).not.toContain('-of')
    expect(args).toContain('-np')
  })
})
