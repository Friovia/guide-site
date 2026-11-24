import { createFileRoute, notFound, Link } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'
import { PageToc } from '~/components/PageToc'
import { getProfile, profilesUpdated, segmentContext, factValue, type VendorProfile } from '~/lib/vendor-profiles'

// Segment → related concept pages on this site. Engineering navigation, not a claim.
const SEGMENT_RELATED: Record<string, { path: string; label: string }[]> = {
  'cold-plates': [{ path: '/cold-plate-vs-immersion', label: 'Cold plate vs immersion' }, { path: '/what-is-liquid-cooling', label: 'What is liquid cooling?' }],
  'cdus': [{ path: '/what-is-a-cdu', label: 'What is a CDU?' }, { path: '/liquid-to-air-vs-liquid-to-liquid', label: 'L2A vs L2L' }],
  'interconnects': [{ path: '/uqd-quick-disconnects', label: 'UQD quick disconnects' }, { path: '/orv3-manifold', label: 'ORv3 manifold spec' }],
  'immersion': [{ path: '/cold-plate-vs-immersion', label: 'Cold plate vs immersion' }, { path: '/liquid-cooling-fluids', label: 'Coolants and fluids' }],
  'heat-rejection': [{ path: '/wet-bulb-free-cooling', label: 'Wet-bulb free cooling' }, { path: '/pue-math', label: 'PUE math' }],
  'servers': [{ path: '/liquid-ready-servers', label: 'Liquid-ready servers' }],
  'fluids': [{ path: '/liquid-cooling-fluids', label: 'Coolants and fluids' }],
  'micro-dc': [{ path: '/what-is-a-micro-data-center', label: 'What is a micro data center?' }, { path: '/cabinet-comparison', label: 'Cabinet comparison' }],
  'integrators': [{ path: '/rfq-scope-checklist', label: 'RFQ scope checklist' }, { path: '/site-survey', label: 'Site survey' }],
  'solutions': [{ path: '/room-load-calculation', label: 'Room load calculation' }],
  'software': [{ path: '/engineering', label: 'Engineering hub' }, { path: '/pressure-drop', label: 'Pressure drop' }],
  'heat-reuse': [{ path: '/heat-capture-split', label: 'Heat capture split' }],
  'testing': [{ path: '/liquid-cooling-standards', label: 'Standards' }],
  'standards': [{ path: '/liquid-cooling-standards', label: 'Standards' }, { path: '/ss726-liquid-cooling-standard', label: 'SS 726' }],
}

const ALONGSIDE_MAX = 12

export const Route = createFileRoute('/supply-chain/$slug')({
  loader: ({ params }) => {
    if (!getProfile(params.slug)) throw notFound()
  },
  head: ({ params }) => {
    const p = getProfile(params.slug)
    if (!p) return {}
    return pageRoute({
      path: `/supply-chain/${p.slug}`,
      title: `${p.name} — liquid cooling vendor profile`,
      description: `${p.tagline} Verified facts only: HQ, ownership, liquid-cooling product lines and key events, each with a source link. Part of the liquid cooling supply chain map.`,
      article: { title: `${p.name} vendor profile`, description: p.tagline, datePublished: profilesUpdated, dateModified: profilesUpdated },
      faq: p.faq,
      component: () => null, // head-only use; the real component is bound below
    }).head()
  },
  component: VendorProfileRoute,
})

function VendorProfileRoute() {
  const { slug } = Route.useParams()
  const p = getProfile(slug)
  if (!p) return null
  return <VendorProfilePage profile={p} />
}

