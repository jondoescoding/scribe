const CYAN = '\x1b[36m'
const DIM = '\x1b[2m'
const GREEN = '\x1b[32m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const HIDE_CURSOR = '\x1b[?25l'
const SHOW_CURSOR = '\x1b[?25h'

const BANNER = `
${CYAN}${BOLD}
 ███████╗ ██████╗██████╗ ██╗██████╗ ███████╗
 ██╔════╝██╔════╝██╔══██╗██║██╔══██╗██╔════╝
 ███████╗██║     ██████╔╝██║██████╔╝█████╗
 ╚════██║██║     ██╔══██╗██║██╔══██╗██╔══╝
 ███████║╚██████╗██║  ██║██║██████╔╝███████╗
 ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝
${DIM} local transcription powered by whisper.cpp${RESET}
`

export function printBanner(): void {
  process.stderr.write(BANNER + '\n')
}

const SPINNER_FRAMES = ['◐', '◓', '◑', '◒']

export class Stage {
  private label: string
  private intervalId: ReturnType<typeof setInterval> | null = null
  private frame = 0
  private startTime = 0

  constructor(label: string) {
    this.label = label
    this.startTime = Date.now()
  }

  start(): this {
    process.stderr.write(HIDE_CURSOR)
    this.intervalId = setInterval(() => {
      const spinner = SPINNER_FRAMES[this.frame % SPINNER_FRAMES.length]
      process.stderr.write(`\r${CYAN}${spinner}${RESET} ${this.label}`)
      this.frame++
    }, 100)
    return this
  }

  done(detail?: string): void {
    if (this.intervalId) clearInterval(this.intervalId)
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1)
    const suffix = detail ? ` ${DIM}— ${detail}${RESET}` : ''
    process.stderr.write(`\r${GREEN}✓${RESET} ${this.label} ${DIM}(${elapsed}s)${RESET}${suffix}\n`)
    process.stderr.write(SHOW_CURSOR)
  }

  fail(message: string): void {
    if (this.intervalId) clearInterval(this.intervalId)
    process.stderr.write(`\r\x1b[31m✗${RESET} ${this.label} ${DIM}— ${message}${RESET}\n`)
    process.stderr.write(SHOW_CURSOR)
  }
}
