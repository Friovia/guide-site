import { createFileRoute } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'

const faqs = [
  {
    q: 'Why do liquid cooling quotes vary so much?',
    a: 'Because the scope underneath the number varies: rated capacity quoted at different ambient temperatures, redundant pumps in one quote and single in another, monitoring included or not, commissioning and certification in or out. Pin twelve line items — capacity at your conditions, capture ratio, redundancy, interconnects, monitoring, acceptance testing, service — and the price gap becomes explainable or disqualifying.',
  },
  {
    q: 'What is the most important question in a liquid cooling RFQ?',
    a: 'Capacity at your actual room design temperature, in writing. Nameplate figures are quoted at 25 °C air / 45 °C coolant; at 35 °C ambient an L2A cabinet delivers roughly half. Vendors who cannot provide a capacity-vs-ambient curve for their own product are answering a different question.',
  },
]

export const Route = createFileRoute('/rfq-scope-checklist')({
  ...pageRoute({
    path: '/rfq-scope-checklist',
    title: 'Liquid cooling RFQ scope checklist — 12 line items',
    description: 'RFQ checklist that makes liquid cooling quotes comparable: capacity at your ambient, heat capture %, facility interfaces, redundancy, UQD/ORv3 interconnects, fluid warranty terms, monitoring scope, leak response, certifications, commissioning acceptance, service SLA, and written derating curves.',
    article: { title: 'RFQ scope checklist', description: 'Twelve line items that make quotes comparable.', datePublished: '2026-10-08', dateModified: '2026-10-08' },
    faq: faqs,
    component: RfqPage,
  }),
})

function RfqPage() {
  return (
    <main className="container" style="padding:40px 20px">
      <p className="updated">Choosing · 2 min read</p>
      <h1>RFQ scope checklist</h1>

      <p style="max-width:680px">
        Nobody in this segment publishes prices — so quotes are only comparable if the <b>scope is
        pinned</b>. Send this checklist with every RFQ and require answers in writing;
        it converts "quote for a liquid cabinet" into twelve defined line items
        (<a href="/liquid-cooling-cost">why prices hide</a>).
      </p>

      <figure className="fig" style="margin-inline:0">
        <table style="max-width:780px">
          <tbody>
            <tr><th>#</th><th>Line item</th><th>The question that pins it</th></tr>
            <tr><td>1</td><td><b>Capacity @ conditions</b></td><td>kW rejected at <em>your</em> room design temp and stated coolant temp — nameplate at 25 °C does not count (<a href="/approach-temperature">derating</a>)</td></tr>
            <tr><td>2</td><td><b>Heat capture</b></td><td>What % of IT heat goes to liquid in this configuration; what stays on air (<a href="/heat-capture-split">split</a>)</td></tr>
            <tr><td>3</td><td><b>Facility interfaces</b></td><td>Power feeds (kW, redundancy), floor load print (kN/m²), water/none, room AC requirement (<a href="/room-ac-load">1.1×</a>, <a href="/floor-loading">floor</a>)</td></tr>
            <tr><td>4</td><td><b>Redundancy</b></td><td>Pumps N+1? Fans? Controls? What fails how gracefully — and what does the cabinet do on facility power loss</td></tr>
            <tr><td>5</td><td><b>Interconnects</b></td><td>UQD and manifold spec/version — ORv3 blind-mate or proprietary (<a href="/uqd-quick-disconnects">UQD</a>, <a href="/liquid-ready-servers">lock-in defense</a>)</td></tr>
            <tr><td>6</td><td><b>Fluid &amp; warranty terms</b></td><td>Shipped fluid spec (PG25?), who owns chemistry compliance, what voids the warranty (<a href="/liquid-cooling-fluids">fluids</a>)</td></tr>
            <tr><td>7</td><td><b>Monitoring scope</b></td><td>Sensors included (flow, ΔP, leak, level, temperature), protocols/BMS integration, alarm routing (<a href="/liquid-cooling-leaks">leak layers</a>)</td></tr>
            <tr><td>8</td><td><b>Leak containment &amp; response</b></td><td>Dripless couplings, drain/containment capacity, interlock actions on leak detect</td></tr>
            <tr><td>9</td><td><b>Certifications</b></td><td>CE/UL/IEC 62368-1 Ed.4 and <em>your market's</em> local listing — per-region confirmation in writing (<a href="/liquid-cooling-standards">standards</a>)</td></tr>
            <tr><td>10</td><td><b>Commissioning &amp; acceptance</b></td><td>Vendor runs the 8-step commissioning; acceptance = measured flow/ΔT/capacity at your conditions (<a href="/commissioning">sequence</a>)</td></tr>
            <tr><td>11</td><td><b>Service model</b></td><td>Response SLA, spares on site, maintenance contract scope vs <a href="/maintenance-schedule">schedule</a>, training for your staff</td></tr>
            <tr><td>12</td><td><b>Derating documentation</b></td><td>Capacity-vs-ambient curve or table in writing — the vendors who can't provide it are telling you something (<a href="/approach-temperature">why</a>)</td></tr>
          </tbody>
        </table>
        <figcaption><b>FIG. 1</b> — Twelve lines that make two quotes comparable. Items 1, 4 and 12 are where most "mysterious" price gaps live.</figcaption>
      </figure>

      <h2>How to run it</h2>
      <ul>
        <li>Send the table as a mandatory annex; "see datasheet" is not an answer to item 1 or 12.</li>
        <li>Score vendors on the <a href="/cabinet-comparison">comparison table</a> after answers arrive — gaps become visible, e.g. the 20-50 kW turnkey void.</li>
        <li>Walk the site with the <a href="/site-survey">survey checklist</a> before the RFQ so items in line 3 are your numbers, not the vendor's assumptions.</li>
      </ul>

      <h2>Related</h2>
      <p>
        <a href="/liquid-cooling-cost">What drives the cost</a> ·
        <a href="/cabinet-comparison">Cabinet comparison</a> ·
        <a href="/liquid-cooling-standards">Standards</a>
      </p>

      <h2>Sources</h2>
      <p className="src">Checklist compiled from this site's engineering pages; each line links the page that explains the underlying physics or standard.</p>
    </main>
  )
}
