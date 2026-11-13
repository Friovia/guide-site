import { useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '~/lib/seo'
import hw from '~/data/hardware.json'

const l2aProducts = hw.cooling.filter(c => c.type === 'L2A')

export const Route = createFileRoute('/playground/derating')({
  head: () => ({
    ...seoHead({
      title: 'Liquid cooling derating simulator (capacity vs room temperature)',
      description: 'Pick a real product (Vertiv CoolChip CDU 70 and more) or a custom rating point, then drag the operating point along the capacity-vs-room-temperature curve — approach-temperature model anchored to published vendor data.',
      path: '/playground/derating',
    }),
  }),
  component: DeratingTool,
})

function DeratingTool() {
  const [prodId, setProdId] = useState(l2aProducts[0]?.id ?? 'custom')
  const product = l2aProducts.find(p => p.id === prodId)
  const [qref, setQref] = useState(product?.ratedKw ?? 86.5)
  const [tref, setTref] = useState(product?.ratedRoomC ?? 25)
  const [tc, setTc] = useState(product?.coolantC ?? 45)
  const [troom, setTroom] = useState(30)
  const dragging = useRef(false)
  const svgEl = useRef<SVGSVGElement | null>(null)

  function pickProduct(id: string) {
    setProdId(id)
    const p = l2aProducts.find(x => x.id === id)
    if (p) {
      setQref(p.ratedKw)
      setTref(p.ratedRoomC ?? 25)
      setTc(p.coolantC ?? 45)
    }
  }

  function capacity(air: number): number {
    const atd = tc - air
    const atdRef = tc - tref
    if (atd <= 5) return 0
    return Math.min(qref, qref * atd / atdRef)
  }
  const q = capacity(troom)
  const pct = Math.round(100 * q / qref)
  const color = q === 0 ? 'var(--heat)' : pct < 60 ? 'var(--warn)' : 'var(--cool)'
  const verdict = q === 0 ? 'APPROACH COLLAPSED' : pct < 60 ? `${pct}% OF RATED — TROPICAL TERRITORY` : `${pct}% OF RATED — HEALTHY`

  const yMax = Math.ceil(qref / 25) * 25
  const yTicks: number[] = []
  for (let k = 0; k <= yMax; k += 25) yTicks.push(k)
  const px = (t: number) => 44 + ((t - 18) / 24) * 504
  const py = (k: number) => 236 - (Math.min(k, yMax) / yMax) * 222

  const curvePath = (() => {
    const pts: string[] = []
    for (let t = 18; t <= 42; t += 0.25) pts.push(`${pts.length ? 'L' : 'M'}${px(t).toFixed(1)},${py(capacity(t)).toFixed(1)}`)
    return pts.join(' ')
  })()
  const areaPath = (() => {
    if (q <= 0) return ''
    let d = `M${px(18)},${py(0)}`
    for (let t = 18; t <= troom; t += 0.25) d += `L${px(t).toFixed(1)},${py(capacity(t)).toFixed(1)}`
    return d + `L${px(troom)},${py(0)}Z`
  })()

  function pointToTemp(e: React.PointerEvent) {
    const rect = svgEl.current!.getBoundingClientRect()
    const frac = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    setTroom(Math.round(18 + frac * 24))
  }

  return (
    <main className="container" style={{ padding:"40px 24px 60px" }}>
      <p className="updated">Interactive · approach-temperature model, anchored to published data</p>
      <h1>Derating simulator — capacity vs room temperature</h1>
      <p style={{ maxWidth:"680px" }}>
        A liquid-to-air CDU's capacity falls as room temperature rises — it scales with the approach
        temperature. Pick a product (or custom), then drag the operating point along the curve.
      </p>

      <div className="ds-grid">
        {/* chart */}
        <div className="ds-chart">
          <svg
            ref={svgEl} viewBox="0 0 560 280" className="ds-svg" role="img"
            aria-label={`Capacity versus room temperature: at ${troom} degrees the unit rejects ${q.toFixed(1)} kW`}
            onPointerDown={e => { dragging.current = true; pointToTemp(e) }}
            onPointerMove={e => { if (dragging.current) pointToTemp(e) }}
            onPointerUp={() => { dragging.current = false }}
            onPointerLeave={() => { dragging.current = false }}
          >
            {[18, 22, 26, 30, 34, 38, 42].map(t => (
              <g key={`gx${t}`}>
                <line x1={px(t)} y1="14" x2={px(t)} y2="236" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />
                <text x={px(t)} y="254" textAnchor="middle" className="ds-axis">{t} °C</text>
              </g>
            ))}
            {yTicks.map(k => (
              <g key={`gy${k}`}>
                <line x1="44" y1={py(k)} x2="548" y2={py(k)} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />
                <text x="38" y={py(k) + 3} textAnchor="end" className="ds-axis">{k}</text>
              </g>
            ))}
            <text x="38" y="10" className="ds-axis ds-rot">kW</text>

            <path d={curvePath} fill="none" stroke="var(--cool)" strokeWidth="2.5" />
            <path d={areaPath} fill="rgba(46,127,194,0.08)" />

            <circle cx={px(tref)} cy={py(qref)} r="3.5" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
            <text x={px(tref) + 7} y={py(qref) - 6} className="ds-note">rated {qref} kW @ {tref} °C</text>

            {q > 0 ? (
              <g>
                <line x1={px(troom)} y1={py(q)} x2={px(troom)} y2="236" stroke="var(--heat)" strokeWidth="1.5" />
                <circle cx={px(troom)} cy={py(q)} r="9" fill="var(--cool)" stroke="#fff" strokeWidth="2.5" style={{ cursor: 'grab' }} />
                <text x={px(troom) + 12} y={py(q) - 10} className="ds-note" fill="var(--text)">{q.toFixed(1)} kW · {pct}%</text>
              </g>
            ) : (
              <text x={px(troom)} y="228" textAnchor="middle" className="ds-note" fill="var(--heat)">✕ approach collapsed</text>
            )}
          </svg>
        </div>

        {/* controls */}
        <div className="ds-side">
          <label>Product</label>
          <select value={prodId} aria-label="Cooling product" onChange={e => pickProduct(e.target.value)}>
            {l2aProducts.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {p.ratedKw} kW</option>
            ))}
            <option value="custom">Custom…</option>
          </select>
          <p className="src" style={{ margin:"6px 0 14px" }}>
            {product
              ? (product.source.startsWith('http') ? <a href={product.source}>source ↗</a> : <a href={product.source}>model →</a>)
              : 'Custom rating point'}
          </p>

          <label>Rated capacity <b>{qref} kW</b></label>
          <input type="range" value={qref} min={5} max={120} step={0.5} disabled={prodId !== 'custom'} onChange={e => setQref(+e.target.value)} />
          <label>Coolant supply <b>{tc} °C</b></label>
          <input type="range" value={tc} min={30} max={55} step={1} disabled={prodId !== 'custom'} onChange={e => setTc(+e.target.value)} />
          <label>Room temperature <b>{troom} °C</b></label>
          <input type="range" value={troom} min={18} max={42} step={1} onChange={e => setTroom(+e.target.value)} />

          <div className="ds-read">
            <div className="ds-num" style={{ color }}>{q.toFixed(1)} <small>kW</small></div>
            <div className="ds-verdict" style={{ color }}>{verdict}</div>
          </div>
        </div>
      </div>

      <p className="src" style={{ maxWidth:"720px", marginTop:"18px" }}>
        Model: Q = Q<sub>rated</sub> × (T<sub>coolant</sub> − T<sub>room</sub>) / (T<sub>coolant</sub> − T<sub>rated room</sub>),
        floored below a 5 °C minimum approach and capped at rating. Default anchors to the published Vertiv XDU070
        point (86.5 kW @ 45 °C coolant, 25 °C air). First-order illustration — real units have fan-speed
        compensation; demand the vendor's measured curve (<a href="/rfq-scope-checklist">RFQ item 12</a>).
      </p>

      <h2>Try this</h2>
      <ul className="src">
        <li>Keep the XDU070 defaults, drag 25 °C → 35 °C — capacity roughly halves. That's the tropics.</li>
        <li>Custom mode, coolant 45 → 50 °C — capacity recovers. This is why warmer <a href="/ashrae-w-classes">W-classes</a> matter.</li>
        <li>Drag past coolant − 5 °C — the curve hits zero: physics, not a product flaw.</li>
      </ul>
    </main>
  )
}
