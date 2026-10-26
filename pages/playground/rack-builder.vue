<template>
  <main class="container" style="padding:40px 24px 60px">
    <p class="updated">Interactive · pick real products, watch the physics settle</p>
    <h1>Rack builder — the product picker</h1>
    <p style="max-width:680px">
      Select a real cooling product and real server platforms, set the room, and watch capacity derate
      against it. Server watts are TDP budgets (ΣGPU + ΣCPU) × 1.2 from public specs — every selection
      links its source. Same physics as the <NuxtLink to="/coolant-flow-rate">formulas section</NuxtLink>.
    </p>

    <!-- Cooling product picker -->
    <h2>Cooling product</h2>
    <div class="pickrow">
      <button
        v-for="c in hw.cooling" :key="c.id"
        class="pickcard" :class="{ on: coolId === c.id }"
        @click="coolId = c.id"
      >
        <b>{{ c.name }}</b>
        <span class="src">{{ c.type }} · {{ c.ratedKw ? `${c.ratedKw} kW${c.coolantC ? ` @ ${c.ratedRoomC} °C / ${c.coolantC} °C coolant` : ''}` : '❌ rating not published' }}</span>
      </button>
    </div>
    <p class="src" style="margin:8px 0 0">
      {{ cool.facility }} ·
      <a v-if="cool.source.startsWith('http')" :href="cool.source">source ↗</a>
      <NuxtLink v-else :to="cool.source">on this site →</NuxtLink>
    </p>

    <!-- Server picker -->
    <h2>Servers</h2>
    <div class="addrow">
      <select v-model="pickId" aria-label="Server model">
        <option v-for="s in hw.servers" :key="s.id" :value="s.id">{{ s.name }} — {{ s.kw }} kW / {{ s.u }}U</option>
      </select>
      <input type="number" v-model.number="qty" min="1" max="20" aria-label="Quantity" />
      <button class="addbtn" @click="add">+ Add</button>
    </div>

    <div class="workbench">
      <!-- Rack visual -->
      <div class="rackcol">
        <div class="rackhead mono">42U RACK · <span :style="{ color: uUsed > 42 ? 'var(--heat)' : 'var(--text)' }">{{ uUsed }}U USED</span></div>
        <div class="rack">
          <div v-for="row in rackRows" :key="row.id" class="unit" :style="{ height: row.h + 'px', background: row.color }" :title="row.name">
            <span class="ulabel">{{ row.name }}<template v-if="row.n > 1"> ×{{ row.n }}</template> · {{ row.kw }} kW</span>
          </div>
          <div v-if="!counts.size" class="empty mono">ADD SERVERS ABOVE</div>
        </div>
        <div v-for="row in rows" :key="'s' + row.id" class="srcline src">
          {{ row.name }}: {{ row.chip }} —
          <a v-if="row.source.startsWith('http')" :href="row.source">spec ↗</a>
          <NuxtLink v-else :to="row.source">model →</NuxtLink>
        </div>
      </div>

      <!-- Gauges & controls -->
      <div class="gauges">
        <h3>Readouts</h3>
        <div class="glabel mono">LIQUID LOAD vs {{ cool.type === 'L2A' ? 'DERATED' : 'RATED' }} CAPACITY</div>
        <div class="gauge"><div class="gfill" :style="{ width: (specPublished ? Math.min(utilPct, 100) : 0) + '%', background: gaugeColor }"></div></div>
        <div class="mono small">{{ liqKw.toFixed(1) }} kW / {{ specPublished ? capacity.toFixed(1) + ' kW (' + utilPct + '%)' : '— no published rating' }}</div>

        <div class="glabel mono" style="margin-top:14px">RACK SPACE</div>
        <div class="gauge"><div class="gfill" :style="{ width: (uUsed / 42 * 100) + '%', background: uUsed > 42 ? 'var(--heat)' : 'var(--cool)' }"></div></div>
        <div class="mono small">{{ uUsed }}U / 42U</div>

        <div class="glabel mono" style="margin-top:14px">ROOM</div>
        <label>Room temp <b>{{ roomT }} °C</b><input type="range" v-model.number="roomT" min="18" max="42" :disabled="cool.type !== 'L2A'" /></label>
        <p v-if="cool.type === 'L2A'" class="src" style="margin:4px 0 0">Capacity derates with room air (<NuxtLink to="/approach-temperature">why</NuxtLink>)</p>
        <p v-else class="src" style="margin:4px 0 0">L2L: capacity set by facility water, not room air — slider disabled</p>
      </div>
    </div>

    <div :style="verdict.style" style="margin-top:22px"><b>{{ verdict.text }}</b></div>

    <figure class="fig" style="margin-inline:0; margin-top:18px">
      <table style="max-width:760px">
        <tr><td>Total IT</td><td><code>{{ totalIt.toFixed(1) }} kW</code></td><td>Heat to liquid</td><td><code>{{ liqKw.toFixed(1) }} kW</code></td></tr>
        <tr><td>Heat to air</td><td><code>{{ airKw.toFixed(1) }} kW</code></td><td>Coolant flow @ ΔT 8 °C</td><td><code>{{ flow.toFixed(0) }} L/min</code></td></tr>
        <tr>
          <td>Capacity at {{ cool.type === 'L2A' ? roomT + ' °C room' : 'facility water' }}</td>
          <td><code>{{ specPublished ? capacity.toFixed(1) + ' kW' : '❌ unpublished' }}</code></td>
          <template v-if="cool.type === 'L2A'">
            <td>Room AC (1.1×)</td><td><code>{{ (totalIt * 1.1).toFixed(1) }} kW ≈ {{ (totalIt * 1.1 / 3.517).toFixed(1) }} tons</code></td>
          </template>
          <template v-else>
            <td>Facility water</td><td><code>tempered loop required</code></td>
          </template>
        </tr>
      </table>
      <figcaption><b>FIG. 1</b> — Live build. Flow: L/min = kW × 60 / (4.186 × ΔT). Derating: approach-temperature model on the selected product's rating point. Watts are TDP budgets, not measured draw.</figcaption>
    </figure>

    <h2>Try this</h2>
    <ul class="src">
      <li>Add one GB200 NVL72 rack with the 30 kW cabinet selected → the gap is the whole story: no single-cabinet class fits a 120 kW rack.</li>
      <li>8× H100 × 4 nodes + Vertiv CDU 70 → fits at 25 °C; slide the room to 35 °C and watch the verdict flip.</li>
      <li>Switch to Asetek L2L → capacity stops derating, but the facility-water requirement takes over the room-AC line.</li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import hw from '~/data/hardware.json'

