export default defineNuxtConfig({
  compatibilityDate: '2026-09-09',
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · Liquid Cooling Guide',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap' }
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Independent guide to liquid cooling for micro data centers: what it is, liquid vs air, and a comparison of small-scale liquid cooling cabinets.' }
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  nitro: { preset: 'static' }
})
