import { createFileRoute } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'
import { PageToc } from '~/components/PageToc'

const faqs = [
  {
    q: 'Is liquid-to-air really liquid cooling if it dumps heat into the room?',
    a: 'Yes — the liquid loop does the hard part: pulling 20–50 kW out of a single rack footprint quietly and densely. What L2A does not do is leave the building; the room AC remains the final heat rejecter. That is precisely why the room rule exists: room extraction ≥ 1.1 × IT load.',
  },
  {
    q: 'Can I start with L2A and move to L2L later?',
    a: 'Yes, if the cabinet keeps open interfaces. Servers blind-mate through UQD couplings to the manifold, so the servers, cold plates and loop survive the change; what changes is the heat-rejection end (adding a liquid-to-liquid CDU and facility water). Ask any vendor what survives the swap — that is the lock-in question.',
  },
  {
    q: 'Which is more efficient, L2A or L2L?',
    a: 'At the rack, both are efficient — direct-to-chip liquid beats air regardless. End-to-end, L2L with warm facility water and dry coolers can reach the best efficiency (chiller-less operation, even heat reuse), but only if the building already has the water infrastructure. L2A reuses the room AC you already own, which is the lower-total-cost answer for rooms without facility water.',
  },
  {
    q: 'What fails in each architecture?',
    a: 'L2A: room AC failure stops heat rejection — the loop warms until interlocks trip; monitor room temperature as a first-class signal. L2L: facility water quality, pumps and the CDU heat exchanger are the critical items; a facility loop failure takes every connected rack at once. Both need leak detection and intervention — the OCP white paper treats it as best practice, not an option.',
  },
]

export const Route = createFileRoute('/liquid-to-air-vs-liquid-to-liquid')({
  ...pageRoute({
    path: '/liquid-to-air-vs-liquid-to-liquid',
    title: 'Liquid-to-air vs liquid-to-liquid (L2A vs L2L) — the CDU form factor axis',
    description: 'L2A rejects rack heat into room air through a sealed loop — no facility water. L2L hands the heat to facility water and scales to megawatts. The comparison table, the room rule (1.1 × IT), derating behavior, and which one a 20–50 kW micro data center needs.',
    article: { title: 'L2A vs L2L — the CDU form factor axis', description: 'The two direct-to-chip heat rejection architectures compared.', datePublished: '2026-11-17', dateModified: '2026-11-17' },
    faq: faqs,
    component: L2aVsL2lPage,
  }),
})

