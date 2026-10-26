<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Updated 2026-09-09 · 5 min read</p>
    <h1>Liquid cooling standards, explained</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>Key takeaways</h3>
        <p>
          Four families of standards govern rack liquid cooling: OCP defines the interconnects (UQD quick
          disconnects, ORv3 blind-mate manifolds); ASHRAE defines coolant temperature classes (W17-W45);
          IEC 62368-1 Edition 4 sets electrical safety including dedicated liquid-cooling clauses; and Singapore's
          SS 726:2026 is the first national standard for liquid cooling in tropical climates — but it applies to
          direct-to-chip systems inside data centers and explicitly excludes indirect cooling.
          If you are buying, the practical checklist is: UQD-compliant couplings, a stated W-class, IEC 62368-1
          Ed.4 safety certification, and honest derating data for your climate.
        </p>
      </div>
    </div>

    <h2>The map</h2>
    <table>
      <tr><th>Body / standard</th><th>What it covers</th><th>Why you care</th></tr>
      <tr>
        <td><strong>OCP — Cooling Environments</strong><br><span class="src">opencompute.org</span></td>
        <td>UQD quick-disconnect specs; ORv3 blind-mate manifold spec (Rev 1.0, 2024); cold plate and rack guidelines</td>
        <td>Interoperability: parts from different vendors physically connect</td>
      </tr>
      <tr>
        <td><strong>ASHRAE Liquid Cooling Guidelines</strong></td>
        <td>Coolant supply temperature classes: W17 (+17°C) … W45 (+45°C); associated facility guidance</td>
        <td>Warmer classes (W32+) save energy; your equipment must be rated for the class you run</td>
      </tr>
      <tr>
        <td><strong>IEC 62368-1 Ed.4</strong></td>
        <td>Electrical safety of IT equipment; Edition 4 adds requirements for liquid-cooled systems (Clause 4.1.8: liquids, leak containment, pressure tests)</td>
        <td>The basis of CB/CE/UL safety certification — ask for it by edition</td>
      </tr>
      <tr>
        <td><strong>SS 726:2026 (Singapore)</strong></td>
        <td>Design/deploy/operate liquid cooling in tropical data centers; direct-to-chip single-phase scope</td>
        <td>First tropical standard; note its scope: it excludes indirect cooling (e.g. rear-door heat exchangers) and does not cover standalone edge cabinets</td>
      </tr>
    </table>

    <h2>Reading between the lines</h2>
    <p>
      Standards are also a buying weapon. A vendor claiming "data-center grade" should be able to point at:
      which OCP spec their couplings comply with, which ASHRAE W-class their servers operate at, an
      IEC 62368-1 <em>Ed.4</em> certificate (Edition 3 predates the liquid clauses), and — in hot climates —
      capacity data at realistic ambient temperatures. Vague answers to any of these are a signal.
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
  title: 'Liquid cooling standards explained (OCP, ASHRAE, IEC 62368-1, SS 726)',
  description: 'The four standard families governing rack liquid cooling — OCP interconnects, ASHRAE W-classes, IEC 62368-1 Ed.4 safety, SS 726 tropical — and the buying checklist they imply.'
})
useArticle({ path: '/liquid-cooling-standards', title: 'Liquid cooling standards, explained', description: 'OCP, ASHRAE, IEC 62368-1 and SS 726 mapped to buying decisions.' })

const faqs = [
  {
    q: 'What is the ASHRAE W-class in liquid cooling?',
    a: 'ASHRAE defines coolant supply temperature classes for liquid-cooled equipment: W17 through W45, where the number is the maximum supply water temperature in °C. Warmer classes (W32, W40, W45) allow facility cooling without chillers in many climates, saving large amounts of energy — but both servers and CDUs must be rated to operate at those temperatures.'
  },
  {
    q: 'What is a UQD quick disconnect?',
    a: 'UQD (Universal Quick Disconnect) is a family of dripless coolant couplings specified by the Open Compute Project. Compliance means couplings from different vendors connect and seal correctly — the piece that makes an "open ecosystem" of racks, manifolds and servers physically possible. The related UQDB adds blind-mate geometry for slide-in servers.'
  },
  {
    q: 'Does SS 726 apply to edge cabinets?',
    a: 'No. Singapore\u2019s SS 726:2026 covers direct-to-chip single-phase liquid cooling inside data centers — from IT equipment through CDUs to facility water. It explicitly excludes indirect cooling approaches (such as rear-door heat exchangers) and does not address standalone edge cabinets. It is still valuable as the first national framework for hot-climate liquid cooling.'
  }
]
useFaq(faqs)
</script>
