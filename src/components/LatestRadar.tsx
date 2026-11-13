// Homepage "latest" card band: curated from data/news.json (daily pipeline rotates it).
// Image discipline (2026-11-09): real article covers first (og:image / RSS-embedded,
// hotlinked with no-referrer); imageless entries fall back to the wire-card layout
// (channel spine + large title — typography as the cover). Never generated images
// pretending to be news photos. Ported from LatestRadar.vue; styles in main.css (.rb-*).
import { useState } from 'react'
import news from '~/data/news.json'

const CHANS: Record<string, string> = {
  technology: 'TECH',
  product: 'PRODUCT',
  standards: 'STD',
  investment: 'INVEST',
}
const chanLabel = (c: string) => CHANS[c] ?? c.toUpperCase()

export function LatestRadar({ label, more, limit = 6 }: { label: string; more: string; limit?: number }) {
  const [failed, setFailed] = useState<Set<string>>(new Set())

  // Curation: within a 21-day window prefer entries carrying real images (max slots),
  // fill the rest by recency, then sort by date — strict chronology lives on /news.
  const cutoff = Date.now() - 21 * 864e5
  const recent = news.items.filter(i => new Date(i.date).getTime() >= cutoff)
  const items = recent
    .sort((a, b) => (Number(!!b.image) - Number(!!a.image)) || (a.date < b.date ? 1 : -1))
    .slice(0, limit)

  return (
    <section className="radar-band">
      <div className="rb-head">
        <h2 className="rb-label">{label}</h2>
        <span className="rb-fresh">AUTO · {news.last_fetched}</span>
        <a href="/news" className="rb-more">{more} →</a>
      </div>
      <div className="rb-grid">
        {items.map(it => (
          <a key={it.url} href={it.url} className="rb-card" target="_blank" rel="noopener">
            {it.image && !failed.has(it.url) ? (
              <>
                <div className={`rb-media ${it.channel}`}>
                  <img
                    src={it.image}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setFailed(prev => { const n = new Set(prev); n.add(it.url); return n })}
                  />
                  <span className={`rb-chan ${it.channel}`}>{chanLabel(it.channel)}</span>
                  <span className="rb-date">{it.date.slice(5)}</span>
                </div>
                <div className="rb-body">
                  <span className="rb-title">{it.title}</span>
                  {it.note && <span className="rb-note">{it.note}</span>}
                  <span className="rb-src">{it.source} ↗</span>
                </div>
              </>
            ) : (
              <div className={`rb-wire ${it.channel}`}>
                <div className="rb-wire-head">
                  <span>{chanLabel(it.channel)}</span>
                  <span>{it.date.slice(5)}</span>
                </div>
                <div className="rb-wmid">
                  <span className="rb-wtitle">{it.title}</span>
                  {it.note && <span className="rb-note">{it.note}</span>}
                </div>
                <span className="rb-src">{it.source} ↗</span>
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  )
}
