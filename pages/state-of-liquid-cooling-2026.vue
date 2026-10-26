<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Digest · 7 min read · Updated 2026-10-12</p>
    <h1>State of liquid cooling, 2026</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>TL;DR</h3>
        <p>
          Above ~30 kW, liquid is no longer a choice — it is the physics. The Rubin generation —
          2.3 kW-class GPUs in 100%-liquid racks fed with 45 °C warm water — started shipping in
          September 2026. Fluorinated fluids are gone
          (3M exited PFAS manufacturing at end-2025), leaving PG25 water-glycol as the default.
          Standards matured (OCP ORv3, SS 726:2026 for the tropics). What still does not exist:
          a turnkey, facility-free liquid cabinet in the 20-50 kW class — the gap this site tracks.
        </p>
      </div>
    </div>

    <h2>The power cliff became a plateau</h2>
    <p style="max-width:680px">
      When accelerators crossed 700 W and rack-scale systems crossed 100 kW
      (<NuxtLink to="/news">GB200-class racks</NuxtLink>), direct-to-chip moved from exotic to
      default in two years. The budgeting math is now routine:
      <NuxtLink to="/tdp-to-rack-kw">TDP sums × 1.2</NuxtLink> for power,
      <NuxtLink to="/heat-capture-split">60-80% capture</NuxtLink> for the liquid share,
      <NuxtLink to="/room-ac-load">1.1×</NuxtLink> for the room. What used to be a research topic
      is a checklist — this site's Formulas section is that checklist.
    </p>

    <h2>The Rubin generation is shipping</h2>
    <p style="max-width:680px">
      What was a roadmap item at the start of 2026 is now delivery news: NVIDIA launched Rubin at
      CES in January (in production on day one), announced the full-production ramp in May, and the
      first <a href="https://ir.supermicro.com/news/news-details/2026/default.aspx">Vera Rubin NVL72
      racks shipped September 23</a> (Supermicro — up to 6,000 racks/month at full production), with
      <a href="https://www.coreweave.com">CoreWeave running production workloads on them from
      September 30</a>. Engineering meaning: 2.3 kW-class GPUs (Max-P), 180-220 kW racks,
      45 °C warm-water cooling made official, and 100% liquid coverage with zero fans — the first
      platform generation with no air-cooled SKU at all. AMD's Helios racks (MI455X) entered full
      production the same quarter, so the physics now applies across both ecosystems. The
      <NuxtLink to="/playground/rack-builder">rack builder</NuxtLink> carries GB300 and Rubin rows
      with per-selection sources.
    </p>

    <h2>Fluids after PFAS</h2>
    <p style="max-width:680px">
      3M's exit from PFAS manufacturing (announced 2022, completed end-2025) removed the dominant
      fluorinated fluid supplier from the market. For direct-to-chip the answer was already sitting
      there: <NuxtLink to="/liquid-cooling-fluids">PG25</NuxtLink> — cheap, non-flammable,
      unregulated as a chemical class. Immersion's fluid story got harder, which is one reason
      direct-to-chip consolidated its lead
      (<NuxtLink to="/cold-plate-vs-immersion">architecture comparison</NuxtLink>).
    </p>

    <h2>Standards consolidated</h2>
    <p style="max-width:680px">
      The interoperability layer is essentially settled: OCP's <NuxtLink to="/uqd-quick-disconnects">UQD</NuxtLink>
      couplings and ORv3 blind-mate manifolds define how parts fit; ASHRAE's
      <NuxtLink to="/ashrae-w-classes">W-classes</NuxtLink> define how warm facility water may be;
      IEC 62368-1 Ed.4 carries the electrical-safety clauses. The 2026 addition is Singapore's
      SS 726 — the first national standard to take
      <NuxtLink to="/liquid-cooling-hot-climates">tropical operation</NuxtLink> seriously.
      Practical effect: the <NuxtLink to="/rfq-scope-checklist">RFQ checklist</NuxtLink> now has
      named standards to demand on every line.
    </p>

    <h2>The tropics stopped being an edge case</h2>
    <p style="max-width:680px">
      Most of the world's next data center capacity is being built in warm climates, where the
      physics is least forgiving: <NuxtLink to="/approach-temperature">capacity halves at 35 °C ambient</NuxtLink>,
      and <NuxtLink to="/wet-bulb-free-cooling">wet-bulbs near 30 °C</NuxtLink> kill free cooling
      outright. Buyers in these markets should size against derated capacity, never nameplate —
      the single most common procurement mistake this site exists to prevent.
    </p>

    <h2>What still doesn't exist</h2>
    <p style="max-width:680px">
      Verified in our <NuxtLink to="/cabinet-comparison">comparison data</NuxtLink>: major-vendor
      micro data centers stop at ~10 kW on air, and their liquid products start at 40-70 kW as
      components for AI halls. A turnkey, facility-free liquid cabinet for 20-50 kW — the
      hospital-edge, factory-edge, campus-edge case — remains essentially uncovered since the
      2018 STULZ×CoolIT attempt. Whoever fills it defines the category.
    </p>

    <h2>Related</h2>
    <p>
      <NuxtLink to="/news">Industry radar &amp; milestones</NuxtLink> ·
      <NuxtLink to="/changelog">Changelog</NuxtLink> ·
      <NuxtLink to="/cabinet-comparison">Cabinet comparison</NuxtLink>
    </p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'State of liquid cooling 2026 — annual digest',
  description: 'Liquid cooling in 2026: direct-to-chip is default above 30 kW; PG25 water-glycol wins the fluid question after 3M\u2019s PFAS exit; OCP/ASHRAE/SS 726 standards consolidate; the tropics become the main event; and the 20-50 kW turnkey cabinet gap persists.'
})
useArticle({
  path: '/state-of-liquid-cooling-2026',
  title: 'State of liquid cooling, 2026',
  description: 'The annual digest: what changed and what still does not exist.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-12'
})

useFaq([
  {
    q: 'Is liquid cooling mainstream in 2026?',
    a: 'Above roughly 30 kW per rack, yes — direct-to-chip is the default once accelerators pass 700 W and rack-scale systems pass 100 kW. Below 30 kW, sealed air-cooled micro data centers remain viable, and the turnkey liquid cabinet for the 20-50 kW middle ground is still an open market gap.'
  },
  {
    q: 'Has the Rubin generation started shipping?',
    a: 'Yes. NVIDIA launched Rubin at CES 2026 (January), ramped it into full production in May, and the first Vera Rubin NVL72 racks shipped September 23 (Supermicro), with CoreWeave running production workloads from September 30. The generation is defined by 2.3 kW-class GPUs, 180-220 kW racks, official 45 °C warm-water cooling and 100% liquid coverage — there is no air-cooled SKU.'
  },
  {
    q: 'What replaced 3M fluorinated cooling fluids?',
    a: 'For direct-to-chip, PG25 water-glycol — already the default — consolidated its position after 3M exited PFAS manufacturing at the end of 2025: it is cheap, non-flammable and outside PFAS regulation. Immersion cooling shifted toward engineered oils and remaining-chemistry suppliers, with fluid sourcing now a formal procurement risk item.'
  }
])
</script>
