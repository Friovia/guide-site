#!/usr/bin/env node
/**
 * gen-figures.mjs — generate the site's AI illustration set via the in-house
 * imgapi pipeline (Z-Image Turbo on ComfyUI, LAN service).
 *
 * Usage:  IMGAPI_URL=... IMGAPI_TOKEN=... node scripts/gen-figures.mjs [--force]
 * Env:    IMGAPI_URL (required)   IMGAPI_TOKEN (required)
 *
 * Style anchor lives in STYLE below — every prompt shares it so the whole set
 * reads as one art direction (engineering documentation, cool blue-grey, no text).
 * Existing files are skipped unless --force. Output: public/img/ai/*.png
 */
import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public/img/ai')
const TOKEN = process.env.IMGAPI_TOKEN
const API = process.env.IMGAPI_URL
const FORCE = process.argv.includes('--force')
if (!TOKEN) { console.error('IMGAPI_TOKEN required'); process.exit(1) }
if (!API) { console.error('IMGAPI_URL required'); process.exit(1) }

const STYLE = 'Professional technical photograph for an engineering documentation site. Cool blue-grey color palette, clean bright environment, soft diffused studio lighting, crisp focus, high detail. No text, no labels, no watermark, no people.'

const JOBS = [
  { file: 'coldplate-macro.png', seed: 42, prompt: 'Extreme macro of a copper cold plate heat exchanger with fine microchannel fins, two coolant ports at the edge, machined metal surface with subtle reflections.' },
  { file: 'rack-cabinet.png', seed: 7, prompt: 'A modern tall server rack cabinet with its side service door open showing a vertical coolant manifold and blue supply and return hoses, glass front door with softly lit servers inside.' },
  { file: 'cdu-inrow.png', seed: 11, prompt: 'An in-row coolant distribution unit (CDU) standing in a clean data center aisle between server racks, status LEDs, pumps and heat exchanger visible behind a half-open service panel.' },
  { file: 'immersion-tank.png', seed: 23, prompt: 'An open single-phase immersion cooling tank with server blades submerged vertically in clear dielectric fluid, lifting handles above the liquid surface, gentle blue underlighting.' },
  { file: 'dc-hall.png', seed: 31, prompt: 'A modern data center hall with two long rows of tall closed server racks, cool white lighting, subtle blue status lights, polished floor with reflections, wide symmetric perspective.' },
  { file: 'uqd-coupling.png', seed: 55, prompt: 'Macro photograph of a pair of dripless quick-disconnect liquid cooling couplings, blue anodized aluminum and stainless steel, one connected one open showing the spring valve.' },
  { file: 'manifold-vert.png', seed: 68, prompt: 'A vertical rack coolant manifold with two main supply and return headers and a column of blind-mate ports, blue anodized aluminum, mounted on a rack frame rail.' },
  { file: 'drycooler-roof.png', seed: 77, prompt: 'Large rectangular industrial dry coolers with big axial fans installed on the flat roof of a technical building, overcast cool sky, seen from a slightly elevated angle.' },
  { file: 'tropical-dc.png', seed: 83, prompt: 'A compact modular data center container exterior in a tropical climate, humid hazy air, palm vegetation around the compound, weathered but clean equipment.' },
  { file: 'gpu-board.png', seed: 99, prompt: 'A high-power GPU accelerator server board with two large copper cold plates over the processors, memory modules, and two liquid quick-disconnect ports at the board edge.' }
]

let ok = 0, skip = 0, fail = 0
for (const j of JOBS) {
  const out = join(OUT, j.file)
  if (existsSync(out) && !FORCE) { console.log(`= skip ${j.file}`); skip++; continue }
  const t0 = Date.now()
  try {
    const res = await fetch(`${API}/txt2img`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `${j.prompt} ${STYLE}`, width: 1152, height: 768, seed: j.seed }),
      signal: AbortSignal.timeout(360000)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 50000 || buf[0] !== 0x89) throw new Error(`suspicious payload ${buf.length}b`)
    writeFileSync(out, buf)
    console.log(`✓ ${j.file}  ${(buf.length / 1024).toFixed(0)} KB  ${((Date.now() - t0) / 1000).toFixed(1)}s`)
    ok++
  } catch (e) {
    console.error(`✗ ${j.file}: ${e.message}`)
    fail++
  }
}
console.log(`\ndone: ${ok} generated, ${skip} skipped, ${fail} failed`)
process.exit(fail ? 1 : 0)
