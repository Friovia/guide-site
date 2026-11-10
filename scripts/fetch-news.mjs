#!/usr/bin/env node
/**
 * fetch-news.mjs — Industry radar pipeline (zero-dependency, Node >= 18).
 *
 * What it does:
 *   1. Fetches RSS from trade press + Google News keyword queries
 *   2. Filters for liquid-cooling relevance, classifies into channels,
 *      dedupes (URL + title similarity), rate-limits per source
 *   3. Self-heals EXISTING items every run (pure text transforms, no network):
 *      decode entities → strip leaked markup, split "Title - Publisher"
 *      suffixes into real source names, empty junk notes
 *   4. Writes data/news.json, public/newsfeed.xml, updates data/meta.json
 *
 * Link policy: news.google.com redirect URLs are KEPT as-is. They work in
 * browsers (that is their design), and resolving them server-side is not
 * viable — Google walls datacenter IPs (a resolve-and-drop strategy emptied
 * the whole radar once; see git history 2026-11-09). Publisher names come
 * from the title suffix instead, which needs no network.
 *
 * Stability rules (do not break):
 *   - A dead feed is skipped and logged; it can NEVER clear existing data
 *   - Manual/curated entries are always preserved (pinned: true)
 *   - Radar-death guard: every source failing exits 1 (loud red, not silent)
 *   - Empty-write guard: a run can never shrink the archive to zero
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
const UA = 'Mozilla/5.0 (compatible; liquidcoolingguide-news/1.0)'

// ---------- sources ----------
const GN = (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`
const SOURCES = [
  // Google News keyword queries — discovery net; redirect links kept as-is
  { name: 'Google News', url: GN('"liquid cooling" data center'), host: 'news.google.com' },
  { name: 'Google News', url: GN('"direct-to-chip" OR "direct to chip" cooling'), host: 'news.google.com' },
  { name: 'Google News', url: GN('"immersion cooling"'), host: 'news.google.com' },
  { name: 'Google News', url: GN('CDU coolant distribution unit'), host: 'news.google.com' },
  { name: 'Google News', url: GN('CoolIT OR Motivair OR LiquidStack OR Submer liquid cooling'), host: 'news.google.com' },
  // Bing News queries — direct publisher links (apclick redirects resolved below);
  // unresolvable bing items are rejected at intake (never enter the archive)
  { name: 'Bing News', url: 'https://www.bing.com/news/search?q=' + encodeURIComponent('"liquid cooling" data center') + '&format=rss', host: 'bing.com' },
  { name: 'Bing News', url: 'https://www.bing.com/news/search?q=' + encodeURIComponent('immersion cooling OR "direct-to-chip"') + '&format=rss', host: 'bing.com' },
  { name: 'Bing News', url: 'https://www.bing.com/news/search?q=' + encodeURIComponent('CDU coolant distribution unit') + '&format=rss', host: 'bing.com' },
  { name: 'Bing News', url: 'https://www.bing.com/news/search?q=' + encodeURIComponent('liquid cooling rack OR cold plate server') + '&format=rss', host: 'bing.com' },
  { name: 'Bing News', url: 'https://www.bing.com/news/search?q=' + encodeURIComponent('liquid cooling market OR investment') + '&format=rss', host: 'bing.com' },
  { name: 'Bing News', url: 'https://www.bing.com/news/search?q=' + encodeURIComponent('Vertiv OR CoolIT OR Motivair OR LiquidStack news') + '&format=rss', host: 'bing.com' },
  { name: 'Bing News', url: 'https://www.bing.com/news/search?q=' + encodeURIComponent('AI data center cooling') + '&format=rss', host: 'bing.com' },
  // Trade press — direct URLs and real summaries; dead feeds are skipped automatically
  { name: 'The Next Platform', url: 'https://www.nextplatform.com/feed/', host: 'nextplatform.com' },
  { name: 'Cooling Post', url: 'https://www.coolingpost.com/feed/', host: 'coolingpost.com' },
  { name: 'Data Center Frontier', url: 'https://www.datacenterfrontier.com/feed/', host: 'datacenterfrontier.com' },
  { name: 'DCD', url: 'https://www.datacenterdynamics.com/en/rss/', host: 'datacenterdynamics.com' },
  { name: 'Blocks & Files', url: 'https://blocksandfiles.com/feed/', host: 'blocksandfiles.com' },
  { name: 'ServeTheHome', url: 'https://www.servethehome.com/feed/', host: 'servethehome.com' },
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

// ---------- text cleaning (pure, no network) ----------
// Order matters: decode HTML entities FIRST, then strip tags — Google News
// descriptions arrive entity-encoded, so stripping tags before decoding leaks
// raw <a href="..."> markup into the page (the bug this pass fixed).
const decodeEntities = (s) => s
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
// also drops UNTERMINATED tags — truncated notes can end mid-tag
// (e.g. '<a href="https://…CBMi300chars' with no closing '>'), which the
// complete-tag regex alone never matches
const stripTags = (s) => s.replace(/<[^>]+>/g, ' ').replace(/<[^>]*$/g, ' ')
function clean(s) {
  let prev = null, cur = String(s ?? '')
  for (let i = 0; i < 3 && cur !== prev; i++) { prev = cur; cur = stripTags(decodeEntities(cur)) }
  return cur.replace(/\s+/g, ' ').trim()
}

// "Long descriptive headline | Publisher" / "Title - Publisher" → { title, publisher }
// (both are Google News title formats; the pipe suffix is the cleanest signal)
function splitPublisher(title) {
  const pipe = title.match(/^(.*\S)\s+\|\s+([^|]{2,40})$/)
  if (pipe && pipe[2].trim().split(/\s+/).length <= 5) {
    // pipe hit = Google News composite title: a trailing dash-suffix on the
    // remainder is the publication's tagline, not article info — strip loosely
    let main = pipe[1].trim()
    const tag = main.match(/^(.*\S)\s+[-–—]\s+([^-–—]{2,80})$/)
    if (tag && !/[.?!]$/.test(tag[2])) main = tag[1].trim()
    return { title: main, publisher: pipe[2].trim() }
  }
  const m = title.match(/^(.*\S)\s+[-–—]\s+([^-–—]{2,40})$/)
  if (!m) return { title, publisher: null }
  const [, main, pub] = m
  // suffix must look like a publication name, not a sentence fragment
  return pub.split(/\s+/).length <= 5 ? { title: main.trim(), publisher: pub.trim() } : { title, publisher: null }
}

const hostOf = (u) => { try { return new URL(u).host.replace(/^www\./, '') } catch { return '' } }
const publisherFromHost = (h) => {
  const known = {
    'nextplatform.com': 'The Next Platform', 'coolingpost.com': 'Cooling Post',
    'datacenterfrontier.com': 'Data Center Frontier', 'datacenterdynamics.com': 'Data Center Dynamics',
    'blocksandfiles.com': 'Blocks & Files', 'servethehome.com': 'ServeTheHome',
    'news.google.com': 'Google News',
  }
  return known[h] ?? h.split('.')[0]?.replace(/^\w/, (c) => c.toUpperCase()) ?? null
}

// ---------- helpers ----------
function normUrl(u) {
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

// 跟随重定向取最终 URL（Bing apclick 等；Bing 不墙数据中心 IP）。null = 失败。
async function followRedirect(u) {
  try {
    const res = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'user-agent': UA } })
    const fin = res.url || ''
    return fin.startsWith('http') ? fin : null
  } catch { return null }
}

// 无头浏览器解析（runner 上跑，puppeteer-core + workflow 预装 Chrome）：
// Google 挡裸 fetch 但真浏览器引擎能走完重定向落到出版社原文页——顺带把
// og:image 从渲染后的 DOM 摘出来。条目 URL 也从 google 重定向升级成出版社直链。
// 本地无浏览器/被墙 → 返回空 Map 静默跳过，绝不丢条目（never-drop 不破）。
import { createRequire } from 'node:module'
const require_ = createRequire(import.meta.url)
let puppeteer = null
try { puppeteer = require_('puppeteer-core') } catch { /* 未安装（如生产 CI 缓存层）→ 跳过 */ }

