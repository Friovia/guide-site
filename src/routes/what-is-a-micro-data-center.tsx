import { createFileRoute } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'
import { PageToc } from '~/components/PageToc'

const faqs = [
  {
    q: 'What counts as a micro data center?',
    a: 'A self-contained IT enclosure — rack, cooling, power protection, monitoring and often physical security bundled as one unit — deployed where a proper machine room does not exist. Working definitions put "micro" at single-enclosure scale (a few kW to ~50 kW per enclosure); "edge data center" usually means a small dedicated building or container beyond that (tens to a few hundred kW).',
  },
  {
    q: 'How is a micro data center different from a server closet?',
    a: 'Engineering intent. A closet is racks in a room that was never designed for them — cooling is whatever the building AC does, monitoring is optional, and failure is discovered by someone walking past. A micro data center treats the enclosure as the data center: sized heat rejection, UPS, environmental sensing with alarms, access control. The Uptime Institute counts both in its surveys — ~10% of enterprise IT lives in closets and IT rooms, ~4% in micro/edge data centers (2025).',
  },
  {
    q: 'Do micro data centers need on-site staff?',
    a: 'No — lights-out operation is the norm at serious scale. Vapor IO runs "autonomous, lights-out facilities" controlled entirely over telemetry. The honest requirement is remote-first monitoring (environmental + device telemetry, threshold alarms to a NOC) and interlocks that fail safe unattended: thermal, and leak detection where liquid cooling is involved.',
  },
  {
    q: 'How much compute fits in a micro data center?',
    a: 'Air-cooled micro enclosures top out around 6–10 kW per rack (48 kW pods aggregate several racks); above that, physics moves you to direct-to-chip liquid. A single liquid-cooled cabinet carries 20–50 kW of IT — the density band where GPU inference clusters live.',
  },
  {
    q: 'Are micro data centers and edge data centers the same thing?',
    a: 'Related, not identical. "Edge" describes location and purpose (compute placed near users or machines for latency); "micro" describes the enclosure class. A micro data center is one common edge form factor — so are containerized pods and telco MEC shelters.',
  },
]

export const Route = createFileRoute('/what-is-a-micro-data-center')({
  ...pageRoute({
    path: '/what-is-a-micro-data-center',
    title: 'What is a micro data center?',
    description: 'A micro data center is a self-contained enclosure — rack, cooling, power, monitoring, security — deployed where no machine room exists. The definition, the size spectrum from server closet to edge pod, the 20–50 kW density gap, and what "unattended" really requires.',
    article: { title: 'What is a micro data center?', description: 'Definition, size spectrum and the 20–50 kW gap.', datePublished: '2026-11-17', dateModified: '2026-11-17' },
    faq: faqs,
    component: MicroDcPage,
  }),
})

