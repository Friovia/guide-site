<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Industry radar · curated {{ news.curated ? 'by editors' : '' }}{{ news.last_fetched ? ` · auto-fetched ${news.last_fetched}` : '' }}</p>
    <h1>Industry radar</h1>
    <p style="max-width:680px">
      What is moving in liquid cooling: technology, products, investment and standards.
      Facts policy applies — <b>every item links to its source; nothing is invented</b>.
      The curated timeline below is the durable view; dated items rotate.
    </p>

    <h2>Milestones — the industry so far</h2>
    <figure class="fig" style="margin-inline:0">
      <table style="max-width:760px">
        <tr><th>Year</th><th>Milestone</th></tr>
        <tr v-for="m in news.milestones" :key="m.date + m.title">
          <td style="white-space:nowrap"><b>{{ m.date }}</b></td>
          <td>
            {{ m.title }} ·
            <a :href="m.source">{{ m.source.startsWith('http') ? 'source ↗' : 'on this site' }}</a>
          </td>
        </tr>
      </table>
      <figcaption><b>FIG. 1</b> — Curated timeline: the events that redirected rack liquid cooling. Hand-maintained; corrections welcome via the changelog.</figcaption>
    </figure>

    <h2>Dated items</h2>
    <div class="chips" style="margin-bottom:18px">
      <button v-for="c in channels" :key="c.id" class="chip" :class="{ on: chan === c.id }" @click="chan = c.id">
        {{ c.label }}<span v-if="c.id !== 'all'" class="cnt">{{ count(c.id) }}</span>
      </button>
    </div>

    <div v-for="it in shown" :key="it.url + it.date" class="newsitem">
      <div class="nmeta">
        <span class="ndate">{{ it.date }}</span>
        <span class="nchan" :class="it.channel">{{ it.channel }}</span>
        <span class="nsrc">{{ it.source }}</span>
      </div>
      <a :href="it.url" class="ntitle">{{ it.title }} <span v-if="it.url.startsWith('http')">↗</span></a>
      <p class="nnote">{{ it.note }}</p>
    </div>
    <p v-if="!shown.length" class="src">No items in this channel yet.</p>

    <h2>How this page works</h2>
    <ul>
      <li><b>Sourcing:</b> public announcements, standards bodies and vendor pages — each item carries its source link. We store titles, links and short notes only; full text stays with the publisher.</li>
      <li><b>Automation:</b> 🚧 under construction until deployment — the RSS pipeline (<span class="mono-src">scripts/fetch-news.mjs</span>, daily GitHub Actions cron) activates when the site is hosted; until then this page is hand-curated. Machine items will merge in daily, deduplicated and channel-tagged; hand-curated entries are always preserved.</li>
      <li><b>Feed:</b> machine-readable version at <a href="/newsfeed.xml">/newsfeed.xml</a>.</li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import news from '~/data/news.json'
useSeo({
  title: 'Liquid cooling industry radar — news, milestones, standards',
  description: 'What is moving in data center liquid cooling: a curated industry timeline (STULZ×CoolIT 2018, ASHRAE W-classes, 3M PFAS exit, GB200-era 120 kW racks, OCP ORv3, SS 726:2026) plus dated items across technology, products, investment and standards — every entry sourced.'
})
useArticle({
  path: '/news',
  title: 'Industry radar',
  description: 'Liquid cooling news and the curated milestone timeline.',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

const channels = [
  { id: 'all', label: 'All' },
  { id: 'technology', label: 'Technology' },
  { id: 'product', label: 'Products' },
  { id: 'investment', label: 'Investment' },
  { id: 'standards', label: 'Standards' }
]
const chan = ref('all')
const count = (id: string) => news.items.filter(i => i.channel === id).length
const shown = computed(() =>
  [...news.items]
    .filter(i => chan.value === 'all' || i.channel === chan.value)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
)

useFaq([
  {
    q: 'What are the biggest milestones in data center liquid cooling?',
    a: 'The arc runs: turnkey liquid micro-cabinets appear (STULZ × CoolIT, 2018); ASHRAE codifies coolant temperature classes W17-W45 (2019); 3M announces and then completes its PFAS exit (2022-2025), redirecting fluid choices toward PG25 water-glycol; NVIDIA\u2019s GB200 NVL72 mainstreams ~120 kW liquid-cooled racks (2024); OCP standardizes blind-mate manifolds (ORv3 Rev 1.0, 2024); and Singapore publishes SS 726:2026, the first national standard for tropical liquid cooling.'
  },
  {
    q: 'Why did 3M stop making liquid cooling fluids?',
    a: '3M announced in December 2022 that it would exit all PFAS manufacturing by the end of 2025, driven by tightening global regulation of per- and polyfluoroalkyl substances, and completed the exit on schedule. Its Novec fluorinated fluids were widely used in immersion and two-phase cooling — the exit pushed the industry toward water-glycol (PG25) for direct-to-chip and accelerated re-evaluation of immersion fluid chemistry.'
  }
])
</script>

<style scoped>
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip { font-family: ui-monospace, monospace; font-size: 12px; letter-spacing: 0.04em; background: var(--panel); border: 1px solid var(--line); padding: 6px 12px; cursor: pointer; color: var(--text2); border-radius: 2px; }
.chip.on { border-color: var(--cool); color: var(--cool); font-weight: 600; }
.chip .cnt { margin-left: 6px; opacity: 0.7; }
.newsitem { border-left: 3px solid var(--line); padding: 2px 0 2px 14px; margin-bottom: 22px; max-width: 760px; }
.nmeta { font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 0.05em; color: var(--text2); display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 3px; }
.nchan { text-transform: uppercase; }
.nchan.technology { color: var(--cool); }
.nchan.product { color: var(--warn); }
.nchan.investment { color: #b18cff; }
.nchan.standards { color: var(--ok); }
.ntitle { font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif; font-size: 16.5px; font-weight: 600; text-decoration: none; display: block; }
.ntitle:hover { text-decoration: underline; }
.nnote { font-size: 14px; color: var(--text2); margin: 4px 0 0; font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif; }
.mono-src { font-family: ui-monospace, monospace; font-size: 12.5px; }
</style>
