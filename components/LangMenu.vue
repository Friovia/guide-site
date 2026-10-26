<template>
  <div class="langmenu">
    <button class="langbtn" :aria-label="`Language: ${current.native}`" @click="open = !open">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex:none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8" />
        <path d="M2.5 12h19M12 2.5c3 3.2 3 15.8 0 19M12 2.5c-3 3.2-3 15.8 0 19" stroke="currentColor" stroke-width="1.6" />
      </svg>
      <span class="langbtn-label">{{ current.native }}</span>
      <span class="chev">▾</span>
    </button>
    <div v-if="open" class="lang-pop" role="menu">
      <NuxtLink
        v-for="l in others"
        :key="l.code"
        :to="l.code === 'en' ? '/' : `/${l.code}`"
        class="lang-opt"
        role="menuitem"
        @click="open = false"
      >
        <span class="lo-native">{{ l.native }}</span>
        <span class="lo-code">{{ l.code }}</span>
      </NuxtLink>
      <a class="lang-help" href="mailto:vendors@liquidcoolingguide.com?subject=Help%20translate%20Liquid%20Cooling%20Guide">
        🌐 Help us translate!
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import locales from '~/data/locales.json'

const route = useRoute()
const open = ref(false)

// current locale = first path segment matching a locale code ('' = en)
const code = computed(() => {
  const seg = route.path.split('/')[1] ?? ''
  return locales.list.find(l => l.code === seg)?.code ?? 'en'
})
const current = computed(() => locales.list.find(l => l.code === code.value) ?? locales.list[0])
const others = computed(() => locales.list.filter(l => l.code !== code.value))

function onDoc(e: MouseEvent) {
  if (!(e.target as HTMLElement)?.closest?.('.langmenu')) open.value = false
}
onMounted(() => document.addEventListener('click', onDoc))
onUnmounted(() => document.removeEventListener('click', onDoc))
</script>

<style scoped>
.langmenu { position: relative; flex: none; }
.langbtn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--sans); font-size: 14px; font-weight: 500; color: var(--text); background: none; border: none; padding: 6px 10px; cursor: pointer; white-space: nowrap; }
.langbtn:hover { color: var(--cool); }
/* fixed width: the label changes per locale — this is the anti-jitter contract */
.langbtn-label { min-width: 74px; text-align: center; }
.chev { font-size: 10px; color: var(--text2); }
.lang-pop { position: absolute; top: calc(100% + 6px); right: 0; width: 230px; background: #fff; border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 8px 30px rgba(20, 40, 60, 0.14); padding: 6px; z-index: 70; max-height: 60vh; overflow-y: auto; }
.lang-opt { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 10px; border-radius: 6px; text-decoration: none; border-bottom: none; }
.lang-opt:hover { background: #f3f8fc; }
.lo-native { font-size: 14px; font-weight: 500; color: var(--text); }
.lang-opt:hover .lo-native { color: var(--cool); }
.lo-code { font-family: var(--mono); font-size: 11px; color: var(--text2); }
.lang-help { display: block; margin-top: 4px; padding: 8px 10px; border-top: 1px solid var(--line); font-size: 12.5px; color: var(--text2); text-decoration: none; }
.lang-help:hover { color: var(--cool); }
</style>
