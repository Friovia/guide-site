<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Formula · 3 min read</p>
    <h1>Pressure drop (Darcy–Weisbach)</h1>

    <p style="max-width:680px">
      Every meter of hose and every coupling eats pump head: <b>90 L/min through 25 mm hose loses
      ≈ 20 kPa over 3 m</b> (f = 0.035). If the loop's total drop exceeds the CDU's available head,
      flow falls below the formula on paper — and the rack overheats on a Friday afternoon.
    </p>

    <h2>Formula</h2>
    <div class="formula">ΔP = f × (L / D) × (ρ × v² / 2)&nbsp;&nbsp;·&nbsp;&nbsp;v = Q / A</div>
    <p style="max-width:680px">
      Darcy–Weisbach with friction factor f (≈ 0.03-0.04 for smooth hose at these flows),
      ρ ≈ 1,020 kg/m³ for PG25, and v the flow velocity. Velocity is the killer —
      it enters squared, which is why stepping down one hose size hurts so much.
    </p>

    <h2>Worked example</h2>
    <div class="formula">90 L/min · 25 mm ID · 3 m · f 0.035 → v 3.06 m/s → ΔP ≈ <b>20.0 kPa (2.9 psi)</b></div>
    <p style="max-width:680px">
      That is just one straight hose. Add the rack manifold, two UQD couplings, elbows and the
      CDU heat exchanger, and a loop can easily demand 100-150 kPa — which is exactly what CDU
      pump curves are sized against.
    </p>

    <h2>Try it</h2>
    <div class="fcalc">
      <div class="frow">
        <label>Flow (L/min)<input type="number" v-model.number="q" min="0" step="5" /></label>
        <label>Inner diameter (mm)<input type="number" v-model.number="dia" min="4" step="1" /></label>
        <label>Length (m)<input type="number" v-model.number="len" min="0" step="0.5" /></label>
        <label>Friction factor f<input type="number" v-model.number="f" min="0.01" max="0.1" step="0.005" /></label>
        <label>CDU available head (kPa)<input type="number" v-model.number="head" min="1" step="10" /></label>
      </div>
      <div class="fresult">
        {{ dp.toFixed(1) }} kPa <small>≈ {{ psi.toFixed(1) }} psi · velocity {{ v.toFixed(2) }} m/s</small>
      </div>
      <div class="fverdict" :style="verdict.style">{{ verdict.text }}</div>
    </div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Undersized hose.</b> Halving diameter multiplies velocity fourfold and drop roughly sixteen-fold (v² and D both bite). 25 mm+ supply lines are normal at rack flows for a reason.</li>
      <li><b>Ignoring fittings and the UQD.</b> Each elbow adds an equivalent length; a quick disconnect is often the single highest-drop element in a sub-loop. Count them, don't wish them away.</li>
      <li><b>Reading the pump curve wrong.</b> A CDU's "available head" is at a flow rate; as loop drop rises, operating flow slides down the curve. Check the intersection, not the brochure peak.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/coolant-flow-rate">Coolant flow rate</NuxtLink> (what Q should be) ·
      <NuxtLink to="/what-is-a-cdu">What is a CDU?</NuxtLink> ·
      <NuxtLink to="/commissioning">Commissioning</NuxtLink> (verifying real ΔP and flow)
    </p>

    <h2>Sources</h2>
    <p class="src">Darcy–Weisbach with Darcy friction factor; PG25 density ≈ 1,020 kg/m³ at 25 °C. Friction factor from Moody/Colebrook smooth-pipe turbulence — engineering approximation for first-pass sizing, not a substitute for vendor loop data.</p>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
useSeo({
  title: 'Coolant pressure drop formula (Darcy–Weisbach calculator)',
  description: 'Pressure drop ΔP = f × (L/D) × ρv²/2: 90 L/min through 25 mm hose loses ≈20 kPa over 3 m. Live calculator with velocity check against CDU available head, plus the undersized-hose and UQD traps.'
})
useArticle({
  path: '/pressure-drop',
  title: 'Pressure drop (Darcy–Weisbach)',
  description: 'Why the loop eats pump head, quantified.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

const q = ref(90), dia = ref(25), len = ref(3), f = ref(0.035), head = ref(150)
const v = computed(() => {
  const d = Math.max(dia.value, 1) / 1000
  const area = Math.PI * (d / 2) ** 2
  return (q.value / 60000) / area
})
const dp = computed(() => {
  const d = Math.max(dia.value, 1) / 1000
  return f.value * (len.value / d) * (1020 * v.value ** 2 / 2) / 1000
})
const psi = computed(() => dp.value * 0.145038)
const verdict = computed(() => {
  if (dp.value > head.value) return { text: `❌ Loop drop ${dp.value.toFixed(0)} kPa exceeds available head — enlarge diameter or shorten runs before the CDU pays for it`, style: 'border-color:var(--heat);color:var(--heat)' }
  if (v.value > 3) return { text: `⚠️ Velocity ${v.value.toFixed(1)} m/s — above the ~3 m/s comfort zone; erosion and noise risk, step up the diameter`, style: 'border-color:var(--warn);color:var(--warn)' }
  if (dp.value > head.value * 0.7) return { text: '⚠️ Using most of the available head — little margin for fouling and additions', style: 'border-color:var(--warn);color:var(--warn)' }
  return { text: `✅ ${((1 - dp.value / head.value) * 100).toFixed(0)}% of CDU head still available for manifolds, couplings and the exchanger`, style: 'border-color:var(--ok);color:var(--ok)' }
})

useFaq([
  {
    q: 'How do you calculate coolant pressure drop in a liquid cooling loop?',
    a: 'With the Darcy–Weisbach equation: ΔP = f × (L/D) × (ρv²/2), where f is the friction factor (about 0.03-0.04 for smooth hose), L the length, D the inner diameter, ρ the fluid density (about 1,020 kg/m³ for PG25) and v the velocity from flow ÷ pipe area. For example, 90 L/min in 25 mm hose over 3 m loses roughly 20 kPa before fittings.'
  },
  {
    q: 'What happens if pressure drop exceeds the CDU pump head?',
    a: 'Flow drops until the loop\u2019s resistance curve intersects the pump curve lower down. Less flow means a wider supply-return temperature rise and less heat moved — the rack runs hotter than the design, typically failing first at high ambient. Fix it with larger diameters and shorter runs, not a bigger pump.'
  }
])
</script>
