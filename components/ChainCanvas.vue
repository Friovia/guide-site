<template>
  <figure class="fig" style="margin-inline:0">
    <svg viewBox="0 0 1120 640" role="img" aria-label="Liquid cooling industry chain canvas: business flow left to right, cash flow right to left, information flow bidirectional, with standards and knowledge as the support layer" style="width:100%;height:auto;display:block">
      <defs>
        <marker id="cc-biz" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="var(--cool)" /></marker>
        <marker id="cc-cash" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="var(--warn)" /></marker>
        <marker id="cc-info" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="var(--text2)" /></marker>
        <marker id="cc-info-l" markerWidth="9" markerHeight="9" refX="1" refY="3" orient="auto"><path d="M7,0 L0,3 L7,6 z" fill="var(--text2)" /></marker>
      </defs>

      <!-- INFORMATION FLOW band (top) -->
      <g>
        <text x="20" y="24" class="cc-band" fill="var(--text2)">INFORMATION FLOW — 信息流</text>
        <line x1="20" y1="46" x2="1100" y2="46" stroke="var(--text2)" stroke-width="1.5" stroke-dasharray="7 6" marker-end="url(#cc-info)" marker-start="url(#cc-info-l)" />
        <text x="60" y="38" class="cc-note">specs · derating curves · BIM models →</text>
        <text x="640" y="38" class="cc-note">← demand · site conditions · live telemetry</text>
      </g>

      <!-- chain stages -->
      <g v-for="(st, i) in stages" :key="st.id">
        <rect :x="st.x" y="86" width="200" height="300" rx="10" fill="var(--bg2)" stroke="var(--line2)" stroke-width="1.5" :style="i === 4 ? 'stroke: var(--cool); stroke-width: 2;' : ''" />
        <text :x="st.x + 100" y="112" text-anchor="middle" class="cc-stage">{{ i + 1 }} · {{ st.title }}</text>
        <text :x="st.x + 100" y="128" text-anchor="middle" class="cc-sub">{{ st.zh }}</text>
        <g v-for="(seg, j) in st.segs" :key="seg.id">
          <text :x="st.x + 14" :y="156 + j * 24" class="cc-seg">· {{ seg.label.split(' (')[0].split(' — ')[0] }}</text>
          <text :x="st.x + 186" :y="156 + j * 24" text-anchor="end" class="cc-cnt">{{ seg.companies.length }}</text>
        </g>
        <!-- business flow arrows between stages -->
        <line v-if="i < 4" :x1="st.x + 202" y1="236" :x2="st.x + 218" y2="236" stroke="var(--cool)" stroke-width="2.5" marker-end="url(#cc-biz)" />
      </g>
      <text x="560" y="412" text-anchor="middle" class="cc-band" fill="var(--cool)">BUSINESS FLOW — 业务流（产品与服务交付）→</text>

      <!-- CASH FLOW band (below stages) -->
      <g>
        <text x="20" y="452" class="cc-band" fill="var(--warn)">CASH FLOW — 现金流（付款回流）</text>
        <line x1="20" y1="476" x2="1100" y2="476" stroke="var(--warn)" stroke-width="2" marker-start="url(#cc-cash)" />
        <text x="60" y="498" class="cc-note" fill="var(--warn)">buyers pay colocation / integrators → they pay equipment vendors → vendors pay materials & IP</text>
        <text x="640" y="498" class="cc-note" fill="var(--warn)">financing sits here: equipment leasing · data center REITs · capex deferral</text>
      </g>

      <!-- SUPPORT layer -->
      <g>
        <rect x="20" y="522" width="1060" height="86" rx="10" fill="none" stroke="var(--line2)" stroke-width="1.5" stroke-dasharray="8 6" />
        <text x="40" y="550" class="cc-band" fill="var(--text2)">SUPPORT LAYER — 支撑体系（不直接交易产品，却约束每一个环节）</text>
        <text x="40" y="576" class="cc-seg">Standards: OCP · ASHRAE · IEC · SS 726 · CAICT</text>
        <text x="430" y="576" class="cc-seg">Simulation: 6SigmaDCX · FloTHERM</text>
        <text x="760" y="576" class="cc-seg">Certification: UL · TÜV · SGS</text>
        <text x="40" y="596" class="cc-note">knowledge & data: independent references (this guide) — every claim sourced, curves demanded</text>
      </g>

      <!-- legend -->
      <g transform="translate(760, 18)">
        <line x1="0" y1="0" x2="34" y2="0" stroke="var(--cool)" stroke-width="2.5" marker-end="url(#cc-biz)" /><text x="42" y="4" class="cc-note">business</text>
        <line x1="120" y1="0" x2="154" y2="0" stroke="var(--warn)" stroke-width="2" marker-start="url(#cc-cash)" /><text x="162" y="4" class="cc-note">cash</text>
        <line x1="228" y1="0" x2="262" y2="0" stroke="var(--text2)" stroke-width="1.5" stroke-dasharray="7 6" /><text x="270" y="4" class="cc-note">information</text>
      </g>
    </svg>
    <figcaption><b>FIG. 1</b> — The full chain, Wei-Zhu canvas style: business flow delivers left→right; cash pays back right→left (financing rides that lane); information runs both ways — specs and curves downstream, demand and telemetry upstream. Numbers = companies per segment in the tables below.</figcaption>
  </figure>
</template>

<script setup lang="ts">
import vendors from '~/data/vendors.json'

// chain stages: segment ids mapped to their position in the business flow
const STAGE_MAP: Record<string, number> = {
  materials: 0,
  'cold-plates': 1, cdus: 1, interconnects: 1, fluids: 1, components: 1, 'heat-rejection': 1,
  chips: 2, servers: 2, immersion: 2, integrators: 2, 'micro-dc': 2,
  solutions: 3, testing: 3,
  buyers: 4
}
const TITLES = [
  { title: 'MATERIALS', zh: '材料与制造' },
  { title: 'COMPONENTS', zh: '核心部件' },
  { title: 'SYSTEMS & SOLUTIONS', zh: '整机与方案' },
  { title: 'DELIVERY & ASSURANCE', zh: '交付与保障' },
  { title: 'BUYERS & OPERATIONS', zh: '买方与运营' }
]
const stages = TITLES.map((t, i) => ({
  ...t,
  id: t.title,
  x: 20 + i * 220,
  segs: (vendors.segments as { id: string; label: string; companies: unknown[] }[]).filter(s => STAGE_MAP[s.id] === i)
}))
</script>

<style scoped>
.cc-band { font-family: var(--mono); font-size: 12px; letter-spacing: 0.1em; font-weight: 500; }
.cc-note { font-family: var(--mono); font-size: 10px; fill: var(--text2); }
.cc-stage { font-family: var(--mono); font-size: 11.5px; letter-spacing: 0.06em; font-weight: 600; fill: var(--text); }
.cc-sub { font-family: var(--sans); font-size: 11px; fill: var(--text2); }
.cc-seg { font-family: var(--sans); font-size: 11.5px; fill: var(--text); }
.cc-cnt { font-family: var(--mono); font-size: 10.5px; fill: var(--cool); }
</style>
