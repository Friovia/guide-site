// Operating-point chart for the configurator: pump curve × system curve × their intersection.
// Nothing here is physics. The system curve is traced by the kernel (one solve per pump speed);
// the pump curve is the published datasheet curve, scaled exactly as the kernel scales it for a
// speed. Dragging the point asks the kernel which pump speed lands there.
import { useRef } from 'react'
import { pumpCurveAt, type CduId } from '~/lib/configurator'

const W = 720
const H = 300
const L = 50
const R = 20
const T = 16
const B = 38

const PUMP_LABEL: Record<CduId, string> = { cdu40: 'CDU40 pump', xcrow080: 'XCRow080 pump', cdu121: 'CDU121 pump' }

function niceStep(max: number, count: number): number {
  const raw = max / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const norm = raw / mag
  return (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag
}

function toPath(pts: readonly [number, number][]): string {
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

export function PumpChart({ pumpCurves, selected, speedPct, systemCurve, operating, flowBand, hxTrustBand, onSeekFlow }: {
  pumpCurves: { cdu: CduId; points: [number, number][] }[]
  selected: CduId
  speedPct: number
  systemCurve: [number, number][]                 // [L/min, kPa], ascending flow
  operating: { q: number; dp: number } | null     // the kernel's operating point
  flowBand: [number, number] | null               // rack flow that satisfies OAI window ∩ cold-plate θ domain
  hxTrustBand: [number, number] | null            // rack flow inside the HX's ±25% rated-flow band
  onSeekFlow: (lpm: number) => void
}) {
  const svgEl = useRef<SVGSVGElement | null>(null)
  const dragging = useRef(false)

  const own = pumpCurves.find(p => p.cdu === selected)
  const others = pumpCurves.filter(p => p.cdu !== selected)
  const ownScaled = own ? pumpCurveAt(own.points, speedPct) : []
  const ownPublished = own ? own.points : []

  const sysMax = systemCurve.length ? systemCurve[systemCurve.length - 1][0] : 0
  const xMax = Math.max(sysMax * 1.25, flowBand?.[1] ?? 0, hxTrustBand?.[1] ?? 0, 40)
  const yMax = Math.max(
    ...pumpCurves.flatMap(p => p.points.map(pt => pt[1])),
    ...systemCurve.map(p => p[1]),
    40,
  ) * 1.06
  const px = (q: number) => L + (Math.min(Math.max(q, 0), xMax) / xMax) * (W - L - R)
  const py = (h: number) => H - B - (Math.min(Math.max(h, 0), yMax) / yMax) * (H - T - B)

  const xStep = niceStep(xMax, 6)
  const yStep = niceStep(yMax, 5)
  const xTicks: number[] = []
  const yTicks: number[] = []
  for (let v = 0; v <= xMax + 1e-9; v += xStep) xTicks.push(v)
  for (let v = 0; v <= yMax + 1e-9; v += yStep) yTicks.push(v)

  function pointToFlow(e: React.PointerEvent) {
    const el = svgEl.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const fx = ((e.clientX - rect.left) / rect.width) * W
    const q = ((fx - L) / (W - L - R)) * xMax
    onSeekFlow(Math.max(0, Math.min(xMax, q)))
  }

  // Label placement. A steep pump curve gets its label beside the curve at mid-height; a flat one
  // above it, left of where the operating point sits. The system curve's label goes under its
  // low-flow end, clear of the operating point at the other end. Positions are interpolated on the
  // curve segments — the published pump curves carry only a handful of points, so snapping to the
  // next point would throw the label far off.
  const onCurve = (pts: readonly [number, number][], target: number, byFlow: boolean) => {
    const first = pts[0]
    if (!first) return { x: L + 8, y: T + 12 }
    const at = (p: readonly [number, number]) => ({ x: px(p[0]), y: py(p[1]) })
    if (pts.length === 1) return at(first)
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]
      const b = pts[i]
      if (a === undefined || b === undefined) break
      const aKey = byFlow ? a[0] : -a[1]   // flow rises along the curve; head falls
      const bKey = byFlow ? b[0] : -b[1]
      if (target <= bKey) {
        const f = bKey === aKey ? 0 : Math.min(Math.max((target - aKey) / (bKey - aKey), 0), 1)
        return at([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f])
      }
    }
    return at(pts[pts.length - 1] ?? first)
  }
  // Steep = the head falls by more than half across the PLOTTED flow range (a curve that only
  // droops far beyond the right-hand edge reads as flat on this chart).
  const isSteep = (pts: readonly [number, number][]) => {
    const first = pts[0]
    if (!first) return false
    const headAtEdge = ((H - B - onCurve(pts, xMax, true).y) / (H - T - B)) * yMax
    return first[1] - headAtEdge > first[1] * 0.5
  }
  const curveLabel = (pts: readonly [number, number][]) =>
    isSteep(pts)
      ? { ...onCurve(pts, -0.8 * yMax, false), dx: 8, dy: 18, anchor: 'start' as const }
      : { ...onCurve(pts, 0.42 * xMax, true), dx: 0, dy: -8, anchor: 'middle' as const }
  const sysLabel = { ...onCurve(systemCurve, 0.25 * xMax, true), dx: 0, dy: 14, anchor: 'middle' as const }
  const ownLabel = ownScaled.length ? curveLabel(ownScaled) : null
  const ownPublishedLabel = ownPublished.length ? curveLabel(ownPublished) : null

  // Labels are placed on their curves, then any label that would sit on an earlier one is lifted
  // a line at a time until the two no longer overlap (width estimated from the character count).
  type Placed = { x: number; y: number; anchor: 'start' | 'middle'; text: string; fill?: string; key: string }
  const place = (l: { x: number; y: number; dx: number; dy: number; anchor: 'start' | 'middle' }, text: string, key: string, fill?: string): Placed =>
    ({ x: l.x + l.dx, y: Math.max(l.y + l.dy, T + 10), anchor: l.anchor, text, fill, key })
  const textW = (s: string) => s.length * 6.6
  const box = (l: Placed) => {
    const half = l.anchor === 'start' ? 0 : textW(l.text) / 2
    return { x0: l.x - half, x1: l.x - half + textW(l.text), y0: l.y - 10, y1: l.y + 3 }
  }
  const overlaps = (a: Placed, b: Placed) => {
    const p = box(a)
    const q = box(b)
    return p.x0 < q.x1 + 6 && q.x0 < p.x1 + 6 && p.y0 < q.y1 + 2 && q.y0 < p.y1 + 2
  }
  const labels: Placed[] = []
  for (const p of others) labels.push(place(curveLabel(p.points), `${PUMP_LABEL[p.cdu]} (published)`, `other-${p.cdu}`))
  if (own && speedPct < 100 && ownPublishedLabel) labels.push(place(ownPublishedLabel, `${PUMP_LABEL[selected]} (published)`, 'own-published'))
  if (ownLabel) labels.push({ ...place(ownLabel, `${PUMP_LABEL[selected]} @ ${speedPct}%`, 'own'), fill: 'var(--cool)' })
  if (systemCurve.length > 1) labels.push(place(sysLabel, 'system curve (kernel)', 'system'))
  for (let i = 1; i < labels.length; i++) {
    const cur = labels[i]
    if (!cur) break
    let lifted = cur
    let guard = 0
    while (labels.slice(0, i).some(prev => prev && overlaps(lifted, prev)) && guard++ < 8) lifted = { ...lifted, y: lifted.y - 13 }
    labels[i] = lifted
  }

  return (
    <figure className="fig" style={{ marginInline: '0', maxWidth: '860px' }}>
      <svg
        ref={svgEl}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
        role="img"
        aria-label={operating
          ? `Pump operating point chart: ${operating.q.toFixed(1)} litres per minute at ${operating.dp.toFixed(0)} kilopascals`
          : 'Pump curve chart: no operating point, the selected CDU has no pump curve'}
        onPointerDown={e => { if (own) { dragging.current = true; pointToFlow(e) } }}
        onPointerMove={e => { if (dragging.current) pointToFlow(e) }}
        onPointerUp={() => { dragging.current = false }}
        onPointerLeave={() => { dragging.current = false }}
        onPointerCancel={() => { dragging.current = false }}
      >
        <defs>
          <clipPath id="pumpchart-plot"><rect x={L} y={T} width={W - L - R} height={H - T - B} /></clipPath>
        </defs>

        {/* data-domain bands, rack flow on the x axis */}
        {hxTrustBand && (
          <rect x={px(hxTrustBand[0])} y={T} width={Math.max(0, px(hxTrustBand[1]) - px(hxTrustBand[0]))} height={H - T - B} fill="rgba(217,164,65,0.13)" />
        )}
        {flowBand && (
          <rect x={px(flowBand[0])} y={T} width={Math.max(0, px(flowBand[1]) - px(flowBand[0]))} height={H - T - B} fill="rgba(26,127,55,0.13)" />
        )}

        {/* grid + axes */}
        {xTicks.map(v => (
          <g key={`x${v}`}>
            <line x1={px(v)} y1={T} x2={px(v)} y2={H - B} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />
            <text x={px(v)} y={H - B + 16} textAnchor="middle" className="hc-axis">{Number.isInteger(v) ? v : v.toFixed(1)}</text>
          </g>
        ))}
        {yTicks.map(v => (
          <g key={`y${v}`}>
            <line x1={L} y1={py(v)} x2={W - R} y2={py(v)} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />
            <text x={L - 8} y={py(v) + 3} textAnchor="end" className="hc-axis">{Number.isInteger(v) ? v : v.toFixed(1)}</text>
          </g>
        ))}
        <text x={W - R} y={H - 4} textAnchor="end" className="hc-axis">rack flow, L/min</text>
        <text x={L - 8} y={T - 3} textAnchor="end" className="hc-axis">kPa</text>

        <g clipPath="url(#pumpchart-plot)">
          {/* the other CDU's published pump curve, for comparison */}
          {others.map(p => (
            <path key={p.cdu} d={toPath(p.points.map(([q, h]) => [px(q), py(h)]))} fill="none" stroke="var(--text2)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" />
          ))}
          {/* the selected pump at the published speed (only when throttled, as the reference) */}
          {own && speedPct < 100 && (
            <path d={toPath(ownPublished.map(([q, h]) => [px(q), py(h)]))} fill="none" stroke="var(--cool)" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.6" />
          )}
          {/* the selected pump at the current speed */}
          {own && <path d={toPath(ownScaled.map(([q, h]) => [px(q), py(h)]))} fill="none" stroke="var(--cool)" strokeWidth="2.5" />}
          {/* the network's system curve, traced by the kernel */}
          <path d={toPath(systemCurve.map(([q, h]) => [px(q), py(h)]))} fill="none" stroke="var(--text2)" strokeWidth="2" />
        </g>

        {/* curve labels, de-overlapped */}
        {labels.map(l => (
          <text key={l.key} x={l.x} y={l.y} textAnchor={l.anchor} className="hc-note" fill={l.fill ?? undefined}>{l.text}</text>
        ))}

        {/* the operating point — drag it along the system curve; drop lines read off the axes */}
        {operating && (
          <g>
            <line x1={px(operating.q)} y1={py(operating.dp)} x2={px(operating.q)} y2={H - B} stroke="var(--text2)" strokeWidth="1" strokeDasharray="2 3" />
            <line x1={L} y1={py(operating.dp)} x2={px(operating.q)} y2={py(operating.dp)} stroke="var(--text2)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={px(operating.q)} cy={py(operating.dp)} r="9" fill="var(--cool)" stroke="#fff" strokeWidth="2.5" style={{ cursor: 'grab' }} />
          </g>
        )}
      </svg>
      <figcaption>
        Operating point = where the pump curve meets the network’s system curve. Green band: rack flow inside both the OAI window
        and the cold-plate θ domain. Amber band: inside the heat exchanger’s ±25% rated-flow band. {own ? 'Drag the point to change pump speed.' : 'No pump curve for the selected CDU — no operating point.'}
      </figcaption>
    </figure>
  )
}
