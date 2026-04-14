import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const PROJECT_ROOT = join(__dirname, '..')

export const MODELS_DIR = join(PROJECT_ROOT, 'models')
export const BIN_DIR = join(PROJECT_ROOT, 'bin')

export const WHISPER_BIN = join(BIN_DIR, 'whisper-cli.exe')
export const WHISPER_DLLS = ['whisper.dll', 'ggml.dll', 'ggml-base.dll', 'ggml-cpu.dll']

export const WHISPER_RELEASE_URL =
  'https://github.com/ggml-org/whisper.cpp/releases/download/v1.8.4/whisper-bin-x64.zip'

export const HUGGINGFACE_MODEL_BASE =
  'https://huggingface.co/ggerganov/whisper.cpp/resolve/main'

export const AVAILABLE_MODELS = [
  'ggml-tiny',
  'ggml-tiny.en',
  'ggml-base',
  'ggml-base.en',
  'ggml-small',
  'ggml-small.en',
  'ggml-medium',
  'ggml-medium.en',
  'ggml-large-v3',
  'ggml-large-v3-turbo',
] as const

export type ModelName = (typeof AVAILABLE_MODELS)[number]
