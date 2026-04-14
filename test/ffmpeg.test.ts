import { describe, expect, it } from 'vitest'
import { buildFfmpegArgs, isVideoFile, isAudioFile } from '../src/ffmpeg.js'

describe('isVideoFile', () => {
  it('detects mp4', () => expect(isVideoFile('clip.mp4')).toBe(true))
  it('detects mkv', () => expect(isVideoFile('clip.mkv')).toBe(true))
  it('detects avi', () => expect(isVideoFile('clip.avi')).toBe(true))
  it('detects mov', () => expect(isVideoFile('clip.mov')).toBe(true))
  it('detects webm', () => expect(isVideoFile('clip.webm')).toBe(true))
  it('rejects wav', () => expect(isVideoFile('audio.wav')).toBe(false))
})

describe('isAudioFile', () => {
  it('detects wav', () => expect(isAudioFile('a.wav')).toBe(true))
  it('detects mp3', () => expect(isAudioFile('a.mp3')).toBe(true))
  it('detects flac', () => expect(isAudioFile('a.flac')).toBe(true))
  it('detects ogg', () => expect(isAudioFile('a.ogg')).toBe(true))
  it('rejects mp4', () => expect(isAudioFile('v.mp4')).toBe(false))
})

describe('buildFfmpegArgs', () => {
  it('builds correct args for audio extraction', () => {
    const args = buildFfmpegArgs('input.mp4', 'output.wav')
    expect(args).toEqual([
      '-i', 'input.mp4',
      '-ar', '16000',
      '-ac', '1',
      '-c:a', 'pcm_s16le',
      '-y',
      'output.wav',
    ])
  })
})
