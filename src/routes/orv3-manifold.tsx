import { createFileRoute } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'
import { PageToc } from '~/components/PageToc'

const faqs = [
  {
    q: 'How much flow does an ORv3 manifold take?',
    a: 'The blind-mate manifold spec publishes no numeric rack flow — only a measured PQ (pressure–flow) curve for a manifold pair at 25 °C (Fig. 19). For sizing, use the OAI guideline ratio: 1.25–2.0 L/min per kW of heat on PG25, with 1.5 L/min/kW the typical design target at 10 °C liquid ΔT. Per-device: OAM-class cold plates 1–2 L/min, whole chassis 4–16 L/min.',
  },
  {
    q: 'Can a standard ORv3 rack be retrofitted to liquid cooling?',
    a: 'Yes — that is a stated design intent of the Meta Open Rack Frame V3 spec: "the liquid cooling kit shall be an add-on kit installed with common tools… to allow one to easily convert a standard rack to a blind mate liquid cooled rack." The reference liquid layout uses 24 valves per manifold and 12 × 3OU chassis, split at OU23.',
  },
  {
    q: 'Which coolant does the ORv3 manifold use?',
    a: 'PG25 — 25% propylene glycol / water. The manifold spec ran durability and flow tests on Dowfrost LC25; the OCP PG-fluid guidelines define PG25 concentration as 24.5–29.5 vol%, pH 8.0–10.5, freeze point −13 to −9 °C.',
  },
  {
    q: 'How many UQD ports does an ORv3 manifold have?',
    a: 'The spec deliberately does not require a count. The reference design used 24 blind-mate valves per manifold (12 each side of the frame cross-brace) — "developers are free to design other port locations and quantities as needed." Ports are 3/4-16 UNF-2B female (ISO 11926-1), and the rack-level inlet uses OCP LQC 1" hoses.',
  },
]

export const Route = createFileRoute('/orv3-manifold')({
  ...pageRoute({
    path: '/orv3-manifold',
    title: 'ORv3 blind-mate manifold — the spec in numbers',
    description: 'The OCP Open Rack V3 liquid manifold spec, quoted: 50 psig working pressure, 60 °C max fluid, PG25 coolant, 24-valve reference design, 3/4-16 UNF ports, ≤5% flow distribution target, W45-class 17–65 °C operation — plus the OAI flow rules of thumb and what the spec deliberately does not publish.',
    article: { title: 'ORv3 blind-mate manifold spec', description: 'The OCP ORv3 liquid manifold, quoted with sources.', datePublished: '2026-11-17', dateModified: '2026-11-17' },
    faq: faqs,
    component: Orv3ManifoldPage,
  }),
})

