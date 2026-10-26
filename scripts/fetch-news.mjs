#!/usr/bin/env node
/**
 * fetch-news.mjs — Industry radar pipeline (zero-dependency, Node >= 18).
 *
 * What it does:
 *   1. Fetches RSS from trade press + Google News keyword queries
 *   2. Filters for liquid-cooling relevance, classifies into channels,
 *      dedupes (URL + title similarity), rate-limits per source
 *   3. Merges with data/news.json preserving hand-curated entries
 *   4. Writes data/news.json, public/newsfeed.xml, updates data/meta.json
 *
 * Stability rules (do not break):
 *   - A dead feed is skipped and logged; it can NEVER clear existing data
 *   - Manual/curated entries are always preserved
 *   - Runs offline-safe: total fetch failure leaves files untouched
 *
 * Usage:
 *   node scripts/fetch-news.mjs            # full run
 *   node scripts/fetch-news.mjs --dry-run  # no writes
 *   node scripts/fetch-news.mjs --rss-only # rebuild newsfeed.xml from news.json
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DRY = process.argv.includes('--dry-run')
const RSS_ONLY = process.argv.includes('--rss-only')
const TODAY = new Date().toISOString().slice(0, 10)

// ---------- sources ----------
const GN = (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`
const SOURCES = [
  // Google News keyword queries — zero-maintenance catch-all
  { name: 'Google News', url: GN('"liquid cooling" data center'), host: 'news.google.com' },
  { name: 'Google News', url: GN('"direct-to-chip" OR "direct to chip" cooling'), host: 'news.google.com' },
  { name: 'Google News', url: GN('"immersion cooling"'), host: 'news.google.com' },
  { name: 'Google News', url: GN('CDU coolant distribution unit'), host: 'news.google.com' },
  { name: 'Google News', url: GN('CoolIT OR Motivair OR LiquidStack OR Submer liquid cooling'), host: 'news.google.com' },
  // Trade press — best effort; dead feeds are skipped automatically
  { name: 'The Next Platform', url: 'https://www.nextplatform.com/feed/', host: 'nextplatform.com' },
  { name: 'Cooling Post', url: 'https://www.coolingpost.com/feed/', host: 'coolingpost.com' },
  { name: 'Data Center Frontier', url: 'https://www.datacenterfrontier.com/feed/', host: 'datacenterfrontier.com' },
  { name: 'DCD', url: 'https://www.datacenterdynamics.com/en/rss/', host: 'datacenterdynamics.com' }
]

const KEYWORDS = [
  'liquid cooling', 'liquid-cooled', 'liquid cooled', 'direct-to-chip', 'direct to chip',
  'immersion cooling', 'cold plate', 'cold-plate', 'coolant', 'cdu', 'cooling distribution',
  'liquid-ready', 'warm water cooling', 'single-phase', 'two-phase cooling', 'rack cooling',
  'data center cooling', 'datacenter cooling'
]
const CH_INVEST = /(fund(ing|s|ed)?|rais(e|es|ed)|series [a-z]\b|invest(ment|or|s)?|acquisit|acquire[sd]?|merger|ipo|valuation|round)/i
const CH_STD = /(\bocp\b|open compute|ashrae|\biec\b|standard|specification|\bss ?726\b|ul listing|\bce\b mark)/i
const CH_PROD = /(launch|unveil|release|introduc|ship|roll ?out|announce|debut|expands?|new.*(cdu|rack|cabinet|platform|cooling))/i

// ---------- rss parsing (regex, CDATA-safe, no deps) ----------
function parseRss(xml) {
  const items = []
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? []
  const strip = (s) => s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .trim()
  for (const b of blocks) {
    const title = strip(b.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '')
    const link = (b.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? '').trim()
    const pub = strip(b.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] ?? '')
    const desc = strip(b.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ?? '').slice(0, 300)
    if (title && link) {
      let host = ''
      try { host = new URL(link).host } catch { /* google news redirect links still parse */ }
      items.push({ title, link, pub, desc, host })
    }
  }
  return items
}

// ---------- helpers ----------
const normUrl = (u) => {
  try {
    const x = new URL(u)
    ;[...x.searchParams.keys()].forEach(k => { if (/^(utm_|ref|source|fbclid|gclid)/i.test(k)) x.searchParams.delete(k) })
    return x.origin + x.pathname + (x.search || '')
  } catch { return u }
}
const tokens = (s) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2))
function similar(a, b, th = 0.75) {
  const A = tokens(a), B = tokens(b)
  if (!A.size || !B.size) return false
  let inter = 0
  for (const t of A) if (B.has(t)) inter++
  return inter / Math.min(A.size, B.size) > th
}
function classify(title, desc) {
  const t = title + ' ' + desc
  if (CH_INVEST.test(t)) return 'investment'
  if (CH_STD.test(t)) return 'standards'
  if (CH_PROD.test(t)) return 'product'
  return 'technology'
}
const within90d = (d) => {
  const t = Date.parse(d)
  return !Number.isNaN(t) && Date.now() - t < 90 * 864e5
}

