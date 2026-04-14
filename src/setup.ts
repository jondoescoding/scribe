import { createWriteStream, existsSync } from 'node:fs'
import { mkdir, rename, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { execFile, execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { BIN_DIR, WHISPER_BIN, WHISPER_DLLS, WHISPER_RELEASE_URL } from './paths.js'

export function getRequiredFiles(): string[] {
  return ['whisper-cli.exe', ...WHISPER_DLLS]
}

export function whisperBinaryExists(): boolean {
  return existsSync(WHISPER_BIN)
}

export function ffmpegExists(): boolean {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

export async function downloadWhisperBinary(): Promise<void> {
  await mkdir(BIN_DIR, { recursive: true })

  const zipPath = join(tmpdir(), `whisper-${randomUUID()}.zip`)

  console.error('Downloading whisper-cli binary...')
  const res = await fetch(WHISPER_RELEASE_URL, { redirect: 'follow' })
  if (!res.ok || !res.body) {
    throw new Error(`Could not download whisper binary. HTTP ${res.status}`)
  }

  const writable = createWriteStream(zipPath)
  await pipeline(Readable.fromWeb(res.body as any), writable)

  console.error('Extracting...')
  const extractDir = join(tmpdir(), `whisper-extract-${randomUUID()}`)
  await mkdir(extractDir, { recursive: true })

  await new Promise<void>((resolve, reject) => {
    execFile('tar', ['-xf', zipPath, '-C', extractDir], (error) => {
      if (error) {
        reject(new Error(`Could not extract zip. ${error.message}`))
        return
      }
      resolve()
    })
  })

  const releaseDir = join(extractDir, 'Release')
  const required = getRequiredFiles()

  for (const file of required) {
    const src = join(releaseDir, file)
    const dest = join(BIN_DIR, file)
    if (!existsSync(src)) {
      throw new Error(`Expected file ${file} not found in release archive.`)
    }
    await rename(src, dest).catch(async () => {
      const { copyFile } = await import('node:fs/promises')
      await copyFile(src, dest)
    })
  }

  await unlink(zipPath).catch(() => {})
  console.error('whisper-cli installed successfully.')
}

export async function ensureWhisperBinary(): Promise<void> {
  if (whisperBinaryExists()) return
  console.error('whisper-cli not found. Downloading...')
  await downloadWhisperBinary()
}