async function headlessResolve(links) {
  const out = new Map()
  if (!puppeteer || links.length === 0) return out
  const exe = process.env.PUPPETEER_EXECUTABLE_PATH
  if (!exe) { console.log('headless: PUPPETEER_EXECUTABLE_PATH 未设置，跳过（本地模式）'); return out }
  let browser = null
  try {
    browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  } catch (e) { console.log(`headless: 启动失败 ${e.message} — 跳过`); return out }
  const page = await browser.newPage()
  // 真 Chrome UA（bot UA 会触发出版社 403，真浏览器引擎就该用真 UA）
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36')
  let ok = 0
  for (const u of links) {
    try {
      await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 18000 })
      // Google 的跳转是 JS 驱动：等跳转执行完（URL 变化或超时让步）
      for (let t = 0; t < 5 && page.url().includes('news.google.com'); t++) {
        await new Promise((r) => setTimeout(r, 1000))
      }
      const final = page.url()
      if (final.startsWith('http') && !final.includes('news.google.com') && !final.includes('bing.com')) {
        // 落地后短沉降（JS 渲染页的 meta 稍后才挂），$eval 失败回落 content() 正则
        await new Promise((r) => setTimeout(r, 1200))
        let img = await page
          .$eval('meta[property="og:image"], meta[name="twitter:image"]', (el) => el.content)
          .catch(() => null)
        if (!img) {
          const html = await page.content().catch(() => '')
          img = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
            ?? html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
            ?? null
        }
        if (img) { try { img = new URL(img, final).href } catch { img = null } }
        out.set(u, { url: normUrl(final), image: img && /^https?:\/\//.test(img) ? img : null })
        ok++
      }
    } catch { /* 单条失败继续 */ }
    await new Promise((r) => setTimeout(r, 400))
  }
  await browser.close()
  console.log(`headless: resolved ${ok}/${links.length} redirect links`)
  return out
}

