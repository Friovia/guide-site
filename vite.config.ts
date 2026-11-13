import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

// Nuxt -> React port (TanStack Start). Prerender renders every route to
// /path/index.html — the same URL shape the Nuxt SSG produced, so Cloudflare
// Pages keeps serving identical paths. Build runs through scripts/build.mjs
// (workaround for TanStack/router#6602 — vite build hangs after prerender).
export default defineConfig({
  server: { port: 3211 },
  plugins: [
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart({
      target: 'react',
      // crawlLinks off on purpose: the route tree IS the full URL truth (42 routes,
      // verified against scripts/baseline) — crawling would trip on not-yet-ported
      // internal links during the migration and add nothing once the tree is complete.
      prerender: { enabled: true, crawlLinks: false, autoSubfolderIndex: true },
    }),
  ],
})
