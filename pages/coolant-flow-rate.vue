<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Formula · 2 min read</p>
    <h1>Coolant flow rate</h1>

    <p style="max-width:680px">
      Coolant flow rate is the volume of coolant per minute needed to carry a given heat load at a given
      temperature drop: <b>P kW at ΔT °C needs P × 60 / (4.186 × ΔT) L/min</b> —
      50 kW of liquid-captured heat at ΔT 8 °C needs 89.6 L/min.
    </p>

    <h2>Formula</h2>
    <div class="formula">flow [L/min] = P<sub>liquid</sub> [kW] × 60 / (4.186 × ΔT [°C])</div>
    <p style="max-width:680px">
      4.186 kJ/(kg·K) is the specific heat of water and a liter of water-glycol weighs about a kilogram,
      so kilowatts convert directly to liters per minute.
      P<sub>liquid</sub> is the heat the loop actually captures — in direct-to-chip systems typically
      60-80% of total IT load, not all of it.
    </p>

    <h2>Worked example</h2>
    <div class="formula">50 kW × 60 / (4.186 × 8) = <b>89.6 L/min</b></div>
    <p style="max-width:680px">
      A rack sending 50 kW to liquid with a supply/return ΔT of 8 °C circulates roughly 90 L/min —
      about a bathtub a minute. The same 50 kW at ΔT 15 °C needs only 47.8 L/min: wider ΔT trades
      flow for temperature.
    </p>

    <h2>Try it</h2>
    <div class="fcalc">
      <div class="frow">
        <label>Heat to liquid (kW)<input type="number" v-model.number="kw" min="0" step="1" /></label>
        <label>Supply/return ΔT (°C)<input type="number" v-model.number="dt" min="1" max="30" step="0.5" /></label>
        <label>CDU rated flow (L/min)<input type="number" v-model.number="rated" min="1" step="5" /></label>
      </div>
      <div class="fresult">
        {{ flow.toFixed(1) }} L/min
        <small>≈ {{ (flow / 60).toFixed(2) }} L/s · {{ util }}% of rated</small>
      </div>
      <div class="fverdict" :style="verdict.style">{{ verdict.text }}</div>
    </div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Feeding total IT load instead of the liquid share.</b> Direct-to-chip captures 60-80%; the rest cools by air. Using 100% oversizes the loop by a quarter to two-thirds.</li>
      <li><b>Wrong ΔT.</b> ΔT is the supply-return coolant temperature difference at the rack — not room air vs coolant, and not the facility water loop's ΔT.</li>
      <li><b>Ignoring glycol.</b> PG25's specific heat runs roughly 10% below pure water, so real systems move a few percent more flow than the water formula suggests. First-pass math with 4.186 is standard practice.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/playground/rack-builder">Rack builder</NuxtLink> computes flow for a whole assembly ·
      <NuxtLink to="/approach-temperature">Approach temperature</NuxtLink> ·
      <NuxtLink to="/room-ac-load">Room AC load</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">
      First principles: q = ṁ × c × ΔT with c(water) = 4.186 kJ/(kg·K), ρ ≈ 1 kg/L.
      Same model as this site's <a href="/playground/rack-builder">rack builder</a>.
    </p>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
useSeo({
  title: 'Coolant flow rate formula (L/min from kW and ΔT)',
  description: 'Coolant flow rate formula: flow [L/min] = P [kW] × 60 / (4.186 × ΔT [°C]). Worked example — 50 kW at ΔT 8 °C needs 89.6 L/min — plus a live calculator and the three mistakes that oversize loops.'
})
useArticle({
  path: '/coolant-flow-rate',
  title: 'Coolant flow rate',
  description: 'L/min from kW and ΔT, with a live calculator.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

const kw = ref(50)
const dt = ref(8)
const rated = ref(100)

const flow = computed(() => {
  const d = Math.max(dt.value || 1, 0.5)
  return Math.max((kw.value || 0) * 60 / (4.186 * d), 0)
})
const util = computed(() => Math.round(100 * flow.value / Math.max(rated.value || 1, 0.01)))
const verdict = computed(() => {
  if (util.value > 100) return { text: `❌ Exceeds CDU rated flow by ${(flow.value - rated.value).toFixed(0)} L/min — wider ΔT, bigger CDU, or less load`, style: 'border-color:var(--heat);color:var(--heat)' }
  if (util.value > 85) return { text: '⚠️ Above 85% of rated flow — no headroom for a hot afternoon', style: 'border-color:var(--warn);color:var(--warn)' }
  return { text: `✅ Fits — ${100 - util.value}% flow headroom`, style: 'border-color:var(--ok);color:var(--ok)' }
})

useFaq([
  {
    q: 'How do you calculate coolant flow rate for a liquid-cooled rack?',
    a: 'Flow in L/min equals the liquid-captured heat in kW times 60, divided by 4.186 times the supply-return temperature difference in °C. For 50 kW at ΔT 8 °C: 50 × 60 / (4.186 × 8) ≈ 89.6 L/min. Use only the heat the liquid loop captures (60-80% of IT load in direct-to-chip systems), not the total.'
  },
  {
    q: 'How many liters per minute does a 50 kW rack need?',
    a: 'About 90 L/min at a typical 8 °C supply/return ΔT (50 × 60 / (4.186 × 8) = 89.6 L/min). Raising ΔT to 15 °C drops the requirement to roughly 48 L/min.'
  }
])
</script>
