// Route factory: collapses the per-page boilerplate (seoHead + article/faq JSON-LD)
// into one spread. Every content route uses the same shape as its Nuxt original:
// useSeo → seoHead, useArticle → articleJsonLd, useFaq → faqJsonLd.
import type { FC } from 'react'
import { seoHead, articleJsonLd, faqJsonLd, jsonLdHead } from '~/lib/seo'

export function pageRoute(o: {
  path: string
  title: string
  description: string
  article?: { title: string; description: string; datePublished?: string; dateModified?: string }
  faq?: { q: string; a: string }[]
  component: FC
}) {
  const nodes = [
    ...(o.article ? [articleJsonLd({ path: o.path, ...o.article })] : []),
    ...(o.faq ? [faqJsonLd(o.faq)] : []),
  ]
  return {
    head: () => ({
      ...seoHead({ title: o.title, description: o.description, path: o.path }),
      ...jsonLdHead(...nodes),
    }),
    component: o.component,
  }
}
