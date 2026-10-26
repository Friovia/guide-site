<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Updated 2026-09-09 · 4 min read</p>
    <h1>What drives the cost of liquid cooling?</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>Key takeaways</h3>
        <p>
          Nobody in this industry publishes list prices because every system is configured: the honest way to think
          about cost is as a stack of drivers — capacity class, cooling architecture (L2A vs liquid-to-liquid),
          redundancy, monitoring, certification for your market, and install/commissioning scope.
          Comparing quotes requires making vendors quote the same scope: same kW, same room conditions, same
          included services — otherwise you are comparing different products.
          The largest avoidable cost is mismatch: over-specced capacity for the room, or an architecture that
          forces facility work (water loops) a small site never needed.
        </p>
      </div>
    </div>

    <h2>The cost stack</h2>
    <table>
      <tr><th>Driver</th><th>How it moves the number</th></tr>
      <tr><td>Capacity class</td><td>Cooling hardware scales with kW; the cabinet, CDU and manifold are all sized by it</td></tr>
      <tr><td>Architecture</td><td>L2A (self-contained) vs liquid-to-liquid (needs facility water work) — the latter adds on-site engineering</td></tr>
      <tr><td>Redundancy</td><td>N+1 pumps, dual paths, UPS-backed controls: reliability costs money and is worth it for clinical/uptime-critical sites</td></tr>
      <tr><td>Monitoring &amp; detection</td><td>Sensors, telemetry platform, alarm integration — cheap relative to what an undetected leak costs</td></tr>
      <tr><td>Certification</td><td>Safety certification for your market (IEC 62368-1-based schemes, local schemes like SABER/ECAS) is per-market engineering</td></tr>
      <tr><td>Install &amp; commissioning</td><td>Delivery, positioning, power connection, loop fill and verification — site-dependent, quote it explicitly</td></tr>
      <tr><td>Consumables &amp; service</td><td>Coolant, filters, periodic chemistry checks, response SLA</td></tr>
    </table>

    <h2>How to compare quotes fairly</h2>
    <ul>
      <li>Fix the scope: same room temperature, same kW, same included services (commissioning? training? SLA?).</li>
      <li>Ask for capacity at YOUR conditions — a unit quoted at 25°C ambient is not comparable in a 30°C room.</li>
      <li>Separate hardware, services and consumables into lines; multi-year service belongs in the comparison.</li>
      <li>Include the room cost: AC spare capacity, electrical work, floor reinforcement — the honest total.</li>
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
  title: 'What drives the cost of liquid cooling?',
  description: 'Why nobody publishes liquid cooling prices: the cost stack (capacity, architecture, redundancy, monitoring, certification, install) and how to make vendors quote comparable scopes.'
})
useArticle({ path: '/liquid-cooling-cost', title: 'What drives the cost of liquid cooling?', description: 'The cost stack and fair quote comparison.' })

const faqs = [
  {
    q: 'Why don\u2019t liquid cooling vendors publish prices?',
    a: 'Because every system is configured: capacity, cooling architecture, redundancy, monitoring, market-specific certification and installation scope all change the number, and most sales flow through channels and integrators. Published list prices would be misleading — the workable equivalent is a fixed-scope RFQ across a few vendors.'
  },
  {
    q: 'Is liquid cooling more expensive than air cooling?',
    a: 'Hardware-for-hardware, yes — cold plates, CDUs, manifolds and couplings add cost. Total-cost-of-ownership depends on density: at GPU-scale heat loads, air cooling hits a wall (more floor space, more CRAC units, higher fan power), while at low density liquid is added cost without benefit. Published data-center-scale analysis (Schneider WP282) found comparable CapEx at equal 10 kW/rack density — but assumptions dominate, so model your own room.'
  },
  {
    q: 'How do I compare liquid cooling quotes from different vendors?',
    a: 'Fix the scope first: identical room temperature, kW, redundancy and included services. Require capacity quoted at your actual ambient conditions, split hardware/services/consumables into line items, include multi-year service, and add the room-side costs (AC spare capacity, electrical work) that each option implies. Quotes that don\u2019t state ambient assumptions are not comparable.'
  }
]
useFaq(faqs)
</script>
