// Animated coolant-loop simulator: servers → manifold → CDU → room air, with four
// live sliders (IT load, capture, room temp, coolant temp). CSS dash/spin animation
// speed tracks flow. Ported from LoopSim.vue — physics identical (flow/capture/derating
// models shared with the calculator pages). Styles live in global main.css (.ls-*).
import { useState } from 'react'

export function LoopSim() {
  const [it, setIt] = useState(40)
  const [capPct, setCapPct] = useState(75)
  const [roomT, setRoomT] = useState(25)
  const [coolT, setCoolT] = useState(45)

  const capture = capPct / 100
  const totalIt = it
  const liqKw = totalIt * capture
  const airKw = totalIt - liqKw
  const flow = liqKw * 60 / (4.186 * 8)
  const approach = coolT - roomT
  const cap = approach <= 5 ? 0 : 50 * approach / 20
  const utilPct = Math.round(100 * liqKw / Math.max(cap, 0.01))
  const flowDur = Math.max(6 - flow / 25, 0.5) // faster flow → faster dashes
  const heatOpacity = Math.min(liqKw / 40 + 0.25, 1)
  const plateFill = liqKw > cap ? 'rgba(255,106,85,0.22)' : 'var(--panel2)'
  const verdictText = cap === 0 ? 'APPROACH COLLAPSED' : liqKw > cap ? 'OVERLOAD' : utilPct > 85 ? 'THIN MARGIN' : 'OK'
  const verdictColor = (cap === 0 || liqKw > cap) ? 'var(--heat)' : utilPct > 85 ? 'var(--warn)' : 'var(--ok)'

  return (
    <div className="loopsim">
      <svg viewBox="0 0 760 290" role="img" aria-label="Animated coolant loop: servers to manifold to CDU, heat rejected to room air" className="ls-svg">
        <defs>
          <marker id="ls-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--cool)" /></marker>
        </defs>

        {/* Servers (3U stack) */}
        {[1, 2, 3].map(i => (
          <g key={i}>
            <rect x="22" y={40 + (i - 1) * 62} width="150" height="46" rx="2" fill="var(--panel)" stroke="var(--text)" strokeWidth="1.5" />
            <rect x="30" y={48 + (i - 1) * 62} width="52" height="14" rx="1" fill={plateFill} stroke="var(--cool)" strokeWidth="1.2" />
            <text x="30" y={76 + (i - 1) * 62} className="ls-t ls-dim">COLD PLATES</text>
            <text x="118" y={58 + (i - 1) * 62} className="ls-t">SERVER {i}</text>
          </g>
        ))}
        <text x="22" y="30" className="ls-t ls-dim">{totalIt.toFixed(0)} kW IT · {(capture * 100).toFixed(0)}% TO LIQUID</text>

        {/* Supply / return to manifold */}
        <path d="M172 62 H236" className="ls-flow" style={{ animationDuration: `${flowDur}s` }} markerEnd="url(#ls-arr)" />
        <path d="M236 216 H172" className="ls-flow ls-ret" style={{ animationDuration: `${flowDur}s` }} markerEnd="url(#ls-arr)" />

        {/* Manifold */}
        <rect x="236" y="42" width="26" height="184" fill="var(--panel)" stroke="var(--text)" strokeWidth="2" />
        <text x="249" y="150" className="ls-t ls-vert" transform="rotate(-90 249 150)">MANIFOLD</text>

        {/* Manifold to CDU */}
        <path d="M262 80 H332" className="ls-flow" style={{ animationDuration: `${flowDur}s` }} markerEnd="url(#ls-arr)" />
        <path d="M332 190 H262" className="ls-flow ls-ret" style={{ animationDuration: `${flowDur}s` }} markerEnd="url(#ls-arr)" />

        {/* CDU with spinning impeller */}
        <rect x="332" y="70" width="170" height="130" fill="var(--panel)" stroke="var(--text)" strokeWidth="2" />
        <g className="ls-pump" style={{ animationDuration: `${flowDur}s` }}>
          <circle cx="378" cy="135" r="20" fill="none" stroke="var(--cool)" strokeWidth="2" />
          <path d="M378 117 v36 M360 135 h36 M365 122 l26 26 M391 122 l-26 26" stroke="var(--cool)" strokeWidth="1.6" fill="none" />
        </g>
        <text x="412" y="128" className="ls-t">CDU</text>
        <text x="412" y="146" className="ls-t ls-dim">PUMP · HX · CTRL</text>

        {/* Heat out to room air, scaled by liquid kW */}
        <g opacity={heatOpacity}>
          <path d="M502 96 H560" stroke="var(--text)" strokeWidth="2" />
          <g stroke="var(--heat)" strokeWidth="2.5" fill="none" strokeLinecap="round">
            <path d="M572 92 q8 -10 0 -20" /><path d="M588 92 q8 -10 0 -20" />
            <path d="M572 132 q8 -10 0 -20" /><path d="M588 132 q8 -10 0 -20" />
            <path d="M572 172 q8 -10 0 -20" /><path d="M588 172 q8 -10 0 -20" />
          </g>
          <text x="560" y="205" className="ls-t" fill="var(--heat)">HEAT OUT → ROOM AIR</text>
          <text x="560" y="222" className="ls-t ls-dim">{liqKw.toFixed(1)} kW to remove</text>
        </g>

        {/* Air share note */}
        <text x="22" y="252" className="ls-t ls-dim">AIR SHARE {airKw.toFixed(1)} kW cools by fans — the room AC still sees all {totalIt.toFixed(0)} kW (1.1× rule)</text>
        <text x="22" y="272" className="ls-t ls-dim" fill={verdictColor}>CAPACITY {cap.toFixed(1)} kW · {utilPct}% USED · {verdictText}</text>
      </svg>

      <div className="ls-ctrl">
        <label>IT load {totalIt.toFixed(0)} kW<input type="range" value={it} min={5} max={60} step={1} onChange={e => setIt(+e.target.value)} /></label>
        <label>Capture {(capture * 100).toFixed(0)}%<input type="range" value={capPct} min={50} max={90} step={5} onChange={e => setCapPct(+e.target.value)} /></label>
        <label>Room {roomT} °C<input type="range" value={roomT} min={18} max={42} step={1} onChange={e => setRoomT(+e.target.value)} /></label>
        <label>Coolant {coolT} °C<input type="range" value={coolT} min={40} max={50} step={1} onChange={e => setCoolT(+e.target.value)} /></label>
      </div>
      <p className="ls-read mono">flow {flow.toFixed(0)} L/min (ΔT 8 °C) · liquid {liqKw.toFixed(1)} kW · air {airKw.toFixed(1)} kW — same models as the <a href="/coolant-flow-rate">flow</a>, <a href="/heat-capture-split">capture</a> and <a href="/approach-temperature">derating</a> pages</p>
    </div>
  )
}
