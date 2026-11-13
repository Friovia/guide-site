import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { jsonLdHead, webSiteJsonLd } from '~/lib/seo'
import { AppShell } from '~/components/AppShell'
import { UiProvider, useLocaleCode } from '~/lib/i18n'
import appCss from '~/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        name: 'description',
        content: 'Independent technical reference on liquid cooling for micro data centers — formulas with live calculators, sourced data, industry radar.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap',
      },
    ],
    ...jsonLdHead(webSiteJsonLd()),
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: ReactNode }) {
  // Locale from the first path segment (/es, /ar) — same probe app.vue used.
  const locale = useLocaleCode()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  return (
    <html lang={locale === 'en' ? 'en' : locale} dir={dir}>
      <head>
        <HeadContent />
      </head>
      <body>
        <UiProvider>
          <AppShell>{children}</AppShell>
        </UiProvider>
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <main className="container" style={{ padding: '40px 20px' }}>
      <h1>404</h1>
      <p>This page does not exist — the sidebar map lists every page on the site.</p>
    </main>
  )
}
