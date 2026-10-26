<template>
  <main class="container" style="padding:40px 24px 60px">
    <p class="updated">Interactive · approach-temperature model, anchored to published data</p>
    <h1>Derating simulator — capacity vs room temperature</h1>
    <p style="max-width:680px">
      A liquid-to-air CDU's capacity falls as room temperature rises — it scales with the approach
      temperature. Pick a product (or custom), then drag the operating point along the curve.
    </p>

    <div class="ds-grid">
      <!-- chart -->
      <div class="ds-chart">
        <svg
          ref="svgEl" viewBox="0 0 560 280" class="ds-svg" role="img"
          :aria-label="`Capacity versus room temperature: at ${troom} degrees the unit rejects ${q.toFixed(1)} kW`"
          @pointerdown="startDrag" @pointermove="onDrag" @pointerup="dragging = false" @pointerleave="dragging = false"
        >
          <g v-for="t in [18, 22, 26, 30, 34, 38, 42]" :key="'gx' + t">
            <line :x1="px(t)" y1="14" :x2="px(t)" y2="236" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4" />
            <text :x="px(t)" y="254" text-anchor="middle" class="ds-axis">{{ t }} °C</text>
          </g>
          <g v-for="k in yTicks" :key="'gy' + k">
            <line x1="44" :y1="py(k)" x2="548" :y2="py(k)" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4" />
            <text x="38" :y="py(k) + 3" text-anchor="end" class="ds-axis">{{ k }}</text>
          </g>
          <text x="38" y="10" class="ds-axis ds-rot">kW</text>

          <path :d="curvePath" fill="none" stroke="var(--cool)" stroke-width="2.5" />
          <path :d="areaPath" fill="rgba(46,127,194,0.08)" />

          <circle :cx="px(tref)" :cy="py(qref)" r="3.5" fill="none" stroke="var(--text2)" stroke-width="1.5" />
          <text :x="px(tref) + 7" :y="py(qref) - 6" class="ds-note">rated {{ qref }} kW @ {{ tref }} °C</text>

          <g v-if="q > 0">
            <line :x1="px(troom)" :y1="py(q)" :x2="px(troom)" y2="236" stroke="var(--heat)" stroke-width="1.5" />
            <circle :cx="px(troom)" :cy="py(q)" r="9" fill="var(--cool)" stroke="#fff" stroke-width="2.5" style="cursor: grab" />
            <text :x="px(troom) + 12" :y="py(q) - 10" class="ds-note" fill="var(--text)">{{ q.toFixed(1) }} kW · {{ pct }}%</text>
          </g>
          <g v-else>
            <text :x="px(troom)" y="228" text-anchor="middle" class="ds-note" fill="var(--heat)">✕ approach collapsed</text>
          </g>
        </svg>
      </div>

      <!-- controls -->
      <div class="ds-side">
        <label>Product</label>
        <select v-model="prodId" aria-label="Cooling product">
          <option v-for="p in l2aProducts" :key="p.id" :value="p.id">{{ p.name }} — {{ p.ratedKw }} kW</option>
          <option value="custom">Custom…</option>
        </select>
        <p v-if="product" class="src" style="margin:6px 0 14px">
          <a v-if="product.source.startsWith('http')" :href="product.source">source ↗</a><NuxtLink v-else :to="product.source">model →</NuxtLink>
        </p>
        <p v-else class="src" style="margin:6px 0 14px">Custom rating point</p>

        <label>Rated capacity <b>{{ qref }} kW</b></label>
        <input type="range" v-model.number="qref" min="5" max="120" step="0.5" :disabled="prodId !== 'custom'" />
        <label>Coolant supply <b>{{ tc }} °C</b></label>
        <input type="range" v-model.number="tc" min="30" max="55" step="1" :disabled="prodId !== 'custom'" />
        <label>Room temperature <b>{{ troom }} °C</b></label>
        <input type="range" v-model.number="troom" min="18" max="42" step="1" />

        <div class="ds-read">
          <div class="ds-num" :style="{ color: color }">{{ q.toFixed(1) }} <small>kW</small></div>
          <div class="ds-verdict" :style="{ color }">{{ verdict }}</div>
        </div>
      </div>
    </div>

    <p class="src" style="max-width:720px; margin-top:18px">
      Model: Q = Q<sub>rated</sub> × (T<sub>coolant</sub> − T<sub>room</sub>) / (T<sub>coolant</sub> − T<sub>rated room</sub>),
      floored below a 5 °C minimum approach and capped at rating. Default anchors to the published Vertiv XDU070
      point (86.5 kW @ 45 °C coolant, 25 °C air). First-order illustration — real units have fan-speed
      compensation; demand the vendor's measured curve (<NuxtLink to="/rfq-scope-checklist">RFQ item 12</NuxtLink>).
    </p>

    <h2>Try this</h2>
    <ul class="src">
      <li>Keep the XDU070 defaults, drag 25 °C → 35 °C — capacity roughly halves. That's the tropics.</li>
      <li>Custom mode, coolant 45 → 50 °C — capacity recovers. This is why warmer <NuxtLink to="/ashrae-w-classes">W-classes</NuxtLink> matter.</li>
      <li>Drag past coolant − 5 °C — the curve hits zero: physics, not a product flaw.</li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import hw from '~/data/hardware.json'

