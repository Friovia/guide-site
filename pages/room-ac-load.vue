<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Formula · 2 min read</p>
    <h1>Room AC load — the 1.1× rule</h1>

    <p style="max-width:680px">
      A liquid-to-air (L2A) cabinet still needs room air conditioning sized for about
      <b>1.1 × the IT load</b>: a 30 kW rack needs ≈ 33 kW ≈ 9.4 refrigeration tons of cooling
      in the room. Liquid cooling moves heat; it does not destroy it.
    </p>

    <h2>Formula</h2>
    <div class="formula">P<sub>AC</sub> [kW] ≈ 1.1 × P<sub>IT</sub> [kW]&nbsp;&nbsp;→&nbsp;&nbsp;tons = P<sub>AC</sub> / 3.517</div>
    <p style="max-width:680px">
      The L2A cabinet rejects essentially all IT heat — the liquid share through its own
      air-to-liquid heat exchanger, the rest straight off the servers — into the room.
      The extra 10% covers pumps and power losses plus commissioning margin.
      Liquid-to-liquid (L2L) systems move the same requirement to facility water and dry coolers instead.
    </p>

    <h2>Worked example</h2>
    <div class="formula">40 kW edge room → 44 kW AC ≈ <b>12.5 refrigeration tons</b></div>
    <p style="max-width:680px">
      A hospital server room hosting a 40 kW liquid-cooled rack needs 44 kW (1.1 ×) of air
      conditioning — about 12.5 tons. An existing 10-ton unit is not enough; the verdict below
      does this comparison for your numbers.
    </p>

    <h2>Try it</h2>
    <div class="fcalc">
      <div class="frow">
        <label>IT load (kW)<input type="number" v-model.number="it" min="0" step="1" /></label>
        <label>Existing room AC (tons)<input type="number" v-model.number="acTons" min="0" step="0.5" /></label>
      </div>
      <div class="fresult">
        {{ ac.toFixed(1) }} kW <small>≈ {{ tons.toFixed(1) }} tons needed</small>
      </div>
      <div class="fverdict" :style="verdict.style">{{ verdict.text }}</div>
    </div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>"Liquid cooling means no air conditioning."</b> No. Anyone telling you otherwise is selling, not engineering. L2A relocates heat into the room; the room still removes it.</li>
      <li><b>Confusing cooling tons with electrical draw.</b> A "12-ton" AC removes 42 kW of heat but draws far less electricity (typically a third, depending on COP/EER).</li>
      <li><b>Forgetting redundancy.</b> The rule sizes the requirement, not the fleet — N+1 redundancy means one more unit than the math demands.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/room-load-calculation">Room load calculation</NuxtLink> (full worked guide + site survey) ·
      <NuxtLink to="/kw-to-tons">kW ↔ tons</NuxtLink> ·
      <NuxtLink to="/liquid-cooling-hot-climates">Hot &amp; tropical climates</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">
      1.1× convention used across this site's tools (<a href="/playground/room-load">room-load calculator</a>,
      <a href="/playground/rack-builder">rack builder</a>); 1 refrigeration ton = 3.517 kW (12,000 BTU/h).
    </p>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
useSeo({
  title: 'Room AC load for liquid cooling — the 1.1× rule',
  description: 'A liquid-to-air cabinet still needs room air conditioning sized at about 1.1 × IT load: a 30 kW rack needs ≈33 kW ≈ 9.4 refrigeration tons. Formula, worked example, live calculator, and the mistakes that leave rooms overheating.'
})
useArticle({
  path: '/room-ac-load',
  title: 'Room AC load — the 1.1× rule',
  description: 'Sizing room cooling for L2A cabinets.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

const it = ref(30)
const acTons = ref(10)

const ac = computed(() => Math.max((it.value || 0) * 1.1, 0))
const tons = computed(() => ac.value / 3.517)
const verdict = computed(() => {
  const have = acTons.value * 3.517
  const need = ac.value
  if (have <= 0) return { text: 'Enter your existing AC capacity for a verdict', style: 'border-color:var(--text);color:var(--text2)' }
  if (have < need) return { text: `❌ Short by ${(need - have).toFixed(1)} kW — add cooling or reduce IT load`, style: 'border-color:var(--heat);color:var(--heat)' }
  if (have < need * 1.15) return { text: '⚠️ Fits, but under 15% margin — no N+1 headroom', style: 'border-color:var(--warn);color:var(--warn)' }
  return { text: `✅ Fits with ${(((have - need) / need) * 100).toFixed(0)}% headroom`, style: 'border-color:var(--ok);color:var(--ok)' }
})

useFaq([
  {
    q: 'Does liquid cooling eliminate the need for air conditioning?',
    a: 'No. Liquid cooling moves heat out of the servers but not out of the building. A liquid-to-air (L2A) cabinet rejects its heat into the deployment room, so the room needs air conditioning sized for roughly 1.1 times the IT load. Liquid-to-liquid systems transfer the requirement to facility water loops and dry coolers instead.'
  },
  {
    q: 'How much air conditioning does a 30 kW liquid-cooled rack need?',
    a: 'About 33 kW of cooling capacity (1.1 × 30 kW), which is roughly 9.4 refrigeration tons. Add redundancy on top: an N+1 design needs one more unit than that math demands.'
  }
])
</script>
