<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Formula · 2 min read</p>
    <h1>Heat capture split (liquid vs air)</h1>

    <p style="max-width:680px">
      Direct-to-chip liquid cooling captures <b>60-80% of server heat</b>, not all of it:
      P<sub>liquid</sub> = capture × P<sub>IT</sub>. A 40 kW rack at 75% capture sends
      30 kW to liquid and 10 kW to air — and the air share still needs the room to remove it.
    </p>

    <h2>Formula</h2>
    <div class="formula">P<sub>liquid</sub> [kW] = capture × P<sub>IT</sub> [kW]&nbsp;&nbsp;·&nbsp;&nbsp;P<sub>air</sub> = (1 − capture) × P<sub>IT</sub></div>
    <p style="max-width:680px">
      Cold plates sit only on the big chips (CPUs, GPUs, accelerators). Memory, drives, VRMs and
      power supplies keep air-cooling themselves. Full immersion is the architecture that captures
      ~100% — at the cost of different hardware, fluids and service model
      (<NuxtLink to="/cold-plate-vs-immersion">comparison</NuxtLink>).
    </p>

    <h2>Worked example</h2>
    <div class="formula">40 kW × 0.75 = <b>30 kW to liquid</b> · 40 × 0.25 = <b>10 kW to air</b></div>
    <p style="max-width:680px">
      The 10 kW air share is why an L2A cabinet still moves substantial air, and why
      <NuxtLink to="/room-ac-load">room AC sizing uses the full IT load</NuxtLink>, not just the liquid part.
    </p>

    <h2>Try it</h2>
    <div class="fcalc">
      <div class="frow">
        <label>IT load (kW)<input type="number" v-model.number="it" min="0" step="1" /></label>
        <label>Capture {{ capLabel }}%<input type="range" v-model.number="capPct" min="40" max="100" step="5" /></label>
        <label>ΔT for flow calc (°C)<input type="number" v-model.number="dt" min="1" max="30" step="0.5" /></label>
      </div>
      <div class="fresult">
        {{ liq.toFixed(1) }} kW liquid <small>· {{ air.toFixed(1) }} kW to air · flow {{ flow.toFixed(0) }} L/min</small>
      </div>
      <div class="fverdict" :style="verdict.style">{{ verdict.text }}</div>
    </div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Assuming 100% capture.</b> Only immersion gets close. Sizing flow, CDU capacity and room AC on 100% overstates the liquid side and — worse — hides the air share that still heats the room.</li>
      <li><b>Using TDP sums as measured load.</b> Thermal design power is a worst-case rating; typical draw is lower and varies with workload (<NuxtLink to="/tdp-to-rack-kw">TDP → rack kW</NuxtLink>).</li>
      <li><b>Forgetting the air share entirely.</b> The 20-40% that stays on air still needs cabinet airflow, room AC capacity and an air path out of the room.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/coolant-flow-rate">Coolant flow rate</NuxtLink> (uses the liquid share) ·
      <NuxtLink to="/room-ac-load">Room AC load</NuxtLink> (uses the total) ·
      <NuxtLink to="/playground/rack-builder">Rack builder</NuxtLink> applies per-server capture
    </p>

    <h2>Sources</h2>
    <p class="src">60-80% direct-to-chip capture is the range used across vendor documentation and this site's data layer; the rack builder uses 75-80% for GPU nodes and 50% for CPU nodes.</p>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
useSeo({
  title: 'Heat capture split — how much heat direct-to-chip actually takes',
  description: 'Direct-to-chip liquid cooling captures 60-80% of server heat: P_liquid = capture × P_IT. Worked example (40 kW at 75% → 30 kW liquid / 10 kW air), live calculator, and why the air share still needs room AC.'
})
useArticle({
  path: '/heat-capture-split',
  title: 'Heat capture split (liquid vs air)',
  description: 'How much heat direct-to-chip actually captures.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

const it = ref(40)
const capPct = ref(75)
const dt = ref(8)
const cap = computed(() => capPct.value / 100)
const capLabel = computed(() => Math.round(cap.value * 100))
const liq = computed(() => (it.value || 0) * cap.value)
const air = computed(() => (it.value || 0) * (1 - cap.value))
const flow = computed(() => liq.value * 60 / (4.186 * Math.max(dt.value, 0.5)))
const verdict = computed(() => {
  if (capPct.value >= 100) return { text: 'ℹ️ 100% capture means immersion-class — direct-to-chip hardware cannot get here', style: 'border-color:var(--text);color:var(--text2)' }
  if (air.value > 15) return { text: `⚠️ ${air.value.toFixed(1)} kW stays on air — that is a real room-AC line item, not a rounding error`, style: 'border-color:var(--warn);color:var(--warn)' }
  return { text: `✅ ${liq.value.toFixed(1)} kW to liquid, ${air.value.toFixed(1)} kW to air — plan room AC for the total`, style: 'border-color:var(--ok);color:var(--ok)' }
})

useFaq([
  {
    q: 'What percentage of heat does direct-to-chip liquid cooling capture?',
    a: 'Typically 60-80% of server heat. Cold plates cover only the main chips (CPUs, GPUs); memory, storage and power electronics keep air-cooling themselves. Full immersion cooling is the architecture that captures nearly 100%, with different hardware and service trade-offs.'
  },
  {
    q: 'Why does the air share of server heat still matter with liquid cooling?',
    a: 'Because the 20-40% that stays on air still heats the room. A liquid-to-air cabinet rejects it into the deployment space, so room air conditioning must be sized for the total IT load (about 1.1×), not just the liquid-captured portion.'
  }
])
</script>
