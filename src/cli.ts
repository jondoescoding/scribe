import { Cli, z } from 'incur'
import { existsSync } from 'node:fs'
import { resolve, basename, join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'

import { ensureModel, listLocalModels, downloadModel } from './models.js'
import { AVAILABLE_MODELS } from './paths.js'
import { isVideoFile, isAudioFile, extractAudio, cleanupTempFile } from './ffmpeg.js'
import { runWhisper, type OutputFormat } from './whisper.js'
import {
  ensureWhisperBinary,
  downloadWhisperBinary,
  whisperBinaryExists,
  ffmpegExists,
} from './setup.js'

const cli = Cli.create('scribe', {
  version: '0.1.0',
  description: 'Transcribe video and audio files using local Whisper models.',
})

cli.command('transcribe', {
  description: 'Transcribe a video or audio file',
  args: z.object({
    file: z.string().describe('Path to video or audio file'),
  }),
  options: z.object({
    model: z.string().default('ggml-small').describe('Model name or absolute path'),
    language: z.string().default('auto').describe('Language code (e.g. en, es) or auto'),
    outputAs: z.enum(['txt', 'srt', 'vtt', 'json']).default('txt').describe('Transcript format: txt, srt, vtt, json'),
    outDir: z.string().optional().describe('Directory to write output file'),
  }),
  alias: { model: 'm', language: 'l', outputAs: 'f', outDir: 'o' },
  examples: [
    { args: { file: 'video.mp4' }, description: 'Transcribe a video' },
    { args: { file: 'audio.wav' }, options: { outputAs: 'srt' }, description: 'Transcribe to SRT' },
    {
      args: { file: 'video.mkv' },
      options: { outputAs: 'json', language: 'en' },
      description: 'Transcribe to JSON in English',
    },
  ],
  async run(c) {
    const filePath = resolve(c.args.file)
    if (!existsSync(filePath)) {
      return c.error({
        code: 'FILE_NOT_FOUND',
        message: `Could not read file ${filePath}. Check the path and try again.`,
      })
    }

    if (!isVideoFile(filePath) && !isAudioFile(filePath)) {
      return c.error({
        code: 'UNSUPPORTED_FORMAT',
        message:
          'Unsupported file type. Use a video (mp4, mkv, avi, mov, webm) or audio (wav, mp3, flac, ogg) file.',
      })
    }

    await ensureWhisperBinary()
    const modelPath = await ensureModel(c.options.model)
    const format = c.options.outputAs as OutputFormat

    let audioPath = filePath
    let tempWav: string | undefined

    if (isVideoFile(filePath)) {
      console.error('Extracting audio...')
      tempWav = await extractAudio(filePath)
      audioPath = tempWav
    }

    try {
      const outputFile = c.options.outDir
        ? join(resolve(c.options.outDir), basename(filePath, '.' + filePath.split('.').pop()))
        : join(tmpdir(), `scribe-out-${randomUUID()}`)

      console.error('Transcribing...')
      const result = await runWhisper({
        modelPath,
        audioPath,
        format,
        language: c.options.language,
        outputFile,
      })

      if (format === 'json') {
        try {
          return c.ok(JSON.parse(result))
        } catch {
          return c.ok({ transcript: result })
        }
      }

      return c.ok({
        transcript: result.trim(),
        file: basename(filePath),
        model: c.options.model,
        language: c.options.language,
        outputAs: format,
      })
    } finally {
      if (tempWav) await cleanupTempFile(tempWav)
    }
  },
})

const models = Cli.create('models', { description: 'Manage Whisper models' })

models.command('list', {
  description: 'List available and downloaded models',
  run() {
    const local = listLocalModels()
    const available = AVAILABLE_MODELS.map((name) => {
      const found = local.find((m) => m.name === name)
      return { name, downloaded: !!found, size: found?.size ?? '-' }
    })
    return { models: available }
  },
})

models.command('download', {
  description: 'Download a Whisper model',
  args: z.object({
    model: z.string().describe('Model name (e.g. ggml-small, ggml-base.en)'),
  }),
  examples: [
    { args: { model: 'ggml-small' }, description: 'Download the small model' },
    { args: { model: 'ggml-large-v3-turbo' }, description: 'Download the large turbo model' },
  ],
  async run(c) {
    const path = await downloadModel(c.args.model)
    return { downloaded: c.args.model, path }
  },
})

cli.command(models)

cli.command('setup', {
  description: 'Download whisper-cli binary and verify ffmpeg',
  async run() {
    const results: Record<string, string> = {}

    if (whisperBinaryExists()) {
      results.whisper = 'already installed'
    } else {
      await downloadWhisperBinary()
      results.whisper = 'downloaded'
    }

    results.ffmpeg = ffmpegExists() ? 'found on PATH' : 'NOT FOUND — install ffmpeg and add to PATH'

    return results
  },
})

cli.serve()

export default cli
