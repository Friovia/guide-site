<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Updated 2026-09-09 · 5 min read</p>
    <h1>Cold plate vs immersion cooling</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>Key takeaways</h3>
        <p>
          Cold plate (direct-to-chip) cooling circulates water-glycol through metal plates on the chips — it keeps
          60-80% of server heat out of the room while leaving the server serviceable; immersion bathing whole
          servers in dielectric fluid captures nearly all heat but changes everything: hardware warranty, fluids,
          maintenance and weight.
          Immersion dominates mining and some hyperscale niches; direct-to-chip is what the mainstream
          (NVIDIA's own rack designs, OCP specs, essentially all server OEM roadmaps) has standardized on.
          For small deployments, cold plate is the pragmatic default — serviceability and standards matter more
          than the last 20% of heat capture.
        </p>
      </div>
    </div>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/immersion-tank.png" alt="Immersion cooling tank with server blades submerged in clear dielectric fluid" loading="lazy" style="width:100%;max-width:640px;display:block;border:1px solid var(--rule)" />
      <figcaption><b>PLATE 1</b> — Single-phase immersion: blades bathed in dielectric fluid. AI-generated illustration (Z-Image Turbo) — representative, not a specific product; real systems photographed below.</figcaption>
    </figure>

    <h2>How each works</h2>
    <p>
      <strong>Cold plate / direct-to-chip (DLC):</strong> metal plates with internal channels are bolted onto CPUs and
      GPUs. Water-glycol (typically PG25) flows through, picks up heat at the source, and the rest of the server is
      still air-cooled for memory, drives and VRMs. Servers look almost normal and can be pulled and serviced like
      any other server (via dripless quick disconnects).
      <br><br>
      <strong>Immersion:</strong> entire servers are submerged in a dielectric fluid — single-phase oils or
      two-phase fluorinated fluids that boil on hot surfaces. Heat capture approaches 100% and PUE can reach ~1.05,
      but you are managing tanks of fluid, crane-and-rail maintenance, specialist hardware, and fluid chemistry.
    </p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:680px" class="figrow">
      <figure class="fig" style="margin-inline:0">
        <img src="/img/asperitas-immersion.jpg" alt="Asperitas AIC24 immersion cooling system" style="width:100%;display:block;background:var(--panel);border:1px solid var(--line)" loading="lazy" />
        <figcaption><b>FIG. 1</b> — Commercial single-phase immersion system (Asperitas AIC24). Credit: Rolf Brink, CC BY-SA 4.0.</figcaption>
      </figure>
      <figure class="fig" style="margin-inline:0">
        <img src="/img/immersion-single.jpg" alt="A single server immersed in dielectric fluid" style="width:100%;display:block;background:var(--panel);border:1px solid var(--line)" loading="lazy" />
        <figcaption><b>FIG. 2</b> — A single server immersed in dielectric fluid. Credit: Submer, CC BY-SA 4.0.</figcaption>
      </figure>
    </div>

    <h2>Head-to-head</h2>
    <table>
      <tr><th></th><th>Cold plate (DLC)</th><th>Immersion</th></tr>
      <tr><td>Heat captured</td><td>60-80% (rest is air)</td><td>~95-100%</td></tr>
      <tr><td>Fluid</td><td>Water-glycol (PG25), PFAS-free</td><td>Oils, or fluorinated fluids under PFAS pressure</td></tr>
      <tr><td>Server hardware</td><td>Standard "liquid-ready" OEM models exist</td><td>Often needs adaptation / affects warranties</td></tr>
      <tr><td>Serviceability</td><td>Slide-out servers, dripless UQD couplings</td><td>Lift out of tank, drip/drain, hot work</td></tr>
      <tr><td>Standards ecosystem</td><td>OCP UQD/ORv3, ASHRAE W-classes, SS 726</td><td>Fragmented</td></tr>
      <tr><td>Weight per rack</td><td>Normal + coolant</td><td>Tank + fluid — floor loading is a real constraint</td></tr>
      <tr><td>Small-room practicality</td><td>High</td><td>Low</td></tr>
    </table>

    <h2>The fluid problem, honestly</h2>
    <p>
      Two-phase immersion depends on fluorinated chemistries that fall under global PFAS restriction efforts
      (EU restriction proposal advancing; US TSCA reporting), and 3M — the leading producer — exited
      fluorinated fluid manufacturing at the end of 2025. Single-phase oils sidestep PFAS but bring their own
      handling and cleanliness costs. This regulatory physics is a big part of why the industry converged on
      water-glycol cold plates.
    </p>

    <h2>Frequently asked questions</h2>
    <div v-for="f in faqs" :key="f.q" style="margin-bottom:18px">
      <h3 style="margin-bottom:4px; font-size:17px">{{ f.q }}</h3>
      <p style="margin:0">{{ f.a }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Cold plate vs immersion cooling',
  description: 'Direct-to-chip cold plates vs immersion: heat capture, fluids and PFAS regulation, serviceability, standards, and which one small deployments should choose.'
})
useArticle({ path: '/cold-plate-vs-immersion', title: 'Cold plate vs immersion cooling', description: 'The two liquid cooling architectures compared honestly.' })

const faqs = [
  {
    q: 'Is immersion cooling better than cold plate cooling?',
    a: 'Immersion captures more heat (nearly 100% vs 60-80% for cold plates) and can reach lower PUE, but it demands tank infrastructure, dielectric fluid management, adapted hardware and heavy floor loading. Cold plate / direct-to-chip cooling uses standard liquid-ready servers, dripless quick disconnects, and a mature standards ecosystem (OCP, ASHRAE) — which is why it is the mainstream choice and the pragmatic default for small deployments.'
  },
  {
    q: 'What fluid does immersion cooling use?',
    a: 'Either single-phase dielectric oils (mineral or synthetic hydrocarbons) or two-phase fluorinated fluids. Fluorinated fluids are PFAS "forever chemicals" facing EU restriction and US reporting rules, and 3M stopped making them at the end of 2025 — a major reason the industry shifted toward water-glycol cold plates.'
  },
  {
    q: 'Do cold plates cool the whole server?',
    a: 'No — cold plates sit on the hottest components (CPUs, GPUs, and sometimes voltage regulators). Memory, drives and other parts are still air-cooled, which is why direct-to-chip captures 60-80% of rack heat and the cabinet still manages a residual air stream.'
  }
]
useFaq(faqs)
</script>