useSeo({
  title: 'Liquid cooling derating simulator (capacity vs room temperature)',
  description: 'Pick a real product (Vertiv CoolChip CDU 70 and more) or a custom rating point, then drag the operating point along the capacity-vs-room-temperature curve — approach-temperature model anchored to published vendor data.'
})

const l2aProducts = computed(() => hw.cooling.filter(c => c.type === 'L2A'))
const prodId = ref(l2aProducts.value[0]?.id ?? 'custom')
const product = computed(() => l2aProducts.value.find(p => p.id === prodId.value))

const qref = ref(86.5), tref = ref(25), tc = ref(45), troom = ref(30)
const dragging = ref(false)
const svgEl = ref<SVGSVGElement | null>(null)

watch(product, p => {
  if (!p) return
  qref.value = p.ratedKw
  tref.value = p.ratedRoomC ?? 25
  tc.value = p.coolantC ?? 45
})

function capacity(air: number): number {
  const atd = tc.value - air
  const atdRef = tc.value - tref.value
  if (atd <= 5) return 0
  return Math.min(qref.value, qref.value * atd / atdRef)
}
const q = computed(() => capacity(troom.value))
const pct = computed(() => Math.round(100 * q.value / qref.value))
const color = computed(() => {
  if (q.value === 0) return 'var(--heat)'
  if (pct.value < 60) return 'var(--warn)'
  return 'var(--cool)'
})
const verdict = computed(() => {
  if (q.value === 0) return 'APPROACH COLLAPSED'
  if (pct.value < 60) return `${pct}% OF RATED — TROPICAL TERRITORY`
  return `${pct}% OF RATED — HEALTHY`
})

const yMax = computed(() => Math.ceil(qref.value / 25) * 25)
const yTicks = computed(() => { const t: number[] = []; for (let k = 0; k <= yMax.value; k += 25) t.push(k); return t })
const px = (t: number) => 44 + ((t - 18) / 24) * 504
const py = (k: number) => 236 - (Math.min(k, yMax.value) / yMax.value) * 222

const curvePath = computed(() => {
  const pts: string[] = []
  for (let t = 18; t <= 42; t += 0.25) pts.push(`${pts.length ? 'L' : 'M'}${px(t).toFixed(1)},${py(capacity(t)).toFixed(1)}`)
  return pts.join(' ')
})
const areaPath = computed(() => {
  if (q.value <= 0) return ''
  let d = `M${px(18)},${py(0)}`
  for (let t = 18; t <= troom.value; t += 0.25) d += `L${px(t).toFixed(1)},${py(capacity(t)).toFixed(1)}`
  return d + `L${px(troom.value)},${py(0)}Z`
})

function pointToTemp(e: PointerEvent) {
  const rect = (svgEl.value as unknown as HTMLElement).getBoundingClientRect()
  const frac = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
  troom.value = Math.round(18 + frac * 24)
}
function startDrag(e: PointerEvent) { dragging.value = true; pointToTemp(e) }
function onDrag(e: PointerEvent) { if (dragging.value) pointToTemp(e) }
</script>

<style scoped>
.ds-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; margin-top: 22px; align-items: start; background: var(--bg2); border: 1px solid var(--line); border-radius: 8px; padding: 18px; }
@media (max-width: 760px) { .ds-grid { grid-template-columns: 1fr; } }
.ds-svg { width: 100%; height: auto; display: block; touch-action: none; }
.ds-axis { font-family: var(--mono); font-size: 10.5px; fill: var(--text2); }
.ds-rot { font-size: 9px; }
.ds-note { font-family: var(--mono); font-size: 10px; fill: var(--text2); }
.ds-side label { font-size: 12.5px; color: var(--text2); display: block; margin-top: 10px; }
.ds-side label:first-child { margin-top: 0; }
.ds-side select { width: 100%; font-family: var(--sans); font-size: 14px; padding: 9px 12px; border: 1px solid var(--line2); border-radius: 8px; background: #fff; color: var(--text); margin-top: 4px; }
.ds-side input[type=range] { width: 100%; margin-top: 4px; }
.ds-side input[type=range]:disabled { opacity: 0.35; }
.ds-read { margin-top: 18px; border-top: 1px solid var(--line); padding-top: 14px; }
.ds-num { font-family: var(--mono); font-weight: 600; font-size: 44px; line-height: 1.1; }
.ds-num small { font-size: 18px; color: var(--text2); font-weight: 400; }
.ds-verdict { font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; margin-top: 6px; }
</style>
