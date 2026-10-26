<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Formula · 2 min read</p>
    <h1>PUE math — and what it hides</h1>

    <p style="max-width:680px">
      PUE = total facility energy ÷ IT energy: <b>100 kW of IT with 15 kW of overhead scores 1.15</b>.
      Liquid cooling reaches 1.05-1.2 where air needs 1.4-1.6 — but the number assumes
      facility-scale infrastructure and honest climate, which single-cabinet deployments don't have.
    </p>

    <h2>Formula</h2>
    <div class="formula">PUE = (P<sub>IT</sub> + P<sub>cooling</sub> + P<sub>power loss</sub> + P<sub>misc</sub>) / P<sub>IT</sub></div>

    <h2>Worked example</h2>
    <div class="formula">(100 + 10 + 4 + 1) / 100 = <b>1.15</b></div>
    <p style="max-width:680px">
      A facility moving 100 kW of IT heat with 10 kW of cooling energy (efficient free-cooling or
      liquid), 4 kW of UPS/conversion losses and 1 kW of lighting and controls runs at PUE 1.15.
      The same site on legacy air with 45 kW of cooling energy runs 1.50.
    </p>

    <h2>Try it</h2>
    <div class="fcalc">
      <div class="frow">
        <label>IT load (kW)<input type="number" v-model.number="it" min="1" step="1" /></label>
        <label>Cooling energy (kW)<input type="number" v-model.number="cool" min="0" step="0.5" /></label>
        <label>Power losses + misc (kW)<input type="number" v-model.number="misc" min="0" step="0.5" /></label>
      </div>
      <div class="fresult">{{ pue.toFixed(2) }}</div>
      <div class="fverdict" :style="verdict.style">{{ verdict.text }}</div>
    </div>

    <h2>What it hides</h2>
    <ul>
      <li><b>Climate is invisible.</b> The same hardware scores differently in Munich and Singapore — free cooling hours depend on wet-bulb (<NuxtLink to="/wet-bulb-free-cooling">wet-bulb physics</NuxtLink>). Cross-climate PUE comparisons are marketing, not engineering.</li>
      <li><b>Liquid cooling doesn't shrink IT power.</b> It shrinks the cooling term. A rack's IT draw is the same; what changes is how cheaply the heat leaves the building.</li>
      <li><b>A cabinet in a room has no honest PUE.</b> If the "facility" is office AC shared with humans, the boundary is undefined. Use the <NuxtLink to="/room-ac-load">1.1× room load rule</NuxtLink> instead for micro deployments.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/room-ac-load">Room AC load</NuxtLink> ·
      <NuxtLink to="/wet-bulb-free-cooling">Wet-bulb &amp; free cooling</NuxtLink> ·
      <NuxtLink to="/liquid-cooling-vs-air">Liquid vs air</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">Definition: The Green Grid / ISO/IEC 30134-2. Band context: Uptime Institute global surveys (air-cooled averages ≈ 1.5; leading liquid-cooled facilities 1.1 or below).</p>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
useSeo({
  title: 'PUE formula — power usage effectiveness, honestly',
  description: 'PUE = total facility energy ÷ IT energy: 100 kW IT with 15 kW overhead = 1.15. Live calculator, the 1.05-1.2 liquid vs 1.4-1.6 air bands, and three things PUE hides — climate, the IT term, and the cabinet-in-a-room boundary problem.'
})
useArticle({
  path: '/pue-math',
  title: 'PUE math — and what it hides',
  description: 'Power usage effectiveness computed honestly.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

const it = ref(100), cool = ref(10), misc = ref(5)
const pue = computed(() => ((it.value || 1) + Math.max(cool.value, 0) + Math.max(misc.value, 0)) / (it.value || 1))
const verdict = computed(() => {
  const p = pue.value
  if (p <= 1.1) return { text: '✅ ≤ 1.1 — leading-facility territory; liquid + free cooling territory', style: 'border-color:var(--ok);color:var(--ok)' }
  if (p <= 1.2) return { text: '✅ 1.1-1.2 — good; typical for well-run liquid-cooled sites', style: 'border-color:var(--ok);color:var(--ok)' }
  if (p <= 1.4) return { text: '⚠️ 1.2-1.4 — average; usually air-side infrastructure', style: 'border-color:var(--warn);color:var(--warn)' }
  return { text: `❌ ${p.toFixed(2)} — legacy territory; the cooling term is eating the budget`, style: 'border-color:var(--heat);color:var(--heat)' }
})

useFaq([
  {
    q: 'What is a good PUE for a liquid-cooled data center?',
    a: 'Well-run liquid-cooled facilities typically reach 1.05-1.2, versus roughly 1.4-1.6 for legacy air-cooled sites. PUE is total facility energy divided by IT energy, so liquid cooling improves the score by shrinking the cooling overhead — it does not reduce IT power itself.'
  },
  {
    q: 'Why can PUE comparisons be misleading?',
    a: 'Because PUE depends on climate and boundary definitions as much as on technology. The same design scores better in a cold, dry climate than in the tropics (free-cooling hours track wet-bulb temperature), and a single cabinet in a shared room has no well-defined facility boundary at all. Compare like climates and stated boundaries, not headline numbers.'
  }
])
</script>
