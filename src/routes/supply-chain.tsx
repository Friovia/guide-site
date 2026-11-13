import { createFileRoute } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'
import { ChainCanvas } from '~/components/ChainCanvas'
import data from '~/data/vendors.json'

const companyCount = data.segments.reduce((n, s) => n + s.companies.length, 0)

// Pre-filled intake template — fields map 1:1 onto data/vendors.json rows
const mailto = 'mailto:vendors@liquidcoolingguide.com'
  + '?subject=' + encodeURIComponent('Supply chain listing submission')
  + '&body=' + encodeURIComponent(
    'Company: \nHQ (country): \nSegment (one of the 12 on the page): \n'
    + 'Role in liquid cooling, one line: \nOfficial site URL: \n'
    + 'Source URL verifying it (product page / datasheet): \n\n'
    + '(Listings are free, editorially reviewed, and require a verifiable source.)',
  )

const faqs = [
  {
    q: 'Who are the main companies in liquid cooling for data centers?',
    a: 'By segment — cold plates: CoolIT Systems, Asetek, Boyd; CDUs: Vertiv (CoolChip), Motivair (now Schneider), CoolIT, nVent, Daikin, Delta; couplings and manifolds: Stäubli, CPC, Parker, nVent; liquid-ready servers: Dell, HPE, Lenovo, Supermicro; immersion: LiquidStack, Submer, GRC; heat rejection: Baltimore Aircoil, EVAPCO, Alfa Laval; fluids: Dow, Clariant, Dynalene. Full mapped list with official links in the supply-chain guide.',
  },
  {
    q: 'How can a company get listed on the liquid cooling supply chain map?',
    a: 'Email vendors@liquidcoolingguide.com with the company name, HQ country, segment, a one-line role description, the official site URL and a source URL verifying the claim. Listings are free and editorially reviewed under the site\u2019s facts policy — no paid placement, no guaranteed inclusion, and a listing is not an endorsement.',
  },
  {
    q: 'Is the liquid cooling market consolidated?',
    a: 'Partially, and increasingly: Schneider Electric acquired CDU maker Motivair in 2024, and several thermal conglomerates (Boyd, nVent) cover multiple segments at once. The interoperability layer, however, is standardized — OCP UQD couplings and ORv3 manifolds let buyers mix cold plates, CDUs and racks across vendors, which keeps the market contestable despite consolidation.',
  },
]

export const Route = createFileRoute('/supply-chain')({
  ...pageRoute({
    path: '/supply-chain',
    title: `Liquid cooling supply chain — ${companyCount} companies across the full chain`,
    description: `Who makes what in data center liquid cooling: ${data.segments.length} segments from chips (NVIDIA, AMD, Intel) through cold plates and CDUs (CoolIT, Asetek, Vertiv, Motivair, Boyd), interconnects (Stäubli, CPC, nVent), fluids, heat rejection (BAC, EVAPCO, Alfa Laval) to turnkey micro DCs — every entry linked to its official source.`,
    article: { title: 'Liquid cooling supply chain', description: 'The industry mapped upstream to downstream.', datePublished: '2026-10-08', dateModified: data.updated },
    faq: faqs,
    component: SupplyChainPage,
  }),
})

function SupplyChainPage() {
  return (
    <main className="container" style={{ padding:"40px 20px" }}>
      <p className="updated">Reference · vendors layer v{data.updated} · {companyCount} companies</p>
      <h1>Liquid cooling supply chain — who makes what</h1>
      <p style={{ maxWidth:"680px" }}>
        The industry runs one chain: <b>chips create the heat → cold plates and CDUs capture and move it
        → couplings and racks hold it together → dry coolers and towers reject it → the facility pays for it</b>.
        {companyCount} companies across {data.segments.length} segments, mapped below —
        each entry links the company's official site; notes state its liquid-cooling role only.
      </p>

      <ChainCanvas />

      {data.segments.map(s => (
        <section key={s.id} id={s.id} style={{ marginTop:"36px" }}>
          <h2 style={{ marginBottom:"4px" }}>{s.label}</h2>
          <p className="src" style={{ marginTop:"0" }}>{s.note}</p>
          <figure className="fig" style={{ marginInline:"0" }}>
            <table style={{ maxWidth:"800px" }}>
              <tbody>
                <tr><th>Company</th><th>HQ</th><th>Role in liquid cooling</th><th></th></tr>
                {s.companies.map(c => (
                  <tr key={c.name}>
                    <td><strong>{c.name}</strong></td>
                    <td style={{ whiteSpace:"nowrap" }}>{c.hq}</td>
                    <td>{c.note}</td>
                    <td><a href={c.source} aria-label={`${c.name} official site`}>site ↗</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        </section>
      ))}

      <h2>Reading the map</h2>
      <ul>
        <li><b>Consolidation is real:</b> Schneider acquired Motivair (2024); several majors bought their way into CDUs. Ownership shifts faster than this page — verify before contracting.</li>
        <li><b>Interop lives in the middle boxes.</b> If your cold plates, CDU and couplings all speak OCP (UQD, ORv3), you can mix rows across vendors — that is the whole lock-in defense (<a href="/uqd-quick-disconnects">UQD table</a>).</li>
        <li><b>The 20-50 kW frontier is thin.</b> The micro-DC segment below still shows the gap our <a href="/cabinet-comparison">comparison data</a> documents — air cabinets stop ~10 kW, liquid turnkeys barely exist.</li>
      </ul>

      <h2>List your company</h2>
      <p style={{ maxWidth:"680px" }}>
        Missing from the map, or wrong? <b>Listings are free, editorially reviewed, and never paid</b> —
        independence is this site's product. Email
        <a href={mailto}>vendors@liquidcoolingguide.com</a> with the fields below (the template
        is pre-filled if you click), and we verify against an official source before anything enters
        the data layer:
      </p>
      <div className="formula" style={{ fontSize:"13px", lineHeight:"1.9" }}>
        Company: ____<br />
        HQ (country): ____<br />
        Segment (one of the {data.segments.length} above): ____<br />
        Role in liquid cooling, one line: ____<br />
        Official site URL: ____<br />
        Source URL verifying it (product page / datasheet): ____
      </div>
      <p className="src" style={{ marginTop:"10px" }}>
        Corrections to existing rows go to the same address. Listing is not an endorsement;
        the <a href="/changelog">changelog</a> records every data-layer change.
      </p>

      <h2>Related</h2>
      <p>
        <a href="/cabinet-comparison">Cabinet comparison</a> ·
        <a href="/rfq-scope-checklist">RFQ scope checklist</a> ·
        <a href="/uqd-quick-disconnects">UQD quick disconnects</a> ·
        <a href="/liquid-cooling-standards">Standards</a>
      </p>

      <h2>Sources &amp; policy</h2>
      <p className="src">
        Company roles per their official sites (linked per row); segment placement reflects each company's
        liquid-cooling-relevant business as of {data.updated}. No funding, revenue or market-size claims —
        out of facts-policy scope. Corrections via the <a href="/changelog">changelog</a>.
      </p>
    </main>
  )
}
