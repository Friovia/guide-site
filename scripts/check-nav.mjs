#!/usr/bin/env node
/**
 * check-nav.mjs — IA consistency guard (runs as part of `npm run generate`).
 *
 * Fails the build when:
 *   - a page exists in pages/ but is missing from data/nav.json (orphan — the
 *     "empty site" failure mode this repo refactored away from)
 *   - nav.json points at a route that doesn't exist (dead sidebar link)
 *   - sitemap.xml is missing a page or points at a ghost route
 *
 * Excludes: dynamic/ignored routes. Playground index handled via directory convention.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []

// Locale landings mirror '/' via data/locales.json — orphan-check exempt, sitemap-exempt
const localesJson = JSON.parse(readFileSync(join(ROOT, 'data/locales.json'), 'utf8'))
const LOCALE_CODES = localesJson.list.map(l => l.code).filter(c => c !== 'en')
const IGNORED = new Set(LOCALE_CODES.map(c => '/' + c))
const isLocalePath = (p) => {
  const seg = p.split('/')[1] ?? ''
  return LOCALE_CODES.includes(seg)
}

// ---- collect routes from pages/ ----
const routes = new Set()
function walk(dir, base) {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f)
    const rel = base + '/' + f.replace(/\.vue$/, '')
    if (statSync(full).isDirectory()) { walk(full, rel); continue }
    if (!f.endsWith('.vue')) continue
    if (f === 'index.vue') { routes.add(base === '' ? '/' : base); continue }
    routes.add(rel)
  }
}
walk(join(ROOT, 'pages'), '')
for (const r of [...routes]) if (r.startsWith('/zh/')) routes.delete(r) // zh mirrors: nav zhPath covers them
for (const ig of IGNORED) routes.delete(ig) // locale landings are mirrors of '/'

// ---- nav.json ----
const nav = JSON.parse(readFileSync(join(ROOT, 'data/nav.json'), 'utf8'))
const navPaths = new Set()
for (const s of nav.sections) for (const it of s.items) navPaths.add(it.path)

for (const r of routes) if (!navPaths.has(r)) errors.push(`orphan page (missing from nav.json): ${r}`)
for (const p of navPaths) if (!routes.has(p)) errors.push(`nav.json points at nonexistent route: ${p}`)

// ---- sitemap ----
const sitemap = readFileSync(join(ROOT, 'public/sitemap.xml'), 'utf8')
const locs = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace('https://liquidcoolingguide.com', '') || '/'))
for (const r of routes) if (!locs.has(r)) errors.push(`page missing from sitemap.xml: ${r}`)
for (const l of locs) {
  if (routes.has(l) || IGNORED.has(l) || l.startsWith('/zh/')) continue
  errors.push(`sitemap.xml has ghost route: ${l}`)
}

// ---- llms.txt presence (warning-level) ----
const llms = readFileSync(join(ROOT, 'public/llms.txt'), 'utf8')
for (const p of navPaths) {
  const slug = p === '/' ? '' : p
  if (slug && !llms.includes(`liquidcoolingguide.com${slug}`)) errors.push(`page missing from llms.txt: ${p}`)
}

if (errors.length) {
  console.error('✗ IA check failed:\n  ' + errors.join('\n  '))
  process.exit(1)
}
console.log(`✓ IA check passed: ${routes.size} routes, nav and sitemap and llms.txt in sync`)