function VendorProfilePage({ profile: p }: { profile: VendorProfile }) {
  const segmentBlocks = p.segments
    .map(id => ({ id, seg: segmentContext(id) }))
    .filter(b => b.seg)

  const factRows: [string, string | null, string?][] = [
    ['Headquarters', factValue(p.hq)],
    ['Founded', factValue(p.founded)],
    ['Ownership', factValue(p.ownership)],
    ['Chain segments', segmentBlocks.map(b => b.seg!.label).join(' · ') || 'not published'],
    ['Official site', 'site ↗', p.website],
  ]

  return (
    <main className="container" style={{ padding: '40px 20px' }}>
      <p className="updated">
        <Link to="/supply-chain">Supply chain</Link> · vendor profile · data layer v{profilesUpdated}
      </p>
      <h1>{p.name}</h1>
      <p style={{ maxWidth: '680px' }}>{p.tagline}</p>

      <PageToc />

      {p.placeholder && (
        <p className="src" style={{ maxWidth: '680px' }}>
          Profile in preparation — sourced product lines and company facts land in the next data-layer update.
          The row in the <a href="/supply-chain">supply chain map</a> is already verified.
        </p>
      )}

      <h2>Company card</h2>
      <figure className="fig" style={{ marginInline: '0' }}>
        <table style={{ maxWidth: '760px' }}>
          <tbody>
            {factRows.map(([label, value, href]) => value && (
              <tr key={label}>
                <th style={{ whiteSpace: 'nowrap' }}>{label}</th>
                <td>{href
                  ? <a href={href}>{value}</a>
                  : value === 'not published' ? <span className="src">not published</span> : <b>{value}</b>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <figcaption>
          Facts policy: every row is sourced or marked not-published — nothing on this page is estimated.
          {p.hq === 'NOT_FOUND' && ' Fields shown as “not published” were researched and could not be verified from an official source.'}
        </figcaption>
      </figure>

      {p.productLines && p.productLines.length > 0 && (
        <>
          <h2>Liquid cooling product lines</h2>
          <figure className="fig" style={{ marginInline: '0' }}>
            <table style={{ maxWidth: '800px' }}>
              <tbody>
                <tr><th>Product</th><th>What it is</th><th></th></tr>
                {p.productLines.map(pl => (
                  <tr key={pl.name}>
                    <td><strong>{pl.name}</strong></td>
                    <td>{pl.note}</td>
                    <td><a href={pl.source}>source ↗</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        </>
      )}

      {p.facts && p.facts.length > 0 && (
        <>
          <h2>Key events</h2>
          <ul style={{ maxWidth: '680px' }}>
            {p.facts.map(f => (
              <li key={f.year + f.text.slice(0, 20)}>
                <b>{f.year}</b> — {f.text} <a className="src" href={f.source}>source ↗</a>
              </li>
            ))}
          </ul>
        </>
      )}

      {p.ocp && (
        <>
          <h2>Standards participation</h2>
          <p style={{ maxWidth: '680px' }}>{p.ocp}</p>
        </>
      )}

      <h2>Where it sits in the chain</h2>
      {segmentBlocks.map(({ id, seg }) => {
        // Long segments list their headliners here and point to the table for the rest.
        const others = seg!.companies.filter(c => c.name !== p.name).map(c => c.name)
        return (
          <div key={id} style={{ maxWidth: '680px', marginBottom: '12px' }}>
            <b><a href={`/supply-chain#${id}`}>{seg!.label}</a></b>{' '}
            <span className="src">— alongside {others.slice(0, ALONGSIDE_MAX).join(', ')}
              {others.length > ALONGSIDE_MAX && <> and {others.length - ALONGSIDE_MAX} more (full list in the segment table)</>}</span>
          </div>
        )
      })}

      <h2>Related</h2>
      <p>
        <a href="/supply-chain">Supply chain map</a>
        {segmentBlocks.flatMap(({ id }) => SEGMENT_RELATED[id] ?? []).map(r => (
          <> · <a key={r.path} href={r.path}>{r.label}</a></>
        ))}
      </p>

      <h2>Sources &amp; policy</h2>
      <p className="src">
        All facts on this page link their source (official sites, press releases, OCP) or are marked
        not-published. Profiles deepen — but never override — the{' '}
        <a href="/supply-chain">supply chain map</a> row for {p.name}; a profile is not an endorsement.
        Corrections via the <a href="/changelog">changelog</a>.
      </p>
    </main>
  )
}
