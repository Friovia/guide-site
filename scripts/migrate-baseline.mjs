// Migration gate (Nuxt -> React): snapshot every URL in public/sitemap.xml into
// scripts/baseline/baseline.json — head fields (title/description/canonical/og/
// hreflang), JSON-LD types+hash, and a normalized body-text hash per page.
// `--diff` re-fetches and compares against the snapshot:
//   - route set inequality (missing/extra page) => HARD FAIL
//   - head field mismatch => HARD FAIL (SEO regression)
//   - body-text hash diff => reported; silence via scripts/baseline/allowlist.json
// A sibling copy lives in official-site/scripts/ — keep the two in sync.
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = 'https://liquidcoolingguide.com'
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const BL_DIR = path.join(ROOT, 'scripts', 'baseline')
const BL_FILE = path.join(BL_DIR, 'baseline.json')
const ALLOW_FILE = path.join(BL_DIR, 'allowlist.json')

const md5 = s => createHash('md5').update(s).digest('hex')

function urlsFromSitemap() {
  const xml = readFileSync(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8')
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(BASE, '').replace(/\/$/, '') || '/')
}

function textOf(html) {
  return md5(html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(svg|noscript)[\s\S]*?<\/\1>/gi, '') // svg markup differs across frameworks; schema covered by head
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim())
}

function headOf(html) {
  const pick = (re) => { const m = html.match(re); return m ? m[1] : null }
  const jsonLdTypes = []
  let schemaHash = ''
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1])
      const nodes = Array.isArray(data) ? data : [data]
      for (const n of nodes) jsonLdTypes.push(n['@type'] ?? '?')
      schemaHash = md5(schemaHash + JSON.stringify(data))
    } catch { jsonLdTypes.push('INVALID') }
  }
  return {
    title: pick(/<title[^>]*>([^<]*)<\/title>/),
    description: pick(/<meta[^>]+name="description"[^>]+content="([^"]*)"/) ?? pick(/<meta[^>]+content="([^"]*)"[^>]+name="description"/),
    canonical: pick(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/) ?? pick(/<link[^>]+href="([^"]*)"[^>]+rel="canonical"/),
    ogTitle: pick(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/),
    ogDescription: pick(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/),
    ogImage: pick(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/),
    hreflang: [...html.matchAll(/<link[^>]+hreflang="([^"]+)"[^>]*>/g)].map(m => m[1]).sort(),
    jsonLdTypes: jsonLdTypes.sort(),
    schemaHash,
  }
}

async function snapshot() {
  const urls = urlsFromSitemap().sort()
  const pages = {}
  for (const u of urls) {
    const res = await fetch(BASE + u, { redirect: 'follow' })
    const html = await res.text()
    pages[u] = { status: res.status, ...headOf(html), textHash: textOf(html) }
    console.log(u, res.status)
  }
  return { base: BASE, capturedAt: new Date().toISOString(), routes: urls, pages }
}

if (process.argv.includes('--diff')) {
  // Compare mode: re-fetch and diff against the snapshot.
  const old = JSON.parse(readFileSync(BL_FILE, 'utf8'))
  const allow = existsSync(ALLOW_FILE) ? new Set(JSON.parse(readFileSync(ALLOW_FILE, 'utf8')).textHashDiffs ?? []) : new Set()
  const now = await snapshot()
  const HEAD_KEYS = ['title', 'description', 'canonical', 'ogTitle', 'ogDescription', 'ogImage', 'hreflang', 'jsonLdTypes', 'schemaHash']
  let hard = 0, soft = 0
  const oldRoutes = new Set(old.routes), newRoutes = new Set(now.routes)
  for (const r of old.routes) if (!newRoutes.has(r)) { console.log(`MISSING ROUTE: ${r}`); hard++ }
  for (const r of now.routes) if (!oldRoutes.has(r)) { console.log(`EXTRA ROUTE: ${r}`); hard++ }
  for (const r of old.routes) {
    if (!now.pages[r]) continue
    for (const k of HEAD_KEYS) {
      if (JSON.stringify(old.pages[r][k]) !== JSON.stringify(now.pages[r][k])) {
        console.log(`HEAD DIFF ${r} [${k}]:\n  old: ${JSON.stringify(old.pages[r][k])}\n  new: ${JSON.stringify(now.pages[r][k])}`); hard++
      }
    }
    if (old.pages[r].textHash !== now.pages[r].textHash && !allow.has(r)) {
      console.log(`TEXT DIFF ${r} (review, or add to allowlist.json)`); soft++
    }
  }
  console.log(`\n${hard} hard failures, ${soft} text diffs`)
  process.exit(hard ? 1 : 0)
}

const baseline = await snapshot()
mkdirSync(BL_DIR, { recursive: true })
writeFileSync(BL_FILE, JSON.stringify(baseline, null, 1))
console.log(`\ncaptured ${baseline.routes.length} routes -> scripts/baseline/baseline.json`)
