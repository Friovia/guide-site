<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Deploy &amp; Ops · 3 min read</p>
    <h1>Commissioning a liquid-cooled rack</h1>

    <p style="max-width:680px">
      Commissioning proves the loop does what the spec sheet promised: <b>pressure-test dry,
      fill, verify flow and ΔT against the calculated values, prove leak detection, then ramp
      load</b>. Acceptance is measured numbers against the RFQ, not a handshake.
    </p>

    <h2>The sequence</h2>
    <figure class="fig" style="margin-inline:0">
      <table style="max-width:760px">
        <tr><th>Step</th><th>What happens</th><th>Pass criterion</th></tr>
        <tr><td><b>1 · Dry pressure test</b></td><td>Loop pressurized with air/nitrogen before fluid</td><td>Hold specified pressure, zero decay over the stated interval</td></tr>
        <tr><td><b>2 · Fill &amp; purge</b></td><td>PG25 (or specified fluid) filled; air bled at high points</td><td>No visible air in sight glass / flow stabilizes; fluid specs documented</td></tr>
        <tr><td><b>3 · Flow verification</b></td><td>Pump at design speed, measure loop flow and supply/return ΔT</td><td>Flow ≥ design (<NuxtLink to="/coolant-flow-rate">flow formula</NuxtLink>); ΔT within design band</td></tr>
        <tr><td><b>4 · Pressure survey</b></td><td>Record loop ΔP across filter, manifold, UQDs</td><td>Within vendor envelope (<NuxtLink to="/pressure-drop">pressure drop</NuxtLink>); clean-filter baseline logged</td></tr>
        <tr><td><b>5 · Dew point check</b></td><td>Confirm minimum coolant supply vs room dew point at commissioning and worst-case humidity</td><td>Supply temperature safely above dew point margin per vendor</td></tr>
        <tr><td><b>6 · Leak system test</b></td><td>Sensor alarm on simulated leak; interlocks (pump stop, valve, alert) fire</td><td>Detection announced, response executed, logs captured</td></tr>
        <tr><td><b>7 · Load ramp</b></td><td>IT load stepped up (e.g., 25/50/75/100%) holding each step</td><td>Chip and supply temperatures stable at each step; no new ΔP growth</td></tr>
        <tr><td><b>8 · Baseline snapshot</b></td><td>Record all measured values as the reference for <NuxtLink to="/maintenance-schedule">maintenance</NuxtLink></td><td>Signed acceptance against RFQ scope</td></tr>
      </table>
      <figcaption><b>FIG. 1</b> — Eight steps from empty pipes to signed acceptance. Steps 3, 5 and 6 are the ones skipped under schedule pressure — and the ones that surface later as incidents.</figcaption>
    </figure>

    <h2>What "good" looks like in numbers</h2>
    <ul>
      <li>Measured flow within ~5-10% of the <NuxtLink to="/coolant-flow-rate">calculated</NuxtLink> value for the actual load and ΔT.</li>
      <li>Capacity verified at <em>your</em> room temperature, not the 25 °C nameplate point (<NuxtLink to="/approach-temperature">derating</NuxtLink>).</li>
      <li>Every alarm path exercised end-to-end — sensors, pump interlock, remote alert — before the first GPU trains anything.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/rfq-scope-checklist">RFQ scope checklist</NuxtLink> (write acceptance criteria before buying) ·
      <NuxtLink to="/liquid-cooling-leaks">Leaks: risk &amp; response</NuxtLink> ·
      <NuxtLink to="/maintenance-schedule">Maintenance schedule</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">Sequence assembled from this site's engineering pages; exact pressures, intervals and margins are vendor- and project-specific — fix them contractually in the RFQ acceptance section.</p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Commissioning a liquid-cooled rack — 8-step acceptance sequence',
  description: 'Liquid cooling commissioning: dry pressure test, fill & purge, flow verification against the calculated L/min, pressure survey, dew-point check, leak-system test, staged load ramp, baseline snapshot — with pass criteria for each step.'
})
useArticle({
  path: '/commissioning',
  title: 'Commissioning a liquid-cooled rack',
  description: 'From empty pipes to signed acceptance.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

useFaq([
  {
    q: 'How is a direct-to-chip liquid cooling system commissioned?',
    a: 'In eight steps: dry pressure test before any fluid, fill and purge air, verify measured flow and supply-return ΔT against the design calculation, survey pressure drop across filter and couplings, confirm coolant supply temperature stays above room dew point, exercise the leak-detection and interlock chain end to end, ramp IT load in steps to full design, and record a baseline snapshot. Acceptance compares measured numbers against the RFQ — not the datasheet.'
  },
  {
    q: 'What is checked during liquid cooling flow verification?',
    a: 'That measured loop flow reaches the design value — flow in L/min should match the heat load times 60 divided by 4.186 times the design ΔT — and that supply/return temperature difference sits inside the design band at that flow. Large deviation means air in the loop, a throttled valve, undersized hose, or a pump operating off its curve.'
  }
])
</script>
