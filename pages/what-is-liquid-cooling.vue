<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Updated 2026-09-09 · 4 min read</p>
    <h1>What is liquid cooling?</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>Key takeaways</h3>
        <p>
          Liquid cooling (direct-to-chip, "DLC") moves heat away from CPUs and GPUs with a water-glycol loop through
          metal plates mounted on the chips, capturing 60-80% of server heat far more efficiently than air.
          A cabinet-level system has four parts: cold plates, a CDU (coolant distribution unit), a rack manifold, and
          dripless quick-disconnect couplings standardized by the Open Compute Project.
          Liquid cooling does not eliminate heat — it relocates it, so the deployment room still needs about 1.1×
          the IT load in air-conditioning capacity.
        </p>
      </div>
    </div>

    <h2>The one-sentence version</h2>
    <p>
      Instead of blowing air over heatsinks, liquid cooling moves heat away with a fluid loop —
      water-glycol through metal plates mounted directly on the chips (direct-to-chip, "DLC"),
      which captures 60-80% of server heat far more efficiently than air ever can.
    </p>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/rack-cabinet.png" alt="Liquid-cooled server rack with open side door showing coolant manifold and blue hoses" loading="lazy" style="width:100%;max-width:640px;display:block;border:1px solid var(--rule)" />
      <figcaption><b>PLATE 1</b> — A liquid-cooled rack: servers, vertical manifold, supply/return hoses. AI-generated illustration (Z-Image Turbo) — representative, not a specific product.</figcaption>
    </figure>

    <h2>The four parts</h2>
    <figure class="fig" style="margin-inline:0">
      <table>
        <tr><th>Part</th><th>What it does</th></tr>
        <tr><td><strong>Cold plate</strong></td><td>Metal block bolted to the CPU/GPU; fluid channels inside pick up heat directly</td></tr>
        <tr><td><strong>CDU</strong> (coolant distribution unit)</td><td>Pumps fluid around and hands heat to a heat sink — either facility water (liquid-to-liquid) or room air (liquid-to-air, "L2A")</td></tr>
        <tr><td><strong>Manifold</strong></td><td>The rack's supply/return spine; good ones are <em>blind-mate</em> — servers connect by sliding in</td></tr>
        <tr><td><strong>Quick disconnects (UQD)</strong></td><td>Dripless couplings standardized by the Open Compute Project, so parts interoperate across vendors</td></tr>
      </table>
      <figcaption><b>FIG. 1</b> — The four components of a direct-to-chip loop, in the order coolant visits them.</figcaption>
    </figure>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/manifold-vert.png" alt="Vertical rack coolant manifold with blind-mate supply and return ports" loading="lazy" style="width:100%;max-width:560px;display:block;border:1px solid var(--rule)" />
      <figcaption><b>PLATE 2</b> — The rack manifold: two headers and a column of blind-mate ports. AI-generated illustration (Z-Image Turbo) — representative, not a specific product.</figcaption>
    </figure>

    <h2>The fluid</h2>
    <figure class="fig" style="margin-inline:0">
      <img src="/img/cfd-coldplate.gif" alt="Animated CFD simulation of fluid flowing through a cold plate" style="width:100%;max-width:560px;display:block;background:var(--panel);border:1px solid var(--line)" loading="lazy" />
      <figcaption><b>FIG. 3</b> — CFD simulation of coolant flowing through a cold plate's internal channels. Credit: Heatlord, CC BY-SA 3.0, via Wikimedia Commons.</figcaption>
    </figure>

    <p>
      Small systems typically use PG25 (75% water / 25% propylene glycol): cheap, non-flammable, and free of the
      PFAS regulatory storm hitting fluorinated fluids — 3M exited that chemistry entirely at the end of 2025.
    </p>

    <h2>What liquid cooling does NOT do</h2>
    <p>
      It does not destroy heat; it moves it. Liquid-to-air cabinets dump heat into the room, so the room still
      needs air conditioning sized for ~1.1× the IT load. Anyone telling you otherwise is selling, not engineering.
    </p>

    <figure class="fig" style="margin-inline:0">
      <svg viewBox="0 0 720 190" role="img" aria-label="Coolant loop schematic: cold plates to manifold to CDU, heat rejected to room air or facility water" style="width:100%;height:auto;background:var(--panel);border:1px solid var(--line)">
        <defs><marker id="g-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--cool)" /></marker></defs>
        <g v-for="i in 3" :key="i">
          <rect :x="20" :y="18 + (i-1)*46" width="150" height="34" fill="var(--bg2)" stroke="var(--text)" stroke-width="1.5" />
          <rect :x="30" :y="24 + (i-1)*46" width="46" height="22" fill="var(--panel2)" stroke="var(--cool)" stroke-width="1.5" />
          <text x="36" :y="39 + (i-1)*46" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--text)">COLD PLATE</text>
          <text x="84" :y="39 + (i-1)*46" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--text2)">CPU / GPU</text>
        </g>
        <path d="M170 35 H250" stroke="var(--cool)" stroke-width="2" marker-end="url(#g-arr)" />
        <path d="M250 60 L190 60" stroke="var(--cool)" stroke-width="2" stroke-dasharray="4 3" />
        <text x="188" y="54" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--cool)">RETURN ↑</text>
        <text x="196" y="30" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--cool)">SUPPLY ↓</text>
        <rect x="250" y="18" width="26" height="140" fill="var(--panel)" stroke="var(--text)" stroke-width="2" />
        <text x="259" y="90" font-family="IBM Plex Mono, monospace" font-size="9" fill="var(--text)" writing-mode="tb" letter-spacing="2">MANIFOLD</text>
        <rect x="330" y="45" width="170" height="90" fill="var(--panel)" stroke="var(--text)" stroke-width="2" />
        <circle cx="365" cy="90" r="15" fill="none" stroke="var(--text)" stroke-width="2" />
        <path d="M365 78 l0 24 M358 85 l14 10 M372 85 l-14 10" stroke="var(--text)" stroke-width="1.8" fill="none" />
        <text x="345" y="122" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--text2)">PUMP · HX · CTRL</text>
        <text x="388" y="80" font-family="IBM Plex Mono, monospace" font-size="10" fill="var(--text)">CDU</text>
        <path d="M276 60 H330" stroke="var(--cool)" stroke-width="2" marker-end="url(#g-arr)" />
        <path d="M330 120 H276" stroke="var(--cool)" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#g-arr)" />
        <path d="M500 75 H560" stroke="var(--text)" stroke-width="2" />
        <g stroke="var(--heat)" stroke-width="2" fill="none">
          <path d="M575 60 q7 -9 0 -18" /><path d="M590 60 q7 -9 0 -18" />
          <path d="M575 95 q7 -9 0 -18" /><path d="M590 95 q7 -9 0 -18" />
        </g>
        <text x="545" y="130" font-family="IBM Plex Mono, monospace" font-size="9" fill="var(--heat)">HEAT OUT</text>
        <text x="530" y="150" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="var(--text2)">→ ROOM AIR (L2A)</text>
        <text x="530" y="163" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="var(--text2)">→ FACILITY WATER (L2L)</text>
        <text x="20" y="182" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="var(--text2)">TCS = CLEAN SERVER LOOP (PG25) · FWS = FACILITY WATER · CDU KEEPS THEM SEPARATE</text>
      </svg>
      <figcaption><b>FIG. 2</b> — The coolant loop. Blue solid = supply, dashed = return; red = rejected heat. The CDU isolates the clean server loop (TCS) from the facility side (FWS).</figcaption>
    </figure>

    <h2 id="try-the-loop">Try the loop</h2>
    <p style="max-width:680px">
      Everything above, live: drag the load, the capture ratio, the room and the coolant — watch the flow
      speed, the heat out and the capacity verdict react. Same physics as the
      <NuxtLink to="/playground">playground tools</NuxtLink>, embedded right where you are reading.
    </p>
    <LoopSim />

    <h2>Frequently asked questions</h2>
    <div v-for="f in faqs" :key="f.q" style="margin-bottom:18px">
      <h3 style="margin-bottom:4px; font-size:17px">{{ f.q }}</h3>
      <p style="margin:0">{{ f.a }}</p>
    </div>

    <h2>Standards worth knowing</h2>
    <p class="src">
      OCP Cooling Environments (UQD, ORv3 blind-mate manifold specs) · ASHRAE liquid cooling guidelines (W-classes) ·
      IEC 62368-1 Ed.4 (electrical safety incl. liquid-cooling clauses) · SS 726:2026 (tropical liquid cooling, Singapore).
    </p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'What is liquid cooling?',
  description: 'Direct-to-chip liquid cooling explained: cold plates, CDUs, manifolds, UQD quick disconnects, PG25 fluid, and the relevant standards (OCP, ASHRAE, IEC, SS 726).'
})
useArticle({
  path: '/what-is-liquid-cooling',
  title: 'What is liquid cooling?',
  description: 'Direct-to-chip liquid cooling explained without vendor spin.'
})

