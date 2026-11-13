import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'

const faqs = [
  {
    q: 'What is a good PUE for a liquid-cooled data center?',
    a: 'Well-run liquid-cooled facilities typically reach 1.05-1.2, versus roughly 1.4-1.6 for legacy air-cooled sites. PUE is total facility energy divided by IT energy, so liquid cooling improves the score by shrinking the cooling overhead — it does not reduce IT power itself.',
  },
  {
    q: 'Why can PUE comparisons be misleading?',
    a: 'Because PUE depends on climate and boundary definitions as much as on technology. The same design scores better in a cold, dry climate than in the tropics (free-cooling hours track wet-bulb temperature), and a single cabinet in a shared room has no well-defined facility boundary at all. Compare like climates and stated boundaries, not headline numbers.',
  },
]

export const Route = createFileRoute('/pue-math')({
  ...pageRoute({
    path: '/pue-math',
    title: 'PUE formula — power usage effectiveness, honestly',
    description: 'PUE = total facility energy ÷ IT energy: 100 kW IT with 15 kW overhead = 1.15. Live calculator, the 1.05-1.2 liquid vs 1.4-1.6 air bands, and three things PUE hides — climate, the IT term, and the cabinet-in-a-room boundary problem.',
    article: { title: 'PUE math — and what it hides', description: 'Power usage effectiveness computed honestly.', datePublished: '2026-10-08', dateModified: '2026-10-08' },
    faq: faqs,
    component: PuePage,
  }),
})

function PuePage() {
  const [it, setIt] = useState(100)
  const [cool, setCool] = useState(10)
  const [misc, setMisc] = useState(5)

  const pue = (Math.max(it, 1) + Math.max(cool, 0) + Math.max(misc, 0)) / Math.max(it, 1)
  const verdict =
    pue <= 1.1 ? { text: '✅ ≤ 1.1 — leading-facility territory; liquid + free cooling territory', style: { borderColor: 'var(--ok)', color: 'var(--ok)' } }
    : pue <= 1.2 ? { text: '✅ 1.1-1.2 — good; typical for well-run liquid-cooled sites', style: { borderColor: 'var(--ok)', color: 'var(--ok)' } }
    : pue <= 1.4 ? { text: '⚠️ 1.2-1.4 — average; usually air-side infrastructure', style: { borderColor: 'var(--warn)', color: 'var(--warn)' } }
    : { text: `❌ ${pue.toFixed(2)} — legacy territory; the cooling term is eating the budget`, style: { borderColor: 'var(--heat)', color: 'var(--heat)' } }

  return (
    <main className="container" style={{ padding:"40px 20px" }}>
      <p className="updated">Formula · 2 min read</p>
      <h1>PUE math — and what it hides</h1>

      <p style={{ maxWidth:"680px" }}>
        PUE = total facility energy ÷ IT energy: <b>100 kW of IT with 15 kW of overhead scores 1.15</b>.
        Liquid cooling reaches 1.05-1.2 where air needs 1.4-1.6 — but the number assumes
        facility-scale infrastructure and honest climate, which single-cabinet deployments don't have.
      </p>

      <h2>Formula</h2>
      <div className="formula">PUE = (P<sub>IT</sub> + P<sub>cooling</sub> + P<sub>power loss</sub> + P<sub>misc</sub>) / P<sub>IT</sub></div>

      <h2>Worked example</h2>
      <div className="formula">(100 + 10 + 4 + 1) / 100 = <b>1.15</b></div>
      <p style={{ maxWidth:"680px" }}>
        A facility moving 100 kW of IT heat with 10 kW of cooling energy (efficient free-cooling or
        liquid), 4 kW of UPS/conversion losses and 1 kW of lighting and controls runs at PUE 1.15.
        The same site on legacy air with 45 kW of cooling energy runs 1.50.
      </p>

      <h2>Try it</h2>
      <div className="fcalc">
        <div className="frow">
          <label>IT load (kW)<input type="number" value={it} min={1} step={1} onChange={e => setIt(+e.target.value)} /></label>
          <label>Cooling energy (kW)<input type="number" value={cool} min={0} step={0.5} onChange={e => setCool(+e.target.value)} /></label>
          <label>Power losses + misc (kW)<input type="number" value={misc} min={0} step={0.5} onChange={e => setMisc(+e.target.value)} /></label>
        </div>
        <div className="fresult">{pue.toFixed(2)}</div>
        <div className="fverdict" style={verdict.style}>{verdict.text}</div>
      </div>

      <h2>What it hides</h2>
      <ul>
        <li><b>Climate is invisible.</b> The same hardware scores differently in Munich and Singapore — free cooling hours depend on wet-bulb (<a href="/wet-bulb-free-cooling">wet-bulb physics</a>). Cross-climate PUE comparisons are marketing, not engineering.</li>
        <li><b>Liquid cooling doesn't shrink IT power.</b> It shrinks the cooling term. A rack's IT draw is the same; what changes is how cheaply the heat leaves the building.</li>
        <li><b>A cabinet in a room has no honest PUE.</b> If the "facility" is office AC shared with humans, the boundary is undefined. Use the <a href="/room-ac-load">1.1× room load rule</a> instead for micro deployments.</li>
      </ul>

      <h2>Related</h2>
      <p>
        <a href="/room-ac-load">Room AC load</a> ·
        <a href="/wet-bulb-free-cooling">Wet-bulb &amp; free cooling</a> ·
        <a href="/liquid-cooling-vs-air">Liquid vs air</a>
      </p>

      <h2>Sources</h2>
      <p className="src">Definition: The Green Grid / ISO/IEC 30134-2. Band context: Uptime Institute global surveys (air-cooled averages ≈ 1.5; leading liquid-cooled facilities 1.1 or below).</p>
    </main>
  )
}