// 文章真图（og:image / twitter:image）——best-effort：仅直链条目，超时/403/无图
// 一律静默跳过，绝不影响条目本身。新闻语境里图片=文章真封面，这是 feeds 配图
// 的正确来源（2026-11-09 定调：真图优先，纹样只是无图兜底）。
async function ogImage(articleUrl) {
  try {
    const res = await fetch(articleUrl, { signal: AbortSignal.timeout(12000), headers: { 'user-agent': UA } })
    if (!res.ok) return null
    const html = (await res.text()).slice(0, 80000)
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
      ?? html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    if (!m) return null
    try { return new URL(m[1], articleUrl).href } catch { return null }
  } catch { return null }
}

// Apply every pure-text heal to one item (idempotent).
function healItem(it) {
  const rawTitle = clean(it.title)
  const { title, publisher } = splitPublisher(rawTitle)
  const url = normUrl(clean(it.url))
  const noteRaw = clean(it.note)
  const out = { ...it, title, url }
  if (publisher) out.source = publisher
  else if (!out.source || out.source === 'Google News') out.source = publisherFromHost(hostOf(url)) ?? out.source
  const noteIsJunk = !noteRaw || noteRaw.startsWith('http') || /<a\s|href=|news\.google\.com\/rss/.test(noteRaw) || (noteRaw.length > 20 && similar(noteRaw, title, 0.6))
  out.note = noteIsJunk ? '' : noteRaw.slice(0, 180)
  return out
}

// 低质来源黑名单（Bing 长尾会捞到个人博客/UGC）——入口过滤，与死源跳过同一性质
const JUNK_HOSTS = /^(www\.)?(note\.com|medium\.com|blogspot\.|wordpress\.com|tumblr\.com|quora\.com|reddit\.com)/i

