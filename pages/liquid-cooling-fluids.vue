<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Updated 2026-09-09 · 4 min read</p>
    <h1>Liquid cooling fluids: PG25, oils and the PFAS problem</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>Key takeaways</h3>
        <p>
          Direct-to-chip systems overwhelmingly use PG25 — 75% water / 25% propylene glycol — which is cheap,
          non-flammable (flash point ~109°C), non-hazardous to ship, and contains no PFAS.
          Fluorinated fluids (the Novec-style chemistries used in two-phase immersion) are PFAS "forever chemicals"
          facing an EU restriction and US reporting rules — and 3M, the leading producer, exited the business at the
          end of 2025.
          For buyers this means: prefer water-glycol systems for long-term regulatory safety, and check any fluid
          plan for local disposal rules and material compatibility (galvanic corrosion in mixed-metal loops).
        </p>
      </div>
    </div>

    <h2>The three fluid families</h2>
    <table>
      <tr><th>Fluid</th><th>Used in</th><th>PFAS?</th><th>Notes</th></tr>
      <tr><td><strong>PG25 (water + propylene glycol)</strong></td><td>Direct-to-chip cold plates</td><td>No</td><td>Industry default; non-hazardous transport; needs corrosion/biological inhibition and periodic checks</td></tr>
      <tr><td><strong>Hydrocarbon / silicone oils</strong></td><td>Single-phase immersion</td><td>No</td><td>Not PFAS, but heavy, messy, flammability classes vary, and handling drives OPEX</td></tr>
      <tr><td><strong>Fluorinated fluids (HFE/PFPE)</strong></td><td>Two-phase immersion, some single-phase</td><td><strong>Yes</strong></td><td>EU restriction in progress; US TSCA reporting; 3M exited end-2025 — supply and regulatory risk</td></tr>
    </table>

    <h2>Why PFAS matters to a cooling buyer</h2>
    <p>
      Per- and polyfluoroalkyl substances (PFAS) are persistent environmental chemicals under active restriction:
      the EU's REACH restriction proposal would dramatically limit their use, and US EPA TSCA rules impose
      reporting. A cooling system built around a restricted fluid risks stranded chemistry — no refill supply,
      forced retrofits, disposal liabilities. Water-glycol loops avoid this entire class of risk, which is one
      reason direct-to-chip with PG25 became the mainstream architecture.
    </p>

    <h2>Maintaining a PG25 loop</h2>
    <ul>
      <li>Concentration checks (refractometer) and top-ups on schedule.</li>
      <li>Inhibitor packages matter: mixed-metal loops (copper + aluminum) corrode without them.</li>
      <li>Biological growth is possible in poorly maintained loops — schedule sampling.</li>
      <li>Disposal is ordinary industrial wastewater in most jurisdictions — but verify locally.</li>
    </ul>

    <h2>Frequently asked questions</h2>
    <div v-for="f in faqs" :key="f.q" style="margin-bottom:18px">
      <h3 style="margin-bottom:4px; font-size:17px">{{ f.q }}</h3>
      <p style="margin:0">{{ f.a }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Liquid cooling fluids: PG25 vs fluorinated (PFAS)',
  description: 'PG25 water-glycol vs immersion oils vs fluorinated fluids: PFAS regulation, 3M\u2019s exit, transport and disposal rules, and what a buyer should specify.'
})
useArticle({ path: '/liquid-cooling-fluids', title: 'Liquid cooling fluids: PG25, oils and the PFAS problem', description: 'Fluid chemistry as a buying decision.' })

const faqs = [
  {
    q: 'Is liquid cooling fluid toxic?',
    a: 'The dominant direct-to-chip fluid, PG25 (75% water / 25% propylene glycol), is low-toxicity and non-hazardous to transport — propylene glycol is the same base used in food-grade antifreeze. Fluorinated immersion fluids are a different matter: they are PFAS chemicals under active regulatory restriction. Oils are generally low-toxicity but messy to handle.'
  },
  {
    q: 'Why did 3M stop making liquid cooling fluids?',
    a: '3M announced it would exit per- and polyfluoroalkyl substance (PFAS) manufacturing by the end of 2025, including the Novec-line fluorinated fluids used in two-phase immersion cooling. The exit follows PFAS litigation and global regulatory pressure (EU restriction proposal, US reporting rules), and it materially weakened the supply outlook for fluorinated-fluid immersion systems.'
  },
  {
    q: 'What is PG25 coolant?',
    a: 'PG25 is a mixture of 75% water and 25% propylene glycol, the standard thermal fluid for direct-to-chip liquid cooling. It is cheap, has a high flash point (about 109°C), ships as non-hazardous cargo, and contains no PFAS. It requires corrosion inhibitors and periodic concentration/microbial checks.'
  }
]
useFaq(faqs)
</script>
