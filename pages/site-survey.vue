<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Deploy &amp; Ops · 3 min read</p>
    <h1>Site survey — can this room host a liquid cabinet?</h1>

    <p style="max-width:680px">
      Before any vendor call, walk the room with this survey. Five of the six items kill micro-DC
      liquid deployments in rooms that "look fine": <b>floor, power, heat egress, water, access,
      noise</b>. Every item links to the math or the check that settles it.
    </p>

    <figure class="fig" style="margin-inline:0">
      <table style="max-width:760px">
        <tr><th>#</th><th>Check</th><th>Pass condition</th><th>Tool / formula</th></tr>
        <tr><td>1</td><td><b>Floor loading</b></td><td>As-built slab rating ≥ filled rack print (often 7+ kN/m²)</td><td><NuxtLink to="/floor-loading">Floor loading calc</NuxtLink> + structural sign-off</td></tr>
        <tr><td>2</td><td><b>Electrical</b></td><td>Feed capacity ≥ IT × 1.2 + AC; redundant path or UPS as required</td><td><NuxtLink to="/tdp-to-rack-kw">TDP → rack kW</NuxtLink></td></tr>
        <tr><td>3</td><td><b>Heat egress (L2A)</b></td><td>Room AC ≥ 1.1 × IT with margin, air path in/out of the cabinet row</td><td><NuxtLink to="/room-ac-load">1.1× rule</NuxtLink> + <NuxtLink to="/room-load-calculation">worked guide</NuxtLink></td></tr>
        <tr><td>4</td><td><b>Water (L2L only)</b></td><td>Facility loop capacity, temperature class and quality documented</td><td><NuxtLink to="/ashrae-w-classes">W-class lookup</NuxtLink></td></tr>
        <tr><td>5</td><td><b>Access &amp; delivery</b></td><td>Door widths, lift capacity, corridor turns for a ~1 t crate on a pallet</td><td>Measure on site; photograph the worst turn</td></tr>
        <tr><td>6</td><td><b>Noise</b></td><td>Room/adjacent use compatible with fan and pump noise at full load</td><td>Ask vendor for full-load dBA at 1 m; check room use</td></tr>
      </table>
      <figcaption><b>FIG. 1</b> — The six-point survey. Items 1, 3 and 5 fail most often in offices and clinics.</figcaption>
    </figure>

    <h2>Climate check</h2>
    <p style="max-width:680px">
      Room design temperature drives capacity: an L2A cabinet rated at 25 °C air delivers roughly
      half at 35 °C (<NuxtLink to="/approach-temperature">approach temperature</NuxtLink>). In the
      tropics the survey includes the room's worst-case temperature with AC failure margins —
      see <NuxtLink to="/liquid-cooling-hot-climates">hot &amp; tropical climates</NuxtLink>.
    </p>

    <h2>Red flags</h2>
    <ul>
      <li>"The floor is raised, so it's data-center grade" — raised ≠ reinforced. Get the as-built rating.</li>
      <li>"We'll add AC later" — the day-one AC is what the cabinet derates against. Size now (<NuxtLink to="/room-ac-load">calculator</NuxtLink>).</li>
      <li>Untested condensation margin — cold coolant below room dew point sweats onto live hardware; verify supply temperature vs worst-case dew point.</li>
    </ul>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/room-load-calculation">Room load calculation</NuxtLink> ·
      <NuxtLink to="/rfq-scope-checklist">RFQ scope checklist</NuxtLink> ·
      <NuxtLink to="/commissioning">Commissioning</NuxtLink>
    </p>

    <h2>Sources</h2>
    <p class="src">Survey structure from this site's engineering pages; thresholds link to the formula pages where each number comes from. Nothing on this page replaces a licensed structural and electrical review.</p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Site survey for liquid-cooled cabinets — the six-point checklist',
  description: 'Six-point site survey before deploying a liquid-cooled cabinet: floor loading, electrical, heat egress (1.1× rule), facility water, access, noise — each check linked to its formula or calculator. Plus climate and condensation red flags.'
})
useArticle({
  path: '/site-survey',
  title: 'Site survey — six-point checklist',
  description: 'Can this room host a liquid cabinet?',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

useFaq([
  {
    q: 'What should I check before installing a liquid-cooled server cabinet?',
    a: 'Six things: floor loading against the filled rack weight (typically 7+ kN/m² needed), electrical feed sized for about 1.2× IT plus the air conditioning, heat egress — room AC at roughly 1.1× the IT load for liquid-to-air cabinets, facility water temperature class and quality if liquid-to-liquid, physical access for a roughly one-tonne delivery, and noise compatible with the room\u2019s use. Climate matters too: capacity derates with room temperature.'
  },
  {
    q: 'What fails most often in site surveys for micro data centers?',
    a: 'Floor capacity, air conditioning headroom and physical access. Office slabs are commonly rated 2.5-3.5 kN/m² while a full liquid rack prints five times that; existing room AC is rarely sized for 1.1× the new IT load; and delivery routes assume doors, lifts and corridors that fit a palletized cabinet. All three are cheap to check early and expensive to discover late.'
  }
])
</script>
