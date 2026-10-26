<template>
  <div class="loopsim">
    <svg viewBox="0 0 760 290" role="img" aria-label="Animated coolant loop: servers to manifold to CDU, heat rejected to room air" class="ls-svg">
      <defs>
        <marker id="ls-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--cool)" /></marker>
      </defs>

      <!-- Servers (3U stack) -->
      <g v-for="i in 3" :key="i">
        <rect :x="22" :y="40 + (i - 1) * 62" width="150" height="46" rx="2" fill="var(--panel)" stroke="var(--text)" stroke-width="1.5" />
        <rect :x="30" :y="48 + (i - 1) * 62" width="52" height="14" rx="1" :fill="plateFill" stroke="var(--cool)" stroke-width="1.2" />
        <text :x="30" :y="76 + (i - 1) * 62" class="ls-t ls-dim">COLD PLATES</text>
        <text :x="118" :y="58 + (i - 1) * 62" class="ls-t">SERVER {{ i }}</text>
      </g>
      <text x="22" y="30" class="ls-t ls-dim">{{ totalIt.toFixed(0) }} kW IT · {{ (capture * 100).toFixed(0) }}% TO LIQUID</text>

      <!-- Supply / return to manifold -->
      <path d="M172 62 H236" class="ls-flow" :style="{ animationDuration: flowDur + 's' }" marker-end="url(#ls-arr)" />
      <path d="M236 216 H172" class="ls-flow ls-ret" :style="{ animationDuration: flowDur + 's' }" marker-end="url(#ls-arr)" />

      <!-- Manifold -->
      <rect x="236" y="42" width="26" height="184" fill="var(--panel)" stroke="var(--text)" stroke-width="2" />
      <text x="249" y="150" class="ls-t ls-vert" transform="rotate(-90 249 150)">MANIFOLD</text>

      <!-- Manifold to CDU -->
      <path d="M262 80 H332" class="ls-flow" :style="{ animationDuration: flowDur + 's' }" marker-end="url(#ls-arr)" />
      <path d="M332 190 H262" class="ls-flow ls-ret" :style="{ animationDuration: flowDur + 's' }" marker-end="url(#ls-arr)" />

      <!-- CDU with spinning impeller -->
      <rect x="332" y="70" width="170" height="130" fill="var(--panel)" stroke="var(--text)" stroke-width="2" />
      <g class="ls-pump" :style="{ animationDuration: flowDur + 's' }">
        <circle cx="378" cy="135" r="20" fill="none" stroke="var(--cool)" stroke-width="2" />
        <path d="M378 117 v36 M360 135 h36 M365 122 l26 26 M391 122 l-26 26" stroke="var(--cool)" stroke-width="1.6" fill="none" />
      </g>
      <text x="412" y="128" class="ls-t">CDU</text>
      <text x="412" y="146" class="ls-t ls-dim">PUMP · HX · CTRL</text>

      <!-- Heat out to room air, scaled by liquid kW -->
      <g :opacity="heatOpacity">
        <path d="M502 96 H560" stroke="var(--text)" stroke-width="2" />
        <g stroke="var(--heat)" stroke-width="2.5" fill="none" stroke-linecap="round">
          <path d="M572 92 q8 -10 0 -20" /><path d="M588 92 q8 -10 0 -20" />
          <path d="M572 132 q8 -10 0 -20" /><path d="M588 132 q8 -10 0 -20" />
          <path d="M572 172 q8 -10 0 -20" /><path d="M588 172 q8 -10 0 -20" />
        </g>
        <text x="560" y="205" class="ls-t" fill="var(--heat)">HEAT OUT → ROOM AIR</text>
        <text x="560" y="222" class="ls-t ls-dim">{{ liqKw.toFixed(1) }} kW to remove</text>
      </g>

      <!-- Air share note -->
      <text x="22" y="252" class="ls-t ls-dim">AIR SHARE {{ airKw.toFixed(1) }} kW cools by fans — the room AC still sees all {{ totalIt.toFixed(0) }} kW (1.1× rule)</text>
      <text x="22" y="272" class="ls-t ls-dim" :fill="verdictColor">CAPACITY {{ cap.toFixed(1) }} kW · {{ utilPct }}% USED · {{ verdictText }}</text>
    </svg>

    <div class="ls-ctrl">
      <label>IT load {{ totalIt.toFixed(0) }} kW<input type="range" v-model.number="it" min="5" max="60" step="1" /></label>
      <label>Capture {{ (capture * 100).toFixed(0) }}%<input type="range" v-model.number="capPct" min="50" max="90" step="5" /></label>
      <label>Room {{ roomT }} °C<input type="range" v-model.number="roomT" min="18" max="42" step="1" /></label>
      <label>Coolant {{ coolT }} °C<input type="range" v-model.number="coolT" min="40" max="50" step="1" /></label>
    </div>
    <p class="ls-read mono">flow {{ flow.toFixed(0) }} L/min (ΔT 8 °C) · liquid {{ liqKw.toFixed(1) }} kW · air {{ airKw.toFixed(1) }} kW — same models as the <NuxtLink to="/coolant-flow-rate">flow</NuxtLink>, <NuxtLink to="/heat-capture-split">capture</NuxtLink> and <NuxtLink to="/approach-temperature">derating</NuxtLink> pages</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const it = ref(40)
