<template>
  <nav class="sidenav" aria-label="Knowledge map">
    <div class="navsearch">
      <input
        v-model="q"
        type="search"
        :placeholder="zh ? '搜索本站（按 / 聚焦）' : 'Search the guide  ( / )'"
        :aria-label="zh ? '搜索本站' : 'Search the guide'"
      />
    </div>

    <template v-for="s in visible" :key="s.id">
      <div class="navsec">{{ zh ? (s.labelZh || s.label) : s.label }}</div>
      <NuxtLink
        v-for="it in s.items"
        :key="it.path"
        :to="target(it)"
        class="navitem"
        :class="{ active: target(it) === route.path }"
        @click="$emit('navigate')"
      >
        <span class="navtitle">{{ zh ? (it.titleZh || it.title) : it.title }}</span>
        <span v-if="q" class="navdesc">{{ it.desc }}</span>
      </NuxtLink>
    </template>

    <p v-if="!visible.length" class="navempty">{{ zh ? '没有匹配项' : `No matches for “${q}”.` }}</p>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import nav from '~/data/nav.json'

defineEmits<{ navigate: [] }>()

const route = useRoute()
const q = ref('')
const zh = computed(() => route.path.startsWith('/zh'))

function target(it: { path: string; zhPath?: string }) {
  return zh.value && it.zhPath ? it.zhPath : it.path
}

const visible = computed(() =>
  nav.sections
    .map(s => ({
      ...s,
      items: q.value
        ? s.items.filter(it =>
            (it.title + ' ' + it.titleZh + ' ' + it.desc).toLowerCase().includes(q.value.toLowerCase())
          )
        : s.items
    }))
    .filter(s => s.items.length)
)
</script>