function Orv3ManifoldPage() {
  return (
    <main className="container" style={{ padding: '40px 20px' }}>
      <p className="updated">Spec digest · 5 min read</p>
      <h1>ORv3 blind-mate manifold — the spec in numbers</h1>

      <p style={{ maxWidth: '680px' }}>
        The <b>Open Rack V3 blind-mate liquid manifold</b> is the rack-side half of OCP direct-to-chip
        cooling: servers slide in and their <a href="/uqd-quick-disconnects">UQD couplings</a> mate
        to manifold valves without tools. The spec — "Open Rack V3 Blind Mate Manifold
        Specification, Rev 1.0" (Meta / nVent / Parker, April 2024) — is public. This page quotes it.
      </p>

      <PageToc />

      <h2>The numbers, quoted</h2>
      <figure className="fig" style={{ marginInline: '0' }}>
        <table style={{ maxWidth: '760px' }}>
          <tbody>
            <tr><th>Parameter</th><th>Value</th><th>Spec text</th></tr>
            <tr><td>Max working pressure</td><td><b>50 psig</b></td><td>"maximum working pressure of 50 psig" (§16)</td></tr>
            <tr><td>Proof test (normal)</td><td><b>150 psig</b> @ 60 °C fluid</td><td>"3 × 50 psig", per UL 62368-1 (§19.3)</td></tr>
            <tr><td>Hydrostatic (abnormal)</td><td><b>100 psig</b></td><td>"2 × 50 psig" (§19.3)</td></tr>
            <tr><td>Max fluid temperature</td><td><b>60 °C</b></td><td>"maximum working fluid temperature of 60 °C" (§17.2)</td></tr>
            <tr><td>Coolant</td><td><b>PG25</b> (Dowfrost LC25 in testing)</td><td>"25% propylene glycol-water mixture" (§17.1)</td></tr>
            <tr><td>Flow distribution target</td><td><b>≤ 5%</b> between branches (recommended)</td><td>measured 10% on the reference design (§13.1)</td></tr>
            <tr><td>Branch pressure drop</td><td><b>~1–2 psi</b> minimum branch ΔP</td><td>"on the order of 1~2 psi" (§13.2)</td></tr>
            <tr><td>Blind-mate port</td><td><b>3/4-16 UNF-2B</b> female, ISO 11926-1</td><td>min 3 full threads (§11.2.1)</td></tr>
            <tr><td>Reference valve count</td><td><b>24 per manifold</b> (12+12 at cross-brace)</td><td>quantity NOT required (§11.2.2)</td></tr>
            <tr><td>Rack inlet</td><td>OCP <b>LQC</b>, 1" hoses</td><td>top and bottom evaluated (§13.1)</td></tr>
            <tr><td>Wetted materials</td><td><b>SS 303 / 304L / 316L</b></td><td>tube and brackets (§18.2)</td></tr>
            <tr><td>Deflection limit</td><td><b>≤ 1.0 mm</b></td><td>any point, depth direction (§14.1)</td></tr>
            <tr><td>Flow convention</td><td>supply = right, return = left</td><td>viewed from rack rear (§13.1)</td></tr>
          </tbody>
        </table>
        <figcaption>All values from the ORv3 Blind Mate Manifold Spec Rev 1.0 (OCP, public PDF).</figcaption>
      </figure>

      <h2>Qualification requirements (white paper v3)</h2>
      <ul style={{ maxWidth: '680px' }}>
        <li><b>Operating temperature 17–65 °C</b> — derived from ASHRAE W45 facility water, a 2 °C approach in the CDU and ~13 °C ΔT.</li>
        <li><b>Burst ≥ 3 × MAWP</b>; qualification pressure tests at 100 psig and 300 psig.</li>
        <li><b>Coolant velocity &lt; 1.5 m/s</b> in the manifold (ASHRAE guideline).</li>
        <li>Shipping environment −40 to +75 °C.</li>
      </ul>

      <h2>Flow rules of thumb (OAI, not the manifold spec)</h2>
      <p style={{ maxWidth: '680px' }}>
        For sizing a rack loop, the industry default comes from the OAI System Liquid Cooling
        Guidelines: <b>1.25–2.0 L/min per kW</b> of heat on PG25, with <b>1.5 L/min/kW</b> as the
        typical design target at 10 °C liquid rise. Device level: OAM-class cold plates run
        1–2 L/min each, chassis loops 4–16 L/min. The GB200 NVL72&apos;s rack numbers
        (120 kW, up to 130 L/min, 85% liquid capture) sit right on this curve — see
        the <a href="/what-is-liquid-cooling">architecture overview</a>.
      </p>

      <h2>What the spec deliberately does not publish</h2>
      <ul style={{ maxWidth: '680px' }}>
        <li><b>Rack-level numeric flow:</b> only a graphical PQ curve for a manifold pair (Fig. 19) — no L/min figure in text. Use the OAI ratio above.</li>
        <li><b>A required valve count:</b> 24 is the reference design, explicitly not a requirement.</li>
        <li><b>A "PHID" power rating:</b> the term does not appear in ORv3 documents. Rack power comes from the power ecosystem (HPR: 93.5 → 190 kW in Meta&apos;s HPR Next deck; vendor racks at 132–140 kW), not from the manifold spec.</li>
      </ul>

      <h2>Related pages</h2>
      <ul style={{ maxWidth: '680px' }}>
        <li><a href="/uqd-quick-disconnects">UQD quick disconnects</a> — the coupling family that mates to these valves</li>
        <li><a href="/liquid-cooling-fluids">Cooling fluids</a> — PG25 chemistry and care</li>
        <li><a href="/what-is-a-cdu">What is a CDU?</a> — what feeds the manifold</li>
        <li><a href="/ashrae-w-classes">ASHRAE W-classes</a> — the facility-water ladder behind W45</li>
      </ul>

      <h2>Sources</h2>
      <ul style={{ maxWidth: '680px' }}>
        <li><a href="https://www.opencompute.org/documents/open-rack-v3-blind-mate-manifold-specification-rev-1-0-review-april05-2024-pdf" rel="noopener">OCP: Open Rack V3 Blind Mate Manifold Specification Rev 1.0</a> (Meta/nVent/Parker, 2024-04-05)</li>
        <li><a href="https://www.opencompute.org/documents/ocp-white-paper-rack-manifold-requirements-and-qualification-v3-pdf" rel="noopener">OCP white paper: Rack Manifold Requirements and Qualification v3</a> (Intel, CoolIT, Meta et al.)</li>
        <li><a href="https://www.opencompute.org/documents/oai-system-liquid-cooling-guidelines-in-ocp-template-mar-3-2023-update-pdf" rel="noopener">OAI: System Liquid Cooling Guidelines</a> (2023-03 update) — L/min/kW ratios</li>
        <li><a href="https://www.opencompute.org/documents/guidelines-for-using-propylene-glycol-based-heat-transfer-fluids-in-single-phase-cold-plate-based-liquid-cooled-racks-final-pdf" rel="noopener">OCP: PG-based heat transfer fluid guidelines</a> (Dow/Intel/Meta) — PG25 concentration</li>
        <li><a href="https://www.opencompute.org/documents/open-rack-version-meta-v3-rev1pt3-june032024-pdf" rel="noopener">Meta Open Rack Frame V3 Spec Rev 1.3</a> (2024-06-03) — retrofit kit, reference layout</li>
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
