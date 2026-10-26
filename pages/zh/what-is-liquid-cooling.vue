<template>
  <main class="container" style="padding:40px 24px 60px">
    <p class="updated">更新于 2026-10-08 · 阅读约 4 分钟 · 中文版</p>
    <h1>什么是液冷？</h1>

    <div class="card-grid" style="grid-template-columns:1fr">
      <div class="card">
        <h3>要点</h3>
        <p>
          液冷（直接芯片冷却，"DLC"）用水-乙二醇回路流过贴装在 CPU/GPU 上的金属冷板带走热量，
          以远高于风冷的效率捕获服务器 60-80% 的热量。一套机柜级系统由四部分组成：
          冷板、CDU（冷量分配单元）、机柜歧管、以及由 OCP 标准化的无滴漏快接头。
          液冷不消灭热量——只是搬运它，因此部署机房仍需要约 1.1× IT 负荷的空调容量。
        </p>
      </div>
    </div>

    <h2>一句话版本</h2>
    <p style="max-width:680px">
      不再对着散热器吹风，液冷用流体回路运走热量——水-乙二醇直接流过贴在芯片上的金属板
      （直接芯片冷却，DLC），捕获 60-80% 的服务器热量，效率远非风冷可比。
    </p>

    <h2>四个组成部分</h2>
    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/rack-cabinet.png" alt="液冷服务器机柜：侧门可见冷却液歧管与蓝色供回液管——AI 插图" loading="lazy" style="width:100%;max-width:640px;display:block" />
      <figcaption><b>图版 1</b> — 液冷机柜：服务器、垂直歧管、供回液管。AI 生成插图（Z-Image Turbo）——仅为示意，非特定产品。</figcaption>
    </figure>
    <figure class="fig" style="margin-inline:0">
      <table>
        <tr><th>部件</th><th>作用</th></tr>
        <tr><td><strong>冷板（Cold plate）</strong></td><td>贴装在 CPU/GPU 上的金属块，内部流道直接带走芯片热量</td></tr>
        <tr><td><strong>CDU</strong>（冷量分配单元）</td><td>驱动冷却液循环并把热量交给散热端——设施水（液-液）或室内空气（液-风，"L2A"）</td></tr>
        <tr><td><strong>歧管（Manifold）</strong></td><td>机柜的供/回液干管；好的设计是<strong>盲插（blind-mate）</strong>——服务器推入即接通</td></tr>
        <tr><td><strong>快接头（UQD）</strong></td><td>由开放计算项目（OCP）标准化的无滴漏接头，保证跨厂商零件互通</td></tr>
      </table>
      <figcaption><b>图 1</b> — 直接芯片回路的四个部件，按冷却液流经顺序排列。</figcaption>
    </figure>

    <figure class="fig" style="margin-inline:0">
      <img src="/img/ai/manifold-vert.png" alt="带盲插端口的垂直机柜歧管——AI 插图" loading="lazy" style="width:100%;max-width:560px;display:block" />
      <figcaption><b>图版 2</b> — 机柜歧管：两根干管和一列盲插端口。AI 生成插图（Z-Image Turbo）——仅为示意。</figcaption>
    </figure>

    <h2>冷却液</h2>
    <figure class="fig" style="margin-inline:0">
      <img src="/img/cfd-coldplate.gif" alt="冷板内部流道 CFD 仿真动画" loading="lazy" style="width:100%;max-width:560px;display:block" />
      <figcaption><b>图 3</b> — 冷却液流经冷板内部流道的 CFD 仿真。来源：Heatlord，CC BY-SA 3.0，经由 Wikimedia Commons。</figcaption>
    </figure>

    <p style="max-width:680px">
      小型系统通常使用 PG25（75% 水 / 25% 丙二醇）：便宜、不可燃，且不受正席卷氟化工质的
      PFAS 法规影响——3M 已于 2025 年底完全退出该类化学品的制造。
    </p>

    <h2>液冷做不到的事</h2>
    <p style="max-width:680px">
      它不消灭热量，只是搬运。液-风机柜把热量排进机房，机房仍需要按约 1.1× IT 负荷配置空调。
      谁告诉你不用，那是在销售而不是在做工程。
    </p>

    <figure class="fig" style="margin-inline:0">
      <svg viewBox="0 0 720 190" role="img" aria-label="冷却回路示意：冷板到歧管到 CDU，热量排向室内空气或设施水" style="width:100%;height:auto;display:block">
        <defs><marker id="g-arr-zh" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--cool)" /></marker></defs>
        <g v-for="i in 3" :key="i">
          <rect :x="20" :y="18 + (i-1)*46" width="150" height="34" fill="var(--bg2)" stroke="var(--text)" stroke-width="1.5" />
          <rect :x="30" :y="24 + (i-1)*46" width="46" height="22" fill="var(--panel2)" stroke="var(--cool)" stroke-width="1.5" />
          <text x="36" :y="39 + (i-1)*46" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--text)">冷板</text>
          <text x="84" :y="39 + (i-1)*46" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--text2)">CPU / GPU</text>
        </g>
        <path d="M170 35 H250" stroke="var(--cool)" stroke-width="2" marker-end="url(#g-arr-zh)" />
        <path d="M250 60 L190 60" stroke="var(--cool)" stroke-width="2" stroke-dasharray="4 3" />
        <text x="188" y="54" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--cool)">回液 ↑</text>
        <text x="196" y="30" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--cool)">供液 ↓</text>
        <rect x="250" y="18" width="26" height="140" fill="var(--panel)" stroke="var(--text)" stroke-width="2" />
        <text x="259" y="90" font-family="IBM Plex Mono, monospace" font-size="9" fill="var(--text)" writing-mode="tb" letter-spacing="2">歧管</text>
        <rect x="330" y="45" width="170" height="90" fill="var(--panel)" stroke="var(--text)" stroke-width="2" />
        <circle cx="365" cy="90" r="15" fill="none" stroke="var(--text)" stroke-width="2" />
        <path d="M365 78 l0 24 M358 85 l14 10 M372 85 l-14 10" stroke="var(--text)" stroke-width="1.8" fill="none" />
        <text x="345" y="122" font-family="IBM Plex Mono, monospace" font-size="8" fill="var(--text2)">泵 · 换热 · 控制</text>
        <text x="388" y="80" font-family="IBM Plex Mono, monospace" font-size="10" fill="var(--text)">CDU</text>
        <path d="M276 60 H330" stroke="var(--cool)" stroke-width="2" marker-end="url(#g-arr-zh)" />
        <path d="M330 120 H276" stroke="var(--cool)" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#g-arr-zh)" />
        <path d="M500 75 H560" stroke="var(--text)" stroke-width="2" />
        <g stroke="var(--heat)" stroke-width="2" fill="none">
          <path d="M575 60 q7 -9 0 -18" /><path d="M590 60 q7 -9 0 -18" />
          <path d="M575 95 q7 -9 0 -18" /><path d="M590 95 q7 -9 0 -18" />
        </g>
        <text x="545" y="130" font-family="IBM Plex Mono, monospace" font-size="9" fill="var(--heat)">热量排出</text>
        <text x="525" y="150" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="var(--text2)">→ 室内空气（L2A）</text>
        <text x="525" y="163" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="var(--text2)">→ 设施水（L2L）</text>
        <text x="20" y="182" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="var(--text2)">TCS = 服务器侧洁净回路（PG25）· FWS = 设施水 · CDU 使两者隔离</text>
      </svg>
      <figcaption><b>图 2</b> — 冷却回路。蓝色实线 = 供液，虚线 = 回液，红色 = 排出的热量。CDU 把洁净的服务器回路（TCS）与设施侧（FWS）隔离开。</figcaption>
    </figure>

    <h2 id="try-the-loop">动手试试</h2>
    <p style="max-width:680px">
      上面的一切，活的：拖动负载、捕获率、室温和冷却液温度——看流速、排热和容量判定实时变化。
      与 <NuxtLink to="/playground">演练场</NuxtLink> 同一套物理，就嵌在你读到这里的地方。
    </p>
    <LoopSim />

    <h2>常见问题</h2>
    <div v-for="f in faqs" :key="f.q" style="margin-bottom:18px">
      <h3 style="margin-bottom:4px; font-size:17px">{{ f.q }}</h3>
      <p style="margin:0">{{ f.a }}</p>
    </div>

    <h2>值得知道的标准</h2>
    <p class="src">
      OCP 冷却环境（UQD、ORv3 盲插歧管规范）· ASHRAE 液冷指南（W 等级）·
      IEC 62368-1 第 4 版（含液冷条款的电气安全）· SS 726:2026（新加坡，热带液冷）。
      详见 <NuxtLink to="/liquid-cooling-standards">标准页（英文）</NuxtLink>。
    </p>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: '什么是液冷？（直接芯片冷却详解）',
  description: '直接芯片液冷详解：冷板、CDU、歧管、UQD 快接头、PG25 冷却液，以及相关标准（OCP、ASHRAE、IEC 62368-1、SS 726）。中文版。',
  path: '/zh/what-is-liquid-cooling'
})
useArticle({
  path: '/zh/what-is-liquid-cooling',
  title: '什么是液冷？',
  description: '直接芯片液冷的部件与物理。',
  datePublished: '2026-10-08',
  dateModified: '2026-10-08'
})

