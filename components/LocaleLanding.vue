<template>
  <div :dir="meta.dir">
    <section class="home-hero">
      <p class="eyebrow">{{ s.eyebrow }}</p>
      <h1><span class="grad">{{ s.heroK }}</span>{{ s.heroRest }}</h1>
      <p class="sub">{{ s.sub }}</p>
      <div class="cta-row">
        <NuxtLink to="/playground" class="btn btn-fill">{{ s.ctaA }}</NuxtLink>
        <NuxtLink to="/what-is-liquid-cooling" class="btn btn-ghost">{{ s.ctaB }}</NuxtLink>
      </div>
    </section>

    <main class="container" style="padding:8px 24px 60px">
      <div class="heropanel">
        <HeroChart :label="s.instLabel" :caption="s.instCap" :sub="s.instSub" />
        <div class="hp-foot">
          <span>{{ s.foot[0] }} <b>v{{ metaNow.version }}</b></span>
          <span>{{ s.foot[1] }} {{ metaNow.datasets.products.slice(5) }}</span>
          <span>{{ s.foot[2] }} {{ metaNow.datasets.vendors.slice(5) }}</span>
          <span>{{ s.foot[3] }} {{ metaNow.datasets.formulas.slice(5) }}</span>
          <span><NuxtLink to="/changelog">{{ s.foot[4] }} →</NuxtLink></span>
        </div>
      </div>

      <div class="feat-band">
        <div class="feat">
          <span class="fic">{{ s.feat1c }}</span>
          <h3>{{ s.feat1k }}</h3>
          <p>{{ s.feat1d }}</p>
        </div>
        <div class="feat">
          <span class="fic">{{ s.feat2c }}</span>
          <h3>{{ s.feat2k }}</h3>
          <p>{{ s.feat2d }}</p>
        </div>
        <div class="feat">
          <span class="fic">{{ s.feat3c }}</span>
          <h3>{{ s.feat3k }}</h3>
          <p>{{ s.feat3d }}</p>
        </div>
      </div>

      <p class="src" style="margin: 40px 0 -18px">{{ s.notice }}</p>

      <section v-for="sec in nav.sections" :key="sec.id">
        <h2 class="idx-sec" style="margin-top:56px">{{ sec.label }}</h2>
        <div class="idx">
          <NuxtLink v-for="it in sec.items" :key="it.path" :to="it.path" class="idx-row">
            <span class="idx-title">{{ it.title }}</span>
            <span class="idx-desc">{{ it.desc }}</span>
            <span class="idx-arrow">→</span>
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import locales from '~/data/locales.json'
import metaNow from '~/data/meta.json'
import nav from '~/data/nav.json'

const props = defineProps<{ locale: string }>()
const meta = computed(() => locales.list.find(l => l.code === props.locale) ?? locales.list[0])
const s = computed(() => locales.ui[props.locale as keyof typeof locales.ui] as Record<string, any>)

useSeo({ title: s.value.seoTitle, description: s.value.seoDesc, path: `/${props.locale}` })
</script>
