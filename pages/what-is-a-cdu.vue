<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Updated 2026-09-09 · 4 min read</p>
    <h1>What is a CDU (coolant distribution unit)?</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>Key takeaways</h3>
        <p>
          A CDU (coolant distribution unit) is the heart of a rack liquid cooling system: it pumps coolant through
          the cold plates on servers and transfers the captured heat to a final heat sink — either facility water
          (liquid-to-liquid) or room air (liquid-to-air).
          Liquid-to-air CDUs make cabinets facility-free but their capacity derates as room temperature rises;
          liquid-to-liquid CDUs handle far more power but need building water loops.
          A CDU also isolates the clean server loop from facility water, filters the coolant, and controls
          temperature, flow and pressure.
        </p>
      </div>
    </div>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/cdu-inrow.png" alt="In-row coolant distribution unit in a data center aisle" loading="lazy" style="width:100%;max-width:640px;display:block;border:1px solid var(--rule)" />
      <figcaption><b>PLATE 1</b> — An in-row CDU between racks: pumps, heat exchanger and controls behind one service panel. AI-generated illustration (Z-Image Turbo) — representative, not a specific product. For the real thing, see the TSUBAME3.0 photo below.</figcaption>
    </figure>

    <h2>What it actually does</h2>
    <p>
      Every direct-to-chip system has two loops. The <strong>technology cooling system (TCS)</strong> is the clean,
      closed loop flowing through server cold plates. The <strong>facility water system (FWS)</strong> is the
      building's water. The CDU sits between them: pumps drive the TCS loop, a plate heat exchanger hands heat to
      the FWS (or to a fan-driven radiator in liquid-to-air units), and instrumentation keeps coolant temperature,
          flow rate and pressure inside spec — protecting the servers from whatever is happening on the facility side.
    </p>

    <h2>The three form factors</h2>
    <table>
      <tr><th>Form</th><th>Where it lives</th><th>Typical reach</th></tr>
      <tr><td><strong>In-rack CDU</strong></td><td>Inside the cabinet (a few U)</td><td>One rack — the micro-DC pattern</td></tr>
      <tr><td><strong>In-row CDU</strong></td><td>Standing between racks</td><td>A row of racks (70-350 kW class)</td></tr>
      <tr><td><strong>Facility CDU</strong></td><td>A plant room</td><td>A whole data hall</td></tr>
    </table>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/tsubame-cdu.jpg" alt="Liquid-cooled racks with cooling distribution at the TSUBAME3.0 supercomputer" style="width:100%;max-width:640px;display:block;background:var(--panel);border:1px solid var(--line)" loading="lazy" />
      <figcaption><b>FIG. 1</b> — Liquid-cooled racks with distribution plumbing at the TSUBAME3.0 supercomputer (Tokyo Tech). Credit: Kestrel, CC BY-SA 4.0, via Wikimedia Commons.</figcaption>
    </figure>

    <h2>Liquid-to-air vs liquid-to-liquid</h2>
    <p>
      Liquid-to-air (L2A) CDUs — sometimes "sidecar" units — blow the heat into the room, trading peak capacity for
      zero plumbing: nothing to connect outside the cabinet. Liquid-to-liquid (L2L) CDUs connect to facility water
      and scale to hundreds of kW per unit, but a room without a water loop cannot use them at all.
      For hospitals, universities and edge sites, that is usually the whole decision.
    </p>

    <h2>Buying questions</h2>
    <ul>
      <li>Capacity at <em>your</em> room temperature, not at 25°C lab conditions — ask for the derating curve.</li>
      <li>Pump redundancy (single pump = single point of failure for the whole rack).</li>
      <li>Coolant filtration and chemistry management (PG25 systems need it too).</li>
      <li>Alarm and telemetry interfaces — remote sites live or die by monitoring.</li>
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
  title: 'What is a CDU (coolant distribution unit)?',
  description: 'CDU explained: pumps, heat exchangers, TCS vs facility loops, in-rack/in-row/facility form factors, and liquid-to-air vs liquid-to-liquid trade-offs.'
})
useArticle({ path: '/what-is-a-cdu', title: 'What is a CDU (coolant distribution unit)?', description: 'The component at the heart of rack liquid cooling.' })

const faqs = [
  {
    q: 'What does a CDU do in liquid cooling?',
    a: 'A coolant distribution unit (CDU) circulates coolant through the cold plates mounted on servers and transfers the absorbed heat to a final heat sink. It also isolates the clean server loop from facility water, filters coolant, and regulates temperature, flow and pressure to keep servers safe.'
  },
  {
    q: 'What is the difference between liquid-to-air and liquid-to-liquid CDUs?',
    a: 'Liquid-to-air (L2A) CDUs reject heat into room air via fans and a radiator — no building water needed, but capacity falls as room temperature rises. Liquid-to-liquid (L2L) CDUs exchange heat with a facility water loop and scale far higher, but require the building to have chilled or tempered water infrastructure.'
  },
  {
    q: 'Do I need a CDU for a single cabinet?',
    a: 'For direct-to-chip cooling, yes — some device must pump the loop and reject the heat. In single-cabinet deployments the CDU is usually built into the cabinet itself (in-rack CDU), which is what makes a "liquid cooling cabinet" self-contained.'
  }
]
useFaq(faqs)
</script>
