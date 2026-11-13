<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Channel · engineering tools</p>
    <h1>Engineering &amp; calculators</h1>

    <p style="max-width:680px">
      The engineering layer of this guide: every formula a rack-level liquid cooling decision actually
      uses — load budgets, flow, derating, room heat, interfaces, fluids. Each page is one concept with
      a live calculator: real physics in, honest envelope out. Numbers here are derived in the open —
      the same derivations the configurator on
      <a href="https://friovia.com" rel="noopener">friovia.com</a> runs.
    </p>

    <h2>Load &amp; flow</h2>
    <ul class="chan">
      <li><NuxtLink to="/tdp-to-rack-kw"><b>TDP to rack kW</b></NuxtLink> — power budget from public specs: (ΣGPU + ΣCPU) × 1.2</li>
      <li><NuxtLink to="/coolant-flow-rate"><b>Coolant flow rate</b></NuxtLink> — Q = P / (ρ · c<sub>p</sub> · ΔT), with live calculator</li>
      <li><NuxtLink to="/heat-capture-split"><b>Heat capture split</b></NuxtLink> — how much of rack heat goes liquid vs air (60–80% DLC)</li>
    </ul>

    <h2>Capacity &amp; climate</h2>
    <ul class="chan">
      <li><NuxtLink to="/approach-temperature"><b>Approach temperature</b></NuxtLink> — the derating physics: why capacity halves from 25 °C to 35 °C</li>
      <li><NuxtLink to="/ashrae-w-classes"><b>ASHRAE W-classes</b></NuxtLink> — W17–W45 supply-temperature ladder with site lookup</li>
      <li><NuxtLink to="/wet-bulb-free-cooling"><b>Wet-bulb &amp; free cooling</b></NuxtLink> — where chiller-free operation dies geographically</li>
      <li><NuxtLink to="/pue-math"><b>PUE math</b></NuxtLink> — cooling energy in the efficiency fraction, computed honestly</li>
    </ul>

    <h2>The room</h2>
    <ul class="chan">
      <li><NuxtLink to="/room-ac-load"><b>Room AC load</b></NuxtLink> — the 1.1× rule: what the building must extract</li>
      <li><NuxtLink to="/room-load-calculation"><b>Room load calculation</b></NuxtLink> — full worksheet for a real site</li>
      <li><NuxtLink to="/floor-loading"><b>Floor loading</b></NuxtLink> — kN/m² of a full 42U liquid rack vs office floors</li>
    </ul>

    <h2>Interfaces &amp; fluids</h2>
    <ul class="chan">
      <li><NuxtLink to="/uqd-quick-disconnects"><b>UQD quick disconnects</b></NuxtLink> — sizes UQD04–UQD40, the coupling AI racks converged on</li>
      <li><NuxtLink to="/liquid-cooling-fluids"><b>Coolant fluids</b></NuxtLink> — PG25 vs dielectric oils, PFAS exit, water quality</li>
      <li><NuxtLink to="/pressure-drop"><b>Pressure drop</b></NuxtLink> — hose/fitting loss calculator for loop sizing</li>
      <li><NuxtLink to="/kw-to-tons"><b>kW to refrigeration tons</b></NuxtLink> — unit conversion for AC conversations</li>
    </ul>

    <h2>Hands-on</h2>
    <p style="max-width:680px">
      Want to drag sliders instead of reading? The <NuxtLink to="/playground">playground</NuxtLink> turns
      the same physics interactive — rack builder, derating explorer, room-load sandbox.
    </p>

    <h2>Related channels</h2>
    <p>
      <NuxtLink to="/what-is-liquid-cooling">Learn</NuxtLink> ·
      <NuxtLink to="/cabinet-comparison">Select &amp; buy</NuxtLink> ·
      <NuxtLink to="/site-survey">Deploy &amp; operate</NuxtLink> ·
      <NuxtLink to="/liquid-cooling-standards">Standards</NuxtLink> ·
      <NuxtLink to="/supply-chain">Supply chain</NuxtLink>
    </p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Engineering & calculators — every liquid cooling formula with live tools',
  description: 'The engineering channel: TDP-to-rack-kW budgets, coolant flow, heat capture split, approach-temperature derating, ASHRAE W-classes, wet-bulb free cooling, room AC load (1.1× rule), UQD interfaces and PG25 fluids — one concept per page, live calculators, sourced.'
})
useArticle({
  path: '/engineering',
  title: 'Engineering & calculators',
  description: 'Channel hub: every formula with a live tool.',
  datePublished: '2026-11-13',
  dateModified: '2026-11-13'
})
</script>

<style scoped>
ul.chan { list-style: none; padding-left: 0; max-width: 720px }
ul.chan li { padding: 7px 0; border-bottom: 1px solid var(--rule) }
</style>