function MicroDcPage() {
  return (
    <main className="container" style={{ padding: '40px 20px' }}>
      <p className="updated">Concept guide · 4 min read</p>
      <h1>What is a micro data center?</h1>

      <p style={{ maxWidth: '680px' }}>
        A <b>micro data center</b> is a self-contained IT enclosure: rack space, heat rejection,
        power protection, monitoring — and often locking doors — engineered as <b>one unit</b> and
        deployed where a proper machine room does not exist. Offices, hospital technical rooms,
        university labs, branch sites, factory floors. The enclosure <i>is</i> the data center.
      </p>
      <p style={{ maxWidth: '680px' }}>
        The category exists because compute keeps arriving in rooms that were never designed for
        it: Uptime Institute's 2025 survey puts roughly <b>14% of enterprise IT</b> outside
        traditional data centers — ~4% in micro/edge sites and ~10% in server closets and IT rooms.
      </p>

      <PageToc />

      <h2>The size spectrum</h2>
      <figure className="fig" style={{ marginInline: '0' }}>
        <table style={{ maxWidth: '760px' }}>
          <tbody>
            <tr><th>Class</th><th>Scale</th><th>What it looks like</th><th>Named examples (sourced)</th></tr>
            <tr><td><b>Server closet / IT room</b></td><td>1–10 kW</td><td>Racks in a repurposed room; building AC does the cooling</td><td>What ~10% of enterprise IT runs on (Uptime 2025)</td></tr>
            <tr><td><b>Micro data center</b></td><td>1–50 kW per enclosure</td><td>Sealed enclosure with integrated cooling, UPS, monitoring</td><td>Schneider/Vertiv micro enclosures; sealed liquid cabinets at 20–50 kW</td></tr>
            <tr><td><b>Edge pod / container</b></td><td>48–150+ kW</td><td>Containerized multi-rack modules at tower/aggregation sites</td><td>EdgeMicro 48 kW pods; Vapor IO VEM-150 (150 kW, lights-out)</td></tr>
            <tr><td><b>Modular DC building</b></td><td>100 kW–MW</td><td>Purpose-built modular buildings on campus or national-lab sites</td><td>HPE POD hosting Bristol's Isambard-AI (~5 MW, DLC)</td></tr>
          </tbody>
        </table>
        <figcaption>Not official standards — working classes anchored to named, sourced deployments.</figcaption>
      </figure>

      <h2>The density gap nobody packaged</h2>
      <p style={{ maxWidth: '680px' }}>
        Air-cooled micro enclosures cluster at <b>6–10 kW per rack</b> — beyond that, server fans
        and room AC stop cooperating. Facility-water liquid cooling starts where rows of racks
        justify the plumbing (~70 kW+ as components, not cabinets). Between them sits the
        <b> 20–50 kW band</b>: exactly what a GPU inference cluster occupies. Sealed liquid-to-air
        cabinets exist to fill that band — <a href="/liquid-to-air-vs-liquid-to-liquid">L2A
        architecture</a>, no facility water.
      </p>

      <h2>What "unattended" actually requires</h2>
      <ul style={{ maxWidth: '680px' }}>
        <li><b>Heat rejection sized and honest:</b> the room must extract what the enclosure emits (≥ 1.1 × IT for L2A), with derating respected above 30–35 °C room air.</li>
        <li><b>Monitoring as the staff:</b> environmental sensing (temperature, humidity, leak) with threshold alerts plus device telemetry — the pattern lights-out operators already run.</li>
        <li><b>Fail-safe interlocks:</b> thermal de-energization; for liquid loops, the OCP leak-detection ladder — alarm, de-energize, fluid shutoff.</li>
        <li><b>Physical security:</b> locked enclosure, access logging — the door is the data center's perimeter.</li>
      </ul>

      <h2>Related pages</h2>
      <ul style={{ maxWidth: '680px' }}>
        <li><a href="/liquid-to-air-vs-liquid-to-liquid">L2A vs L2L</a> — the architecture decision inside a micro DC</li>
        <li><a href="/room-load-calculation">Room load calculation</a> — sizing the room side</li>
        <li><a href="/liquid-cooling-leaks">Leak management</a> — what unattended liquid loops need</li>
        <li><a href="/cabinet-comparison">Small-scale cabinet comparison</a> — the sourced product landscape</li>
      </ul>

      <h2>Sources</h2>
      <ul style={{ maxWidth: '680px' }}>
        <li>Uptime Institute, <i>Global Data Center Survey 2025</i> — workload distribution (micro/edge ~4%, closet/IT room ~10%); AI analytics trust — uptimeinstitute.com</li>
        <li>Vapor IO Kinetic Grid — "autonomous, lights-out facilities", VEM-150 150 kW module — vapor.io</li>
        <li>EdgeMicro platform — 6 racks / 48 kW micro data centers at tower sites — Data Center Knowledge</li>
        <li>OCP Advanced Cooling Solutions, <i>Leak Detection and Intervention</i> (2021) — leak ladder for unattended liquid loops — vertiv.com (hosted PDF)</li>
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
