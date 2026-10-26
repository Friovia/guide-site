<template>
  <div class="shell">
    <header class="site topbar">
      <div class="inner">
        <button v-if="!isHome" class="burger" aria-label="Open navigation" @click="open = true">☰</button>
        <NuxtLink to="/" class="masthead" aria-label="Liquid Cooling Guide — home">
          <svg class="mark" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <rect x="0.75" y="0.75" width="20.5" height="20.5" rx="4" fill="none" stroke="var(--line2)" stroke-width="1.5" />
            <path d="M5 11 h4 M13 11 h4" stroke="var(--cool)" stroke-width="1.75" fill="none" />
            <circle cx="11" cy="11" r="2.9" fill="none" stroke="var(--cool)" stroke-width="1.75" />
            <path d="M11 7.4 v1.2 M11 13.4 v1.2 M7.4 11 h1.2 M13.4 11 h1.2" stroke="var(--text2)" stroke-width="1.4" />
          </svg>
          <span>Liquid Cooling Guide</span>
        </NuxtLink>

        <TopSearch />

        <nav class="topnav" aria-label="Primary">
          <NuxtLink to="/what-is-liquid-cooling">{{ ui.nav.guide }}</NuxtLink>
          <NuxtLink to="/playground">{{ ui.nav.playground }}</NuxtLink>
          <NuxtLink to="/supply-chain">{{ ui.nav.supply }}</NuxtLink>
          <NuxtLink to="/news">{{ ui.nav.news }}</NuxtLink>
        </nav>

        <LangMenu />
      </div>
    </header>

    <div class="cols">
      <aside v-if="!isHome" class="side" :class="{ open }">
        <SiteSidebar @navigate="open = false" />
      </aside>
      <div v-if="open && !isHome" class="scrim" @click="open = false" />

      <div class="content">
        <NuxtPage />
        <footer class="site">
          <div class="container">
            Liquid Cooling Guide · {{ ui.footer }}
            <span v-if="localeCode === 'en'">
              Data updated as products change — see the <NuxtLink to="/changelog">changelog</NuxtLink>.
              <br />Cite this site: <i>Liquid Cooling Guide</i> — liquidcoolingguide.com, data v{{ meta.version }}.
            </span>
            <span v-else><br /><NuxtLink to="/changelog">Changelog</NuxtLink> · data v{{ meta.version }}.</span>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import meta from '~/data/meta.json'
import locales from '~/data/locales.json'
import { computed, ref } from 'vue'
const open = ref(false)
// Landing pages (vuejs.org-style) have no sidebar; docs pages do
const route = useRoute()
const localeCode = computed(() => {
  const seg = route.path.split('/')[1] ?? ''
  return locales.list.find(l => l.code === seg)?.code ?? 'en'
})
const ui = computed(() => locales.ui[localeCode.value as keyof typeof locales.ui] as { nav: Record<string, string>, footer: string })
const isHome = computed(() => route.path === '/' || locales.list.some(l => '/' + l.code === route.path))

// Sitewide structured data: WebSite (knowledge hub — no product org, neutrality is the point)
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Liquid Cooling Guide',
  url: 'https://liquidcoolingguide.com',
  description: 'Independent guide to liquid cooling for micro data centers: concepts, formulas, and sourced cabinet comparisons.'
})
</script>
