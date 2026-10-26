<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Data layer updated {{ data.updated }} · every row links to its source</p>
    <h1>Small-scale cooling cabinet comparison</h1>
    <p style="max-width:700px">
      Every rack-level cooling product we could verify for micro data center use (≤120 kW class).
      This segment does not publish prices — treat any number a vendor gives you as an opening position.
    </p>

    <figure class="fig" style="margin-inline:0">
      <div style="overflow-x:auto">
        <table>
          <tr>
            <th>Product</th><th>Form</th><th>Cooling</th><th>Power class</th><th>Facility-free?</th><th>Note</th>
          </tr>
          <tr v-for="p in data.products" :key="p.vendor + p.product">
            <td><a :href="p.source" rel="noopener">{{ p.vendor }}<br/><em style="font-size:12.5px">{{ p.product }}</em></a></td>
            <td>{{ p.form }}</td>
            <td>{{ p.cooling }}</td>
            <td>{{ p.power_class }}</td>
            <td>{{ p.facility_free }}</td>
            <td>{{ p.note }}</td>
          </tr>
        </table>
      </div>
      <figcaption><b>FIG. 1</b> — Rack-level cooling products for micro data centers, compiled {{ data.updated }}. Per-row sources: vendor names link to manufacturer pages. Prices unpublished segment-wide (❌).</figcaption>
    </figure>

    <h2>The gap</h2>
    <p style="max-width:700px">{{ data.gap_statement }}</p>

    <h2>Caveats</h2>
    <ul class="src">
      <li v-for="c in data.caveats" :key="c">{{ c }}</li>
    </ul>

    <h2>Looking for a turnkey 20-50 kW cabinet?</h2>
    <p style="max-width:700px">
      This guide stays vendor-neutral. Vendors building in this gap can be found via search;
      we don't endorse listings here. Methodology: manufacturer pages, datasheets and trade press only.
    </p>
  </main>
</template>

<script setup lang="ts">
import data from '~/data/products.json'
useSeo({
  title: 'Small-scale cooling cabinet comparison',
  description: 'Verified comparison of rack-level cooling products for micro data centers — Schneider, Vertiv, STULZ×CoolIT, Rittal, Asetek, nVent: power class, cooling type, facility requirements, per-row sources.'
})
useArticle({
  path: '/cabinet-comparison',
  title: 'Small-scale cooling cabinet comparison',
  description: 'Every verifiable rack-level cooling product for micro data centers, with sources.'
})
</script>