const faqs = [
  {
    q: '什么是液冷？',
    a: '液冷是一种散热方式：让水-乙二醇流体流过贴装在 CPU/GPU 上的金属冷板，吸收芯片热量并送至冷量分配单元（CDU），再由 CDU 交给设施水或室内空气。在数据中心语境里通常指直接芯片冷却（DLC），不是整机浸没。'
  },
  {
    q: '液冷系统的主要组成有哪些？',
    a: '四个部分：贴在芯片上的冷板、驱动回路循环并排出热量的 CDU、分配供回液的机柜歧管、以及由开放计算项目（OCP）标准化的无滴漏快接头（UQD）——标准化保证跨厂商零件可以混配。'
  },
  {
    q: '直接液冷用什么冷却液？',
    a: '小型直接芯片系统通常用 PG25——75% 水 + 25% 丙二醇。便宜、不可燃、不含 PFAS；与之相对，氟化工质正面临全球 PFAS 法规收紧（3M 已于 2025 年底退出氟化液制造）。'
  },
  {
    q: '液冷后还需要机房空调吗？',
    a: '需要。液冷搬运热量，不消灭热量。液-风（L2A）机柜把热量排进机房，机房需要约 1.1× IT 负荷的空调容量；液-液（L2L）则把这份需求转移到设施水环路和干冷器上。'
  },
  {
    q: '数据中心液冷适用哪些标准？',
    a: '开放计算项目（OCP）规定了 UQD 快接头和 ORv3 盲插歧管；ASHRAE 定义冷却液温度等级（W 系列）；IEC 62368-1 第 4 版覆盖含液冷条款的电气安全；新加坡 SS 726:2026 是首个热带液冷国家标准。'
  }
]
useFaq(faqs)
</script>
