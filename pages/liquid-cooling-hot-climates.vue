<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Updated 2026-09-09 · 6 min read</p>
    <h1>Liquid cooling in hot and tropical climates</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>Key takeaways</h3>
        <p>
          In the tropics, free cooling (economizers) is essentially unavailable — high wet-bulb temperatures mean
          mechanical cooling is always in the chain; the design question is only where it sits.
          A liquid-to-air cabinet's cooling capacity falls as room temperature rises, roughly tracking the
          temperature difference between coolant and air: in published vendor data, raising room temperature from
          25°C to 35°C roughly halves capacity at a fixed coolant temperature.
          Almost no vendor publishes capacity-vs-ambient curves — Vertiv's XDU070 application guide is a rare
          exception — so demanding one before purchase is the single most useful thing a hot-climate buyer can do.
        </p>
      </div>
    </div>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/tropical-dc.png" alt="Modular data center container in a humid tropical setting" loading="lazy" style="width:100%;max-width:640px;display:block;border:1px solid var(--rule)" />
      <figcaption><b>PLATE 1</b> — Deployment in the tropics: humidity, corrosion and zero free-cooling margin change the engineering. AI-generated illustration (Z-Image Turbo) — representative, not a specific site.</figcaption>
    </figure>

    <h2>What actually changes in the tropics</h2>
    <p>
      Three physical facts dominate. First, <strong>high wet-bulb temperatures</strong> gut dry coolers and cooling
      towers — outside air cannot absorb much heat when it is already hot and humid, so chiller-based cooling is
      unavoidable at the facility level. Second, <strong>approach temperature</strong> governs L2A capacity: a
      liquid-to-air CDU can only reject heat down to some margin above room air temperature, so hotter rooms mean
      less capacity at the same coolant setpoint. Third, <strong>humidity</strong> accelerates corrosion and
      biological growth in cooling loops — SS 726:2026 explicitly calls out corrosion and microbial risk as
      tropical-specific design concerns.
    </p>

    <h2>The derating physics, with numbers</h2>
    <p>
      Vertiv's published XDU070 (CoolChip CDU 70) application guide shows the shape: at 45°C facility coolant,
      100 L/min flow and 25°C inlet air, the unit delivers ~86.5 kW; move the inlet air to 35°C and the driving
      temperature difference halves — capacity lands near half. Room-air cooling is not binary "works / doesn't
      work": it is a curve. Any deployment plan in a warm climate should read capacity off that curve at the
      <em>real</em> room temperature, with the building AC running.
    </p>
    <p class="src">
      Source: Vertiv XDU070 Application &amp; Planning Guide (SL-71111), capacity charts covering 20-35°C inlet air.
    </p>

    <h2>What Singapore's standard says (and doesn't)</h2>
    <p>
      SS 726:2026, the world's first tropical-climate liquid cooling standard, covers direct-to-chip single-phase
      systems inside data centers: IT equipment, CDUs, facility water, cooling towers and chillers, plus operation
      and sustainability tracking. It explicitly excludes indirect approaches like rear-door heat exchangers, and
      says nothing about standalone edge cabinets. Treat it as a design philosophy source — raise operating
      temperatures, manage corrosion and biology, measure everything — rather than a pass/fail mark on a product.
      Singapore's Green DC roadmap pushes operating temperatures from 22-24°C toward 26°C+, which is exactly the
      direction that makes hot-climate liquid cooling economics work.
    </p>

    <h2>Practical checklist for hot-climate buyers</h2>
    <ul>
      <li>Demand capacity-vs-ambient curves at your coolant temperature, not headline kW at 25°C.</li>
      <li>Run a room heat-load calculation: room AC must absorb ~1.1× full IT load.</li>
      <li>Ask for corrosion inhibition and biological-control plans for the coolant loop.</li>
      <li>Check the equipment's stated maximum operating ambient (40°C is typical for CDUs).</li>
      <li>For anything outside a proper data center, ask what SS 726 discipline the vendor borrows even though the standard doesn't cover the form factor.</li>
    </ul>

    <h2>Frequently asked questions</h2>
    <div v-for="f in faqs" :key="f.q" style="margin-bottom:18px">
      <h3 style="margin-bottom:4px; font-size:17px">{{ f.q }}</h3>
      <p style="margin:0">{{ f.a }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Liquid cooling in hot and tropical climates',
  description: 'Tropical liquid cooling physics: why free cooling fails at high wet-bulb, how L2A capacity derates with room temperature (with published numbers), SS 726:2026 scope, and a hot-climate buying checklist.'
})
useArticle({ path: '/liquid-cooling-hot-climates', title: 'Liquid cooling in hot and tropical climates', description: 'Derating physics, SS 726 and the hot-climate buying checklist.' })

const faqs = [
  {
    q: 'Does liquid cooling work in tropical climates?',
    a: 'Yes — every major tropical market (Singapore, Malaysia, Indonesia, the Gulf) is deploying it. The caveats: capacity must be read at realistic room temperature because liquid-to-air output falls as rooms get hotter, room air conditioning must absorb about 1.1× the IT load, and coolant loops need corrosion and biological control. Singapore\u2019s SS 726:2026 is the first national standard addressing exactly these issues.'
  },
  {
    q: 'Why can\u2019t you use free cooling in the tropics?',
    a: 'Free cooling (economizers) rejects heat to outside air or water directly. In the tropics, high wet-bulb temperatures mean outside air and water are too warm to absorb useful heat most of the year, so mechanical (chiller) cooling has to remain in the chain. This is why hot-climate design focuses on raising operating temperatures to improve chiller efficiency rather than eliminating chillers.'
  },
  {
    q: 'How much capacity does a liquid cooling cabinet lose at 35°C room temperature?',
    a: 'It depends on coolant temperature and unit design, but as a rule capacity tracks the coolant-to-air temperature difference. In Vertiv\u2019s published XDU070 curves, moving inlet air from 25°C to 35°C at 45°C coolant roughly halves capacity (~86.5 kW to the mid-40s kW). Vendors who cannot produce a curve for their unit should be treated with caution.'
  }
]
useFaq(faqs)
</script>
