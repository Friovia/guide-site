import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '~/lib/seo'

export const Route = createFileRoute('/playground/room-load')({
  head: () => ({
    ...seoHead({
      title: 'Room load calculator (interactive)',
      description: 'Can your room host a liquid cooling cabinet? Live heat-to-reject, refrigeration tons, AC spare capacity comparison bar and margin verdict — math shown with your numbers.',
      path: '/playground/room-load',
    }),
  }),
  component: RoomLoadTool,
})

function RoomLoadTool() {
  const [it, setIt] = useState(30)
  const [ac, setAc] = useState(35)
  const [existing, setExisting] = useState(0)

  const q = 1.1 * it
  const tons = q / 3.517
  const spare = ac - existing
  const ratio = spare / q
  const color = ratio >= 1.15 ? 'var(--ok)' : ratio >= 1.0 ? 'var(--warn)' : 'var(--heat)'
  const verdict =
    ratio >= 1.15 ? '✅ Sufficient — the room can host this cabinet'
    : ratio >= 1.0 ? '⚠️ Conditional — derate the cabinet or verify AC condition'
    : '❌ Insufficient — upgrade AC or reduce cabinet load'
  // bar scales: 100% = max(required, available) so the two bars share one honest scale
  const scaleMax = Math.max(q, Math.max(spare, 0), 1)
  const reqPct = (q / scaleMax) * 100
  const sparePct = (Math.max(spare, 0) / scaleMax) * 100

  return (
    <main className="container" style={{ padding:"40px 24px 60px" }}>
      <p className="updated">Interactive · three inputs, live math, honest verdict</p>
      <h1>Room load calculator</h1>
      <p style={{ maxWidth:"680px" }}>
        Can your room host a liquid-to-air cabinet? The formula shows itself with <em>your</em> numbers —
        and the bar shows how thin the margin really is.
      </p>

      <div className="rl-panel">
        <div className="rl-controls">
          <label>Cabinet IT load <b>{it} kW</b><input type="range" value={it} min={1} max={50} step={1} onChange={e => setIt(+e.target.value)} /></label>
          <label>Room AC installed capacity <b>{ac} kW</b><input type="range" value={ac} min={0} max={80} step={0.5} onChange={e => setAc(+e.target.value)} /></label>
          <label>Existing heat in same zone <b>{existing} kW</b><input type="range" value={existing} min={0} max={40} step={0.5} onChange={e => setExisting(+e.target.value)} /></label>
        </div>

        <div className="rl-bar">
          <div className="glabel mono">REQUIRED — heat the room must remove</div>
          <div className="rl-track">
            <div className="rl-req" style={{ width: `${reqPct}%` }}><span>{q.toFixed(1)} kW</span></div>
          </div>
          <div className="glabel mono" style={{ marginTop:"10px" }}>AVAILABLE — AC spare capacity</div>
          <div className="rl-track">
            <div className="rl-spare" style={{ width: `${sparePct}%`, background: color }}>{spare >= 0 && <span>{spare.toFixed(1)} kW</span>}</div>
          </div>
          <div className="mono rl-margin" style={{ color }}>margin {ratio.toFixed(2)}×</div>
        </div>

        <div className="rl-verdict" style={{ borderColor: color, color }}><b>{verdict}</b></div>

        <table style={{ maxWidth:"560px" }}>
          <tbody>
            <tr><td>Heat to reject</td><td><code>1.1 × {it} = {q.toFixed(1)} kW</code></td></tr>
            <tr><td>…in refrigeration tons</td><td><code>{q.toFixed(1)} ÷ 3.517 = {tons.toFixed(1)} tons</code></td></tr>
            <tr><td>AC spare capacity</td><td><code>{ac} − {existing} = {spare.toFixed(1)} kW</code></td></tr>
            <tr><td>Margin</td><td><code>{spare.toFixed(1)} ÷ {q.toFixed(1)} = {ratio.toFixed(2)}×</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2>Try this</h2>
      <ul className="src">
        <li>IT 30 kW, AC 35 kW, existing 0 → green, but the bar shows the margin is one hot afternoon wide.</li>
        <li>Add 5 kW of existing equipment in the same zone → green turns red. Zones matter.</li>
        <li>Keep the AC, halve the IT load → find the load this room can actually host.</li>
      </ul>

      <p className="src">
        Rule: margin ≥ 1.15 green · 1.0–1.15 conditional · &lt; 1.0 insufficient. The 1.1 factor covers pumps and
        fans — the <a href="/room-ac-load">1.1× rule explained</a> · full worked guide in
        <a href="/room-load-calculation">room load calculation</a>.
      </p>
    </main>
  )
}
