/**
 * SEO/GEO helpers — React port of composables/useSeo.ts (equivalent output, verified
 * against scripts/baseline). GEO emphasis: TechArticle + FAQPage schemas, dates.
 * In TanStack Router these feed route `head()` — SSG renders them into static HTML.
 */
export const SITE = {
  url: 'https://liquidcoolingguide.com',
  name: 'Liquid Cooling Guide',
  tagline: 'Independent guide to liquid cooling for micro data centers',
}

export interface SeoOptions { title: string; description: string; path: string }

/** head() fragment for page SEO — <title> mirrors the old '%s · Liquid Cooling Guide' template. */
export function seoHead(o: SeoOptions) {
  const url = SITE.url + o.path
  return {
    links: [{ rel: 'canonical', href: url }],
    meta: [
      { title: `${o.title} · ${SITE.name}` },
      { name: 'description', content: o.description },
      { property: 'og:title', content: `${o.title} · ${SITE.name}` },
      { property: 'og:description', content: o.description },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url },
      { property: 'og:site_name', content: SITE.name },
      { property: 'og:image', content: `${SITE.url}/og-image.png` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${o.title} · ${SITE.name}` },
      { name: 'twitter:description', content: o.description },
    ],
  }
}

/** Article schema — freshness signals matter for both SEO and GEO. */
export function articleJsonLd(o: { path: string; title: string; description: string; datePublished?: string; dateModified?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: o.title,
    description: o.description,
    url: SITE.url + o.path,
    datePublished: o.datePublished ?? '2026-09-09',
    dateModified: o.dateModified ?? '2026-09-09',
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  }
}

/** FAQ schema — question phrasing matches real user queries (LLMs favor Q&A structure). */
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

/** head() fragment carrying JSON-LD nodes (arrays are wrapped, same as the Vue useJsonLd). */
export function jsonLdHead(...nodes: Record<string, unknown>[]) {
  return {
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(nodes) }],
  }
}

/** Sitewide WebSite schema (the old app.vue used useJsonLd once globally — kept neutral on purpose). */
export function webSiteJsonLd() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url }
}