// ---------- load existing ----------
const newsPath = join(ROOT, 'data/news.json')
const existing = JSON.parse(readFileSync(newsPath, 'utf8'))

function writeRss(items) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const body = items.map(i => `  <item>
    <title>${esc(i.title)}</title>
    <link>${esc(i.url)}</link>
    <guid>${esc(normUrl(i.url))}</guid>
    <pubDate>${new Date(i.date + 'T08:00:00Z').toUTCString()}</pubDate>
    <category>${esc(i.channel)}</category>
    <description>Source: ${esc(i.source)} — ${esc(i.note ?? '')}</description>
  </item>`).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/fetch-news.mjs from data/news.json — do not edit by hand -->
<rss version="2.0"><channel>
  <title>Liquid Cooling Guide — Industry Radar</title>
  <link>https://liquidcoolingguide.com/news</link>
  <description>Liquid cooling news and milestones: technology, products, investment, standards. Every item sourced.</description>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${body}
</channel></rss>`
  writeFileSync(join(ROOT, 'public/newsfeed.xml'), xml)
}

if (RSS_ONLY) {
  writeRss(existing.items)
  console.log(`newsfeed.xml rebuilt from ${existing.items.length} items`)
  process.exit(0)
}

// ---------- fetch & filter ----------
const log = []
const collected = []
for (const s of SOURCES) {
  try {
    const res = await fetch(s.url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'liquidcoolingguide-news/1.0' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const parsed = parseRss(await res.text())
    log.push(`✓ ${s.name} (${parsed.length} items)`)
    collected.push(...parsed.map(p => ({ ...p, srcName: s.name, srcHost: p.host || s.host })))
  } catch (e) {
    log.push(`✗ ${s.name}: ${e.message} — skipped`)
  }
}

const score = (t) => KEYWORDS.reduce((n, k) => n + (t.toLowerCase().includes(k) ? 1 : 0), 0)
const kept = []
const seenUrls = new Set()
for (const c of collected) {
  if (!within90d(c.pub)) continue
  if (score(c.title + ' ' + c.desc) < 1) continue
  const u = normUrl(c.link)
  if (seenUrls.has(u)) continue
  seenUrls.add(u)
  kept.push(c)
}
// title-similarity dedupe + per-source daily cap (3)
const perDay = new Map()
const final = []
for (const k of kept.sort((a, b) => Date.parse(b.pub || 0) - Date.parse(a.pub || 0))) {
  if (final.some(f => similar(f.title, k.title))) continue
  const key = k.srcHost + '|' + (k.pub || '').slice(0, 16)
  const n = (perDay.get(key) ?? 0) + 1
  perDay.set(key, n)
  if (n > 3) continue
  final.push({
    date: new Date(k.pub).toISOString().slice(0, 10),
    title: k.title,
    source: k.srcName,
    url: k.link,
    channel: classify(k.title, k.desc),
    note: k.desc ? k.desc.slice(0, 180) : 'Aggregated from public RSS — see source for full coverage.'
  })
}

// ---------- merge (curated/manual entries are preserved) ----------
const manual = existing.items.filter(i => existing.curated || i.pinned)
const manualKeys = new Set(manual.map(i => normUrl(i.url)))
const auto = final.filter(f => !manualKeys.has(normUrl(f.url)) && !manual.some(m => similar(m.title, f.title)))
const merged = [...manual, ...auto]
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .slice(0, 60)

console.log(log.join('\n'))
console.log(`\ncollected ${collected.length} → relevant ${kept.length} → after dedupe/caps ${final.length} → merged total ${merged.length}`)

if (DRY) { console.log('dry run — no files written'); process.exit(0) }

const updated = { ...existing, curated: false, last_fetched: TODAY, items: merged }
writeFileSync(newsPath, JSON.stringify(updated, null, 2) + '\n')
writeRss(merged)

// keep meta.json freshness in sync
const metaPath = join(ROOT, 'data/meta.json')
if (existsSync(metaPath)) {
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
  meta.datasets.news = TODAY
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n')
}
console.log(`written: data/news.json (${merged.length} items), public/newsfeed.xml, meta.json.news=${TODAY}`)
