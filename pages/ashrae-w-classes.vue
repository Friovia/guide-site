<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Reference + lookup · 2 min read</p>
    <h1>ASHRAE W-classes (W17–W45)</h1>

    <p style="max-width:680px">
      ASHRAE sorts liquid-cooled equipment into coolant supply temperature classes:
      <b>W17, W27, W32, W40, W45 — the number is the maximum facility water supply temperature in °C</b>.
      Higher classes reject heat into warmer water, enabling chiller-free operation — if the IT
      hardware supports it.
    </p>

    <h2>The table</h2>
    <figure class="fig" style="margin-inline:0">
      <table style="max-width:720px">
        <tr><th>Class</th><th>Max facility supply</th><th>What it implies for the site</th></tr>
        <tr><td><b>W17</b></td><td>≈ 17 °C</td><td>Chilled water required — compressors run year-round; historic baseline</td></tr>
        <tr><td><b>W27</b></td><td>≈ 27 °C</td><td>Cooler climate or partial free cooling; chiller mostly shoulder-season</td></tr>
        <tr><td><b>W32</b></td><td>≈ 32 °C</td><td>Most temperate sites' free-cooling target; dry coolers viable much of the year</td></tr>
        <tr><td><b>W40</b></td><td>≈ 40 °C</td><td>Chiller-less operation in most of Europe/North America via dry coolers</td></tr>
        <tr><td><b>W45</b></td><td>≈ 45 °C</td><td>Warm-water direct-to-chip; the class behind "free cooling almost everywhere" claims — and the rating point of typical L2A cabinets</td></tr>
      </table>
      <figcaption><b>FIG. 1</b> — The class number ≈ maximum facility water supply temperature in °C. Quality, chemistry and wet-bulb limits apply on top — see notes.</figcaption>
    </figure>

    <h2>Look up your site</h2>
    <div class="fcalc">
      <div class="frow">
        <label>Your facility water supply (°C)<input type="number" v-model.number="t" min="5" max="60" step="1" /></label>
      </div>
      <div class="fresult">Needs class ≥ <b>{{ need }}</b></div>
      <div class="fverdict" :style="verdict.style">{{ verdict.text }}</div>
    </div>

    <h2>Reading it honestly</h2>
    <ul>
      <li><b>W-class is about the facility loop, not the room.</b> Room air classes (A1-A4) are a separate ladder for air-cooled IT; do not mix them in a quote.</li>
      <li><b>Warmer water trades chiller hours for chip margin.</b> A W45 loop lets the site skip refrigeration, but every degree of warmer coolant raises cold-plate approach and chip temperatures — capacity and silicon limits pay for the efficiency.</li>
      <li><b>Temperature is only half the spec.</b> Classes assume water quality targets (corrosion, biology, particulates); PG25 with inhibitors is the usual answer on the technology loop (<NuxtLink to="/liquid-cooling-fluids">fluids</NuxtLink>).</li>
      <li><b>Tropics cap the ladder.</b> With design wet-bulbs near 28-30 °C, even W45 loops lose dry-cooler margin — the physics behind <NuxtLink to="/wet-bulb-free-cooling">wet-bulb limits</NuxtLink> and SS 726.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/wet-bulb-free-cooling">Wet-bulb &amp; free cooling</NuxtLink> ·
      <NuxtLink to="/liquid-cooling-standards">Standards overview</NuxtLink> ·
      <NuxtLink to="/approach-temperature">Approach temperature</NuxtLink> ·
      <NuxtLink to="/glossary">Glossary</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">ASHRAE liquid cooling guidance ("Water-Cooled Servers" framework, 2019) and the W-class family as cited in equipment datasheets. Class value ≈ max supply temperature; confirm exact envelope in the current ASHRAE edition and your vendor's spec.</p>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
useSeo({
  title: 'ASHRAE W-classes explained (W17, W27, W32, W40, W45)',
  description: 'ASHRAE W-class table: W17/W27/W32/W40/W45 — the number is the maximum facility water supply temperature in °C. Higher classes enable chiller-free warm-water cooling; lookup tool, what each class implies, and the quality/tropical caveats.'
})
useArticle({
  path: '/ashrae-w-classes',
  title: 'ASHRAE W-classes (W17–W45)',
  description: 'Coolant supply temperature classes, tabulated.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

const t = ref(32)
const need = computed(() => [17, 27, 32, 40, 45].find(c => t.value <= c) ?? 'W45+')
const verdict = computed(() => {
  if (t.value <= 17) return { text: 'W17: chilled water year-round — refrigeration is in your PUE forever', style: 'border-color:var(--text);color:var(--text2)' }
  if (t.value <= 27) return { text: 'W27: shoulder-season free cooling in temperate climates; chiller for summer peaks', style: 'border-color:var(--text);color:var(--text2)' }
  if (t.value <= 32) return { text: 'W32: the common free-cooling target — dry coolers cover much of the year in temperate sites', style: 'border-color:var(--ok);color:var(--ok)' }
  if (t.value <= 40) return { text: 'W40: chiller-less operation in most of Europe/North America; check IT hardware support', style: 'border-color:var(--ok);color:var(--ok)' }
  if (t.value <= 45) return { text: 'W45: warm-water direct-to-chip territory — maximal free cooling, minimal chip margin', style: 'border-color:var(--warn);color:var(--warn)' }
  return { text: 'Above 45 °C — beyond the standard ladder; specialized designs only', style: 'border-color:var(--heat);color:var(--heat)' }
})

useFaq([
  {
    q: 'What do ASHRAE W-classes mean?',
    a: 'They classify liquid-cooled IT by the maximum facility water supply temperature it accepts: W17 up to about 17 °C, then W27, W32, W40 and W45. The higher the class, the warmer the water the equipment tolerates — unlocking chiller-free cooling with dry coolers — at the cost of tighter chip-level thermal margins. The classes complement, and are separate from, the A1-A4 room-air classes.'
  },
  {
    q: 'Which W-class do I need for free cooling?',
    a: 'It depends on climate: W32 suits dry coolers for much of the year in temperate regions, W40 makes chiller-less operation feasible across most of Europe and North America, and W45 extends free cooling further — but tropical sites with design wet-bulbs near 28-30 °C lose margin even at W45. Match the class to your site\u2019s wet-bulb statistics, not to vendor marketing.'
  }
])
</script>
