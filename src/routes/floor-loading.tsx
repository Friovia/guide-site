import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'

const faqs = [
  {
    q: 'How much floor load does a liquid-cooled server rack impose?',
    a: 'Divide the filled rack mass times 9.81 by its footprint. A typical fully-loaded liquid cabinet — say 1,200 kg on a 600 × 1,200 mm footprint — imposes about 16.4 kN/m² (≈ 1,670 kg/m²), roughly five times a standard office floor design load of 2.5-3.5 kN/m². Reinforced slabs or ground floors are usually required.',
  },
  {
    q: 'What floor load rating do data centers have?',
    a: 'Raised-floor computer rooms are commonly designed for roughly 7-12 kN/m², and light-industrial spaces for 10 kN/m² or more. Regular office space is typically 2.5-3.5 kN/m² and residential lower — a liquid rack in an office building needs a structural engineer\u2019s confirmation, not an assumption.',
  },
]

export const Route = createFileRoute('/floor-loading')({
  ...pageRoute({
    path: '/floor-loading',
    title: 'Floor loading for liquid-cooled racks (kN/m² calculator)',
    description: 'Floor load = mass × 9.81 ÷ footprint: a 1,200 kg rack on 600 × 1,200 mm prints 16.4 kN/m², ~5× an office floor design load (~3 kN/m²). Live calculator, typical design ranges, and the concentrated-load mistake.',
    article: { title: 'Floor loading', description: 'Can the building carry the rack?', datePublished: '2026-10-08', dateModified: '2026-10-08' },
    faq: faqs,
    component: FloorPage,
  }),
})

function FloorPage() {
  const [mass, setMass] = useState(1200)
  const [w, setW] = useState(600)
  const [d, setD] = useState(1200)

  const load = (mass * 9.81) / ((w / 1000) * (d / 1000))
  const kgm2 = load * 102
  const verdict =
    load > 12 ? { text: '❌ Industrial-grade load — most office and clinical buildings cannot take this without reinforcement', style: { borderColor: 'var(--heat)', color: 'var(--heat)' } }
    : load > 7 ? { text: '⚠️ Computer-room / industrial territory — structural sign-off mandatory, ground floor or reinforced slab', style: { borderColor: 'var(--warn)', color: 'var(--warn)' } }
    : load > 3.5 ? { text: '⚠️ Above typical office ratings (~2.5-3.5 kN/m²) — verify the as-built slab before ordering', style: { borderColor: 'var(--warn)', color: 'var(--warn)' } }
    : { text: '✅ Within typical office design loads — still verify for old or timber-floor buildings', style: { borderColor: 'var(--ok)', color: 'var(--ok)' } }

  return (
    <main className="container" style={{ padding:"40px 20px" }}>
      <p className="updated">Formula · 2 min read</p>
      <h1>Floor loading</h1>

      <p style={{ maxWidth:"680px" }}>
        Floor load is mass over footprint: <b>1,200 kg on a 600 × 1,200 mm rack prints 16.4 kN/m²</b> —
        five times a typical office floor's design load (~3 kN/m²). In hospitals, offices and
        renovated buildings, this check comes before any cooling math.
      </p>

      <h2>Formula</h2>
      <div className="formula">load [kN/m²] = m [kg] × 9.81 / (w [m] × d [m])&nbsp;&nbsp;·&nbsp;&nbsp;1 kN/m² ≈ 102 kg/m²</div>

      <h2>Worked example</h2>
      <div className="formula">1,200 × 9.81 / (0.6 × 1.2) = <b>16.4 kN/m²</b> ≈ 1,670 kg/m²</div>
      <p style={{ maxWidth:"680px" }}>
        Typical design loads (verify with a structural engineer for the actual building):
        residential ≈ 1.5-2 kN/m², offices ≈ 2.5-3.5, raised-floor computer rooms ≈ 7-12,
        light industrial ≈ 10+. A fully-loaded liquid cabinet is industrial-grade concentrated load.
      </p>

      <h2>Try it</h2>
      <div className="fcalc">
        <div className="frow">
          <label>Filled rack mass (kg)<input type="number" value={mass} min={0} step={50} onChange={e => setMass(+e.target.value)} /></label>
          <label>Width (mm)<input type="number" value={w} min={200} step={50} onChange={e => setW(+e.target.value)} /></label>
          <label>Depth (mm)<input type="number" value={d} min={200} step={50} onChange={e => setD(+e.target.value)} /></label>
        </div>
        <div className="fresult">
          {load.toFixed(1)} kN/m² <small>≈ {kgm2.toFixed(0)} kg/m²</small>
        </div>
        <div className="fverdict" style={verdict.style}>{verdict.text}</div>
      </div>

      <h2>Common mistakes</h2>
      <ul>
        <li><b>Averaging over the room.</b> Codes and slabs care about the concentrated load under the frame and casters, not the average across the floor area.</li>
        <li><b>Assuming "server room" ratings.</b> An office built as an office is rated as an office, whatever it is called now. Old buildings and timber floors can be far lower — get the as-built rating.</li>
        <li><b>Forgetting dynamics and route.</b> Rolling a 1,000 kg crate across a corridor imposes different loads than a static rack; delivery paths, lifts and thresholds need their own check.</li>
      </ul>

      <h2>Related</h2>
      <p>
        <a href="/site-survey">Site survey</a> (where this check lives in practice) ·
        <a href="/room-load-calculation">Room load calculation</a> ·
        <a href="/cold-plate-vs-immersion">Cold plate vs immersion</a> (immersion tanks are heavier still)
      </p>

      <h2>Sources</h2>
      <p className="src">Typical ranges per common structural design practice (e.g., EN 1991-1-1 categories). Actual capacity is building-specific — this page sizes the question, a structural engineer signs the answer.</p>
    </main>
  )
}
