<template>
  <main class="container" style="padding:40px 24px 60px">
    <p class="updated">交互工具 · 全部在浏览器内运行 · 中文版</p>
    <h1>演练场</h1>
    <p style="max-width:640px">用拖动数字代替阅读来学液冷。先玩下面的回路——再把工具逐个拆开看。</p>

    <h2 id="loop-sim">活的回路</h2>
    <p style="max-width:640px">服务器 → 歧管 → CDU → 排热。随便拖：流速、排热箭头和容量判定都会跟着变。</p>
    <LoopSim />

    <h2>工具</h2>
    <div class="idx">
      <NuxtLink to="/playground/rack-builder" class="idx-row"><span class="idx-title">装机台</span><span class="idx-desc">选真实服务器平台（GB200 NVL72、HGX B200/H100、MI300X）与真实冷却产品（Vertiv CDU 70、STULZ、Asetek L2L）——降额容量、流量与机房需求实时收敛，逐项带源</span><span class="idx-arrow">→</span></NuxtLink>
      <NuxtLink to="/playground/derating" class="idx-row"><span class="idx-title">降额模拟器</span><span class="idx-desc">容量-室温曲线，可拖动——直观看到 25 °C → 35 °C 对液-风 CDU 意味着什么</span><span class="idx-arrow">→</span></NuxtLink>
      <NuxtLink to="/playground/room-load" class="idx-row"><span class="idx-title">机房负荷计算器</span><span class="idx-desc">机柜 kW、已装空调、既有热源——机房放不放得下的实时判定</span><span class="idx-arrow">→</span></NuxtLink>
    </div>

    <h2>为什么要有演练场</h2>
    <p style="max-width:640px" class="src">
      模型为一阶近似，在有公开数据处锚定（如 Vertiv XDU070 曲线）；它们演示物理，不替代厂商工程。
      如果工具说你的机房放不下——那正是它的价值：在任何设备发货之前，先在这里免费发现问题。
    </p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: '演练场——液冷交互工具',
  description: '液冷交互演练场：动画冷却回路模拟、装机台、降额模拟器、机房负荷计算器——拖动数字来学习，全部在浏览器内。',
  path: '/zh/playground'
})
</script>
