import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'

const faqs = [
  {
    q: 'What percentage of heat does direct-to-chip liquid cooling capture?',
    a: 'Typically 60-80% of server heat. Cold plates cover only the main chips (CPUs, GPUs); memory, storage and power electronics keep air-cooling themselves. Full immersion cooling is the architecture that captures nearly 100%, with different hardware and service trade-offs.',
  },
  {
    q: 'Why does the air share of server heat still matter with liquid cooling?',
    a: 'Because the 20-40% that stays on air still heats the room. A liquid-to-air cabinet rejects it into the deployment space, so room air conditioning must be sized for the total IT load (about 1.1×), not just the liquid-captured portion.',
  },
]

export const Route = createFileRoute('/heat-capture-split')({
  ...pageRoute({
    path: '/heat-capture-split',
    title: 'Heat capture split — how much heat direct-to-chip actually takes',
    description: 'Direct-to-chip liquid cooling captures 60-80% of server heat: P_liquid = capture × P_IT. Worked example (40 kW at 75% → 30 kW liquid / 10 kW air), live calculator, and why the air share still needs room AC.',
    article: { title: 'Heat capture split (liquid vs air)', description: 'How much heat direct-to-chip actually captures.', datePublished: '2026-10-08', dateModified: '2026-10-08' },
    faq: faqs,
    component: CapturePage,
  }),
})

function CapturePage() {
  const [it, setIt] = useState(40)
  const [capPct, setCapPct] = useState(75)
  const [dt, setDt] = useState(8)

  const cap = capPct / 100
  const liq = it * cap
  const air = it * (1 - cap)
  const flow = liq * 60 / (4.186 * Math.max(dt, 0.5))
  const verdict =
    capPct >= 100 ? { text: 'ℹ️ 100% capture means immersion-class — direct-to-chip hardware cannot get here', style: { borderColor: 'var(--text)', color: 'var(--text2)' } }
    : air > 15 ? { text: `⚠️ ${air.toFixed(1)} kW stays on air — that is a real room-AC line item, not a rounding error`, style: { borderColor: 'var(--warn)', color: 'var(--warn)' } }
    : { text: `✅ ${liq.toFixed(1)} kW to liquid, ${air.toFixed(1)} kW to air — plan room AC for the total`, style: { borderColor: 'var(--ok)', color: 'var(--ok)' } }

  return (
    <main className="container" style={{ padding:"40px 20px" }}>
      <p className="updated">Formula · 2 min read</p>
      <h1>Heat capture split (liquid vs air)</h1>

      <p style={{ maxWidth:"680px" }}>
        Direct-to-chip liquid cooling captures <b>60-80% of server heat</b>, not all of it:
        P<sub>liquid</sub> = capture × P<sub>IT</sub>. A 40 kW rack at 75% capture sends
        30 kW to liquid and 10 kW to air — and the air share still needs the room to remove it.
      </p>

      <h2>Formula</h2>
      <div className="formula">P<sub>liquid</sub> [kW] = capture × P<sub>IT</sub> [kW]&nbsp;&nbsp;·&nbsp;&nbsp;P<sub>air</sub> = (1 − capture) × P<sub>IT</sub></div>
      <p style={{ maxWidth:"680px" }}>
        Cold plates sit only on the big chips (CPUs, GPUs, accelerators). Memory, drives, VRMs and
        power supplies keep air-cooling themselves. Full immersion is the architecture that captures
        ~100% — at the cost of different hardware, fluids and service model
        (<a href="/cold-plate-vs-immersion">comparison</a>).
      </p>

      <h2>Worked example</h2>
      <div className="formula">40 kW × 0.75 = <b>30 kW to liquid</b> · 40 × 0.25 = <b>10 kW to air</b></div>
      <p style={{ maxWidth:"680px" }}>
        The 10 kW air share is why an L2A cabinet still moves substantial air, and why
        <a href="/room-ac-load">room AC sizing uses the full IT load</a>, not just the liquid part.
      </p>

      <h2>Try it</h2>
      <div className="fcalc">
        <div className="frow">
          <label>IT load (kW)<input type="number" value={it} min={0} step={1} onChange={e => setIt(+e.target.value)} /></label>
          <label>Capture {Math.round(cap * 100)}%<input type="range" value={capPct} min={40} max={100} step={5} onChange={e => setCapPct(+e.target.value)} /></label>
          <label>ΔT for flow calc (°C)<input type="number" value={dt} min={1} max={30} step={0.5} onChange={e => setDt(+e.target.value)} /></label>
        </div>
        <div className="fresult">
          {liq.toFixed(1)} kW liquid <small>· {air.toFixed(1)} kW to air · flow {flow.toFixed(0)} L/min</small>
        </div>
        <div className="fverdict" style={verdict.style}>{verdict.text}</div>
      </div>

      <h2>Common mistakes</h2>
      <ul>
        <li><b>Assuming 100% capture.</b> Only immersion gets close. Sizing flow, CDU capacity and room AC on 100% overstates the liquid side and — worse — hides the air share that still heats the room.</li>
        <li><b>Using TDP sums as measured load.</b> Thermal design power is a worst-case rating; typical draw is lower and varies with workload (<a href="/tdp-to-rack-kw">TDP → rack kW</a>).</li>
        <li><b>Forgetting the air share entirely.</b> The 20-40% that stays on air still needs cabinet airflow, room AC capacity and an air path out of the room.</li>
      </ul>

      <h2>Related</h2>
      <p>
        <a href="/coolant-flow-rate">Coolant flow rate</a> (uses the liquid share) ·
        <a href="/room-ac-load">Room AC load</a> (uses the total) ·
        <a href="/playground/rack-builder">Rack builder</a> applies per-server capture
      </p>

      <h2>Sources</h2>
      <p className="src">60-80% direct-to-chip capture is the range used across vendor documentation and this site's data layer; the rack builder uses 75-80% for GPU nodes and 50% for CPU nodes.</p>
    </main>
  )
}