const faqs = [
  {
    q: 'What is liquid cooling?',
    a: 'Liquid cooling is a heat removal method that circulates a water-glycol fluid through metal plates (cold plates) mounted directly on CPUs and GPUs, absorbing chip heat and carrying it to a coolant distribution unit, which hands it off to facility water or room air. In data centers it usually means direct-to-chip (DLC) cooling, not full immersion.'
  },
  {
    q: 'What are the main components of a liquid cooling system?',
    a: 'Four parts: cold plates on the chips, a CDU (coolant distribution unit) that pumps the loop and rejects heat, a rack manifold that distributes supply and return lines, and dripless quick-disconnect (UQD) couplings standardized by the Open Compute Project so components interoperate across vendors.'
  },
  {
    q: 'What coolant fluid is used in direct liquid cooling?',
    a: 'Small direct-to-chip systems typically use PG25 — a mixture of 75% water and 25% propylene glycol. It is cheap, non-flammable and PFAS-free, unlike fluorinated fluids, which face tightening global PFAS regulation (3M exited fluorinated fluid production at the end of 2025).'
  },
  {
    q: 'Does liquid cooling remove the need for air conditioning?',
    a: 'No. Liquid cooling moves heat; it does not eliminate it. A liquid-to-air (L2A) cabinet rejects heat into the room, so the room needs air conditioning sized for roughly 1.1× the IT load. Liquid-to-liquid systems move the requirement to facility water loops and dry coolers instead.'
  },
  {
    q: 'Which standards apply to liquid cooling in data centers?',
    a: 'The Open Compute Project (OCP) specifies UQD quick disconnects and ORv3 blind-mate manifolds; ASHRAE defines coolant temperature classes (W-series); IEC 62368-1 Edition 4 covers electrical safety including liquid-cooling clauses; and Singapore\u2019s SS 726:2026 is the first national standard for liquid cooling in tropical climates.'
  }
]
useFaq(faqs)
</script>
