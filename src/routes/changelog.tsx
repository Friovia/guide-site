import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '~/lib/seo'
import { PageToc } from '~/components/PageToc'

export const Route = createFileRoute('/changelog')({
  head: () => ({
    ...seoHead({
      title: 'Changelog',
      description: 'What changed and when on the Liquid Cooling Guide — data layer versions, article updates, standards tracking.',
      path: '/changelog',
    }),
  }),
  component: ChangelogPage,
})

function ChangelogPage() {
  return (
    <main className="container" style={{ padding: '40px 20px' }}>
      <h1>Changelog</h1>
      <p className="updated">Freshness log — data and articles are revised as products and standards change.</p>

      <PageToc />

      <h2 style={{ marginTop: 24 }}>2026-11-23</h2>
      <ul>
        <li><b>Vendor profiles, batch 3 (+11 → 33 of 98)</b>: NVIDIA, Dell, HPE, Supermicro, Lenovo (chips + liquid-cooled servers), Schneider Electric, STULZ (integrators), Dow, Dynalene (fluids), Grundfos, Danfoss (components) — every previously uncovered major segment now has profile pages. Same sourced-facts policy throughout.</li>
        <li><b>Fact corrections from the batch research</b>: the STULZ×CoolIT liquid-cooled micro DC launched <b>2017</b> (PRWeb original, June 19), not 2018 — fixed in the radar timeline, the 2026 digest and llms.txt. Directory notes sharpened: Dow's unsourced market-share wording replaced with the OCP-guideline fact; Danfoss's note now names its actual portfolio (brazed plate HXs, valve trains, controllers, Hansen couplings — <b>no pump product</b>, its drives regulate third-party pumps).</li>
        <li><b>Rubin power figures re-sourced to NVIDIA's own documents</b>: the rack builder listed the Vera Rubin NVL72 at 180–220 kW — an analyst estimate — behind a Supermicro link that carries no power figure at all, and the Rubin NVL8 node as a 22.9 kW TDP budget built on a per-GPU wattage that appears on none of NVIDIA's pages. Both now carry the vendor's numbers: NVL72 <b>MaxP 227 kW / MaxQ 187 kW / MaxLPS 156 kW</b> (NVIDIA Vera Rubin datasheet), NVL8 <b>~24 kW system power</b> (DGX Rubin NVL8). The 2026 digest, the NVIDIA profile and the official site's server table follow. Also dropped the word "first" from the shipping news: Supermicro's release claims shipping, not an industry first.</li>
        <li><b>Rack configurator (new, Playground)</b>: one kernel-driven chain — scenario → load → CDU &amp; pump operating point → thermal chain → downloadable calculation note. The open-source kernel chooses among the three CDUs its sourced curve library can model by evidence, the operating point is draggable along the system curve, and a run outside the kernel's evidenced data domain is reported as <i>not judgeable</i> — never as a verdict. Listed on the Playground page for the first time.</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>2026-11-18</h2>
      <ul>
        <li><b>Vendor profiles, batch 2 (+12 → 22 of 98)</b>: nVent, Rittal, ZutaCore, JetCool, Daikin, Envicool, Parker Hannifin, Submer, GRC, EVAPCO, Alfa Laval, Sugon DataEnergy. Same facts policy — highlights include two OCP-Accepted Google Deschutes CDUs (nVent, Envicool), China's first national liquid cooling standard with Sugon DataEnergy as chief drafting unit (GB/T 48023-2026), and the waterless two-phase Z2O architecture (ZutaCore × Munters).</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>2026-11-17</h2>
      <ul>
        <li><b>Vendor profile pages launch</b> (<code>/supply-chain/&lt;slug&gt;</code>): a new data layer (<code>data/vendor-profiles.json</code>) deepens the supply-chain map with per-company pages — company card, liquid-cooling product lines, key events, standards participation and FAQ, each with a 2-4 entry product table sourced to official pages. First batch: ten companies — CoolIT, Asetek, Boyd, Motivair, Vertiv, Delta, Stäubli, CPC, LiquidStack, BAC. Same facts policy as everywhere else: every claim carries a source URL; unverifiable fields render as <b>not published</b>, never estimated. <code>scripts/check-nav.mjs</code> now enforces conservation both ways — every profile must be in sitemap+llms.txt, and no /supply-chain/* URL may exist without a profile behind it.</li>
        <li><b>Data-layer corrections</b>: the supply-chain row count read "97 companies" in the sidebar, homepage and llms.txt while <code>vendors.json</code> holds 98 — fixed everywhere (the changelog entry that introduced the 98th row stands as history). The listing mailto template said "one of the 12 segments"; it now says the real number (16).</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>2026-10-12</h2>
      <ul>
        <li><b>Hardware picker: the GB300/Rubin generation</b> (researched, sourced): GB300 NVL72 rack (48U, vendor-stated up to ~140 kW, shipping since Q4 2025), HGX B300 node (TDP budget 12.4 kW, 1,200 W HGX GPUs), Rubin NVL8 node (TDP budget 22.9 kW ≈ NVIDIA/ODM-stated ~24 kW, liquid-only), Vera Rubin NVL72 rack (180-220 kW Max-P, 100% liquid / zero fans, capture = 1.0). Fixed a pre-existing bug: the GB200 entry's source link pointed at the GB300 page.</li>
        <li><b>News radar: the Rubin shipping quarter</b>: Supermicro ships first Vera Rubin NVL72 racks (9/23, up to 6,000 racks/month), CoreWeave delivers VR NVL72 at production scale (9/30, first customer Cognition), AMD launches MI400/Helios (7/23, full production, late-Q3 shipments), NVIDIA full-production ramp (5/31) and CES launch (1/5). Milestone timeline gains 2025 GB300 and 2026 Rubin entries.</li>
        <li><b>State of liquid cooling 2026 digest updated</b>: new "The Rubin generation is shipping" section (2.3 kW GPUs, 45 °C warm water, 100% liquid coverage, no air SKU) + a Rubin FAQ entry.</li>
      </ul>

      <h2 style={{ marginTop: 24 }}>2026-10-08</h2>
      <ul>
        <li>Site restructured around a global sidebar knowledge map — every page is now reachable from every page; client-side search in the sidebar (press <code>/</code>).</li>
        <li>New <b>Formulas</b> section, 11 pages with live calculators: coolant flow rate, heat capture split, TDP→rack kW, room AC load, kW↔tons, approach temperature, pressure drop, floor loading, PUE math, ASHRAE W-classes, wet-bulb &amp; free cooling.</li>
        <li>New <b>Radar</b>: <a href="/news">industry news</a> with the curated milestone timeline (facts policy applies to news too), the <a href="/newsfeed.xml">/newsfeed.xml</a> RSS output, and the <a href="/state-of-liquid-cooling-2026">State of liquid cooling 2026</a> digest.</li>
        <li>New <b>Deploy &amp; Ops</b> pages: <a href="/site-survey">site survey</a>, <a href="/commissioning">commissioning</a>, <a href="/maintenance-schedule">maintenance schedule</a>; plus the <a href="/rfq-scope-checklist">RFQ scope checklist</a> and the <a href="/uqd-quick-disconnects">UQD reference table</a>.</li>
        <li>Glossary expanded 20 → 50+ terms, every term anchorable (<code>/glossary#term</code>).</li>
        <li><b>Supply chain complete: 16 segments · 97 companies</b> + Wei-Zhu-style chain canvas (FIG.1): business flow →, cash flow ← (with financing lane), information flow ⇄, support layer (standards/simulation/certification). New segments: Materials &amp; precision manufacturing (upstream), Testing &amp; certification (UL/TÜV/SGS/CAICT), Buyers &amp; operators (AWS/Azure/GCP/Alibaba/Tencent/China Mobile/Equinix/DRT/GDS/VNET/Chindata — the demand side the chain exists for).</li>
        <li><b>Supply chain: solutions &amp; engineering segment</b> (the non-equipment layer): Sugon DataEnergy (phase-change immersion solutions, C8000 rack &gt;900 kW), AECOM, WSP, Jacobs (design/EPC), Cadence 6SigmaDCX + Siemens FloTHERM (simulation), Uptime Institute (certification) — 79 companies, 13 segments.</li>
        <li><b>Hardware picker: OEM + CN batch</b> (researched, sourced): Dell XE9680 (6U, ~10.2 kW, XE9680L liquid variant), Supermicro 821GE-TNHR, HPE Cray XD670 (5U, air or DLC), Lenovo SR685a V3, Huawei Atlas 900 full-liquid rack (50 kW/rack, &gt;95% liquid, PUE&lt;1.1); Envicool Coolinside cabinet CDU entered with rating <b>❌ unpublished</b> — the picker models honesty: no curve, no verdict, demand RFQ item 12.</li>
        <li><b>CDU database begins</b>: hardware picker gains CoolIT CHx80/CHx200/CHx2000 (4U in-rack 80-200 kW; 2 MW row unit rated for twelve GB200 racks) and the Motivair family (105 kW-2.5 MW, Schneider) — all sourced; note: a "CHx60" circulates in forum lore but does not exist.</li>
        <li><b>Homepage hero: derating curve</b> — the bare slider is replaced by a draggable point on an actual capacity-vs-room-temperature chart (axes, curve, rated-point annotation); the interaction now carries its own logic.</li>
        <li><b>Rack builder → product picker</b>: new <code>data/hardware.json</code> — real server platforms (GB200 NVL72 120 kW, HGX B200/H100, MI300X, TDP-budget watts) and real cooling products (Vertiv CoolChip CDU 70 with its derating anchor, STULZ Micro DC, Asetek L2L) — every selection links its source; L2L products model facility-water instead of room derating.</li>
        <li><b>i18n: focused 3-locale coverage (en + es + ar, RTL for العربية)</b>: language dropdown with native names + Help-translate link, per-locale landing pages, localized topbar/search/footer. Earlier: 17-locale coverage (vuejs.org-parity 14 + es/id/ar) — cut 2026-11-09 to focus effort; zh content pages retired with it.</li>
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
  )
}
