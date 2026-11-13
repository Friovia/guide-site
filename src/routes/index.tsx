import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '~/lib/seo'

// Placeholder homepage — the real home (HeroChart drag curve, LatestRadar band,
// feature band, full index) is ported in batch D of the React migration.
export const Route = createFileRoute('/')({
  head: () => ({
    ...seoHead({
      title: 'Liquid cooling for micro data centers — the sourced reference',
      description: 'Independent technical reference on liquid cooling for micro data centers: how it works, the formulas, and a sourced comparison of small-scale cooling cabinets. Data compiled from manufacturer pages, datasheets and trade press only.',
      path: '/',
    }),
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <main className="container" style={{ padding: '40px 20px' }}>
      <h1>Liquid Cooling Guide</h1>
      <p>React port in progress — content pages are being ported batch by batch; the production site continues to serve from the Nuxt build until the switch.</p>
    </main>
  )
}
