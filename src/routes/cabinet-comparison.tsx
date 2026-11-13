import { createFileRoute } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'
import data from '~/data/products.json'

export const Route = createFileRoute('/cabinet-comparison')({
  ...pageRoute({
    path: '/cabinet-comparison',
    title: 'Small-scale cooling cabinet comparison',
    description: 'Verified comparison of rack-level cooling products for micro data centers — Schneider, Vertiv, STULZ×CoolIT, Rittal, Asetek, nVent: power class, cooling type, facility requirements, per-row sources.',
    article: { title: 'Small-scale cooling cabinet comparison', description: 'Every verifiable rack-level cooling product for micro data centers, with sources.' },
    component: CabinetComparisonPage,
  }),
})

function CabinetComparisonPage() {
  return (
    <main className="container" style={{ padding:"40px 20px" }}>
      <p className="updated">Data layer updated {data.updated} · every row links to its source</p>
      <h1>Small-scale cooling cabinet comparison</h1>
      <p style={{ maxWidth:"700px" }}>
        Every rack-level cooling product we could verify for micro data center use (≤120 kW class).
        This segment does not publish prices — treat any number a vendor gives you as an opening position.
      </p>

      <figure className="fig" style={{ marginInline:"0" }}>
        <div style={{ overflowX:"auto" }}>
          <table>
            <tbody>
              <tr>
                <th>Product</th><th>Form</th><th>Cooling</th><th>Power class</th><th>Facility-free?</th><th>Note</th>
              </tr>
              {data.products.map(p => (
                <tr key={p.vendor + p.product}>
                  <td><a href={p.source} rel="noopener">{p.vendor}<br /><em style={{ fontSize:"12.5px" }}>{p.product}</em></a></td>
                  <td>{p.form}</td>
                  <td>{p.cooling}</td>
                  <td>{p.power_class}</td>
                  <td>{p.facility_free}</td>
                  <td>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <figcaption><b>FIG. 1</b> — Rack-level cooling products for micro data centers, compiled {data.updated}. Per-row sources: vendor names link to manufacturer pages. Prices unpublished segment-wide (❌).</figcaption>
      </figure>

      <h2>The gap</h2>
      <p style={{ maxWidth:"700px" }}>{data.gap_statement}</p>

      <h2>Caveats</h2>
      <ul className="src">
        {data.caveats.map(c => <li key={c}>{c}</li>)}
      </ul>

      <h2>Looking for a turnkey 20-50 kW cabinet?</h2>
      <p style={{ maxWidth:"700px" }}>
        This guide stays vendor-neutral. Vendors building in this gap can be found via search;
        we don't endorse listings here. Methodology: manufacturer pages, datasheets and trade press only.
      </p>
    </main>
  )
}
