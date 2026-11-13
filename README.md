# Liquid Cooling Guide

**The liquid-cooling gobyexample — structured, visual, sourced.** Now on React:
TanStack Start (SSG prerender to `dist/client`) + Vite 8 + Tailwind v4 (no preflight —
site tokens live in `assets/css/main.css`). Ported 1:1 from the Nuxt original on
2026-11-14; URLs, data layer (`data/*.json`) and the SEO head output are verified
against the production baseline (`scripts/migrate-baseline.mjs --diff`).


## What's inside

- **Formula handbook ×11** — flow rate, heat capture, derating, floor loading… each with a worked example and an in-browser calculator
- **Supply-chain map** — 97 companies across 16 segments, every row linked to its source
- **Playground** — derating simulator, rack builder, room-load calculator, animated coolant loop
- **Industry radar** — daily auto-fetched news with real article covers, plus a curated milestone timeline; feed at [`/newsfeed.xml`](https://liquidcoolingguide.com/newsfeed.xml)
- **Physics kernel (vendored)** — interactive pages import the solvers of our open [simulation kernel](https://github.com/Friovia/simulation); every vendor run is parity-tested against the kernel's golden vectors (`pnpm vendor:sim`)

## Editing discipline

Only manufacturer pages, spec sheets and trade press. Unverifiable data is marked ❌, never invented. Data-layer freshness is versioned in `data/meta.json` and surfaces on the homepage status bar.

## License

- **Code** — Apache-2.0, see [LICENSE](./LICENSE)
- **Site content** (articles, data text) — CC BY-SA 4.0, see [LICENSE-CONTENT.md](./LICENSE-CONTENT.md)
- Third-party photographs keep their own licenses (see site CREDITS)

## Maintenance

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm generate     # static build + nav/sitemap/llms consistency gate
```

Adding a page is a four-piece set — `pages/<slug>.vue`, `data/nav.json`, `public/sitemap.xml`, `public/llms.txt` — and the build fails if they drift out of sync. The news radar runs itself: `.github/workflows/news.yml` fetches daily and commits only when something changed.
