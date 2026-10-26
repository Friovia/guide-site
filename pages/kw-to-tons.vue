<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Formula · 1 min read</p>
    <h1>kW ↔ refrigeration tons</h1>

    <p style="max-width:680px">
      One refrigeration ton equals <b>3.517 kW</b> of heat removal — converting is just division:
      <b>tons = kW ÷ 3.517</b>. A 70 kW cooling load is ≈ 19.9 tons.
    </p>

    <h2>Formula</h2>
    <div class="formula">tons = kW ÷ 3.517&nbsp;&nbsp;·&nbsp;&nbsp;kW = tons × 3.517&nbsp;&nbsp;·&nbsp;&nbsp;1 ton = 12,000 BTU/h</div>
    <p style="max-width:680px">
      A "ton of refrigeration" is pre-electricity HVAC vocabulary: the heat needed to melt one
      short ton (907 kg) of ice in 24 hours — 12,000 BTU/h, or 3.517 kW. Precision-cooling
      and building-HVAC vendors still quote in tons, so data-center kilowatts must cross this bridge.
    </p>

    <h2>Worked example</h2>
    <div class="formula">70 kW ÷ 3.517 = <b>19.9 tons</b>&nbsp;&nbsp;·&nbsp;&nbsp;12 tons × 3.517 = 42.2 kW</div>

    <h2>Try it</h2>
    <div class="fcalc">
      <div class="frow">
        <label>Cooling load (kW)<input type="number" v-model.number="kw" min="0" step="1" /></label>
        <label>Cooling capacity (tons)<input type="number" v-model.number="tons" min="0" step="0.5" /></label>
      </div>
      <div class="fresult">
        {{ (kw || 0).toFixed(1) }} kW <small>=</small> {{ (tons || 0).toFixed(1) }} tons
        <small>· electrical draw ≈ {{ elec }} kW at COP 3</small>
      </div>
    </div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Tons of cooling ≠ tons of electricity.</b> A 20-ton unit removes 70 kW of heat but draws only ~23 kW from the grid at a typical COP of 3. Sizing rooms with electrical numbers understates cooling by two-thirds.</li>
      <li><b>Nominal vs actual capacity.</b> Nameplate tons are rated at standard conditions; at 35 °C ambient an AC delivers less. Derate or check the capacity table, same as liquid cabinets (<NuxtLink to="/approach-temperature">approach temperature</NuxtLink>).</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/room-ac-load">Room AC load (1.1× rule)</NuxtLink> ·
      <NuxtLink to="/room-load-calculation">Room load calculation</NuxtLink> ·
      <NuxtLink to="/glossary">Glossary</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">Definition: 1 ton of refrigeration = 12,000 BTU/h = 3.51685 kW (ASHRAE convention).</p>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
useSeo({
  title: 'kW to refrigeration tons conversion (and back)',
  description: '1 refrigeration ton = 3.517 kW (12,000 BTU/h); tons = kW ÷ 3.517. Worked examples, a two-way live converter, and the tons-vs-electrical-draw mistake that undersizes rooms by two-thirds.'
})
useArticle({
  path: '/kw-to-tons',
  title: 'kW ↔ refrigeration tons',
  description: 'Cooling unit conversion with a live two-way converter.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

// Two-way binding: editing either field updates the other via the ratio
const kw = ref(70)
const tons = computed({
  get: () => (kw.value || 0) / 3.517,
  set: (v: number) => { kw.value = (v || 0) * 3.517 }
})
const elec = computed(() => ((kw.value || 0) / 3).toFixed(1))

useFaq([
  {
    q: 'How many kW is one ton of cooling?',
    a: 'One refrigeration ton is 3.517 kilowatts of heat removal, equivalent to 12,000 BTU/h — originally the heat needed to melt one short ton of ice per day. To convert a cooling load, divide kilowatts by 3.517 to get tons, or multiply tons by 3.517 to get kilowatts.'
  },
  {
    q: 'Is a cooling ton the same as electrical power?',
    a: 'No. Tons measure heat removed, not electricity consumed. A 20-ton air conditioner moves about 70 kW of heat while drawing roughly 23 kW of electricity at a coefficient of performance (COP) of 3. Always size rooms by cooling tons or kW-th, never by the unit\u2019s electrical draw.'
  }
])
</script>
