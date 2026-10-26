<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Interactive tools · everything runs in your browser</p>
    <h1>Playground</h1>
    <p style="max-width:640px">Liquid cooling, learned by moving numbers instead of reading paragraphs. Start with the loop below — then take a tool apart.</p>

    <h2 id="loop-sim">The loop, live</h2>
    <p style="max-width:640px">Servers → manifold → CDU → heat out. Drag anything; the flow speed, the heat arrows and the capacity verdict all follow.</p>
    <LoopSim />

    <h2>The tools</h2>
    <div class="idx">
      <NuxtLink to="/playground/rack-builder" class="idx-row"><span class="idx-title">Rack builder</span><span class="idx-desc">Pick real server platforms (GB200 NVL72, HGX B200/H100, MI300X) and real cooling products (Vertiv CDU 70, STULZ, Asetek L2L) — derated capacity, flow and facility needs settle live, every selection sourced</span><span class="idx-arrow">→</span></NuxtLink>
      <NuxtLink to="/playground/derating" class="idx-row"><span class="idx-title">Derating simulator</span><span class="idx-desc">Capacity vs room temperature as a draggable curve — exactly what 25 °C → 35 °C does to an L2A CDU</span><span class="idx-arrow">→</span></NuxtLink>
      <NuxtLink to="/playground/room-load" class="idx-row"><span class="idx-title">Room load calculator</span><span class="idx-desc">Cabinet kW, installed AC, existing heat — live verdict on whether the room can host the cabinet</span><span class="idx-arrow">→</span></NuxtLink>
    </div>

    <h2>Why a playground</h2>
    <p style="max-width:640px" class="src">
      Models are first-order and anchored to published data where it exists (e.g. Vertiv XDU070 curves);
      they illustrate physics, not replace vendor engineering. If a tool says your room doesn't fit —
      that's the point: find out here, for free, before anyone ships anything.
    </p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Playground — interactive liquid cooling tools',
  description: 'Interactive liquid cooling playground: live coolant-loop simulator, rack builder, capacity derating simulator, room load calculator — learn by moving numbers, all in-browser.',
  path: '/playground'
})
</script>
