<!--
  In-page table of contents for long "monolith" pages: reads main h2 headings at
  runtime and renders anchor chips under the intro. Zero content changes needed —
  add <PageToc /> once below the lead paragraph of any dense page.
-->
<template>
  <nav v-if="heads.length > 2" class="ptoc" aria-label="On this page">
    <span class="ptoc-label">On this page</span>
    <a v-for="h in heads" :key="h.id" :href="'#' + h.id">{{ h.text }}</a>
  </nav>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const heads = ref<{ id: string, text: string }[]>([])

onMounted(() => {
  heads.value = [...document.querySelectorAll('main h2')].map((h) => {
    if (!h.id) {
      h.id = (h.textContent ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }
    return { id: h.id, text: (h.textContent ?? '').trim() }
  })
})
</script>

<style scoped>
.ptoc {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  align-items: baseline;
  max-width: 760px;
  padding: 10px 14px;
  border: 1px solid var(--rule);
  border-radius: 8px;
  margin: 0 0 28px;
  font-size: 13px;
}
.ptoc-label {
  font-weight: 600;
  color: var(--text2);
}
.ptoc a {
  color: var(--link, #2f6fed);
  text-decoration: none;
}
.ptoc a:hover {
  text-decoration: underline;
}
</style>
