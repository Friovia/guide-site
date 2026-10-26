<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Deploy &amp; Ops · 2 min read</p>
    <h1>Maintenance schedule</h1>

    <p style="max-width:680px">
      A direct-to-chip loop is a small hydronic system: <b>fluid chemistry, filters, wetted
      seals and instrumentation each have an interval</b>. The table below is the honest default —
      your vendor's service manual overrides it, and the commissioning baseline
      (<NuxtLink to="/commissioning">step 8</NuxtLink>) is the reference every check compares against.
    </p>

    <figure class="fig" style="margin-inline:0">
      <table style="max-width:760px">
        <tr><th>Interval</th><th>Task</th><th>What you are looking for</th></tr>
        <tr><td><b>Weekly</b></td><td>Visual + dashboard walk</td><td>New drips/stains at couplings and clamps; flow, ΔP, ΔT, supply temperature vs baseline drift</td></tr>
        <tr><td><b>Monthly</b></td><td>Parameter log &amp; trend</td><td>Slow ΔP rise (fouling), ΔT widening (air accumulation or flow loss), coolant level drop</td></tr>
        <tr><td><b>Quarterly</b></td><td>Filter check/clean; strainer</td><td>Debris load vs baseline; replace on schedule or ΔP trigger, whichever first</td></tr>
        <tr><td><b>Semi-annual</b></td><td><b>Fluid sample analysis</b></td><td>pH, inhibitor level, conductivity, bacteria — the early-warning system for corrosion and biology (<NuxtLink to="/liquid-cooling-fluids">fluids</NuxtLink>)</td></tr>
        <tr><td><b>Annual</b></td><td>UQD &amp; seal inspection; sensor calibration</td><td>Corrosion or residue at couplings; temperature/pressure/level sensors re-calibrated; leak sensors cleaned/repositioned</td></tr>
        <tr><td><b>Per vendor (typ. 2-3 yr)</b></td><td>Fluid replacement / top-up chemistry</td><td>Inhibitor depletion that dosing cannot recover; document lot changes</td></tr>
        <tr><td><b>On event</b></td><td>After any leak, service disconnect or power event</td><td>Re-verify flow/ΔP/ΔT against baseline before returning to full load</td></tr>
      </table>
      <figcaption><b>FIG. 1</b> — Default intervals. Trend matters more than thresholds: a clean absolute number that is drifting is a failing system.</figcaption>
    </figure>

    <h2>The three failures this schedule catches</h2>
    <ul>
      <li><b>Corrosion &amp; biology</b> — caught by semi-annual fluid analysis long before it shows as a clogged cold plate (<NuxtLink to="/liquid-cooling-fluids">PG25 chemistry</NuxtLink>).</li>
      <li><b>Slow fouling</b> — caught by monthly ΔP trending, not by waiting for the high-ΔP alarm (<NuxtLink to="/pressure-drop">what ΔP means</NuxtLink>).</li>
      <li><b>Seal aging</b> — caught by annual coupling inspection; UQDs are dripless by design but not immortal (<NuxtLink to="/uqd-quick-disconnects">UQD</NuxtLink>, <NuxtLink to="/liquid-cooling-leaks">leak layers</NuxtLink>).</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/commissioning">Commissioning</NuxtLink> (the baseline this all compares to) ·
      <NuxtLink to="/liquid-cooling-fluids">Fluids &amp; PFAS</NuxtLink> ·
      <NuxtLink to="/liquid-cooling-leaks">Leaks: risk &amp; response</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">Interval structure reflects common practice for inhibited water-glycol loops; actual intervals, inhibitor chemistry and fluid life are vendor- and warranty-defined — contract them (<NuxtLink to="/rfq-scope-checklist">RFQ</NuxtLink>).</p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Liquid cooling maintenance schedule (intervals table)',
  description: 'Direct-to-chip maintenance intervals: weekly visual, monthly parameter trending, quarterly filters, semi-annual fluid analysis (pH, inhibitors, bacteria), annual UQD and sensor calibration, vendor-defined fluid replacement every 2-3 years. Plus the three failures the schedule catches early.'
})
useArticle({
  path: '/maintenance-schedule',
  title: 'Maintenance schedule',
  description: 'Intervals that keep a coolant loop boring.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

useFaq([
  {
    q: 'How often does direct-to-chip liquid cooling need maintenance?',
    a: 'A typical rhythm: weekly visual checks and dashboard review, monthly parameter trending, quarterly filter checks, semi-annual coolant sample analysis (pH, inhibitor level, conductivity, bacteria), annual coupling and sensor inspection, and fluid replacement per the vendor — commonly every two to three years. Trend against the commissioning baseline matters more than any single reading.'
  },
  {
    q: 'What does coolant fluid analysis check for?',
    a: 'pH shift (contamination or corrosion), inhibitor depletion (loses corrosion protection while looking fine), conductivity (ion buildup), and biological growth (biofilm clogs cold plates and corrodes surfaces). Semi-annual sampling catches all four long before they become thermal incidents.'
  }
])
</script>
