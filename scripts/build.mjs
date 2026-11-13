// Build wrapper — workaround for TanStack/router#6602: `vite build` with prerender
// can hang forever AFTER all pages are written (SSR stream timeout never fires).
// Strategy: run vite build; once output goes quiet for 90s AND dist/client exists,
// force a clean exit. Hard timeout 15 min => real failure.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const child = spawn('vite', ['build'], { cwd: root, shell: true, stdio: ['ignore', 'pipe', 'pipe'] })

let lastOutput = Date.now()
let sawPrerenderDone = false
let timer = null

const bump = (data) => {
  const s = String(data)
  lastOutput = Date.now()
  if (/prerender|dist\/client|building|built/i.test(s)) {
    if (/rendered|complete|done/i.test(s)) sawPrerenderDone = true
    process.stdout.write(s)
  } else {
    process.stdout.write(s)
  }
}
child.stdout.on('data', bump)
child.stderr.on('data', bump)
child.on('exit', (code) => {
  clearTimeout(timer)
  process.exit(code ?? 1)
})

timer = setInterval(() => {
  const quiet = Date.now() - lastOutput
  const out = existsSync(path.join(root, 'dist', 'client'))
  if (quiet > 90_000 && out) {
    console.log('\n[build.mjs] output quiet for 90s with dist/client present — forcing exit (issue #6602 workaround)')
    clearTimeout(timer)
    child.kill('SIGKILL')
    process.exit(0)
  }
  if (quiet > 15 * 60_000) {
    console.error('[build.mjs] hard timeout — no dist/client output')
    clearTimeout(timer)
    child.kill('SIGKILL')
    process.exit(1)
  }
}, 10_000)