const capPct = ref(75)
const roomT = ref(25)
const coolT = ref(45)

const capture = computed(() => capPct.value / 100)
const totalIt = computed(() => it.value)
const liqKw = computed(() => totalIt.value * capture.value)
const airKw = computed(() => totalIt.value - liqKw.value)
const flow = computed(() => liqKw.value * 60 / (4.186 * 8))
const cap = computed(() => {
  const approach = coolT.value - roomT.value
  if (approach <= 5) return 0
  return 50 * approach / 20
})
const utilPct = computed(() => Math.round(100 * liqKw.value / Math.max(cap.value, 0.01)))
const flowDur = computed(() => Math.max(6 - flow.value / 25, 0.5)) // faster flow → faster dashes
const heatOpacity = computed(() => Math.min(liqKw.value / 40 + 0.25, 1))
const plateFill = computed(() => (liqKw.value > cap.value ? 'rgba(255,106,85,0.22)' : 'var(--panel2)'))

const verdictText = computed(() => {
  if (cap.value === 0) return 'APPROACH COLLAPSED'
  if (liqKw.value > cap.value) return 'OVERLOAD'
  if (utilPct.value > 85) return 'THIN MARGIN'
  return 'OK'
})
const verdictColor = computed(() => {
  if (cap.value === 0 || liqKw.value > cap.value) return 'var(--heat)'
  if (utilPct.value > 85) return 'var(--warn)'
  return 'var(--ok)'
})
</script>

<style scoped>
.loopsim { background: var(--sheet); border: 1px solid var(--rule); border-top: 2px solid var(--ink); padding: 16px 16px 12px; position: relative; }
.loopsim::after { content: "LIVE"; position: absolute; top: 10px; right: 12px; font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: 0.14em; color: var(--ok); border: 1px solid currentColor; border-radius: 2px; padding: 3px 6px 2px; }
.ls-svg { width: 100%; height: auto; display: block; background: var(--panel); }
.ls-t { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 9.5px; fill: var(--text); letter-spacing: 0.06em; }
.ls-dim { fill: var(--text2); }
.ls-vert { letter-spacing: 0.2em; }
.ls-flow { fill: none; stroke: var(--cool); stroke-width: 2.5; stroke-dasharray: 7 7; animation: ls-dash 1.6s linear infinite; }
.ls-ret { opacity: 0.55; }
.ls-pump { transform-origin: 378px 135px; animation: ls-spin 1.6s linear infinite; }
@keyframes ls-dash { to { stroke-dashoffset: -56; } }
@keyframes ls-spin { to { transform: rotate(360deg); } }
.ls-ctrl { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px 18px; margin-top: 12px; }
.ls-ctrl label { font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif; font-size: 12.5px; color: var(--text2); display: block; }
.ls-ctrl input[type=range] { width: 100%; display: block; }
.ls-read { font-size: 11.5px; color: var(--text2); margin: 10px 0 0; font-family: "IBM Plex Mono", ui-monospace, monospace; }
</style>
