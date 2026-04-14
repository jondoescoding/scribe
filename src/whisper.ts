import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { BIN_DIR, WHISPER_BIN } from './paths.js'

export type OutputFormat = 'txt' | 'srt' | 'vtt' | 'json'

export interface WhisperArgs {
  modelPath: string
  audioPath: string
  format: OutputFormat
  language: string
  outputFile?: string
}

const FORMAT_FLAGS: Record<OutputFormat, string> = {
  txt: '-otxt',
  srt: '-osrt',
  vtt: '-ovtt',
  json: '-oj',
}

const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  txt: '.txt',
  srt: '.srt',
  vtt: '.vtt',
  json: '.json',
}

export function buildWhisperArgs(opts: WhisperArgs): string[] {
  const args = [
    '-m', opts.modelPath,
    '-f', opts.audioPath,
    '-l', opts.language,
    FORMAT_FLAGS[opts.format],
  ]
  if (opts.outputFile) {
    args.push('-of', opts.outputFile)
  }
  args.push('-np')
  return args
}

export async function runWhisper(opts: WhisperArgs): Promise<string> {
  if (!existsSync(WHISPER_BIN)) {
    throw new Error('Could not find whisper-cli. Run `scribe setup` first.')
  }

  const args = buildWhisperArgs(opts)

  return new Promise((resolve, reject) => {
    execFile(WHISPER_BIN, args, { env: { ...process.env, PATH: `${BIN_DIR};${process.env.PATH}` } }, async (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Could not transcribe file. ${stderr || error.message}`))
        return
      }

      if (opts.outputFile) {
        const ext = FORMAT_EXTENSIONS[opts.format]
        const outPath = `${opts.outputFile}${ext}`
        try {
          const content = await readFile(outPath, 'utf-8')
          resolve(content)
        } catch {
          reject(new Error(`Could not read output file ${outPath}.`))
        }
      } else {
        resolve(stdout)
      }
    })
  })
}
