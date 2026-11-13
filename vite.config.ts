import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import nav from './data/nav.json' with { type: 'json' }

const srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'src')
function routeFilesExist(routePath: string) {
  const seg = routePath.replace(/^\//, '')
  return existsSync(path.join(srcDir, 'routes', `${seg}.tsx`))
      || existsSync(path.join(srcDir, 'routes', seg, 'index.tsx'))
}

// Full URL truth for prerendering: every nav.json path + the es/ar landings.
// (42 routes once complete — the set scripts/migrate-baseline.mjs asserts
// against the Nuxt production sitemap.)
const PRERENDER_ROUTES = [...new Set([
  '/',
  ...nav.sections.flatMap(s => s.items.map(i => i.path)),
  '/es',
  '/ar',
])]

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
      // Explicit page list (only routes whose file exists during the migration);
      // crawlLinks off — the nav.json-derived list IS the full URL truth.
      pages: PRERENDER_ROUTES
        .filter(r => r === '/' || routeFilesExist(r))
        .map(p => ({ path: p })),
      prerender: {
        enabled: true,
        crawlLinks: false,
        autoStaticPathsDiscovery: false,
        autoSubfolderIndex: true,
      },
    }),
    // React Refresh runtime — required by TanStack Start dev mode (client JS
    // 500s without it, so hydration never attaches; build path never needed it).
    // Order: router plugins first, react() last (router-code-splitter asserts this).
    react(),
  ],
})