useSeo({
  title: 'Rack builder — pick real servers and cooling products',
  description: 'Product-picker simulator: choose real server platforms (GB200 NVL72, HGX B200/H100, MI300X) and real cooling products (Vertiv CoolChip CDU 70, STULZ Micro DC, Asetek L2L), set room temperature, watch derated capacity, coolant flow and facility requirements settle live. TDP-budget watts, every selection sourced.'
})

const COLORS = ['#2e7fc2', '#3d7fb2', '#275d84', '#43566a', '#5b6b7f', '#8fa5b5']
const coolId = ref(hw.cooling[0].id)
const pickId = ref(hw.servers[2].id)
const qty = ref(4)
const roomT = ref(25)

const cool = computed(() => hw.cooling.find(c => c.id === coolId.value) ?? hw.cooling[0])

// land alive: a realistic default build instead of an empty rack
const counts = reactive(new Map<string, number>([['hgx-h100', 4]]))
function add() {
  counts.set(pickId.value, (counts.get(pickId.value) ?? 0) + Math.max(1, qty.value))
}

const rows = computed(() =>
  [...counts.entries()].map(([id, n], i) => {
    const s = hw.servers.find(x => x.id === id)!
    return { ...s, n, color: COLORS[i % COLORS.length] }
  })
)
const rackRows = computed(() =>
  rows.value.map(r => ({ ...r, h: Math.min(r.u * r.n, 42) * 10 }))
)

const uUsed = computed(() => rows.value.reduce((s, r) => s + r.u * r.n, 0))
const totalIt = computed(() => rows.value.reduce((s, r) => s + r.kw * r.n, 0))
const liqKw = computed(() => rows.value.reduce((s, r) => s + r.kw * r.n * r.capture, 0))
const airKw = computed(() => totalIt.value - liqKw.value)
const flow = computed(() => liqKw.value * 60 / (4.186 * 8))

const specPublished = computed(() => typeof cool.value.ratedKw === 'number')
const capacity = computed(() => {
  const c = cool.value
  if (typeof c.ratedKw !== 'number') return NaN
  if (c.type === 'L2L') return c.ratedKw
  const approach = (c.coolantC ?? 45) - roomT.value
  if (approach <= (c.minApproachK ?? 5)) return 0
  return c.ratedKw * approach / ((c.coolantC ?? 45) - (c.ratedRoomC ?? 25))
})
const utilPct = computed(() => Math.round(100 * liqKw.value / Math.max(capacity.value, 0.01)))
const gaugeColor = computed(() => (utilPct.value > 100 ? 'var(--heat)' : utilPct.value > 85 ? 'var(--warn)' : 'var(--cool)'))