function L2aVsL2lPage() {
  return (
    <main className="container" style={{ padding: '40px 20px' }}>
      <p className="updated">Term guide · 4 min read</p>
      <h1>Liquid-to-air vs liquid-to-liquid — L2A and L2L explained</h1>

      <p style={{ maxWidth: '680px' }}>
        <b>L2A (liquid-to-air)</b> and <b>L2L (liquid-to-liquid)</b> are the two heat-rejection
        architectures of direct-to-chip cooling — the form factor axis of every CDU. Both pump
        coolant over cold plates inside the servers. <b>The difference is only the last step:</b> an
        L2A CDU rejects the heat into <b>room air</b> through an internal liquid-to-air heat
        exchanger; an L2L CDU hands it to <b>facility water</b> through a liquid-to-liquid heat
        exchanger, and the building moves it outdoors.
      </p>
      <p style={{ maxWidth: '680px' }}>
        That single difference decides who does the final cooling (your room AC vs your facility
        water system), what the deployment costs, and how far the architecture scales.
      </p>

      <PageToc />

      <h2>The comparison table</h2>
      <figure className="fig" style={{ marginInline: '0' }}>
        <table style={{ maxWidth: '760px' }}>
          <tbody>
            <tr><th>&nbsp;</th><th>L2A (liquid-to-air)</th><th>L2L (liquid-to-liquid)</th></tr>
            <tr><td><b>Heat goes to</b></td><td>Room air, via internal exchanger + fans</td><td>Facility water loop (then dry coolers / heat reuse)</td></tr>
            <tr><td><b>Facility water needed</b></td><td><b>None</b> — sealed, self-contained</td><td>Required: supply/return pipes at the CDU</td></tr>
            <tr><td><b>Room AC requirement</b></td><td>Room must extract ≥ <b>1.1 × IT load</b></td><td>Only the residual (typically minor)</td></tr>
            <tr><td><b>Typical per-cabinet sweet spot</b></td><td>20–50 kW (single cabinets, micro DCs)</td><td>70 kW–MW+ (rows, halls)</td></tr>
            <tr><td><b>Derating behavior</b></td><td>Strong function of <b>room air</b> temperature — capacity ≈ halves from 25 °C to 35 °C</td><td>Function of <b>facility water</b> temperature — see ASHRAE W-classes</td></tr>
            <tr><td><b>Installation</b></td><td>Roll in, power, network — no plumbing</td><td>Plumbing project: water quality, flow, isolation, permits</td></tr>
            <tr><td><b>Failure surface</b></td><td>Room AC is the single point of heat rejection</td><td>Facility loop serves many racks at once</td></tr>
            <tr><td><b>Heat reuse possible?</b></td><td>No (heat ends as warm room air)</td><td>Yes — warm-water loops can feed heating or reuse</td></tr>
          </tbody>
        </table>
        <figcaption>One axis, two endings. The rack-side physics (cold plates, UQD, manifolds, PG25) is shared.</figcaption>
      </figure>

      <h2>The two rules of thumb</h2>
      <ul style={{ maxWidth: '680px' }}>
        <li><b>L2A obeys the room rule:</b> whatever the loop takes off the chips, it puts into the
        room. Size room extraction at <b>1.1 × IT load</b> — the extra 10% covers pump and fan heat.
        A 30 kW cluster means the room AC carries ≈ 33 kW.</li>
        <li><b>L2L obeys the water rule:</b> capacity depends on facility water temperature and
        flow. ASHRAE W-classes (W17 → W45) classify supply temperature; warmer water buys
        chiller-less operation at the price of approach margin. Every °C of supply temperature
        comes back through <a href="/approach-temperature">approach temperature</a> as capacity.</li>
      </ul>

      <h2>Which one does a micro data center need?</h2>
      <p style={{ maxWidth: '680px' }}>
        A single 20–50 kW cabinet in a hospital technical room, a department lab or an edge site has
        no facility water — and should not build any. <b>L2A is the architecture of rooms that were
        never meant to be data centers;</b> L2L is the architecture of buildings that already are.
        The scaling break is real: air-based micro enclosures cluster around 6–10 kW per rack, and
        facility-water liquid starts where rows of racks justify the plumbing. The 20–50 kW band is
        exactly the gap L2A cabinets exist to fill.
      </p>

      <h2>Related pages</h2>
      <ul style={{ maxWidth: '680px' }}>
        <li><a href="/what-is-a-cdu">What is a CDU?</a> — the device where this choice physically lives</li>
        <li><a href="/room-ac-load">Room AC load — the 1.1× rule</a> — sizing the L2A room side</li>
        <li><a href="/ashrae-w-classes">ASHRAE W-classes</a> — the L2L facility-water ladder</li>
        <li><a href="/approach-temperature">Approach temperature</a> — the capacity physics both obey</li>
      </ul>

      <h2>Sources</h2>
      <ul style={{ maxWidth: '680px' }}>
        <li>OCP Advanced Cooling Solutions, <i>Leak Detection and Intervention</i> white paper (2021) — covers both coolant architectures, leak practice — vertiv.com (hosted PDF)</li>
        <li>CoolIT systems documentation — self-contained liquid-to-air CDUs "reject heat directly to room air" where facility water is unavailable — coolitsystems.com</li>
        <li>ASHRAE TC 9.9 thermal guidelines, 5th ed. reference card — allowable envelopes and W-class definitions — ashrae.org</li>
      </ul>

      <h2>Frequently asked questions</h2>
      {faqs.map(f => (
        <div key={f.q} style={{ marginBottom: '18px' }}>
          <h3 style={{ marginBottom: '4px', fontSize: '17px' }}>{f.q}</h3>
          <p style={{ margin: '0' }}>{f.a}</p>
        </div>
      ))}
    </main>
  )
}
