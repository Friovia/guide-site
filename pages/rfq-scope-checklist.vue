<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Choosing · 2 min read</p>
    <h1>RFQ scope checklist</h1>

    <p style="max-width:680px">
      Nobody in this segment publishes prices — so quotes are only comparable if the <b>scope is
      pinned</b>. Send this checklist with every RFQ and require answers in writing;
      it converts "quote for a liquid cabinet" into twelve defined line items
      (<NuxtLink to="/liquid-cooling-cost">why prices hide</NuxtLink>).
    </p>

    <figure class="fig" style="margin-inline:0">
      <table style="max-width:780px">
        <tr><th>#</th><th>Line item</th><th>The question that pins it</th></tr>
        <tr><td>1</td><td><b>Capacity @ conditions</b></td><td>kW rejected at <em>your</em> room design temp and stated coolant temp — nameplate at 25 °C does not count (<NuxtLink to="/approach-temperature">derating</NuxtLink>)</td></tr>
        <tr><td>2</td><td><b>Heat capture</b></td><td>What % of IT heat goes to liquid in this configuration; what stays on air (<NuxtLink to="/heat-capture-split">split</NuxtLink>)</td></tr>
        <tr><td>3</td><td><b>Facility interfaces</b></td><td>Power feeds (kW, redundancy), floor load print (kN/m²), water/none, room AC requirement (<NuxtLink to="/room-ac-load">1.1×</NuxtLink>, <NuxtLink to="/floor-loading">floor</NuxtLink>)</td></tr>
        <tr><td>4</td><td><b>Redundancy</b></td><td>Pumps N+1? Fans? Controls? What fails how gracefully — and what does the cabinet do on facility power loss</td></tr>
        <tr><td>5</td><td><b>Interconnects</b></td><td>UQD and manifold spec/version — ORv3 blind-mate or proprietary (<NuxtLink to="/uqd-quick-disconnects">UQD</NuxtLink>, <NuxtLink to="/liquid-ready-servers">lock-in defense</NuxtLink>)</td></tr>
        <tr><td>6</td><td><b>Fluid &amp; warranty terms</b></td><td>Shipped fluid spec (PG25?), who owns chemistry compliance, what voids the warranty (<NuxtLink to="/liquid-cooling-fluids">fluids</NuxtLink>)</td></tr>
        <tr><td>7</td><td><b>Monitoring scope</b></td><td>Sensors included (flow, ΔP, leak, level, temperature), protocols/BMS integration, alarm routing (<NuxtLink to="/liquid-cooling-leaks">leak layers</NuxtLink>)</td></tr>
        <tr><td>8</td><td><b>Leak containment &amp; response</b></td><td>Dripless couplings, drain/containment capacity, interlock actions on leak detect</td></tr>
        <tr><td>9</td><td><b>Certifications</b></td><td>CE/UL/IEC 62368-1 Ed.4 and <em>your market's</em> local listing — per-region confirmation in writing (<NuxtLink to="/liquid-cooling-standards">standards</NuxtLink>)</td></tr>
        <tr><td>10</td><td><b>Commissioning &amp; acceptance</b></td><td>Vendor runs the 8-step commissioning; acceptance = measured flow/ΔT/capacity at your conditions (<NuxtLink to="/commissioning">sequence</NuxtLink>)</td></tr>
        <tr><td>11</td><td><b>Service model</b></td><td>Response SLA, spares on site, maintenance contract scope vs <NuxtLink to="/maintenance-schedule">schedule</NuxtLink>, training for your staff</td></tr>
        <tr><td>12</td><td><b>Derating documentation</b></td><td>Capacity-vs-ambient curve or table in writing — the vendors who can't provide it are telling you something (<NuxtLink to="/approach-temperature">why</NuxtLink>)</td></tr>
      </table>
      <figcaption><b>FIG. 1</b> — Twelve lines that make two quotes comparable. Items 1, 4 and 12 are where most "mysterious" price gaps live.</figcaption>
    </figure>

    <h2>How to run it</h2>
    <ul>
      <li>Send the table as a mandatory annex; "see datasheet" is not an answer to item 1 or 12.</li>
      <li>Score vendors on the <NuxtLink to="/cabinet-comparison">comparison table</NuxtLink> after answers arrive — gaps become visible, e.g. the 20-50 kW turnkey void.</li>
      <li>Walk the site with the <NuxtLink to="/site-survey">survey checklist</NuxtLink> before the RFQ so items in line 3 are your numbers, not the vendor's assumptions.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/liquid-cooling-cost">What drives the cost</NuxtLink> ·
      <NuxtLink to="/cabinet-comparison">Cabinet comparison</NuxtLink> ·
      <NuxtLink to="/liquid-cooling-standards">Standards</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">Checklist compiled from this site's engineering pages; each line links the page that explains the underlying physics or standard.</p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Liquid cooling RFQ scope checklist — 12 line items',
  description: 'RFQ checklist that makes liquid cooling quotes comparable: capacity at your ambient, heat capture %, facility interfaces, redundancy, UQD/ORv3 interconnects, fluid warranty terms, monitoring scope, leak response, certifications, commissioning acceptance, service SLA, and written derating curves.'
})
useArticle({
  path: '/rfq-scope-checklist',
  title: 'RFQ scope checklist',
  description: 'Twelve line items that make quotes comparable.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

useFaq([
  {
    q: 'Why do liquid cooling quotes vary so much?',
    a: 'Because the scope underneath the number varies: rated capacity quoted at different ambient temperatures, redundant pumps in one quote and single in another, monitoring included or not, commissioning and certification in or out. Pin twelve line items — capacity at your conditions, capture ratio, redundancy, interconnects, monitoring, acceptance testing, service — and the price gap becomes explainable or disqualifying.'
  },
  {
    q: 'What is the most important question in a liquid cooling RFQ?',
    a: 'Capacity at your actual room design temperature, in writing. Nameplate figures are quoted at 25 °C air / 45 °C coolant; at 35 °C ambient an L2A cabinet delivers roughly half. Vendors who cannot provide a capacity-vs-ambient curve for their own product are answering a different question.'
  }
])
</script>
