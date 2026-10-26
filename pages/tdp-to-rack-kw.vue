<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Formula · 3 min read</p>
    <h1>TDP → rack kW budget</h1>

    <p style="max-width:680px">
      Rack power is a sum, not a mystery: <b>P<sub>rack</sub> = N<sub>nodes</sub> × (GPU + CPU + ~20% overhead)</b>.
      A node with 8 accelerators at 1,000 W plus 2 CPUs at 360 W draws ≈ 10.4 kW —
      four of those is a 42 kW rack before you touch a cooling spec.
    </p>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/gpu-board.png" alt="GPU accelerator board with copper cold plates over the processors" loading="lazy" style="width:100%;max-width:620px;display:block;border:1px solid var(--rule)" />
      <figcaption><b>PLATE 1</b> — Where the watts live: a accelerator board with cold plates over the big chips. AI-generated illustration (Z-Image Turbo) — representative, not a specific product.</figcaption>
    </figure>

    <h2>Formula</h2>
    <div class="formula">P<sub>node</sub> ≈ (Σ P<sub>GPU</sub> + Σ P<sub>CPU</sub>) × 1.2&nbsp;&nbsp;·&nbsp;&nbsp;P<sub>rack</sub> = N × P<sub>node</sub></div>
    <p style="max-width:680px">
      The 20% overhead covers power supply losses, fans, memory, drives and networking.
      TDP is a worst-case thermal rating — real draw rides below it and follows the workload,
      so treat the TDP sum as the design ceiling, not the electric bill.
    </p>

    <h2>Worked example</h2>
    <div class="formula">(8 × 1.0 kW + 2 × 0.36 kW) × 1.2 = <b>10.5 kW/node</b> × 4 nodes = <b>42 kW/rack</b></div>
    <p style="max-width:680px">
      42 kW fits a 50 kW-class liquid cabinet at 25 °C air — but at 35 °C the same cabinet only
      rejects ≈ 25 kW (<NuxtLink to="/approach-temperature">derating</NuxtLink>). The budget and the
      climate have to be checked together.
    </p>

    <h2>Try it</h2>
    <div class="fcalc">
      <div class="frow">
        <label>GPU/accelerators per node<input type="number" v-model.number="gN" min="0" step="1" /></label>
        <label>Each (W)<input type="number" v-model.number="gW" min="0" step="50" /></label>
        <label>CPUs per node<input type="number" v-model.number="cN" min="0" step="1" /></label>
        <label>Each (W)<input type="number" v-model.number="cW" min="0" step="10" /></label>
        <label>Nodes in rack<input type="number" v-model.number="nodes" min="1" step="1" /></label>
      </div>
      <div class="fresult">
        {{ nodeKw.toFixed(1) }} kW/node <small>· rack {{ rackKw.toFixed(1) }} kW IT</small>
      </div>
      <div class="fverdict" :style="verdict.style">{{ verdict.text }}</div>
    </div>

    <h2>Common mistakes</h2>
    <ul>
      <li><b>Nameplate vs typical.</b> PSU nameplates (e.g., 2 × 3 kW PSUs) state maximum delivery, not draw. Budget on TDP sums; verify on metered PDU data after deployment.</li>
      <li><b>Forgetting the 20%.</b> Fans, memory and converters add up; a rack budget built on chip TDPs alone under-provisions power and cooling by a fifth.</li>
      <li><b> kW ≠ kVA.</b> UPS and electrical work in VA with a power factor below 1; converting late surprises people. Match units early.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/approach-temperature">Approach temperature</NuxtLink> (does the climate still fit the budget) ·
      <NuxtLink to="/heat-capture-split">Heat capture split</NuxtLink> ·
      <NuxtLink to="/playground/rack-builder">Rack builder</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">Method note: TDP-based ceiling budgeting with 1.2 overhead factor — standard provisioning practice; accelerator classes (700-1,000+ W) per this site's overview. Verify final numbers on metered power.</p>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
useSeo({
  title: 'TDP to rack kW — power budgeting for liquid-cooled racks',
  description: 'Rack power budget formula: P_node ≈ (Σ GPU + Σ CPU) × 1.2, P_rack = N × P_node. Worked example — 8×1 kW GPUs + 2×360 W CPUs = 10.5 kW/node, 42 kW/rack — plus live calculator and the nameplate trap.'
})
useArticle({
  path: '/tdp-to-rack-kw',
  title: 'TDP → rack kW budget',
  description: 'From chip power ratings to a rack-level cooling budget.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

const gN = ref(8), gW = ref(1000), cN = ref(2), cW = ref(360), nodes = ref(4)
const nodeKw = computed(() => ((gN.value * gW.value + cN.value * cW.value) * 1.2) / 1000)
const rackKw = computed(() => nodeKw.value * (nodes.value || 1))
const verdict = computed(() => {
  const k = rackKw.value
  if (k > 50) return { text: `❌ ${k.toFixed(0)} kW — beyond single-cabinet liquid-to-air territory; needs liquid-to-liquid and facility water`, style: 'border-color:var(--heat);color:var(--heat)' }
  if (k > 30) return { text: `⚠️ ${k.toFixed(0)} kW — 50 kW-class cabinet territory, and only in a cool room (derating!)`, style: 'border-color:var(--warn);color:var(--warn)' }
  return { text: `✅ ${k.toFixed(0)} kW — inside the 20-50 kW turnkey cabinet band`, style: 'border-color:var(--ok);color:var(--ok)' }
})

useFaq([
  {
    q: 'How do you calculate the power consumption of a GPU rack?',
    a: 'Sum the thermal design power of every accelerator and CPU per node, add about 20% for power supplies, fans, memory and networking, then multiply by the node count: P_rack ≈ nodes × (Σ GPU TDP + Σ CPU TDP) × 1.2. For example, four nodes of 8 × 1 kW GPUs plus 2 × 360 W CPUs is roughly a 42 kW rack — a design ceiling, since real draw follows the workload.'
  },
  {
    q: 'Is TDP the same as actual power draw?',
    a: 'No. TDP is a worst-case thermal rating used to size cooling; typical consumption is lower and workload-dependent. Budget cooling and power on TDP sums (the ceiling), then verify actuals with metered PDUs after deployment.'
  }
])
</script>