const verdict = computed(() => {
  if (!counts.size) return { text: 'Add servers to begin — start with one GB200 NVL72 rack and see every cabinet class fail.', style: vStyle('var(--text2)') }
  if (!specPublished.value) return { text: '❓ Rating not published for this product — no honest model is possible until the vendor provides the capacity-vs-ambient curve (RFQ item 12)', style: vStyle('var(--warn)') }
  if (capacity.value === 0) return { text: `❌ Approach collapsed at ${roomT.value} °C — L2A physically cannot reject at this room temperature`, style: vStyle('var(--heat)') }
  if (uUsed.value > 42) return { text: `❌ ${uUsed.value}U in a 42U frame — this is multi-rack territory, model it per rack`, style: vStyle('var(--heat)') }
  if (liqKw.value > capacity.value) return { text: `❌ Liquid load exceeds capacity by ${(liqKw.value - capacity.value).toFixed(1)} kW — bigger product, cooler room, or fewer servers`, style: vStyle('var(--heat)') }
  if (utilPct.value > 85) return { text: '⚠️ Above 85% utilization — no headroom for a hot afternoon', style: vStyle('var(--warn)') }
  return { text: `✅ Fits — ${100 - utilPct.value}% thermal headroom, ${42 - uUsed.value}U free, at ${roomT.value} °C`, style: vStyle('var(--ok)') }
})
function vStyle(c: string) { return `border:1px solid ${c}; padding:12px 16px; border-radius:8px; color:${c}` }
</script>

<style scoped>
.pickrow { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
.pickcard { text-align: left; background: var(--bg2); border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; cursor: pointer; font-family: var(--sans); min-width: 190px; }
.pickcard b { display: block; font-size: 13.5px; color: var(--text); }
.pickcard .src { display: block; font-size: 11.5px; margin-top: 2px; }
.pickcard.on { border-color: var(--cool); box-shadow: 0 0 0 1px var(--cool); }
.pickcard.on b { color: var(--cool); }
.addrow { display: flex; gap: 10px; align-items: center; margin-top: 10px; flex-wrap: wrap; }
.addrow select { font-family: var(--sans); font-size: 14px; padding: 9px 12px; border: 1px solid var(--line2); border-radius: 8px; background: #fff; color: var(--text); flex: 1 1 320px; }
.addrow input[type=number] { width: 74px; padding: 9px; }
.addbtn { background: var(--cool); color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-family: var(--sans); font-weight: 600; font-size: 14px; cursor: pointer; }
.addbtn:hover { background: var(--cool2); }
.workbench { display: grid; grid-template-columns: 320px 1fr; gap: 26px; margin-top: 22px; align-items: start; }
@media (max-width: 880px) { .workbench { grid-template-columns: 1fr; } }
.gauges h3 { font-size: 13px; margin: 0 0 8px; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--text2); }
.rackhead { font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; margin: 0 0 8px; color: var(--text2); }
.rack { position: relative; width: 100%; height: 420px; background: var(--panel); border: 3px solid var(--text); border-radius: 4px; background-image: repeating-linear-gradient(0deg, transparent 0 9px, var(--panel2) 9px 10px); overflow: hidden; display: flex; flex-direction: column; }
.unit { border: 1px solid rgba(0, 0, 0, 0.35); display: flex; align-items: center; padding: 0 8px; color: #fff; flex: none; overflow: hidden; }
.ulabel { font-family: var(--mono); font-size: 10.5px; white-space: nowrap; }
.empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 12px; letter-spacing: 0.2em; color: var(--line2); }
.srcline { font-size: 11px; margin: 4px 0 0; }
.mono { font-family: var(--mono); }
.small { font-size: 11.5px; color: var(--text2); }
.glabel { font-size: 10.5px; letter-spacing: 0.1em; color: var(--text2); }
.gauge { height: 12px; background: #fff; border: 1px solid var(--line); border-radius: 4px; overflow: hidden; margin: 4px 0; }
.gfill { height: 100%; transition: width 0.15s; }
.gauges label { font-size: 12.5px; display: block; margin-top: 6px; color: var(--text2); }
.gauges input[type=range] { display: block; }
.gauges input[type=range]:disabled { opacity: 0.35; }
code { font-family: var(--mono); font-size: 13px; }
</style>