// ---------- rss parsing (regex, CDATA-safe, no deps) ----------
function parseRss(xml) {
  const items = []
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? []
  for (const b of blocks) {
    const title = clean(b.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '')
    const link = clean(b.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? '')
    const pub = clean(b.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] ?? '')
    const desc = clean(b.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ?? '').slice(0, 300)
    // RSS 内嵌图：enclosure / media:content（部分源直接带封面，零额外请求）
    const img = clean(
      b.match(/<(?:enclosure|media:content)[^>]+(?:url|href)="([^"]+)"[^>]*>/i)?.[1]
      ?? b.match(/<media:thumbnail[^>]+url="([^"]+)"[^>]*>/i)?.[1]
      ?? ''
    )
    if (title && link) items.push({ title, link, pub, desc, host: hostOf(link), img: /^https?:\/\//.test(img) ? img : '' })
  }
  return items
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

// ---------- self-heal pass over existing items (pure text, never drops) ----------
// 质量规则例外：低质域名存量条目明确剔除（确定性编辑规则，非网络失败模式——
// 与"never drop"稳定性规则的区别在此注释划清）
const existingClean = existing.items
  .map((it) => (it.pinned ? it : healItem(it)))
  .filter((it) => it.pinned || !JUNK_HOSTS.test(hostOf(it.url)))
console.log(`self-heal: ${existingClean.length} existing items kept (junk-host dropped: ${existing.items.length - existingClean.length})`)

// 无头升级：存量 google 重定向条目 → 出版社直链 + 真图（失败保留原链接，不丢）
{
  const gLinks = existingClean.filter(i => !i.pinned && i.url.includes('news.google.com')).map(i => i.url)
  const resolved = await headlessResolve([...new Set(gLinks)])
  let up = 0
  for (const it of existingClean) {
    const r = resolved.get(it.url)
    if (r) { it.url = r.url; if (r.image) it.image = r.image; if (it.source === 'Google News') it.source = publisherFromHost(hostOf(r.url)) ?? it.source; up++ }
  }
  console.log(`self-heal: headless upgraded ${up} google links`)
}

// 补真图：存量里无 image 的直链条目抓 og:image（google 重定向拿不到，跳过）
{
  const need = existingClean.filter(i => !i.pinned && !i.image && /^https?:\/\//.test(i.url) && !i.url.includes('news.google.com'))
  const q = [...need]
  const worker = async () => { while (q.length) { const it = q.shift(); const im = await ogImage(it.url); if (im) it.image = im } }
  await Promise.all(Array.from({ length: 4 }, worker))
  console.log(`images: self-heal +${need.filter(i => i.image).length}/${need.length} direct-link items`)

}

// ---------- fetch & filter ----------
const log = []
const collected = []
for (const s of SOURCES) {
  try {
    const res = await fetch(s.url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': UA } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const parsed = parseRss(await res.text())
    log.push(`✓ ${s.name} (${parsed.length} items)`)
    collected.push(...parsed.map(p => ({ ...p, srcName: s.name })))
  } catch (e) {
    log.push(`✗ ${s.name}: ${e.message} — skipped`)
  }
}
console.log(log.join('\n'))

// radar-death guard: every source dead = loud failure, not silent success
if (log.every(l => l.startsWith('✗'))) {
  console.error('\nALL SOURCES FAILED — radar is dead. Failing loudly instead of silently succeeding.')
  process.exit(1)
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

// 预取阶段（并发 4）：解析 bing 重定向 + 抓文章真图。未解析的 bing 条目 → null（入口过滤）
const prepared = new Map()
{
  const q3 = [...kept]
  const w = async () => {
    while (q3.length) {
      const k = q3.shift()
      let url = normUrl(k.link), img = k.img || ''
      if (url.includes('bing.com/news')) {
        const real = await followRedirect(url)
        if (!real || real.includes('bing.com')) { prepared.set(k, null); continue }
        url = normUrl(real)
        if (JUNK_HOSTS.test(hostOf(url))) { prepared.set(k, null); continue }
      }
      if (!img && /^https?:\/\//.test(url) && !url.includes('news.google.com')) img = (await ogImage(url)) || ''
      prepared.set(k, { url, img })
    }
  }
  await Promise.all(Array.from({ length: 4 }, w))
}

// 预取阶段之后：新鲜 google 条目无头解析（升级直链+图；失败的以原链接保留，不丢）
{
  const gnLinks = kept.filter(k => k.link.includes('news.google.com')).map(k => k.link)
  const resolved = await headlessResolve([...new Set(gnLinks)])
  for (const k of kept) {
    const r = resolved.get(k.link)
    if (r) {
      k.link = r.url
      k.img = k.img || r.img || ''
      // 同步 prepared：去重循环读的是 prepared（在无头升级前固化的旧链接会覆盖升级结果）
      if (prepared.has(k)) prepared.set(k, { url: r.url, img: prepared.get(k)?.img || r.img || '' })
    }
  }
}

// title-similarity dedupe + per-source daily cap (3)
const perDay = new Map()
const fresh = []
for (const k of kept.sort((a, b) => Date.parse(b.pub || 0) - Date.parse(a.pub || 0))) {
  const prep = prepared.get(k)
  if (prep === null) continue // 未解析的 bing 条目不入库
  const url = prep ? prep.url : normUrl(k.link)
  const { title, publisher } = splitPublisher(k.title)
  if (fresh.some(f => similar(f.title, title))) continue
  const host = hostOf(url)
  const key = host + '|' + (k.pub || '').slice(0, 16)
  const n = (perDay.get(key) ?? 0) + 1
  perDay.set(key, n)
  if (n > 3) continue
  const noteRaw = clean(k.desc)
  const noteIsJunk = !noteRaw || noteRaw.startsWith('http') || /<a\s|href=|news\.google\.com\/rss/.test(noteRaw) || (noteRaw.length > 20 && similar(noteRaw, title, 0.6))
  fresh.push({
    date: new Date(k.pub).toISOString().slice(0, 10),
    title,
    source: publisher ?? k.srcName,
    url,
    channel: classify(k.title, k.desc),
    note: noteIsJunk ? '' : noteRaw.slice(0, 180),
    image: prep?.img || undefined,
  })
}

// ---------- merge (curated pinned entries preserved; existing never dropped) ----------
const manual = existingClean.filter(i => existing.curated || i.pinned)
const manualKeys = new Set(manual.map(i => normUrl(i.url)))
const freshAuto = fresh.filter(f => !manualKeys.has(normUrl(f.url)) && !manual.some(m => similar(m.title, f.title)))
const existingAuto = existingClean.filter(i =>
  !manualKeys.has(normUrl(i.url)) &&
  !freshAuto.some(f => similar(f.title, i.title) || normUrl(f.url) === normUrl(i.url)))
// 图片继承：fresh 与存量是同一故事（标题相似）时，fresh 无图则继承存量已抓到的
// 真图——否则无图的新版本会把刚治好图的存量版本挤掉（同故事双版本坑）
const imageCarrier = existingClean.filter(i => i.image)
const merged = [...manual, ...freshAuto, ...existingAuto]
  .map(i => i.image ? i : { ...i, image: imageCarrier.find(c => similar(c.title, i.title))?.image })
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .slice(0, 60)

console.log(`\ncollected ${collected.length} → relevant ${kept.length} → after dedupe/caps ${fresh.length} fresh → merged total ${merged.length}`)

// empty-write guard: a bug can never empty the archive
if (merged.length === 0 && existing.items.length > 0) {
  console.error('\nREFUSING TO WRITE: merge produced 0 items while archive had ' + existing.items.length + '. Failing loudly.')
  process.exit(1)
}

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
