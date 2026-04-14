# scribe

Local video and audio transcription CLI powered by [whisper.cpp](https://github.com/ggerganov/whisper.cpp). Built with [incur](https://github.com/wevm/incur) so AI agents find and use it automatically.

No API keys. No cloud. Runs offline on CPU.

## Quick Start

```bash
# Clone and install
git clone https://github.com/jondoescoding/scribe.git
cd scribe
pnpm install

# First run downloads the whisper binary and verifies ffmpeg
pnpm scribe setup

# Download a model (ggml-small recommended to start)
pnpm scribe models download ggml-small

# Transcribe
pnpm scribe transcribe video.mp4
pnpm scribe transcribe video.mp4 --output-as srt
pnpm scribe transcribe podcast.mp3 --output-as json --language en
```

## Requirements

- **Node.js** >= 22
- **pnpm**
- **ffmpeg** on PATH ([install guide](https://ffmpeg.org/download.html))

The whisper binary and models download automatically on first use.

## Commands

### `scribe transcribe <file>`

Transcribe a video or audio file.

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--model` | `-m` | `ggml-small` | Model name or absolute path to .bin |
| `--language` | `-l` | `auto` | Language code (`en`, `es`, `fr`, ...) or `auto` |
| `--output-as` | `-f` | `txt` | Output format: `txt`, `srt`, `vtt`, `json` |
| `--out-dir` | `-o` | stdout | Directory to write output file |

**Supported input formats:**

- Video: mp4, mkv, avi, mov, webm, flv, wmv, m4v
- Audio: wav, mp3, flac, ogg, m4a, aac, wma

**Examples:**

```bash
# Plain text transcript
scribe transcribe meeting.mp4

# SRT subtitles
scribe transcribe lecture.mkv --output-as srt

# JSON with timestamps, specific language
scribe transcribe podcast.mp3 --output-as json --language en

# Save to a directory
scribe transcribe interview.mov --output-as vtt --out-dir ./subtitles

# Use a different model
scribe transcribe audio.wav --model ggml-large-v3-turbo
```

### `scribe models list`

Show all available models and which are downloaded locally.

```bash
$ scribe models list
models[10]{name,downloaded,size}:
  ggml-tiny,false,"-"
  ggml-base,false,"-"
  ggml-small,true,465.0 MB
  ggml-medium,false,"-"
  ggml-large-v3,false,"-"
  ...
```

### `scribe models download <model>`

Download a model from HuggingFace.

```bash
scribe models download ggml-base
scribe models download ggml-large-v3-turbo
```

**Available models:**

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| `ggml-tiny` / `ggml-tiny.en` | ~75 MB | Fastest | Lower |
| `ggml-base` / `ggml-base.en` | ~142 MB | Fast | Good |
| `ggml-small` / `ggml-small.en` | ~465 MB | Medium | Better |
| `ggml-medium` / `ggml-medium.en` | ~1.5 GB | Slow | High |
| `ggml-large-v3` | ~3 GB | Slowest | Highest |
| `ggml-large-v3-turbo` | ~1.6 GB | Medium | High |

Models ending in `.en` are English-only and slightly faster for English content.

### `scribe setup`

Download the whisper-cli binary and verify ffmpeg is installed.

```bash
$ scribe setup
whisper: downloaded
ffmpeg: found on PATH
```

## Agent Integration

scribe is built with [incur](https://github.com/wevm/incur), which means any MCP-compatible agent (Claude Code, Codex, etc.) can find and use it automatically.

### Register as a skill (recommended)

```bash
scribe skills add
```

This generates skill files that agents load on demand. Lighter on tokens than MCP.

### Register as an MCP server

```bash
scribe mcp add
```

This adds scribe to your agent's MCP config so all commands appear as tools.

### Machine-readable manifest

```bash
scribe --llms
```

Outputs a token-efficient command manifest for agent consumption.

## How It Works

```
input file (video or audio)
  -> ffmpeg extracts and normalizes audio to 16kHz mono WAV
  -> whisper-cli.exe runs inference with the selected model
  -> output in your chosen format (txt, srt, vtt, json)
  -> temp files cleaned up
```

- Video files get audio extracted via ffmpeg first
- Audio files get normalized to the format whisper expects
- Models auto-download from HuggingFace if not found locally
- The whisper binary auto-downloads from [whisper.cpp releases](https://github.com/ggerganov/whisper.cpp/releases) on first run

## Development

```bash
# Run tests
pnpm test

# Type check
pnpm check

# Run the CLI in dev
node --import tsx src/cli.ts transcribe video.mp4
```

## License

MIT
