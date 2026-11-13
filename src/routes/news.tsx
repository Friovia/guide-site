import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'
import news from '~/data/news.json'

const channels = [
  { id: 'all', label: 'All' },
  { id: 'technology', label: 'Technology' },
  { id: 'product', label: 'Products' },
  { id: 'investment', label: 'Investment' },
  { id: 'standards', label: 'Standards' },
]

const faqs = [
  {
    q: 'What are the biggest milestones in data center liquid cooling?',
    a: 'The arc runs: turnkey liquid micro-cabinets appear (STULZ × CoolIT, 2018); ASHRAE codifies coolant temperature classes W17-W45 (2019); 3M announces and then completes its PFAS exit (2022-2025), redirecting fluid choices toward PG25 water-glycol; NVIDIA\u2019s GB200 NVL72 mainstreams ~120 kW liquid-cooled racks (2024); OCP standardizes blind-mate manifolds (ORv3 Rev 1.0, 2024); and Singapore publishes SS 726:2026, the first national standard for tropical liquid cooling.',
  },
  {
    q: 'Why did 3M stop making liquid cooling fluids?',
    a: '3M announced in December 2022 that it would exit all PFAS manufacturing by the end of 2025, driven by tightening global regulation of per- and polyfluoroalkyl substances, and completed the exit on schedule. Its Novec fluorinated fluids were widely used in immersion and two-phase cooling — the exit pushed the industry toward water-glycol (PG25) for direct-to-chip and accelerated re-evaluation of immersion fluid chemistry.',
  },
]

export const Route = createFileRoute('/news')({
  ...pageRoute({
    path: '/news',
    title: 'Liquid cooling industry radar — news, milestones, standards',
    description: 'What is moving in data center liquid cooling: a curated industry timeline (STULZ×CoolIT 2018, ASHRAE W-classes, 3M PFAS exit, GB200-era 120 kW racks, OCP ORv3, SS 726:2026) plus dated items across technology, products, investment and standards — every entry sourced.',
    article: { title: 'Industry radar', description: 'Liquid cooling news and the curated milestone timeline.', datePublished: '2026-10-08', dateModified: '2026-10-08' },
    faq: faqs,
    component: NewsPage,
  }),
})

function NewsPage() {
  const [chan, setChan] = useState('all')
  const count = (id: string) => news.items.filter(i => i.channel === id).length
  const shown = [...news.items]
    .filter(i => chan === 'all' || i.channel === chan)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <main className="container" style="padding:40px 20px">
      <p className="updated">Industry radar · curated {news.curated ? 'by editors' : ''}{news.last_fetched ? ` · auto-fetched ${news.last_fetched}` : ''}</p>
      <h1>Industry radar</h1>
      <p style="max-width:680px">
        What is moving in liquid cooling: technology, products, investment and standards.
        Facts policy applies — <b>every item links to its source; nothing is invented</b>.
        The curated timeline below is the durable view; dated items rotate.
      </p>

      <h2>Milestones — the industry so far</h2>
      <figure className="fig" style="margin-inline:0">
        <table style="max-width:760px">
          <tbody>
            <tr><th>Year</th><th>Milestone</th></tr>
            {news.milestones.map(m => (
              <tr key={m.date + m.title}>
                <td style="white-space:nowrap"><b>{m.date}</b></td>
                <td>
                  {m.title} ·
                  <a href={m.source}>{m.source.startsWith('http') ? 'source ↗' : 'on this site'}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <figcaption><b>FIG. 1</b> — Curated timeline: the events that redirected rack liquid cooling. Hand-maintained; corrections welcome via the changelog.</figcaption>
      </figure>

      <h2>Dated items</h2>
      <div className="chips" style="margin-bottom:18px">
        {channels.map(c => (
          <button key={c.id} className={`chip${chan === c.id ? ' on' : ''}`} onClick={() => setChan(c.id)}>
            {c.label}{c.id !== 'all' && <span className="cnt">{count(c.id)}</span>}
          </button>
        ))}
      </div>

      {shown.map(it => (
        <div key={it.url + it.date} className="newsitem">
          <div className="nmeta">
            <span className="ndate">{it.date}</span>
            <span className={`nchan ${it.channel}`}>{it.channel}</span>
            <span className="nsrc">{it.source}</span>
          </div>
          <a href={it.url} className="ntitle">{it.title} {it.url.startsWith('http') && '↗'}</a>
          <p className="nnote">{it.note}</p>
        </div>
      ))}
      {!shown.length && <p className="src">No items in this channel yet.</p>}

      <h2>How this page works</h2>
      <ul>
        <li><b>Sourcing:</b> public announcements, standards bodies and vendor pages — each item carries its source link. We store titles, links and short notes only; full text stays with the publisher.</li>
        <li><b>Automation:</b> 🚧 under construction until deployment — the RSS pipeline (<span className="mono-src">scripts/fetch-news.mjs</span>, daily GitHub Actions cron) activates when the site is hosted; until then this page is hand-curated. Machine items will merge in daily, deduplicated and channel-tagged; hand-curated entries are always preserved.</li>
        <li><b>Feed:</b> machine-readable version at <a href="/newsfeed.xml">/newsfeed.xml</a>.</li>
      </ul>
    </main>
  )
}
