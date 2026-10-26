<template>
  <div class="topsearch">
    <input
      ref="el"
      v-model="q"
      type="search"
      :placeholder="ph"
      aria-label="Search the guide"
      @focus="open = true"
      @blur="onBlur"
      @keydown.enter.prevent="goFirst"
    />
    <div v-if="open && q" class="ts-pop">
      <NuxtLink v-for="r in results" :key="r.path" :to="r.path" class="ts-row" @mousedown.prevent="go(r.path)">
        <span class="ts-title">{{ r.title }}</span>
        <span class="ts-desc">{{ r.desc }}</span>
      </NuxtLink>
      <p v-if="!results.length" class="ts-empty">No matches — try “flow” or “W-class”.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import nav from '~/data/nav.json'
import locales from '~/data/locales.json'

const route = useRoute()
const ph = computed(() => {
  const seg = route.path.split('/')[1] ?? ''
  const l = locales.list.find(x => x.code === seg)?.code ?? 'en'
  return (locales.ui[l as keyof typeof locales.ui] as { search?: string })?.search ?? 'Search'
})
const q = ref('')
const open = ref(false)
const el = ref<HTMLInputElement | null>(null)

const results = computed(() => {
  const all = nav.sections.flatMap(s => s.items)
  if (!q.value) return []
  const needle = q.value.toLowerCase()
  return all.filter(i => (i.title + ' ' + i.desc).toLowerCase().includes(needle)).slice(0, 7)
})

function go(p: string) { q.value = ''; open.value = false; navigateTo(p) }
function goFirst() { if (results.value[0]) go(results.value[0].path) }
function onBlur() { setTimeout(() => { open.value = false }, 120) }

// "/" focuses search from anywhere (docs muscle memory)
function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  if (e.key === '/' && t?.tagName !== 'INPUT' && t?.tagName !== 'TEXTAREA') {
    e.preventDefault()
    el.value?.focus()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.topsearch { position: relative; flex: 1 1 auto; max-width: 240px; }
.topsearch input { width: 100%; font-family: var(--mono); font-size: 12px; padding: 7px 12px; border: 1px solid var(--line2); background: var(--bg2); border-radius: 999px; color: var(--text); }
.topsearch input:focus { outline: none; background: #fff; border-color: var(--cool); box-shadow: 0 0 0 2px rgba(46, 127, 194, 0.15); }
.ts-pop { position: absolute; top: calc(100% + 8px); right: 0; width: 380px; max-width: 90vw; background: #fff; border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 8px 30px rgba(20, 40, 60, 0.14); padding: 6px; z-index: 70; }
.ts-row { display: block; padding: 8px 10px; border-radius: 6px; text-decoration: none; border-bottom: none; }
.ts-row:hover { background: #f3f8fc; }
.ts-title { display: block; font-size: 13.5px; font-weight: 600; color: var(--text); }
.ts-row:hover .ts-title { color: var(--cool); }
.ts-desc { display: block; font-size: 11.5px; color: var(--text2); }
.ts-empty { font-family: var(--mono); font-size: 11.5px; color: var(--text2); padding: 8px 10px; margin: 0; }
</style>
