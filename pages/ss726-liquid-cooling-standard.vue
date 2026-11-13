<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Reference · 5 min read</p>
    <h1>SS 726:2026 — the tropical liquid cooling standard, explained</h1>

    <p style="max-width:680px">
      On 27 August 2026 Singapore published <b>SS 726:2026, "Liquid Cooling in Tropical Data Centres"</b> —
      the world's first national standard written specifically for liquid cooling in hot, humid climates.
      It was developed jointly by IMDA and Enterprise Singapore through the Singapore Standards Council,
      in close consultation with industry. This page is a sourced explainer of what the standard is,
      what it covers, who wrote it — and where its scope stops.
    </p>

    <h2>The standard at a glance</h2>
    <figure class="fig" style="margin-inline:0">
      <table style="max-width:720px">
        <tr><th>Field</th><th>Value</th></tr>
        <tr><td><b>Designation</b></td><td>SS 726:2026 — Liquid Cooling in Tropical Data Centres</td></tr>
        <tr><td><b>Published</b></td><td>27 August 2026, Singapore</td></tr>
        <tr><td><b>Developed by</b></td><td>IMDA + Enterprise Singapore, via the Singapore Standards Council (consensus process with industry, academia and technical experts)</td></tr>
        <tr><td><b>What it provides</b></td><td>"Requirements and recommendations for the deployment of liquid-cooled systems within data centres located in tropical climate zones" (Scope, verbatim) — planning/design, deployment, maintenance, sustainability tracking and risk management</td></tr>
        <tr><td><b>Technology focus</b></td><td>Coolant removing heat directly from the source (CPUs/GPUs/TPUs). <b>Rear-door heat exchangers and other indirect solutions are out of scope; two-phase and hybrid systems are not covered</b> (Scope, verbatim)</td></tr>
        <tr><td><b>Tropical-specific content</b></td><td>Corrosion and reliability under heat and humidity; best practices for measuring and optimising water use</td></tr>
        <tr><td><b>Builds on</b></td><td>Existing international liquid cooling standards — with elements of the OCP's liquid cooling specifications reflected in the standard (per OCP Foundation)</td></tr>
        <tr><td><b>Context</b></td><td>Complements the Tropical Data Centre standard, the Energy Efficiency of Data Centre IT Equipment standard, and IMDA's Green Data Centre Roadmap (2024)</td></tr>
        <tr><td><b>Full text</b></td><td>Purchase from the Singapore Standards e-shop (singaporestandardseshop.sg)</td></tr>
      </table>
      <figcaption><b>FIG. 1</b> — Facts as stated in the official launch media release (27 Aug 2026). No clause numbers are quoted on this page; the clause-by-clause breakdown follows once the full text is in hand.</figcaption>
    </figure>

    <h2>Why the tropics need their own standard</h2>
    <ul>
      <li><b>The physics is least forgiving exactly where AI demand is growing.</b> Liquid cooling can cut data-centre-level energy consumption by <b>more than 30%</b> versus traditional air cooling (IMDA's framing) — but tropical temperatures and humidity add challenges air-cooled temperate designs never face.</li>
      <li><b>The standard's own framing: warm is an advantage if the fluid runs hot.</b> Its Introduction notes that tropical ambient temperatures "often exceed 30 °C", and that liquid cooling systems designed for <b>higher fluid temperatures (above 40 °C) are well-suited to such climates</b> — high-grade heat rejection with less chiller. That is the same physics behind our <NuxtLink to="/ashrae-w-classes">ASHRAE W-class</NuxtLink> ladder: W40/W45 loops trade chip margin for chiller-free operation.</li>
      <li><b>Corrosion is a first-class concern.</b> The launch release explicitly names equipment corrosion under heat and humidity as a threat to cooling efficiency <i>and</i> reliability — not a footnote. See our <NuxtLink to="/liquid-cooling-fluids">coolant chemistry and water-quality</NuxtLink> treatment of the same problem.</li>
      <li><b>Free cooling collapses at tropical wet-bulbs.</b> The efficiency case for liquid cooling in the tropics rests on mechanical refrigeration or high-temperature loops carrying the load — the physics behind <NuxtLink to="/wet-bulb-free-cooling">wet-bulb limits</NuxtLink> and <NuxtLink to="/liquid-cooling-hot-climates">hot-climate derating</NuxtLink>.</li>
      <li><b>Water efficiency is addressed, not assumed.</b> The standard recommends best practices for measuring and optimising water use — relevant where water is scarce and evaporation is high.</li>
    </ul>

    <h2>The standard's structure (from the official preview)</h2>
    <figure class="fig" style="margin-inline:0">
      <table style="max-width:720px">
        <tr><th>Clause</th><th>Title</th><th>Page</th></tr>
        <tr><td>5</td><td>Background and environmental conditions</td><td>9</td></tr>
        <tr><td>6</td><td>Liquid-cooling facilities</td><td>12</td></tr>
        <tr><td>7</td><td>Equipment and materials</td><td>26</td></tr>
        <tr><td>8</td><td>Pre-deployment and commissioning</td><td>33</td></tr>
        <tr><td>9</td><td>Operations and maintenance</td><td>39</td></tr>
        <tr><td>10</td><td>Risk management</td><td>47</td></tr>
        <tr><td>11</td><td>Sustainability indicators</td><td>53</td></tr>
        <tr><td>A</td><td>Immersion fluid specifications</td><td>59</td></tr>
      </table>
      <figcaption><b>FIG. 3</b> — Main technical clauses (0–4 are introduction/scope/references/terms). Named tables mark the engineering meat: water-based fluid performance guide &amp; PG25 properties (cl. 6), dielectric liquids (cl. 7), monitored parameters (cl. 9), four sample hazard tables (cl. 10), SI types (cl. 11). Clause-by-clause commentary on this page follows the full text.</figcaption>
    </figure>

    <h2>The OCP and ASHRAE connection</h2>
    <p style="max-width:680px">
      The Foreword names its reference publications explicitly: <b>ASHRAE TC9.9 "Water-cooled servers" (2019)</b>,
      the OCP <b>PG25 propylene-glycol guidelines (2022)</b> and OCP <b>Immersion Requirements rev 2.10 (2023)</b> —
      with <b>permission obtained to adapt OCP's "Minimum dielectric fluid requirements" table directly into Table 3</b>.
      Steve Helvie of the OCP Foundation, a working-group member, likewise noted that
      <i>"elements of the OCP's liquid cooling specifications and guidelines [are] reflected in the standard"</i>.
      This ties SS 726 to the same open-interface stack this site documents —
      <NuxtLink to="/uqd-quick-disconnects">UQD quick disconnects</NuxtLink>,
      <NuxtLink to="/liquid-cooling-standards">ORv3 blind-mate manifolds and W-class envelopes</NuxtLink>,
      <NuxtLink to="/liquid-cooling-fluids">PG25 fluids</NuxtLink> —
      which is why a tropical standard matters even to buyers outside Singapore: the interfaces it
      standardises are the ones global AI racks already speak.
    </p>

    <h2>Who built it</h2>
    <p style="max-width:680px">
      The working group mixed policy makers with the region's largest operators:
    </p>
    <figure class="fig" style="margin-inline:0">
      <table style="max-width:720px">
        <tr><th>Member</th><th>Role in the working group</th></tr>
        <tr><td><b>ST Telemedia Global Data Centres</b></td><td>Deputy convenor of the Liquid Cooling in Tropical Data Centres Working Group (Yeo Teong Chuan, Head of R&amp;D) — will use the standard to guide liquid cooling deployments across its portfolio</td></tr>
        <tr><td><b>AirTrunk</b></td><td>Contributed large-scale liquid-cooled operations experience across the region (Jose Castaneda, VP Innovation &amp; Intelligence)</td></tr>
        <tr><td><b>Meta</b></td><td>Public-policy perspective on sustainable AI infrastructure (Clara Koh, Director, Public Policy)</td></tr>
        <tr><td><b>OCP Foundation</b></td><td>Open-specification alignment (Steve Helvie, Chief Emerging Ecosystem Officer)</td></tr>
      </table>
      <figcaption><b>FIG. 2</b> — Quoted in the launch annex. A consensus standard led by the people who operate tropical AI data centres — not a paper exercise.</figcaption>
    </figure>

    <h2>Status of this page</h2>
    <p style="max-width:680px" class="src">
      Sources, in order of authority: the official eShop preview of SS 726:2026 (cover, contents, Foreword,
      Introduction and Scope — 7 pp.), the 27 Aug 2026 launch media release (4 pp., incl. working-group annex),
      and IMDA's public statements. A clause-by-clause commentary will follow once the full text is in hand.
      Until then, nothing on this page quotes requirements beyond what the preview's own Scope, Foreword and
      contents pages state.
    </p>

    <h2>What it is not</h2>
    <ul>
      <li><b>It is not a certification you can claim by association.</b> Compliance is tested against the standard's own methods, not asserted from its existence.</li>
      <li><b>Its scope is data-centre liquid cooling.</b> Smaller standalone deployments — edge cabinets, single-rack rooms — sit outside it. If a vendor of such equipment references SS 726, the honest phrasing is "designed with the standard's discipline in mind", not "SS 726 compliant".</li>
      <li><b>It does not repeal tropical physics.</b> Whatever the standard recommends, capacity still derates with room temperature and rooms still must extract the heat — run the <NuxtLink to="/room-ac-load">1.1× room-load check</NuxtLink> regardless.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/liquid-cooling-standards">Standards overview (OCP, ASHRAE, IEC, SS 726)</NuxtLink> ·
      <NuxtLink to="/liquid-cooling-hot-climates">Liquid cooling in hot &amp; tropical climates</NuxtLink> ·
      <NuxtLink to="/wet-bulb-free-cooling">Wet-bulb &amp; free cooling</NuxtLink> ·
      <NuxtLink to="/ashrae-w-classes">ASHRAE W-classes</NuxtLink> ·
      <NuxtLink to="/uqd-quick-disconnects">UQD quick disconnects</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">
      IMDA / EnterpriseSG media release, "Singapore launches world's first liquid cooling standard for data
      centres in tropical climates", 27 Aug 2026 (SGPC, 4 pp. incl. working-group annex) · IMDA factsheet
      "Liquid Cooling in Tropical Data Centres" (imda.gov.sg) · Singapore Standards e-shop for the full text.
    </p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'SS 726:2026 explained — Singapore\u2019s tropical liquid cooling standard',
  description: 'SS 726:2026 "Liquid Cooling in Tropical Data Centres", explained from the official preview and launch release: verbatim scope (direct-to-chip; rear-door and two-phase excluded), clause structure (facilities/equipment/commissioning/O&M/risk/sustainability), OCP+ASHRAE references, working group (STT GDC, AirTrunk, Meta, OCP) — and what it means for buyers outside Singapore.'
})
useArticle({
  path: '/ss726-liquid-cooling-standard',
  title: 'SS 726:2026 — tropical liquid cooling standard',
  description: 'The world\u2019s first tropical liquid cooling standard, explained from official sources.',
  datePublished: '2026-11-13',
  dateModified: '2026-11-13'
})
useFaq([
  {
    q: 'What is SS 726:2026?',
    a: 'A Singapore Standard published on 27 August 2026 — the world\u2019s first national liquid cooling standard written specifically for tropical climates. Developed by IMDA and Enterprise Singapore through the Singapore Standards Council, it gives data centre operators technical guidelines to design, deploy and operate liquid cooling systems, manage risks, and integrate liquid cooling with existing air-cooled facilities, with explicit attention to corrosion under heat/humidity and to water efficiency.'
  },
  {
    q: 'Does SS 726 apply outside data centres, e.g. edge cabinets?',
    a: 'Its scope is liquid-cooled systems deployed within data centres in tropical climate zones. Standalone edge cabinets and single-rack rooms sit outside it. The Scope also explicitly excludes rear-door heat exchangers and other indirect liquid cooling, and does not cover two-phase or hybrid systems. Honest phrasing for out-of-scope equipment is \u201cdesigned with the standard\u2019s discipline in mind\u201d — not \u201cSS 726 compliant\u201d.'
  },
  {
    q: 'Does SS 726 cover immersion cooling?',
    a: 'The Scope centres on coolant removing heat directly from the source, and excludes two-phase systems. Single-phase immersion is addressed at annex level: Annex A carries immersion fluid specifications, and its Table 3 (dielectric liquid guidelines) is adapted from the OCP Immersion Requirements rev 2.10 — so immersion fluids are specified even though the main clauses are direct-to-chip.'
  },
  {
    q: 'How is SS 726 related to OCP specifications?',
    a: 'The OCP Foundation, a working-group member, states that elements of the OCP\u2019s liquid cooling specifications and guidelines are reflected in the standard — tying SS 726 to the same open-interface stack (UQD couplings, ORv3 blind-mate manifolds) used by global AI racks.'
  },
  {
    q: 'Where can I read the full SS 726:2026 text?',
    a: 'From the Singapore Standards e-shop (singaporestandardseshop.sg). The official launch media release and IMDA\u2019s factsheet summarize the scope publicly; this page is based on those until the full text is studied for a clause-by-clause breakdown.'
  }
])
</script>
