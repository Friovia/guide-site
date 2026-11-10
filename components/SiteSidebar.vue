<template>
  <nav class="sidenav" aria-label="Knowledge map">
    <div class="navsearch">
      <input
        v-model="q"
        type="search"
        placeholder="Search the guide  ( / )"
        aria-label="Search the guide"
      />
    </div>

    <template v-for="s in visible" :key="s.id">
      <div class="navsec">{{ s.label }}</div>
      <NuxtLink
        v-for="it in s.items"
        :key="it.path"
        :to="it.path"
        class="navitem"
        :class="{ active: it.path === route.path }"
        @click="$emit('navigate')"
      >
        <span class="navtitle">{{ it.title }}</span>
        <span v-if="q" class="navdesc">{{ it.desc }}</span>
      </NuxtLink>
    </template>

    <p v-if="!visible.length" class="navempty">{{ `No matches for “${q}”.` }}</p>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import nav from '~/data/nav.json'

defineEmits<{ navigate: [] }>()

const route = useRoute()
const q = ref('')

const visible = computed(() =>
  nav.sections
    .map(s => ({
      ...s,
      items: q.value
        ? s.items.filter(it =>
            (it.title + ' ' + it.desc).toLowerCase().includes(q.value.toLowerCase())
          )
        : s.items
    }))
    .filter(s => s.items.length)
)
</script>
