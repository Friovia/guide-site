import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '~/lib/seo'
import hw from '~/data/hardware.json'

const COLORS = ['#2e7fc2', '#3d7fb2', '#275d84', '#43566a', '#5b6b7f', '#8fa5b5']
const vStyle = (c: string) => ({ border: `1px solid ${c}`, padding: '12px 16px', borderRadius: 8, color: c })

export const Route = createFileRoute('/playground/rack-builder')({
  head: () => ({
    ...seoHead({
      title: 'Rack builder — pick real servers and cooling products',
      description: 'Product-picker simulator: choose real server platforms (GB200 NVL72, HGX B200/H100, MI300X) and real cooling products (Vertiv CoolChip CDU 70, STULZ Micro DC, Asetek L2L), set room temperature, watch derated capacity, coolant flow and facility requirements settle live. TDP-budget watts, every selection sourced.',
      path: '/playground/rack-builder',
    }),
  }),
  component: RackBuilderTool,
})

function RackBuilderTool() {
  const [coolId, setCoolId] = useState(hw.cooling[0].id)
  const [pickId, setPickId] = useState(hw.servers[2].id)
  const [qty, setQty] = useState(4)
  const [roomT, setRoomT] = useState(25)
  // land alive: a realistic default build instead of an empty rack
  const [counts, setCounts] = useState<Map<string, number>>(new Map([['hgx-h100', 4]]))

  const cool = hw.cooling.find(c => c.id === coolId) ?? hw.cooling[0]

  function add() {
    setCounts(prev => {
      const next = new Map(prev)
      next.set(pickId, (next.get(pickId) ?? 0) + Math.max(1, qty))
      return next
    })
  }

  const rows = [...counts.entries()].map(([id, n], i) => {
    const s = hw.servers.find(x => x.id === id)!
    return { ...s, n, color: COLORS[i % COLORS.length] }
  })
  const rackRows = rows.map(r => ({ ...r, h: Math.min(r.u * r.n, 42) * 10 }))

  const uUsed = rows.reduce((s, r) => s + r.u * r.n, 0)
  const totalIt = rows.reduce((s, r) => s + r.kw * r.n, 0)
  const liqKw = rows.reduce((s, r) => s + r.kw * r.n * r.capture, 0)
  const airKw = totalIt - liqKw
  const flow = liqKw * 60 / (4.186 * 8)

  const specPublished = typeof cool.ratedKw === 'number'
  const capacity = (() => {
    const c = cool
    if (typeof c.ratedKw !== 'number') return NaN
    if (c.type === 'L2L') return c.ratedKw
    const approach = (c.coolantC ?? 45) - roomT
    if (approach <= (c.minApproachK ?? 5)) return 0
    return c.ratedKw * approach / ((c.coolantC ?? 45) - (c.ratedRoomC ?? 25))
  })()
  const utilPct = Math.round(100 * liqKw / Math.max(capacity, 0.01))
  const gaugeColor = utilPct > 100 ? 'var(--heat)' : utilPct > 85 ? 'var(--warn)' : 'var(--cool)'

  const verdict =
    !counts.size ? { text: 'Add servers to begin — start with one GB200 NVL72 rack and see every cabinet class fail.', style: vStyle('var(--text2)') }
    : !specPublished ? { text: '❓ Rating not published for this product — no honest model is possible until the vendor provides the capacity-vs-ambient curve (RFQ item 12)', style: vStyle('var(--warn)') }
    : capacity === 0 ? { text: `❌ Approach collapsed at ${roomT} °C — L2A physically cannot reject at this room temperature`, style: vStyle('var(--heat)') }
    : uUsed > 42 ? { text: `❌ ${uUsed}U in a 42U frame — this is multi-rack territory, model it per rack`, style: vStyle('var(--heat)') }
    : liqKw > capacity ? { text: `❌ Liquid load exceeds capacity by ${(liqKw - capacity).toFixed(1)} kW — bigger product, cooler room, or fewer servers`, style: vStyle('var(--heat)') }
    : utilPct > 85 ? { text: '⚠️ Above 85% utilization — no headroom for a hot afternoon', style: vStyle('var(--warn)') }
    : { text: `✅ Fits — ${100 - utilPct}% thermal headroom, ${42 - uUsed}U free, at ${roomT} °C`, style: vStyle('var(--ok)') }

  return (
    <main className="container" style={{ padding:"40px 24px 60px" }}>
      <p className="updated">Interactive · pick real products, watch the physics settle</p>
      <h1>Rack builder — the product picker</h1>
      <p style={{ maxWidth:"680px" }}>
        Select a real cooling product and real server platforms, set the room, and watch capacity derate
        against it. Server watts are TDP budgets (ΣGPU + ΣCPU) × 1.2 from public specs — every selection
        links its source. Same physics as the <a href="/coolant-flow-rate">formulas section</a>.
      </p>

      {/* Cooling product picker */}
      <h2>Cooling product</h2>
      <div className="pickrow">
        {hw.cooling.map(c => (
          <button key={c.id} className={`pickcard${coolId === c.id ? ' on' : ''}`} onClick={() => setCoolId(c.id)}>
            <b>{c.name}</b>
            <span className="src">{c.type} · {c.ratedKw ? `${c.ratedKw} kW${c.coolantC ? ` @ ${c.ratedRoomC} °C / ${c.coolantC} °C coolant` : ''}` : '❌ rating not published'}</span>
          </button>
        ))}
      </div>
      <p className="src" style={{ margin:"8px 0 0" }}>
        {cool.facility} ·
        {cool.source.startsWith('http') ? <a href={cool.source}>source ↗</a> : <a href={cool.source}>on this site →</a>}
      </p>

      {/* Server picker */}
      <h2>Servers</h2>
      <div className="addrow">
        <select value={pickId} aria-label="Server model" onChange={e => setPickId(e.target.value)}>
          {hw.servers.map(s => (
            <option key={s.id} value={s.id}>{s.name} — {s.kw} kW / {s.u}U</option>
          ))}
        </select>
        <input type="number" value={qty} min={1} max={20} aria-label="Quantity" onChange={e => setQty(+e.target.value)} />
        <button className="addbtn" onClick={add}>+ Add</button>
      </div>

      <div className="workbench">
        {/* Rack visual */}
        <div className="rackcol">
          <div className="rackhead mono">42U RACK · <span style={{ color: uUsed > 42 ? 'var(--heat)' : 'var(--text)' }}>{uUsed}U USED</span></div>
          <div className="rack">
            {rackRows.map(row => (
              <div key={row.id} className="unit" style={{ height: `${row.h}px`, background: row.color }} title={row.name}>
                <span className="ulabel">{row.name}{row.n > 1 && ` ×${row.n}`} · {row.kw} kW</span>
              </div>
            ))}
            {!counts.size && <div className="empty mono">ADD SERVERS ABOVE</div>}
          </div>
          {rows.map(row => (
            <div key={`s${row.id}`} className="srcline src">
              {row.name}: {row.chip} —
              {row.source.startsWith('http') ? <a href={row.source}>spec ↗</a> : <a href={row.source}>model →</a>}
            </div>
          ))}
        </div>

        {/* Gauges & controls */}
        <div className="gauges">
          <h3>Readouts</h3>
          <div className="glabel mono">LIQUID LOAD vs {cool.type === 'L2A' ? 'DERATED' : 'RATED'} CAPACITY</div>
          <div className="gauge"><div className="gfill" style={{ width: `${specPublished ? Math.min(utilPct, 100) : 0}%`, background: gaugeColor }}></div></div>
          <div className="mono small">{liqKw.toFixed(1)} kW / {specPublished ? `${capacity.toFixed(1)} kW (${utilPct}%)` : '— no published rating'}</div>

          <div className="glabel mono" style={{ marginTop:"14px" }}>RACK SPACE</div>
          <div className="gauge"><div className="gfill" style={{ width: `${uUsed / 42 * 100}%`, background: uUsed > 42 ? 'var(--heat)' : 'var(--cool)' }}></div></div>
          <div className="mono small">{uUsed}U / 42U</div>

          <div className="glabel mono" style={{ marginTop:"14px" }}>ROOM</div>
          <label>Room temp <b>{roomT} °C</b><input type="range" value={roomT} min={18} max={42} disabled={cool.type !== 'L2A'} onChange={e => setRoomT(+e.target.value)} /></label>
          {cool.type === 'L2A'
            ? <p className="src" style={{ margin:"4px 0 0" }}>Capacity derates with room air (<a href="/approach-temperature">why</a>)</p>
            : <p className="src" style={{ margin:"4px 0 0" }}>L2L: capacity set by facility water, not room air — slider disabled</p>}
        </div>
      </div>

      <div style={{ ...verdict.style, marginTop: 22 }}><b>{verdict.text}</b></div>

      <figure className="fig" style={{ marginInline: 0, marginTop: 18 }}>
        <table style={{ maxWidth:"760px" }}>
          <tbody>
            <tr><td>Total IT</td><td><code>{totalIt.toFixed(1)} kW</code></td><td>Heat to liquid</td><td><code>{liqKw.toFixed(1)} kW</code></td></tr>
            <tr><td>Heat to air</td><td><code>{airKw.toFixed(1)} kW</code></td><td>Coolant flow @ ΔT 8 °C</td><td><code>{flow.toFixed(0)} L/min</code></td></tr>
            <tr>
              <td>Capacity at {cool.type === 'L2A' ? `${roomT} °C room` : 'facility water'}</td>
              <td><code>{specPublished ? `${capacity.toFixed(1)} kW` : '❌ unpublished'}</code></td>
              {cool.type === 'L2A' ? (
                <>
                  <td>Room AC (1.1×)</td><td><code>{(totalIt * 1.1).toFixed(1)} kW ≈ {(totalIt * 1.1 / 3.517).toFixed(1)} tons</code></td>
                </>
              ) : (
                <>
                  <td>Facility water</td><td><code>tempered loop required</code></td>
                </>
              )}
            </tr>
          </tbody>
        </table>
        <figcaption><b>FIG. 1</b> — Live build. Flow: L/min = kW × 60 / (4.186 × ΔT). Derating: approach-temperature model on the selected product's rating point. Watts are TDP budgets, not measured draw.</figcaption>
      </figure>

      <h2>Try this</h2>
      <ul className="src">
        <li>Add one GB200 NVL72 rack with the 30 kW cabinet selected → the gap is the whole story: no single-cabinet class fits a 120 kW rack.</li>
        <li>8× H100 × 4 nodes + Vertiv CDU 70 → fits at 25 °C; slide the room to 35 °C and watch the verdict flip.</li>
        <li>Switch to Asetek L2L → capacity stops derating, but the facility-water requirement takes over the room-AC line.</li>
      </ul>
    </main>
  )
}
