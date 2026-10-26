<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Reference · 2 min read</p>
    <h1>UQD quick disconnects</h1>

    <p style="max-width:680px">
      UQD (Universal Quick Disconnect) is the OCP-standardized family of <b>dripless coolant
      couplings</b>: any compliant plug meets any compliant socket across vendors. Sizes run
      UQD04 → UQD40, where <b>the number ≈ nominal flow in L/min</b> — a per-plate loop typically
      uses UQD06–UQD12, rack manifolds aggregate to UQD32/UQD40 territory.
    </p>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/uqd-coupling.png" alt="Macro photograph of dripless quick-disconnect coolant couplings" loading="lazy" style="width:100%;max-width:620px;display:block;border:1px solid var(--rule)" />
      <figcaption><b>PLATE 1</b> — Dripless quick disconnects up close: the valved halves that close on separation. AI-generated illustration (Z-Image Turbo) — representative, not a specific product.</figcaption>
    </figure>

    <h2>The size table</h2>
    <figure class="fig" style="margin-inline:0">
      <table style="max-width:680px">
        <tr><th>Size</th><th>Nominal flow</th><th>Typical use</th></tr>
        <tr><td><b>UQD04 / UQD06</b></td><td>≈ 4 / 6 L/min</td><td>Single cold plate loops (CPU plates, entry nodes)</td></tr>
        <tr><td><b>UQD08 / UQD12</b></td><td>≈ 8 / 12 L/min</td><td>High-power GPU plate pairs, accelerator nodes</td></tr>
        <tr><td><b>UQD16 / UQD22</b></td><td>≈ 16 / 22 L/min</td><td>Multi-plate node loops, dense 1U twins</td></tr>
        <tr><td><b>UQD32 / UQD40</b></td><td>≈ 32 / 40 L/min</td><td>Rack-level manifold feeds, CDU headers</td></tr>
      </table>
      <figcaption><b>FIG. 1</b> — The OCP UQD family. Nominal flow ≈ the size number in L/min; check each vendor's pressure-drop curve at your flow before committing (<NuxtLink to="/pressure-drop">pressure drop</NuxtLink>).</figcaption>
    </figure>

    <h2>Why it matters</h2>
    <ul>
      <li><b>Interoperability.</b> Standardized bodies and seals mean cold plates, manifolds and CDUs from different vendors mate — the open-ecosystem defense against lock-in (<NuxtLink to="/liquid-ready-servers">liquid-ready servers</NuxtLink>).</li>
      <li><b>Dripless disconnects.</b> Valves close on separation, spilling at most a film of residue — the difference between a serviceable rack and a hazmat event (<NuxtLink to="/liquid-cooling-leaks">leak design</NuxtLink>).</li>
      <li><b>Blind-mate option.</b> Combined with ORv3 manifolds, servers connect by sliding in — no hand-plumbing per node (<NuxtLink to="/what-is-liquid-cooling">how the loop fits together</NuxtLink>).</li>
      <li><b>Size honestly.</b> An undersized UQD is the highest-pressure-drop element in a sub-loop; check the curve, not just the mating chart.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/liquid-cooling-standards">Standards overview</NuxtLink> ·
      <NuxtLink to="/pressure-drop">Pressure drop</NuxtLink> ·
      <NuxtLink to="/coolant-flow-rate">Coolant flow rate</NuxtLink> ·
      <NuxtLink to="/glossary">Glossary</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">OCP Cooling Environments / UQD specification family (opencompute.org). Nominal flows are the size-class ratings; exact curves are per vendor and per fluid temperature — request them in the RFQ (<NuxtLink to="/rfq-scope-checklist">RFQ checklist</NuxtLink>).</p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'UQD quick disconnects — OCP sizes (UQD04–UQD40) explained',
  description: 'UQD is the OCP-standardized dripless coolant coupling family: sizes UQD04 to UQD40, where the number ≈ nominal flow in L/min. Size table, per-loop guidance, why interoperability prevents vendor lock-in, and the pressure-drop trap.'
})
useArticle({
  path: '/uqd-quick-disconnects',
  title: 'UQD quick disconnects',
  description: 'OCP-standardized dripless couplings, by size.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

useFaq([
  {
    q: 'What is a UQD coupling in liquid cooling?',
    a: 'The Universal Quick Disconnect — a family of quick-release coolant couplings standardized by the Open Compute Project. Compliant plugs and sockets from different vendors interoperate and close dripless on disconnect, so servers, manifolds and CDUs can be mixed across the open ecosystem instead of being welded to one supplier.'
  },
  {
    q: 'Which UQD size do I need?',
    a: 'Match the nominal flow to your loop: single CPU cold plates typically use UQD04-UQD06, high-power GPU plate pairs UQD08-UQD12, dense node loops UQD16-UQD22, and rack manifold or CDU header feeds UQD32-UQD40. The size number approximates nominal L/min; always verify the vendor\u2019s pressure-drop curve at your actual flow and fluid temperature.'
  }
])
</script>
