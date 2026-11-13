// Wei-Zhu canvas: the whole industry chain in one figure — business flow →,
// cash flow ←, information ⇄, support layer beneath. Data-driven from
// vendors.json (company counts update automatically). Ported from ChainCanvas.vue.
import vendors from '~/data/vendors.json'

const STAGE_MAP: Record<string, number> = {
  materials: 0,
  'cold-plates': 1, cdus: 1, interconnects: 1, fluids: 1, components: 1, 'heat-rejection': 1,
  chips: 2, servers: 2, immersion: 2, integrators: 2, 'micro-dc': 2,
  solutions: 3, testing: 3,
  buyers: 4,
}
const TITLES = [
  { title: 'MATERIALS', zh: '材料与制造' },
  { title: 'COMPONENTS', zh: '核心部件' },
  { title: 'SYSTEMS & SOLUTIONS', zh: '整机与方案' },
  { title: 'DELIVERY & ASSURANCE', zh: '交付与保障' },
  { title: 'BUYERS & OPERATIONS', zh: '买方与运营' },
]
const stages = TITLES.map((t, i) => ({
  ...t,
  x: 20 + i * 220,
  segs: (vendors.segments as { id: string, label: string, companies: unknown[] }[]).filter(s => STAGE_MAP[s.id] === i),
}))

export function ChainCanvas() {
  return (
    <figure className="fig" style="margin-inline:0">
      <svg viewBox="0 0 1120 640" role="img" aria-label="Liquid cooling industry chain canvas: business flow left to right, cash flow right to left, information flow bidirectional, with standards and knowledge as the support layer" style="width:100%;height:auto;display:block">
        <defs>
          <marker id="cc-biz" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="var(--cool)" /></marker>
          <marker id="cc-cash" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="var(--warn)" /></marker>
          <marker id="cc-info" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="var(--text2)" /></marker>
          <marker id="cc-info-l" markerWidth="9" markerHeight="9" refX="1" refY="3" orient="auto"><path d="M7,0 L0,3 L7,6 z" fill="var(--text2)" /></marker>
        </defs>

        {/* INFORMATION FLOW band (top) */}
        <g>
          <text x="20" y="24" className="cc-band" fill="var(--text2)">INFORMATION FLOW — 信息流</text>
          <line x1="20" y1="46" x2="1100" y2="46" stroke="var(--text2)" strokeWidth="1.5" strokeDasharray="7 6" markerEnd="url(#cc-info)" markerStart="url(#cc-info-l)" />
          <text x="60" y="38" className="cc-note">specs · derating curves · BIM models →</text>
          <text x="640" y="38" className="cc-note">← demand · site conditions · live telemetry</text>
        </g>

        {/* chain stages */}
        {stages.map((st, i) => (
          <g key={st.title}>
            <rect x={st.x} y="86" width="200" height="300" rx="10" fill="var(--bg2)" stroke="var(--line2)" strokeWidth="1.5" style={i === 4 ? { stroke: 'var(--cool)', strokeWidth: 2 } : undefined} />
            <text x={st.x + 100} y="112" textAnchor="middle" className="cc-stage">{i + 1} · {st.title}</text>
            <text x={st.x + 100} y="128" textAnchor="middle" className="cc-sub">{st.zh}</text>
            {st.segs.map((seg, j) => (
              <g key={seg.id}>
                <text x={st.x + 14} y={156 + j * 24} className="cc-seg">· {seg.label.split(' (')[0].split(' — ')[0]}</text>
                <text x={st.x + 186} y={156 + j * 24} textAnchor="end" className="cc-cnt">{seg.companies.length}</text>
              </g>
            ))}
            {i < 4 && <line x1={st.x + 202} y1="236" x2={st.x + 218} y2="236" stroke="var(--cool)" strokeWidth="2.5" markerEnd="url(#cc-biz)" />}
          </g>
        ))}
        <text x="560" y="412" textAnchor="middle" className="cc-band" fill="var(--cool)">BUSINESS FLOW — 业务流（产品与服务交付）→</text>

        {/* CASH FLOW band (below stages) */}
        <g>
          <text x="20" y="452" className="cc-band" fill="var(--warn)">CASH FLOW — 现金流（付款回流）</text>
          <line x1="20" y1="476" x2="1100" y2="476" stroke="var(--warn)" strokeWidth="2" markerStart="url(#cc-cash)" />
          <text x="60" y="498" className="cc-note" fill="var(--warn)">buyers pay colocation / integrators → they pay equipment vendors → vendors pay materials & IP</text>
          <text x="640" y="498" className="cc-note" fill="var(--warn)">financing sits here: equipment leasing · data center REITs · capex deferral</text>
        </g>

        {/* SUPPORT layer */}
        <g>
          <rect x="20" y="522" width="1060" height="86" rx="10" fill="none" stroke="var(--line2)" strokeWidth="1.5" strokeDasharray="8 6" />
          <text x="40" y="550" className="cc-band" fill="var(--text2)">SUPPORT LAYER — 支撑体系（不直接交易产品，却约束每一个环节）</text>
          <text x="40" y="576" className="cc-seg">Standards: OCP · ASHRAE · IEC · SS 726 · CAICT</text>
          <text x="430" y="576" className="cc-seg">Simulation: 6SigmaDCX · FloTHERM</text>
          <text x="760" y="576" className="cc-seg">Certification: UL · TÜV · SGS</text>
          <text x="40" y="596" className="cc-note">knowledge & data: independent references (this guide) — every claim sourced, curves demanded</text>
        </g>

        {/* legend */}
        <g transform="translate(760, 18)">
          <line x1="0" y1="0" x2="34" y2="0" stroke="var(--cool)" strokeWidth="2.5" markerEnd="url(#cc-biz)" /><text x="42" y="4" className="cc-note">business</text>
          <line x1="120" y1="0" x2="154" y2="0" stroke="var(--warn)" strokeWidth="2" markerStart="url(#cc-cash)" /><text x="162" y="4" className="cc-note">cash</text>
          <line x1="228" y1="0" x2="262" y2="0" stroke="var(--text2)" strokeWidth="1.5" strokeDasharray="7 6" /><text x="270" y="4" className="cc-note">information</text>
        </g>
      </svg>
      <figcaption><b>FIG. 1</b> — The full chain, Wei-Zhu canvas style: business flow delivers left→right; cash pays back right→left (financing rides that lane); information runs both ways — specs and curves downstream, demand and telemetry upstream. Numbers = companies per segment in the tables below.</figcaption>
    </figure>
  )
}
