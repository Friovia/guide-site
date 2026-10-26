<template>
  <div class="herochart">
    <div class="hc-chart">
      <svg
        ref="svgEl"
        viewBox="0 0 560 240"
        class="hc-svg"
        role="img"
        :aria-label="`Capacity versus room temperature chart: at ${temp} degrees the cabinet can reject ${cap.toFixed(1)} kW`"
        @pointerdown="startDrag" @pointermove="onDrag" @pointerup="dragging = false" @pointerleave="dragging = false"
      >
        <!-- gridlines -->
        <g v-for="t in [20, 25, 30, 35, 40]" :key="'gx' + t">
          <line :x1="px(t)" y1="12" :x2="px(t)" y2="196" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4" />
          <text :x="px(t)" y="214" text-anchor="middle" class="hc-axis">{{ t }} °C</text>
        </g>
        <g v-for="k in [0, 25, 50, 75]" :key="'gy' + k">
          <line x1="34" :y1="py(k)" x2="548" :y2="py(k)" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4" />
          <text x="28" :y="py(k) + 3" text-anchor="end" class="hc-axis">{{ k }}</text>
        </g>
        <text x="28" y="12" class="hc-axis hc-rot">kW</text>

        <!-- derating curve: capacity = 50 × approach / 20, approach = 45 − T, zero past 40 °C -->
        <path :d="curvePath" fill="none" stroke="var(--cool)" stroke-width="2.5" />
        <!-- area under curve up to current temp -->
        <path :d="areaPath" fill="rgba(46,127,194,0.08)" />

        <!-- rated point (25 °C, 50 kW) -->
        <circle :cx="px(25)" :cy="py(50)" r="3.5" fill="none" stroke="var(--text2)" stroke-width="1.5" />
        <text :x="px(25) + 7" :y="py(50) - 6" class="hc-note">rated 50 kW @ 25 °C</text>

        <!-- the draggable point -->
        <g v-if="cap > 0">
          <line :x1="px(temp)" :y1="py(capNow)" :x2="px(temp)" y2="196" stroke="var(--heat)" stroke-width="1.5" />
          <circle :cx="px(temp)" :cy="py(capNow)" r="9" fill="var(--cool)" stroke="#fff" stroke-width="2.5" style="cursor: grab" />
        </g>
        <g v-else>
          <text :x="px(temp)" y="190" text-anchor="middle" class="hc-note" fill="var(--heat)">✕ {{ temp }} °C</text>
        </g>
      </svg>
    </div>
    <div class="hc-read">
      <div class="hp-label">{{ label }}</div>
      <div class="hp-num" :style="{ color: color }">{{ cap.toFixed(1) }} <small>kW</small></div>
      <p class="hp-cap">{{ caption.replace('{t}', String(temp)) }}</p>
      <span class="hp-read">ROOM {{ temp }} °C</span>
      <p class="hp-sub">{{ sub }} <NuxtLink to="/approach-temperature">→</NuxtLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  label: string
  caption: string   // may contain {t}
  sub: string
  ratedKw?: number
  coolantC?: number
}>()

const rated = props.ratedKw ?? 50
const coolant = props.coolantC ?? 45
const temp = ref(25)
const dragging = ref(false)
const svgEl = ref<SVGSVGElement | null>(null)

const cap = computed(() => {
  const approach = coolant - temp.value
  if (approach <= 5) return 0
  return rated * approach / (coolant - 25)
})
const capNow = computed(() => Math.max(cap.value, 0))
const color = computed(() => {
  if (cap.value === 0) return 'var(--heat)'
  if (cap.value / rated < 0.6) return 'var(--warn)'
  return 'var(--cool)'
})

// chart geometry: X 18–42 °C → 34–548 px, Y 0–60 kW → 196–12 px
const px = (t: number) => 34 + ((t - 18) / 24) * 514
const py = (k: number) => 196 - (Math.min(k, 60) / 60) * 184

const curvePath = computed(() => {
  const pts: string[] = []
  for (let t = 18; t <= 42; t += 0.5) {
    const a = coolant - t
    const k = a <= 5 ? 0 : rated * a / (coolant - 25)
    pts.push(`${pts.length ? 'L' : 'M'}${px(t).toFixed(1)},${py(k).toFixed(1)}`)
  }
  return pts.join(' ')
})
const areaPath = computed(() => {
  if (cap.value <= 0) return ''
  let d = `M${px(18)},${py(0)}`
  for (let t = 18; t <= temp.value; t += 0.5) {
    const a = coolant - t
    const k = a <= 5 ? 0 : rated * a / (coolant - 25)
    d += `L${px(t).toFixed(1)},${py(k).toFixed(1)}`
  }
  return d + `L${px(temp.value)},${py(0)}Z`
})

function pointToTemp(e: PointerEvent) {
  const rect = (svgEl.value as unknown as HTMLElement).getBoundingClientRect()
  const frac = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
  temp.value = Math.round(18 + frac * 24)
}
function startDrag(e: PointerEvent) { dragging.value = true; pointToTemp(e) }
function onDrag(e: PointerEvent) { if (dragging.value) pointToTemp(e) }
</script>

<style scoped>
.herochart { display: grid; grid-template-columns: 1.5fr 1fr; gap: 22px; align-items: center; }
@media (max-width: 720px) { .herochart { grid-template-columns: 1fr; } }
.hc-svg { width: 100%; height: auto; display: block; touch-action: none; }
.hc-axis { font-family: var(--mono); font-size: 10.5px; fill: var(--text2); }
.hc-rot { font-size: 9px; }
.hc-note { font-family: var(--mono); font-size: 9.5px; fill: var(--text2); }
.hp-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; color: var(--cool); text-transform: uppercase; }
.hp-num { font-family: var(--mono); font-weight: 600; font-size: 52px; line-height: 1.05; margin: 10px 0 0; letter-spacing: -0.01em; }
.hp-num small { font-size: 20px; color: var(--text2); font-weight: 400; }
.hp-cap { font-family: var(--sans); font-size: 13.5px; color: var(--text2); margin: 4px 0 12px; }
.hp-read { display: inline-block; font-family: var(--mono); font-size: 12px; color: var(--text); background: #fff; border: 1px solid var(--line2); border-radius: 6px; padding: 6px 10px; white-space: nowrap; }
.hp-sub { font-family: var(--sans); font-size: 13px; color: var(--text2); margin: 12px 0 0; }
</style>
