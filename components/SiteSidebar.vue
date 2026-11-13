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
      <!-- Channel-first sidebar: the section containing the current page stays
           open; other channels collapse to their group label; searching opens
           everything. -->
      <div v-if="q || s.id === currentSectionId">
        <div class="navsec" :class="{ chan: !q && s.id === currentSectionId }">{{ s.label }}</div>
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
      </div>
      <details v-else class="navgroup">
        <summary class="navsec">{{ s.label }}</summary>
        <NuxtLink
          v-for="it in s.items"
          :key="it.path"
          :to="it.path"
          class="navitem"
          :class="{ active: it.path === route.path }"
          @click="$emit('navigate')"
        >
          <span class="navtitle">{{ it.title }}</span>
        </NuxtLink>
      </details>
    </template>

    <p v-if="!visible.length" class="navempty">{{ `No matches for “${q}.”` }}</p>
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

/** The channel (section) that owns the current page — stays expanded. */
const currentSectionId = computed(() =>
  nav.sections.find(s => s.items.some(it => it.path === route.path))?.id
)
</script>

<style scoped>
.navsec.chan {
  color: var(--cool);
}
details.navgroup > summary {
  cursor: pointer;
  list-style: none;
  user-select: none;
}
details.navgroup > summary::-webkit-details-marker {
  display: none;
}
details.navgroup > summary::after {
  color: var(--line2);
  content: '+';
  float: right;
  font-family: var(--mono);
}
details.navgroup[open] > summary::after {
  content: '\2013';
}
</style>
