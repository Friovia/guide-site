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
      <!-- Channel-first knowledge map: the section owning the current page stays
           open; other channels toggle via managed state (native <details> open
           state is not tracked by Vue and gets reset on re-render); searching
           opens everything. -->
      <div class="navsec" :class="{ chan: !q && s.id === currentSectionId }" @click="toggle(s.id)">{{ s.label }}<span class="navtoggle">{{ isOpen(s.id) ? '–' : '+' }}</span></div>
      <NuxtLink
        v-for="it in s.items"
        v-show="isOpen(s.id)"
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

    <p v-if="!visible.length" class="navempty">{{ `No matches for “${q}.”` }}</p>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import nav from '~/data/nav.json'

defineEmits<{ navigate: [] }>()

const route = useRoute()
const q = ref('')

/** Channels the user manually expanded (managed state — survives re-renders). */
const expanded = ref(new Set<string>())

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

/** The channel (section) that owns the current page — always open. */
const currentSectionId = computed(() =>
  nav.sections.find(s => s.items.some(it => it.path === route.path))?.id
)

function toggle(id: string) {
  const next = new Set(expanded.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expanded.value = next
}

function isOpen(id: string) {
  return !!q.value || id === currentSectionId.value || expanded.value.has(id)
}

// Leaving a channel collapses it again (keeps the map focused on the channel you're in)
watch(currentSectionId, (now, before) => {
  if (before && now !== before) {
    const next = new Set(expanded.value)
    next.delete(before)
    expanded.value = next
  }
})
</script>

<style scoped>
.navsec {
  cursor: pointer;
  user-select: none;
}
.navsec.chan {
  color: var(--cool);
}
.navsec.chan .navtoggle {
  color: var(--cool);
}
.navtoggle {
  color: var(--line2);
  float: right;
  font-family: var(--mono);
}
</style>
