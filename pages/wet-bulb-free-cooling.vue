<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Formula · 3 min read</p>
    <h1>Wet-bulb temperature &amp; free cooling</h1>

    <p style="max-width:680px">
      Evaporative cooling can only chill water to near the <b>wet-bulb</b> temperature — plus a
      tower approach of ~5-8 K. Free cooling works when <b>T<sub>wet-bulb</sub> + 6 ≤ T<sub>coolant required</sub></b>.
      At a tropical design wet-bulb of 28 °C, tower water bottoms out near 34 °C — even a 35 °C loop
      has no margin, which is the physics behind every tropical-derating warning on this site.
    </p>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/drycooler-roof.png" alt="Industrial dry coolers with axial fans on a building roof" loading="lazy" style="width:100%;max-width:640px;display:block;border:1px solid var(--rule)" />
      <figcaption><b>PLATE 1</b> — Where facility heat lands: rooftop dry coolers. Their output tracks the weather — wet-bulb decides how cold "cold" gets. AI-generated illustration (Z-Image Turbo) — representative, not a specific site.</figcaption>
    </figure>

    <h2>Formula</h2>
    <div class="formula">T<sub>sink,min</sub> ≈ T<sub>wet-bulb</sub> + 6 K (tower)&nbsp;&nbsp;·&nbsp;&nbsp;dry cooler: T<sub>wb</sub> → T<sub>dry-bulb</sub> + ~10 K</div>
    <p style="max-width:680px">
      The 6 K is a typical cooling-tower approach; dry coolers run against dry-bulb with ~10 K
      approach. Whichever sink you use, if its achievable temperature sits above the coolant your
      equipment needs, mechanical refrigeration enters the chain — with its capital, energy and
      PUE cost. Higher <NuxtLink to="/ashrae-w-classes">W-classes</NuxtLink> raise T<sub>coolant</sub>
      and buy back free-cooling hours.
    </p>

    <h2>Worked example</h2>
    <div class="formula">Singapore wb ≈ 28 °C → sink ≈ 34 °C → a 35 °C loop: no margin ❌&nbsp;&nbsp;·&nbsp;&nbsp;Munich wb ≈ 20 °C → sink ≈ 26 °C → 35 °C loop: 9 K margin ✅</div>
    <p style="max-width:680px">
      Typical 1% design wet-bulbs (verify per site): tropical coastal cities 27-30 °C,
      Gulf coast 30 °C+, Central Europe 20-22 °C, Northern Europe 17-19 °C.
    </p>

    <h2>Try it</h2>
    <div class="fcalc">
      <div class="frow">
        <label>Required coolant temp (°C)<input type="number" v-model.number="tc" min="15" max="50" step="1" /></label>
        <label>Site design wet-bulb (°C)<input type="number" v-model.number="wb" min="5" max="35" step="1" /></label>
        <label>Tower approach (K)<input type="number" v-model.number="ap" min="3" max="12" step="1" /></label>
      </div>
      <div class="fresult">
        sink ≈ {{ sink.toFixed(0) }} °C <small>· margin {{ (tc - sink).toFixed(0) }} K</small>
      </div>
      <div class="fverdict" :style="verdict.style">{{ verdict.text }}</div>
    </div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Averaging annual temperature.</b> Free cooling fails on design days, not average days. Size against the 1% design wet-bulb, or accept mechanical backup.</li>
      <li><b>Believing "chiller-free in any climate".</b> At wet-bulbs near 30 °C even W45 loops have thin margin — and L2A cabinets derate on <em>room</em> air independently (<NuxtLink to="/approach-temperature">approach temperature</NuxtLink>).</li>
      <li><b>Forgetting water.</b> Towers and adiabatic assists consume water and need treatment; in water-stressed regions dry coolers plus higher W-classes may beat evaporative despite fewer free hours.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/ashrae-w-classes">ASHRAE W-classes</NuxtLink> ·
      <NuxtLink to="/pue-math">PUE math</NuxtLink> ·
      <NuxtLink to="/liquid-cooling-hot-climates">Hot &amp; tropical climates</NuxtLink> ·
      <NuxtLink to="/liquid-cooling-vs-air">Liquid vs air</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">Evaporative-cooling limit physics (wet-bulb as floor) with typical tower approaches of 5-8 K; design wet-bulb values are approximate 1% design points — always pull ASHRAE climate data or local meteo records for a real site.</p>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
useSeo({
  title: 'Wet-bulb temperature and free cooling limits (formula + calculator)',
  description: 'Free cooling works when wet-bulb + ~6 K ≤ required coolant temperature. Tropical design wet-bulbs of 28-30 °C leave no margin even for 35 °C loops — the physics behind tropical derating, SS 726 and W-class selection. Live calculator included.'
})
useArticle({
  path: '/wet-bulb-free-cooling',
  title: 'Wet-bulb temperature & free cooling',
  description: 'Why the tropics cannot free-cool.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

const tc = ref(35), wb = ref(28), ap = ref(6)
const sink = computed(() => wb.value + ap.value)
const verdict = computed(() => {
  const margin = tc.value - sink.value
  if (margin >= 5) return { text: `✅ ${margin} K margin at design conditions — free cooling holds even on design days`, style: 'border-color:var(--ok);color:var(--ok)' }
  if (margin >= 0) return { text: `⚠️ Only ${margin} K margin — free cooling on paper, mechanical assist on design days`, style: 'border-color:var(--warn);color:var(--warn)' }
  return { text: `❌ Sink (${sink.value} °C) above required coolant (${tc.value} °C) — mechanical refrigeration is mandatory; raise W-class or budget the chiller`, style: 'border-color:var(--heat);color:var(--heat)' }
})

useFaq([
  {
    q: 'Why does free cooling fail in tropical climates?',
    a: 'Evaporative cooling cannot chill water below the ambient wet-bulb temperature, and towers realistically bottom out about 5-8 K above it. Tropical design wet-bulbs of 27-30 °C put the achievable sink temperature at 33-36 °C or higher — at or above the coolant temperature most equipment needs, so mechanical refrigeration becomes mandatory on design days.'
  },
  {
    q: 'How is wet-bulb temperature used in data center cooling design?',
    a: 'Designers take the site\u2019s 1% design wet-bulb (the value exceeded only 1% of hours), add the tower approach of roughly 6 K to get the coldest achievable water, and compare that against the coolant temperature the IT equipment requires (its ASHRAE W-class). Margin means free-cooling hours; no margin means compressors. Dry coolers follow the same logic against dry-bulb temperature with about 10 K approach.'
  }
])
</script>
