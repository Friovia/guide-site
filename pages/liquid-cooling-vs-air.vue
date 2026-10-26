<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Updated 2026-09-09 · 4 min read</p>
    <h1>Liquid cooling vs air: where the crossover really is</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>Key takeaways</h3>
        <p>
          The widely quoted "liquid wins above 30-40 kW per rack" threshold traces to vendor marketing, not primary
          research — the crossover is decided by physics: liquid becomes necessary when heat per rack exceeds what
          room air can carry away.
          A liquid-to-air (L2A) cabinet's cooling capacity falls as room temperature rises, and vendors almost never
          publish derating curves — ask for them and a room-load worksheet before buying.
          In tropical climates the binding constraint is the building's air conditioning: it must absorb roughly
          1.1× the cabinet's full IT load.
        </p>
      </div>
    </div>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/dc-hall.png" alt="Data center hall with rows of tall server racks" loading="lazy" style="width:100%;max-width:680px;display:block;border:1px solid var(--rule)" />
      <figcaption><b>PLATE 1</b> — The room every kW has to leave: rack rows and the air that carries (or fails to carry) the heat. AI-generated illustration (Z-Image Turbo) — representative, not a specific facility.</figcaption>
    </figure>

    <h2>The honest answer about "when liquid becomes necessary"</h2>
    <p>
      Widely quoted figures ("liquid wins above 30-40 kW per rack") mostly trace back to vendor marketing, not
      primary research. The only robust published finding (Schneider WP282) is that at equal 10 kW/rack density,
      immersion and air CapEx are comparable — at data-center scale. For small rooms, physics decides instead:
      <strong>when heat per rack exceeds what room air can carry away, you have no choice.</strong> That point arrives
      earlier than most people think once GPUs enter the room.
    </p>

    <h2>The tropical catch</h2>
    <p>
      A liquid-to-air (L2A) cabinet's capacity falls as room temperature rises — capacity tracks the temperature
      difference between coolant and room air. Derating curves are almost never published (Vertiv's XDU070
      application guide is a rare exception). In tropical climates, every building runs AC, so the practical
      question is not "35°C air" but <em>"can this room's AC absorb 1.1× the IT load?"</em> Ask any vendor for a
      capacity-vs-ambient curve and a room-load worksheet before purchasing — if they can't produce them, walk.
    </p>

    <h2>What PUE comparisons assume</h2>
    <p class="src">
      Published PUE gains (air ~1.5 → liquid 1.1-1.2) assume facility water loops and dry coolers at data-center
      scale. A single L2A cabinet in an office depends on the building AC's efficiency for its final numbers.
      Singapore's Green DC roadmap and SS 726:2026 are the best public references for hot-climate design.
    </p>

    <h2>Rule of thumb</h2>
    <table>
      <tr><th>Your situation</th><th>Reasonable default</th></tr>
      <tr><td>&lt; 10 kW total, comfort AC</td><td>Air cooling is fine</td></tr>
      <tr><td>10-20 kW in a normal room</td><td>Borderline — run the room-load numbers first</td></tr>
      <tr><td>20-50 kW, GPU servers, no machine room</td><td>Liquid-cooled cabinet territory</td></tr>
      <tr><td>50 kW+ multiple racks</td><td>Rack-scale DLC with proper facility design</td></tr>
    </table>

    <h2>Frequently asked questions</h2>
    <div v-for="f in faqs" :key="f.q" style="margin-bottom:18px">
      <h3 style="margin-bottom:4px; font-size:17px">{{ f.q }}</h3>
      <p style="margin:0">{{ f.a }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Liquid cooling vs air cooling',
  description: 'When liquid cooling becomes necessary (and the 30 kW crossover myth), tropical-climate derating physics, room AC load math, and what PUE comparisons actually assume.'
})
useArticle({
  path: '/liquid-cooling-vs-air',
  title: 'Liquid cooling vs air: where the crossover really is',
  description: 'Physics-based guidance on choosing between air and liquid cooling for small server rooms.'
})

const faqs = [
  {
    q: 'When is liquid cooling necessary?',
    a: 'Liquid cooling becomes necessary when heat per rack exceeds what the room\u2019s air can carry away — in practice, once GPU servers push a small room past roughly 20 kW total. Below ~10 kW with comfort air conditioning, air cooling remains fine; between 10 and 20 kW, run a room heat-load calculation before deciding.'
  },
  {
    q: 'Is liquid cooling better than air cooling?',
    a: 'Not universally. Liquid cooling captures 60-80% of server heat at the chip and enables much higher rack density, but it adds components (cold plates, CDU, manifolds, couplings) and still relies on the building\u2019s air conditioning or a facility water loop to reject the heat. For low-density rooms it is added cost without benefit.'
  },
  {
    q: 'Does liquid cooling work in hot or tropical climates?',
    a: 'Yes, with a caveat. A liquid-to-air cabinet\u2019s capacity decreases as room temperature rises, because capacity follows the temperature difference between coolant and room air. In the tropics the practical requirement is that the room\u2019s air conditioning can absorb about 1.1× the cabinet\u2019s full IT load. Singapore\u2019s SS 726:2026 is the first national standard addressing liquid cooling in tropical climates.'
  },
  {
    q: 'How much air conditioning does a liquid cooling cabinet need?',
    a: 'For a liquid-to-air (L2A) cabinet, the deployment room needs roughly 1.1× the IT load in cooling capacity — e.g. a 30 kW cabinet needs about 33 kW (roughly 9-10 tons) of available AC capacity. Vendors should provide a room-load worksheet; treat the inability to produce one as a red flag.'
  }
]
useFaq(faqs)
</script>
