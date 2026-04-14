import { execFile } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { unlink } from 'node:fs/promises'

const VIDEO_EXTS = new Set(['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv', '.m4v'])
const AUDIO_EXTS = new Set(['.wav', '.mp3', '.flac', '.ogg', '.m4a', '.aac', '.wma'])

export function isVideoFile(filePath: string): boolean {
  return VIDEO_EXTS.has(extname(filePath).toLowerCase())
}

export function isAudioFile(filePath: string): boolean {
  return AUDIO_EXTS.has(extname(filePath).toLowerCase())
}

export function buildFfmpegArgs(input: string, output: string): string[] {
  return ['-i', input, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', '-y', output]
}

export function createTempWavPath(): string {
  return join(tmpdir(), `scribe-${randomUUID()}.wav`)
}

export async function extractAudio(inputPath: string): Promise<string> {
  const tempWav = createTempWavPath()
  const args = buildFfmpegArgs(inputPath, tempWav)

  return new Promise((resolve, reject) => {
    execFile('ffmpeg', args, (error, _stdout, stderr) => {
      if (error) {
        reject(new Error(`Could not extract audio. ffmpeg error: ${stderr}`))
        return
      }
      resolve(tempWav)
    })
  })
}

export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath)
  } catch {
    // temp file cleanup is best-effort
  }
}
