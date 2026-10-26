<template>
  <div>
    <section class="home-hero">
      <p class="eyebrow">Independent reference · every claim sourced</p>
      <h1><span class="grad">Liquid cooling</span>, made checkable.</h1>
      <p class="sub">
        GPU racks crossed 100 kW and air cannot follow. One concept per page — formulas with real
        numbers, live calculators, sourced product data — for engineers and buyers who verify instead of trust.
      </p>
      <div class="cta-row">
        <NuxtLink to="/playground" class="btn btn-fill">⚡ Open the playground</NuxtLink>
        <NuxtLink to="/what-is-liquid-cooling" class="btn btn-ghost">Start the guide →</NuxtLink>
      </div>
    </section>

    <main class="container" style="padding:8px 24px 60px">
      <div class="heropanel">
        <HeroChart
          label="Live — drag the point along the curve"
          caption="what a 50 kW-class liquid-to-air cabinet can still reject at {t} °C room air"
          sub="Drag toward the tropics: hotter room, smaller approach, less capacity — the one piece of physics this whole site exists to make obvious"
        />
        <div class="hp-foot">
          <span>DATA <b>v{{ meta.version }}</b></span>
          <span>PRODUCTS {{ meta.datasets.products.slice(5) }}</span>
          <span>VENDORS {{ meta.datasets.vendors.slice(5) }}</span>
          <span>FORMULAS {{ meta.datasets.formulas.slice(5) }}</span>
          <span><NuxtLink to="/changelog">CHANGELOG →</NuxtLink></span>
        </div>
      </div>

      <div class="feat-band">
        <div class="feat">
          <span class="fic">FORMULAS × 11</span>
          <h3>Verifiable</h3>
          <p>Every formula with worked examples and a live calculator — real numbers you can check, not marketing curves.</p>
        </div>
        <div class="feat">
          <span class="fic">97 COMPANIES · 16 SEGMENTS</span>
          <h3>Sourced</h3>
          <p>Product and supply-chain data linked to official sources on every row; unverifiable data is marked, never invented.</p>
        </div>
        <div class="feat">
          <span class="fic">4 TOOLS · ALL IN-BROWSER</span>
          <h3>Interactive</h3>
          <p>Rack builder, derating simulator, room-load calculator and an animated coolant loop — learn by moving numbers.</p>
        </div>
      </div>

      <h2 class="idx-sec" style="margin-top:64px">Start</h2>
      <div class="idx">
        <NuxtLink to="/what-is-liquid-cooling" class="idx-row"><span class="idx-title">What is liquid cooling?</span><span class="idx-desc">Cold plates, CDUs, manifolds, quick disconnects — the parts and the physics, with a live loop simulator</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/what-is-a-cdu" class="idx-row"><span class="idx-title">What is a CDU?</span><span class="idx-desc">The heart of the system: pumps, heat exchangers, TCS vs facility loops, the three form factors</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/cold-plate-vs-immersion" class="idx-row"><span class="idx-title">Cold plate vs immersion</span><span class="idx-desc">The two architectures compared: heat capture, fluids, PFAS regulation, serviceability</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-vs-air" class="idx-row"><span class="idx-title">Liquid vs air</span><span class="idx-desc">Where the crossover really is, what PUE numbers assume, and the tropical catch nobody mentions</span><span class="idx-arrow">→</span></NuxtLink>
      </div>

      <h2 class="idx-sec" style="margin-top:56px">Formulas</h2>
      <p class="src" style="margin:4px 0 0">One formula per page: definition → worked example with real numbers → live calculator → the mistakes that cost money.</p>
      <div class="idx">
        <NuxtLink to="/coolant-flow-rate" class="idx-row"><span class="idx-title">Coolant flow rate</span><span class="idx-desc"><span class="f">L/min = kW × 60 / (4.186 × ΔT)</span> — 50 kW at ΔT 8 °C → 89.6 L/min</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/heat-capture-split" class="idx-row"><span class="idx-title">Heat capture split</span><span class="idx-desc"><span class="f">P_liq = capture × P_IT</span> — 60-80% leaves through liquid; the rest still heats the room</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/tdp-to-rack-kw" class="idx-row"><span class="idx-title">TDP → rack kW</span><span class="idx-desc"><span class="f">P_rack ≈ nodes × (Σ GPU + Σ CPU) × 1.2</span> — chip power to a rack budget</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/room-ac-load" class="idx-row"><span class="idx-title">Room AC load</span><span class="idx-desc"><span class="f">P_AC ≈ 1.1 × P_IT</span> — 30 kW rack → 33 kW ≈ 9.4 tons of room cooling</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/kw-to-tons" class="idx-row"><span class="idx-title">kW ↔ refrigeration tons</span><span class="idx-desc"><span class="f">1 ton = 3.517 kW = 12,000 BTU/h</span> — cooling units ≠ electrical draw</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/approach-temperature" class="idx-row"><span class="idx-title">Approach temperature</span><span class="idx-desc"><span class="f">capacity ≈ rated × approach / 20 K</span> — why 35 °C halves a 50 kW cabinet</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/pressure-drop" class="idx-row"><span class="idx-title">Pressure drop</span><span class="idx-desc"><span class="f">ΔP = f × (L/D) × ρv²/2</span> — 90 L/min in 25 mm hose loses ≈20 kPa over 3 m</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/floor-loading" class="idx-row"><span class="idx-title">Floor loading</span><span class="idx-desc"><span class="f">kN/m² = kg × 9.81 ÷ m²</span> — a full rack prints ~5× an office floor's rating</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/pue-math" class="idx-row"><span class="idx-title">PUE math</span><span class="idx-desc"><span class="f">PUE = total ÷ IT energy</span> — 1.05-1.2 liquid vs 1.4-1.6 air, and what the number hides</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/ashrae-w-classes" class="idx-row"><span class="idx-title">ASHRAE W-classes</span><span class="idx-desc"><span class="f">W17 · W27 · W32 · W40 · W45</span> — the number ≈ max facility water supply °C</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/wet-bulb-free-cooling" class="idx-row"><span class="idx-title">Wet-bulb &amp; free cooling</span><span class="idx-desc"><span class="f">free cooling ⇔ wb + 6 K ≤ coolant °C</span> — why the tropics can't economize</span><span class="idx-arrow">→</span></NuxtLink>
      </div>

      <h2 class="idx-sec" style="margin-top:56px">Choosing</h2>
      <div class="idx">
        <NuxtLink to="/cabinet-comparison" class="idx-row"><span class="idx-title">Cabinet comparison</span><span class="idx-desc">Every small-scale cooling cabinet we could verify — power class, cooling type, facility needs, per-row sources</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-cost" class="idx-row"><span class="idx-title">What drives the cost</span><span class="idx-desc">Why nobody publishes prices, the cost stack, and how to make quotes comparable</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/rfq-scope-checklist" class="idx-row"><span class="idx-title">RFQ scope checklist</span><span class="idx-desc">Twelve line items that turn two incomparable quotes into one comparable table</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-ready-servers" class="idx-row"><span class="idx-title">Liquid-ready servers</span><span class="idx-desc">The five compatibility checks — plates, couplings, W-class, flow, serviceability</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-hot-climates" class="idx-row"><span class="idx-title">Hot &amp; tropical climates</span><span class="idx-desc">Derating physics with published numbers, SS 726:2026 scope, the buying checklist</span><span class="idx-arrow">→</span></NuxtLink>
      </div>

      <figure class="fig" style="margin:56px 0 6px">
        <img src="/img/ai/immersion-tank.png" alt="Immersion cooling tank with server blades in dielectric fluid — AI illustration" loading="lazy" style="width:100%;display:block" />
        <figcaption><b>PLATE 2</b> — The other architecture: single-phase immersion, blades bathed in dielectric fluid. AI-generated illustration (Z-Image Turbo) — representative, not a specific product. Compared honestly in <NuxtLink to="/cold-plate-vs-immersion">cold plate vs immersion</NuxtLink>.</figcaption>
      </figure>

      <h2 class="idx-sec" style="margin-top:40px">Deploy &amp; Ops</h2>
      <div class="idx">
        <NuxtLink to="/site-survey" class="idx-row"><span class="idx-title">Site survey</span><span class="idx-desc">Six-point checklist — floor, power, heat egress, water, access, noise — each linked to its math</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/room-load-calculation" class="idx-row"><span class="idx-title">Room load calculation</span><span class="idx-desc">Can your room host an L2A cabinet? The 1.1× rule, worked hospital example, full survey</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/commissioning" class="idx-row"><span class="idx-title">Commissioning</span><span class="idx-desc">Eight steps from empty pipes to signed acceptance</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-leaks" class="idx-row"><span class="idx-title">Leaks: risk &amp; response</span><span class="idx-desc">Where leaks actually happen, and the four-layer detection model to demand</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/maintenance-schedule" class="idx-row"><span class="idx-title">Maintenance schedule</span><span class="idx-desc">Weekly-to-annual intervals that keep a coolant loop boring</span><span class="idx-arrow">→</span></NuxtLink>
      </div>

      <h2 class="idx-sec" style="margin-top:56px">Reference</h2>
      <div class="idx">
        <NuxtLink to="/supply-chain" class="idx-row"><span class="idx-title">Supply chain map</span><span class="idx-desc">97 companies across 16 segments, chips to heat rejection — every row sourced; free listings, never paid</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/news" class="idx-row"><span class="idx-title">Industry radar</span><span class="idx-desc">News plus the curated milestone timeline — every item sourced, nothing invented</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/state-of-liquid-cooling-2026" class="idx-row"><span class="idx-title">State of 2026</span><span class="idx-desc">The annual digest: what changed, and the 20-50 kW turnkey gap that still doesn't exist</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/glossary" class="idx-row"><span class="idx-title">Glossary</span><span class="idx-desc">50+ self-contained, anchorable definitions — DLC, UQD, W-class, approach temperature…</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/uqd-quick-disconnects" class="idx-row"><span class="idx-title">UQD quick disconnects</span><span class="idx-desc">The OCP coupling family UQD04-UQD40, tabulated by nominal flow</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-fluids" class="idx-row"><span class="idx-title">Fluids &amp; PFAS</span><span class="idx-desc">PG25 vs oils vs fluorinated fluids — chemistry as a buying decision</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-standards" class="idx-row"><span class="idx-title">Standards</span><span class="idx-desc">OCP, ASHRAE W-classes, IEC 62368-1, SS 726 — mapped to a buying checklist</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/changelog" class="idx-row"><span class="idx-title">Changelog</span><span class="idx-desc">Data-layer versions and article updates</span><span class="idx-arrow">→</span></NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import meta from '~/data/meta.json'
useSeo({
  title: 'Liquid cooling for micro data centers — an independent guide',
  description: 'What liquid cooling is, liquid vs air, the formulas with live calculators, and a sourced comparison of small-scale cooling cabinets. Independent reference for hospitals, universities and edge deployments.',
  path: '/'
})
</script>
