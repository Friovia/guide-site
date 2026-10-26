<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Updated 2026-09-09 · 5 min read</p>
    <h1>Room load calculation: can your room host a liquid cooling cabinet?</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>Key takeaways</h3>
        <p>
          A liquid-to-air cabinet relocates all IT heat into the room air, so the room's air conditioning must
          absorb about 1.1× the IT load (the 0.1 covers pumps and fans) — e.g. a 30 kW cabinet needs ~33 kW ≈
          9-10 refrigeration tons of spare cooling capacity.
          The check is three numbers: cabinet IT load, the room AC's installed capacity, and what else already
          draws on that AC; margin below ~15% spare means upgrade first or derate the cabinet.
          Floor loading (a liquid cabinet is heavier than an air one), electrical supply and noise complete the
          site survey — all checkable before any vendor visit.
        </p>
      </div>
    </div>

    <h2>The worksheet</h2>
    <h3>Step 1 — Heat to reject</h3>
    <p>
      Q = 1.1 × IT load (kW). For a cabinet with 4 liquid-cooled GPU servers at ~7 kW each: Q = 1.1 × 28 ≈ 31 kW.
      Convert to tons of refrigeration if your AC is specified that way: 1 ton ≈ 3.52 kW, so 31 kW ≈ 8.8 tons.
    </p>
    <h3>Step 2 — Spare capacity in the room</h3>
    <p>
      From the AC unit nameplate(s): installed cooling (kW) minus existing heat sources in the same zone
      (people ~0.1 kW each, other equipment, lighting). What remains is your spare. Compare with Q.
    </p>
    <h3>Step 3 — Margin rule</h3>
    <p>
      Spare ÷ Q ≥ 1.15 → green. Between 1.0 and 1.15 → conditional: derate the cabinet or verify AC maintenance
      state. Below 1.0 → the room needs an AC upgrade or a ducted/liquid-to-liquid alternative.
    </p>

    <h2>Worked example — hospital equipment room</h2>
    <table>
      <tr><th>Item</th><th>Value</th></tr>
      <tr><td>Cabinet IT load (2 × 10 kW GPU nodes)</td><td>20 kW</td></tr>
      <tr><td>Heat to reject (×1.1)</td><td><strong>22 kW ≈ 6.3 tons</strong></td></tr>
      <tr><td>Room AC installed (one 8-ton split)</td><td>28 kW</td></tr>
      <tr><td>Existing load (PACS gear + lighting)</td><td>9 kW</td></tr>
      <tr><td>Spare</td><td>19 kW</td></tr>
      <tr><td>Verdict (19 / 22 = 0.86)</td><td><strong>Insufficient — add ~1.5 tons or halve the cabinet load</strong></td></tr>
    </table>

    <h2>The rest of the site survey</h2>
    <table>
      <tr><th>Check</th><th>Typical requirement</th></tr>
      <tr><td>Floor loading</td><td>Liquid cabinets run heavier than air racks (coolant + CDU); confirm with the building for upper floors — reinforced slabs or ground floors are safe bets</td></tr>
      <tr><td>Electrical</td><td>Cabinet IT load ÷ 0.9 PSU efficiency on an appropriate circuit; check breaker size and cable route</td></tr>
      <tr><td>Air path</td><td>Warm exhaust must not recirculate into the unit's intake; avoid tight closets without return flow</td></tr>
      <tr><td>Noise</td><td>L2A fans under load: ask for sound power data if the room shares walls with clinical or office space</td></tr>
      <tr><td>Water</td><td>None required for L2A — that\u2019s the point; but drainage for maintenance matters</td></tr>
    </table>

    <h2>Frequently asked questions</h2>
    <div v-for="f in faqs" :key="f.q" style="margin-bottom:18px">
      <h3 style="margin-bottom:4px; font-size:17px">{{ f.q }}</h3>
      <p style="margin:0">{{ f.a }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Room load calculation for liquid cooling cabinets (with worksheet)',
  description: 'How to check if a room can host a liquid-to-air cooling cabinet: 1.1× IT load rule, refrigeration-ton conversion, worked hospital example, and the full site survey checklist.'
})
useArticle({ path: '/room-load-calculation', title: 'Room load calculation: can your room host a liquid cooling cabinet?', description: 'A worksheet, a worked example and a site survey.' })

const faqs = [
  {
    q: 'How much air conditioning do I need for a liquid cooling cabinet?',
    a: 'For a liquid-to-air cabinet, plan for about 1.1× the cabinet\u2019s IT load in room cooling capacity — the extra 10% covers pumps and fans. In refrigeration tons, divide kW by 3.52: a 30 kW cabinet needs roughly 33 kW ≈ 9-10 tons of spare AC capacity in the room.'
  },
  {
    q: 'Can I put a liquid cooling cabinet in a normal office or hospital room?',
    a: 'Often yes — the requirements are spare AC capacity (≥1.15× the heat load), adequate floor loading, a suitable electrical circuit, an air path so warm exhaust doesn\u2019t recirculate, and acceptable fan noise for neighboring spaces. The worksheet above tells you in fifteen minutes before anyone visits the site.'
  },
  {
    q: 'Why 1.1× and not exactly the IT load?',
    a: 'The cabinet\u2019s pumps and fans add their own consumption (a few percent of load), and heat exchangers are not perfectly efficient. Planning 10% extra avoids running the room AC at 100% duty — which is loud, inefficient and leaves no headroom for a hot afternoon.'
  }
]
useFaq(faqs)
</script>
