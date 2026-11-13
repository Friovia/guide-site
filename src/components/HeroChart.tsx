// Homepage hero: a real capacity-vs-room-temperature chart with a draggable point
// constrained to the derating curve (capacity = rated × approach / approach_rated).
// Ported from HeroChart.vue — same geometry and physics. Styles in global main.css (.hc-/.hp-).
import { useRef, useState } from 'react'

export function HeroChart({ label, caption, sub, ratedKw = 50, coolantC = 45 }: {
  label: string
  caption: string // may contain {t}
  sub: string
  ratedKw?: number
  coolantC?: number
}) {
  const [temp, setTemp] = useState(25)
  const dragging = useRef(false)
  const svgEl = useRef<SVGSVGElement | null>(null)

  const rated = ratedKw
  const coolant = coolantC
  const approach = coolant - temp
  const cap = approach <= 5 ? 0 : rated * approach / (coolant - 25)
  const capNow = Math.max(cap, 0)
  const color = cap === 0 ? 'var(--heat)' : cap / rated < 0.6 ? 'var(--warn)' : 'var(--cool)'

  // chart geometry: X 18–42 °C → 34–548 px, Y 0–60 kW → 196–12 px
  const px = (t: number) => 34 + ((t - 18) / 24) * 514
  const py = (k: number) => 196 - (Math.min(k, 60) / 60) * 184

  const curvePath = (() => {
    const pts: string[] = []
    for (let t = 18; t <= 42; t += 0.5) {
      const a = coolant - t
      const k = a <= 5 ? 0 : rated * a / (coolant - 25)
      pts.push(`${pts.length ? 'L' : 'M'}${px(t).toFixed(1)},${py(k).toFixed(1)}`)
    }
    return pts.join(' ')
  })()
  const areaPath = (() => {
    if (cap <= 0) return ''
    let d = `M${px(18)},${py(0)}`
    for (let t = 18; t <= temp; t += 0.5) {
      const a = coolant - t
      const k = a <= 5 ? 0 : rated * a / (coolant - 25)
      d += `L${px(t).toFixed(1)},${py(k).toFixed(1)}`
    }
    return d + `L${px(temp)},${py(0)}Z`
  })()

  function pointToTemp(e: React.PointerEvent) {
    const rect = svgEl.current!.getBoundingClientRect()
    const frac = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    setTemp(Math.round(18 + frac * 24))
  }

  return (
    <div className="herochart">
      <div className="hc-chart">
        <svg
          ref={svgEl}
          viewBox="0 0 560 240"
          className="hc-svg"
          role="img"
          aria-label={`Capacity versus room temperature chart: at ${temp} degrees the cabinet can reject ${cap.toFixed(1)} kW`}
          onPointerDown={e => { dragging.current = true; pointToTemp(e) }}
          onPointerMove={e => { if (dragging.current) pointToTemp(e) }}
          onPointerUp={() => { dragging.current = false }}
          onPointerLeave={() => { dragging.current = false }}
        >
          {/* gridlines */}
          {[20, 25, 30, 35, 40].map(t => (
            <g key={`gx${t}`}>
              <line x1={px(t)} y1="12" x2={px(t)} y2="196" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />
              <text x={px(t)} y="214" textAnchor="middle" className="hc-axis">{t} °C</text>
            </g>
          ))}
          {[0, 25, 50, 75].map(k => (
            <g key={`gy${k}`}>
              <line x1="34" y1={py(k)} x2="548" y2={py(k)} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />
              <text x="28" y={py(k) + 3} textAnchor="end" className="hc-axis">{k}</text>
            </g>
          ))}
          <text x="28" y="12" className="hc-axis hc-rot">kW</text>

          {/* derating curve */}
          <path d={curvePath} fill="none" stroke="var(--cool)" strokeWidth="2.5" />
          <path d={areaPath} fill="rgba(46,127,194,0.08)" />

          {/* rated point (25 °C, 50 kW) */}
          <circle cx={px(25)} cy={py(50)} r="3.5" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
          <text x={px(25) + 7} y={py(50) - 6} className="hc-note">rated 50 kW @ 25 °C</text>

          {/* the draggable point */}
          {cap > 0 ? (
            <g>
              <line x1={px(temp)} y1={py(capNow)} x2={px(temp)} y2="196" stroke="var(--heat)" strokeWidth="1.5" />
              <circle cx={px(temp)} cy={py(capNow)} r="9" fill="var(--cool)" stroke="#fff" strokeWidth="2.5" style={{ cursor: 'grab' }} />
            </g>
          ) : (
            <text x={px(temp)} y="190" textAnchor="middle" className="hc-note" fill="var(--heat)">✕ {temp} °C</text>
          )}
        </svg>
      </div>
      <div className="hc-read">
        <div className="hp-label">{label}</div>
        <div className="hp-num" style={{ color }}>{cap.toFixed(1)} <small>kW</small></div>
        <p className="hp-cap">{caption.replace('{t}', String(temp))}</p>
        <span className="hp-read">ROOM {temp} °C</span>
        <p className="hp-sub">{sub} <a href="/approach-temperature">→</a></p>
      </div>
    </div>
  )
}
