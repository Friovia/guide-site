/**
 * Central SEO/GEO helpers for the knowledge hub — zero-dependency, SSG-friendly.
 * GEO emphasis: TechArticle + FAQPage schemas, dates, extractable takeaways.
 */
export const SITE = {
  url: 'https://liquidcoolingguide.com',
  name: 'Liquid Cooling Guide',
  tagline: 'Independent guide to liquid cooling for micro data centers'
}

export function useSeo(o: { title: string; description: string; path?: string }) {
  // path defaults to the current route — canonicals must always resolve, never "...comundefined"
  const route = useRoute()
  const url = SITE.url + (o.path ?? route.path)
  useHead({
    title: o.title,
    link: [{ rel: 'canonical', href: url }],
    meta: [
      { name: 'description', content: o.description },
      { property: 'og:title', content: `${o.title} · ${SITE.name}` },
      { property: 'og:description', content: o.description },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url },
      { property: 'og:site_name', content: SITE.name },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: `${o.title} · ${SITE.name}` },
      { name: 'twitter:description', content: o.description }
    ]
  })
}

/** Article schema — freshness signals (published/modified) matter for both SEO and GEO. */
export function useArticle(o: { path: string; title: string; description: string; datePublished?: string; dateModified?: string }) {
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: o.title,
    description: o.description,
    url: SITE.url + o.path,
    datePublished: o.datePublished ?? '2026-09-09',
    dateModified: o.dateModified ?? '2026-09-09',
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url }
  })
}

/** FAQ schema — question phrasing matches real user queries (LLMs favor Q&A structure). */
export function useFaq(faqs: { q: string; a: string }[]) {
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  })
}

export function useJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify(Array.isArray(data) ? data : [data])
    }]
  })
}
