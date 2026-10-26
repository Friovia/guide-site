<template>
  <main class="container" style="padding:40px 24px 60px">
    <p class="updated">Interactive · three inputs, live math, honest verdict</p>
    <h1>Room load calculator</h1>
    <p style="max-width:680px">
      Can your room host a liquid-to-air cabinet? The formula shows itself with <em>your</em> numbers —
      and the bar shows how thin the margin really is.
    </p>

    <div class="rl-panel">
      <div class="rl-controls">
        <label>Cabinet IT load <b>{{ it }} kW</b><input type="range" v-model.number="it" min="1" max="50" step="1" /></label>
        <label>Room AC installed capacity <b>{{ ac }} kW</b><input type="range" v-model.number="ac" min="0" max="80" step="0.5" /></label>
        <label>Existing heat in same zone <b>{{ existing }} kW</b><input type="range" v-model.number="existing" min="0" max="40" step="0.5" /></label>
      </div>

      <!-- capacity comparison bar -->
      <div class="rl-bar">
        <div class="glabel mono">REQUIRED — heat the room must remove</div>
        <div class="rl-track">
          <div class="rl-req" :style="{ width: reqPct + '%' }"><span>{{ q.toFixed(1) }} kW</span></div>
        </div>
        <div class="glabel mono" style="margin-top:10px">AVAILABLE — AC spare capacity</div>
        <div class="rl-track">
          <div class="rl-spare" :style="{ width: sparePct + '%', background: color }"><span v-if="spare >= 0">{{ spare.toFixed(1) }} kW</span></div>
        </div>
        <div class="mono rl-margin" :style="{ color }">margin {{ ratio.toFixed(2) }}×</div>
      </div>

      <div class="rl-verdict" :style="{ borderColor: color, color }"><b>{{ verdict }}</b></div>

      <table style="max-width:560px">
        <tr><td>Heat to reject</td><td><code>1.1 × {{ it }} = {{ q.toFixed(1) }} kW</code></td></tr>
        <tr><td>…in refrigeration tons</td><td><code>{{ q.toFixed(1) }} ÷ 3.517 = {{ tons.toFixed(1) }} tons</code></td></tr>
        <tr><td>AC spare capacity</td><td><code>{{ ac }} − {{ existing }} = {{ spare.toFixed(1) }} kW</code></td></tr>
        <tr><td>Margin</td><td><code>{{ spare.toFixed(1) }} ÷ {{ q.toFixed(1) }} = {{ ratio.toFixed(2) }}×</code></td></tr>
      </table>
    </div>

    <h2>Try this</h2>
    <ul class="src">
      <li>IT 30 kW, AC 35 kW, existing 0 → green, but the bar shows the margin is one hot afternoon wide.</li>
      <li>Add 5 kW of existing equipment in the same zone → green turns red. Zones matter.</li>
      <li>Keep the AC, halve the IT load → find the load this room can actually host.</li>
    </ul>

    <p class="src">
      Rule: margin ≥ 1.15 green · 1.0–1.15 conditional · &lt; 1.0 insufficient. The 1.1 factor covers pumps and
      fans — the <NuxtLink to="/room-ac-load">1.1× rule explained</NuxtLink> · full worked guide in
      <NuxtLink to="/room-load-calculation">room load calculation</NuxtLink>.
    </p>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
useSeo({
  title: 'Room load calculator (interactive)',
  description: 'Can your room host a liquid cooling cabinet? Live heat-to-reject, refrigeration tons, AC spare capacity comparison bar and margin verdict — math shown with your numbers.'
})

const it = ref(30), ac = ref(35), existing = ref(0)
const q = computed(() => 1.1 * it.value)
const tons = computed(() => q.value / 3.517)
const spare = computed(() => ac.value - existing.value)
const ratio = computed(() => spare.value / q.value)
const color = computed(() => (ratio.value >= 1.15 ? 'var(--ok)' : ratio.value >= 1.0 ? 'var(--warn)' : 'var(--heat)'))
const verdict = computed(() => {
  if (ratio.value >= 1.15) return '✅ Sufficient — the room can host this cabinet'
  if (ratio.value >= 1.0) return '⚠️ Conditional — derate the cabinet or verify AC condition'
  return '❌ Insufficient — upgrade AC or reduce cabinet load'
})
// bar scales: 100% = max(required, available) so the two bars share one honest scale
const scaleMax = computed(() => Math.max(q.value, Math.max(spare.value, 0), 1))
const reqPct = computed(() => (q.value / scaleMax.value) * 100)
const sparePct = computed(() => (Math.max(spare.value, 0) / scaleMax.value) * 100)
</script>

<style scoped>
.rl-panel { background: var(--bg2); border: 1px solid var(--line); border-radius: 8px; padding: 20px 22px; margin-top: 20px; position: relative; }
.rl-panel::after { content: "LIVE"; position: absolute; top: 12px; right: 14px; font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: 0.14em; color: var(--ok); border: 1px solid currentColor; border-radius: 4px; padding: 3px 6px 2px; }
.rl-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px 24px; }
.rl-controls label { font-size: 12.5px; color: var(--text2); display: block; }
.rl-controls input[type=range] { display: block; margin-top: 2px; }
.rl-bar { margin-top: 20px; border-top: 1px solid var(--line); padding-top: 16px; }
.glabel { font-size: 10.5px; letter-spacing: 0.1em; color: var(--text2); margin-bottom: 4px; }
.rl-track { height: 22px; background: #fff; border: 1px solid var(--line); border-radius: 4px; overflow: hidden; }
.rl-req { height: 100%; background: var(--text2); display: flex; align-items: center; padding-left: 8px; min-width: 0; transition: width 0.15s; }
.rl-req span { font-family: var(--mono); font-size: 11px; color: #fff; white-space: nowrap; }
.rl-spare { height: 100%; display: flex; align-items: center; padding-left: 8px; min-width: 0; transition: width 0.15s; }
.rl-spare span { font-family: var(--mono); font-size: 11px; color: #fff; white-space: nowrap; }
.rl-margin { font-size: 12px; letter-spacing: 0.06em; margin-top: 10px; }
.rl-verdict { border: 1px solid; border-radius: 8px; padding: 12px 16px; margin-top: 16px; font-size: 14.5px; }
.rl-panel table { margin-top: 16px; }
code { font-family: var(--mono); font-size: 13px; }
</style>
