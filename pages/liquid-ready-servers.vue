<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Updated 2026-09-09 · 4 min read</p>
    <h1>Liquid-ready servers: what to check before you buy</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>Key takeaways</h3>
        <p>
          "Liquid-ready" (DLC-ready) servers ship with factory cold plates and quick disconnects — every major OEM
          (Supermicro, Dell, Lenovo, Gigabyte and others) now sells them across GPU lines.
          Compatibility comes down to five things: which components have cold plates, the coupling standard
          (OCP UQD family), the coolant temperature class (ASHRAE W-class) the server accepts, required flow and
          pressure, and the physical manifold interface.
          Insisting on OCP-standard interfaces is what keeps you vendor-independent: an open cabinet accepts any
          compliant server, so future refreshes don't strand your cooling infrastructure.
        </p>
      </div>
    </div>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/coldplate-macro.png" alt="Macro photograph of a copper cold plate with microchannel fins" loading="lazy" style="width:100%;max-width:640px;display:block;border:1px solid var(--rule)" />
      <figcaption><b>PLATE 1</b> — What "cold plate coverage" means up close: microchannels and coolant ports. AI-generated illustration (Z-Image Turbo) — representative, not a specific product.</figcaption>
    </figure>

    <h2>The five checks</h2>
    <table>
      <tr><th>Check</th><th>What to ask for</th></tr>
      <tr><td>1. Cold plate coverage</td><td>CPU + GPU plates standard; VRM plates optional. Coverage defines how much heat leaves through liquid vs air</td></tr>
      <tr><td>2. Coupling standard</td><td>OCP UQD family and size — this determines what it physically plugs into</td></tr>
      <tr><td>3. W-class</td><td>ASHRAE coolant class the server tolerates (W32+ is efficient; W17 means it demands cold water)</td></tr>
      <tr><td>4. Flow &amp; pressure</td><td>Required L/min at a stated pressure drop — your CDU/manifold must deliver it per server, summed across the rack</td></tr>
      <tr><td>5. Serviceability</td><td>Tube lengths and dripless disconnects that let the server slide out without draining the rack</td></tr>
    </table>

    <h2>Why open interfaces matter more than the server brand</h2>
    <p>
      Some rack products bind you to one vendor's nodes; some require custom cold-plate adaptation per model.
      Both turn your cooling investment into a lock-in device. The open pattern — OCP-compliant manifold, standard
      UQD couplings, published flow/temperature specs — lets you mix generations and brands inside one cabinet and
      replace servers on their own lifecycle. When a cooling vendor can't name their coupling standard, treat it
      as a lock-in signal.
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
  title: 'Liquid-ready servers: the five compatibility checks',
  description: 'What "DLC-ready" means, the five compatibility checks (cold plate coverage, UQD couplings, W-class, flow/pressure, serviceability), and why OCP-standard interfaces protect you from vendor lock-in.'
})
useArticle({ path: '/liquid-ready-servers', title: 'Liquid-ready servers: what to check before you buy', description: 'The five checks that make a server compatible with a liquid cooling rack.' })

const faqs = [
  {
    q: 'What is a liquid-ready server?',
    a: 'A server factory-fitted for direct liquid cooling: cold plates on the CPU/GPU, internal coolant tubing, and dripless quick-disconnect ports instead of (or alongside) air heatsinks. All major OEMs — Supermicro, Dell, Lenovo, Gigabyte and others — offer DLC-ready configurations across their GPU server lines.'
  },
  {
    q: 'Can I mix server brands in one liquid cooling rack?',
    a: 'Yes, if everything speaks the same interfaces: OCP-family UQD couplings, a compatible coolant temperature class, and flow/pressure requirements that the rack\u2019s CDU and manifold can satisfy per server. This is the practical benefit of insisting on open standards rather than proprietary rack-node bindings.'
  },
  {
    q: 'What is the ASHRAE W-class on a server spec sheet?',
    a: 'It is the coolant supply temperature the server is certified to accept — W17 through W45, number in °C. A W32 or W40 server runs on warm water, enabling efficient or chiller-less facility cooling; a W17-only server forces cold water and higher energy use. Match server class and CDU design or you will pay for it in efficiency.'
  }
]
useFaq(faqs)
</script>
