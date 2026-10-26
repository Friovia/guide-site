<template>
  <main class="container" style="padding:40px 20px">
    <h1>Changelog</h1>
    <p class="updated">Freshness log — data and articles are revised as products and standards change.</p>

    <h2 style="margin-top:24px">2026-10-12</h2>
    <ul>
      <li><b>Hardware picker: the GB300/Rubin generation</b> (researched, sourced): GB300 NVL72 rack (48U, vendor-stated up to ~140 kW, shipping since Q4 2025), HGX B300 node (TDP budget 12.4 kW, 1,200 W HGX GPUs), Rubin NVL8 node (TDP budget 22.9 kW ≈ NVIDIA/ODM-stated ~24 kW, liquid-only), Vera Rubin NVL72 rack (180-220 kW Max-P, 100% liquid / zero fans, capture = 1.0). Fixed a pre-existing bug: the GB200 entry's source link pointed at the GB300 page.</li>
      <li><b>News radar: the Rubin shipping quarter</b>: Supermicro ships first Vera Rubin NVL72 racks (9/23, up to 6,000 racks/month), CoreWeave delivers VR NVL72 at production scale (9/30, first customer Cognition), AMD launches MI400/Helios (7/23, full production, late-Q3 shipments), NVIDIA full-production ramp (5/31) and CES launch (1/5). Milestone timeline gains 2025 GB300 and 2026 Rubin entries.</li>
      <li><b>State of liquid cooling 2026 digest updated</b>: new "The Rubin generation is shipping" section (2.3 kW GPUs, 45 °C warm water, 100% liquid coverage, no air SKU) + a Rubin FAQ entry.</li>
    </ul>

    <h2 style="margin-top:24px">2026-10-08</h2>
    <ul>
      <li>Site restructured around a global sidebar knowledge map — every page is now reachable from every page; client-side search in the sidebar (press <code>/</code>).</li>
      <li>New <b>Formulas</b> section, 11 pages with live calculators: coolant flow rate, heat capture split, TDP→rack kW, room AC load, kW↔tons, approach temperature, pressure drop, floor loading, PUE math, ASHRAE W-classes, wet-bulb &amp; free cooling.</li>
      <li>New <b>Radar</b>: <a href="/news">industry news</a> with the curated milestone timeline (facts policy applies to news too), the <a href="/newsfeed.xml">/newsfeed.xml</a> RSS output, and the <a href="/state-of-liquid-cooling-2026">State of liquid cooling 2026</a> digest.</li>
      <li>New <b>Deploy &amp; Ops</b> pages: <a href="/site-survey">site survey</a>, <a href="/commissioning">commissioning</a>, <a href="/maintenance-schedule">maintenance schedule</a>; plus the <a href="/rfq-scope-checklist">RFQ scope checklist</a> and the <a href="/uqd-quick-disconnects">UQD reference table</a>.</li>
      <li>Glossary expanded 20 → 50+ terms, every term anchorable (<code>/glossary#term</code>).</li>
      <li><b>Supply chain complete: 16 segments · 97 companies</b> + Wei-Zhu-style chain canvas (FIG.1): business flow →, cash flow ← (with financing lane), information flow ⇄, support layer (standards/simulation/certification). New segments: Materials & precision manufacturing (upstream), Testing & certification (UL/TÜV/SGS/CAICT), Buyers & operators (AWS/Azure/GCP/阿里云/腾讯云/移动/Equinix/DRT/GDS/VNET/秦淮 — the demand side the chain exists for).</li>
      <li><b>Supply chain: solutions & engineering segment</b> (the non-equipment layer): 曙光数创 (Sugon DataEnergy, phase-change immersion solutions, C8000 rack >900 kW), AECOM, WSP, Jacobs (design/EPC), Cadence 6SigmaDCX + Siemens FloTHERM (simulation), Uptime Institute (certification) — 79 companies, 13 segments.</li>
      <li><b>Hardware picker: OEM + CN batch</b> (researched, sourced): Dell XE9680 (6U, ~10.2 kW, XE9680L liquid variant), Supermicro 821GE-TNHR, HPE Cray XD670 (5U, air or DLC), Lenovo SR685a V3, Huawei Atlas 900 full-liquid rack (50 kW/rack, >95% liquid, PUE<1.1); Envicool Coolinside cabinet CDU entered with rating <b>❌ unpublished</b> — the picker models honesty: no curve, no verdict, demand RFQ item 12.</li>
      <li><b>CDU database begins</b>: hardware picker gains CoolIT CHx80/CHx200/CHx2000 (4U in-rack 80-200 kW; 2 MW row unit rated for twelve GB200 racks) and the Motivair family (105 kW-2.5 MW, Schneider) — all sourced; note: a "CHx60" circulates in forum lore but does not exist.</li>
      <li><b>Homepage hero: derating curve</b> — the bare slider is replaced by a draggable point on an actual capacity-vs-room-temperature chart (axes, curve, rated-point annotation); the interaction now carries its own logic.</li>
      <li><b>Rack builder → product picker</b>: new <code>data/hardware.json</code> — real server platforms (GB200 NVL72 120 kW, HGX B200/H100, MI300X, TDP-budget watts) and real cooling products (Vertiv CoolChip CDU 70 with its derating anchor, STULZ Micro DC, Asetek L2L) — every selection links its source; L2L products model facility-water instead of room derating.</li>
      <li><b>i18n: 17 locales</b> (vuejs.org-parity 14 + es/id/ar): vue-style language dropdown with native names + Help-translate link, per-locale landing pages (RTL for العربية/فارسی), localized topbar/search/footer; zh keeps 4 content pages + bilingual sidebar. Earlier:  vue-style topbar (logo · nav · search · 🌐 language · version), topbar live search over the knowledge map, and a fully translated Chinese landing at <a href="/zh">/zh</a> — content pages follow page-by-page; the language toggle only ever offers what actually exists.</li>
      <li><b>Visual pass</b>: 10 AI-generated illustrations (Z-Image Turbo, in-house pipeline, <code>scripts/gen-figures.mjs</code>) embedded as labeled PLATE figures across 9 pages + the homepage hero; captions mark them as representative AI illustrations, never product photos. New <b>LoopSim</b> animated coolant-loop simulator on the what-is page. Supply chain grows to 72 companies incl. Envicool, Huawei, Goaland.</li>
      <li>New <b>Supply chain map</b> (<a href="/supply-chain">/supply-chain</a>): 72 companies across 12 segments — chips, cold plates, CDUs, interconnects, servers, immersion, fluids, heat rejection, components, integrators, micro-DC, standards — every row sourced to the official site (<code>data/vendors.json</code>). Free editorially-reviewed listings via <code>vendors@liquidcoolingguide.com</code> (no paid placement).</li>
      <li>News radar: page + curated timeline live; automated RSS pipeline ships with the repo and activates on deployment (GitHub Actions cron) — marked "under construction" until hosted.</li>
      <li>Infrastructure: <code>data/meta.json</code> single source for freshness; homepage data status bar; sitemap <code>lastmod</code>; <code>scripts/check-nav.mjs</code> guards nav/sitemap/llms.txt sync at build; <code>scripts/fetch-news.mjs</code> + GitHub Actions daily cron for unattended news; fixed canonical URLs on 16 pages.</li>
    </ul>

    <h2>2026-09-09</h2>
    <ul>
      <li>Site launch: 12 guides + glossary + this changelog.</li>
      <li>Data layer v2026-09-09: cabinet comparison covering Schneider, Vertiv (×2), STULZ×CoolIT, Rittal, Asetek, nVent with per-row sources.</li>
      <li>Published derating figures from Vertiv XDU070 application guide (SL-71111) in <a href="/liquid-cooling-hot-climates">hot climates guide</a>.</li>
      <li>Standards snapshot: OCP ORv3 manifold Rev 1.0 (2024-04), IEC 62368-1 Ed.4, SS 726:2026 (2026-08).</li>
    </ul>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Changelog',
  description: 'What changed and when on the Liquid Cooling Guide — data layer versions, article updates, standards tracking.',
  path: '/changelog'
})
</script>
