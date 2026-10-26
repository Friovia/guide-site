<template>
  <div>
    <section class="home-hero">
      <p class="eyebrow">独立参考 · 每条结论皆有出处</p>
      <h1><span class="grad">液冷</span>，做成可验证的工程。</h1>
      <p class="sub">
        GPU 机柜功率跨过 100 kW，风冷已无力跟随。本站一页一个概念——带真实数字的公式、可交互的计算器、
        可溯源的产品与厂商数据，写给需要验证而非轻信的工程师和采购。
      </p>
      <div class="cta-row">
        <NuxtLink to="/zh/playground" class="btn btn-fill">⚡ 打开演练场</NuxtLink>
        <NuxtLink to="/zh/what-is-liquid-cooling" class="btn btn-ghost">从入门开始 →</NuxtLink>
      </div>
    </section>

    <main class="container" style="padding:8px 24px 60px">
      <div class="heropanel">
        <HeroChart
          label="实时——沿曲线拖动那个点"
          caption="一台 50 kW 级液-风（L2A）机柜，在 {t} °C 室温下还能带走多少热量"
          sub="向热带方向拖：室温越高、逼近温差越小、容量越低——本站存在的理由就是让这根曲线无处可藏"
        />
          <div class="hp-foot">
            <span>数据 <b>v{{ meta.version }}</b></span>
            <span>产品 {{ meta.datasets.products.slice(5) }}</span>
            <span>厂商 {{ meta.datasets.vendors.slice(5) }}</span>
            <span>公式 {{ meta.datasets.formulas.slice(5) }}</span>
            <span><NuxtLink to="/changelog">更新日志 →</NuxtLink></span>
          </div>
      </div>

      <div class="feat-band">
        <div class="feat">
          <span class="fic">公式 × 11</span>
          <h3>可验证</h3>
          <p>每个公式配真实数字的算例与实时计算器——数字可以自己核，不靠厂商曲线。</p>
        </div>
        <div class="feat">
          <span class="fic">97 家厂商 · 16 个环节</span>
          <h3>有出处</h3>
          <p>产品与产业链数据逐行挂官方来源；查不到的明确标注，绝不编造。</p>
        </div>
        <div class="feat">
          <span class="fic">4 个工具 · 全部在浏览器内</span>
          <h3>可交互</h3>
          <p>装机台、降额模拟、机房负荷计算、动画冷却回路——拖动数字来学习。</p>
        </div>
      </div>

      <p class="src" style="margin: 40px 0 -18px">
        🚧 中文正文已上线：什么是液冷（入门第一篇）、术语表（50+ 词条双语）、演练场——目录中已标中文；其余条目暂为英文原文，持续翻译中。公式与数字本身是通用语言。
      </p>

      <h2 class="idx-sec" style="margin-top:64px">入门</h2>
      <div class="idx">
        <NuxtLink to="/what-is-liquid-cooling" class="idx-row"><span class="idx-title">什么是液冷？</span><span class="idx-desc">冷板、CDU、歧管、快接头——部件与物理，附动画回路模拟</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/what-is-a-cdu" class="idx-row"><span class="idx-title">什么是 CDU？</span><span class="idx-desc">系统的心脏：泵、换热器、TCS 与设施水环路、三种形态</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/cold-plate-vs-immersion" class="idx-row"><span class="idx-title">冷板 vs 浸没</span><span class="idx-desc">两种架构对垒：热量捕获、工质、PFAS 法规、可维护性</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-vs-air" class="idx-row"><span class="idx-title">液冷 vs 风冷</span><span class="idx-desc">交叉点到底在哪、PUE 数字的前提、没人提的热带陷阱</span><span class="idx-arrow">→</span></NuxtLink>
      </div>

      <h2 class="idx-sec" style="margin-top:56px">公式手册</h2>
      <div class="idx">
        <NuxtLink to="/coolant-flow-rate" class="idx-row"><span class="idx-title">冷却液流量</span><span class="idx-desc"><span class="f">L/min = kW × 60 / (4.186 × ΔT)</span> — 50 kW、ΔT 8 °C → 89.6 L/min</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/heat-capture-split" class="idx-row"><span class="idx-title">热量捕获比例</span><span class="idx-desc"><span class="f">P_液 = 捕获率 × P_IT</span> — 60-80% 走液体，其余仍在加热机房</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/tdp-to-rack-kw" class="idx-row"><span class="idx-title">TDP → 机柜 kW</span><span class="idx-desc"><span class="f">P_rack ≈ 节点 × (Σ GPU + Σ CPU) × 1.2</span> — 从芯片功率到机柜预算</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/room-ac-load" class="idx-row"><span class="idx-title">机房空调负荷</span><span class="idx-desc"><span class="f">P_AC ≈ 1.1 × P_IT</span> — 30 kW 机柜 → 33 kW ≈ 9.4 冷吨</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/kw-to-tons" class="idx-row"><span class="idx-title">kW ↔ 冷吨</span><span class="idx-desc"><span class="f">1 冷吨 = 3.517 kW = 12,000 BTU/h</span> — 制冷量 ≠ 用电功率</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/approach-temperature" class="idx-row"><span class="idx-title">逼近温度与降额</span><span class="idx-desc"><span class="f">容量 ≈ 标称 × 逼近温差 / 20 K</span> — 35 °C 为何腰斩 50 kW 机柜</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/pressure-drop" class="idx-row"><span class="idx-title">压降</span><span class="idx-desc"><span class="f">ΔP = f × (L/D) × ρv²/2</span> — 90 L/min、25 mm 软管 3 m 损失 ≈20 kPa</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/floor-loading" class="idx-row"><span class="idx-title">楼板承重</span><span class="idx-desc"><span class="f">kN/m² = kg × 9.81 ÷ m²</span> — 满载机柜 ≈ 办公楼设计荷载的 5 倍</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/pue-math" class="idx-row"><span class="idx-title">PUE 计算</span><span class="idx-desc"><span class="f">PUE = 总能耗 ÷ IT 能耗</span> — 液冷 1.05-1.2 vs 风冷 1.4-1.6，以及数字掩盖的东西</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/ashrae-w-classes" class="idx-row"><span class="idx-title">ASHRAE W 等级</span><span class="idx-desc"><span class="f">W17 · W27 · W32 · W40 · W45</span> — 数字 ≈ 设施供水最高温度 °C</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/wet-bulb-free-cooling" class="idx-row"><span class="idx-title">湿球与免费制冷</span><span class="idx-desc"><span class="f">免费制冷 ⇔ 湿球 + 6 K ≤ 冷却液 °C</span> — 热带为何用不了自然冷</span><span class="idx-arrow">→</span></NuxtLink>
      </div>

      <h2 class="idx-sec" style="margin-top:56px">选型</h2>
      <div class="idx">
        <NuxtLink to="/cabinet-comparison" class="idx-row"><span class="idx-title">机柜对比</span><span class="idx-desc">可核验的小型制冷机柜全集——功率等级、制冷方式、机房要求，逐行带源</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/rfq-scope-checklist" class="idx-row"><span class="idx-title">RFQ 范围清单</span><span class="idx-desc">十二条让报价变得可比的硬指标</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-ready-servers" class="idx-row"><span class="idx-title">液冷就绪服务器</span><span class="idx-desc">买前五项兼容性检查——冷板、接头、W 等级、流量、可维护性</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-hot-climates" class="idx-row"><span class="idx-title">高温与热带</span><span class="idx-desc">带公开数字的降额物理、SS 726:2026、采购清单</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-cost" class="idx-row"><span class="idx-title">成本由什么决定</span><span class="idx-desc">为什么没人公开报价、成本堆栈、如何让报价可比</span><span class="idx-arrow">→</span></NuxtLink>
      </div>

      <h2 class="idx-sec" style="margin-top:56px">部署与运维</h2>
      <div class="idx">
        <NuxtLink to="/site-survey" class="idx-row"><span class="idx-title">勘站</span><span class="idx-desc">六项清单——承重、供电、排热、水、搬运、噪声，逐项挂公式</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/room-load-calculation" class="idx-row"><span class="idx-title">机房负荷计算</span><span class="idx-desc">你的机房放得下 L2A 机柜吗？1.1× 规则、医院算例、完整勘站</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/commissioning" class="idx-row"><span class="idx-title">调试验收</span><span class="idx-desc">从空管到签收的八步</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-leaks" class="idx-row"><span class="idx-title">漏液：风险与响应</span><span class="idx-desc">漏点在哪，以及该向厂商要求的四层检测模型</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/maintenance-schedule" class="idx-row"><span class="idx-title">维护周期表</span><span class="idx-desc">让冷却回路保持无聊的周期性检查</span><span class="idx-arrow">→</span></NuxtLink>
      </div>

      <h2 class="idx-sec" style="margin-top:56px">参考</h2>
      <div class="idx">
        <NuxtLink to="/supply-chain" class="idx-row"><span class="idx-title">产业链地图</span><span class="idx-desc">16 个环节 97 家公司，从芯片到热排放——逐行带源；收录免费，永不收费</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/news" class="idx-row"><span class="idx-title">行业雷达</span><span class="idx-desc">资讯 + 人工维护的里程碑时间线——每条有源，绝不编造</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/state-of-liquid-cooling-2026" class="idx-row"><span class="idx-title">2026 年度综述</span><span class="idx-desc">变了什么，以及 20-50 kW 交钥匙空白为何仍存在</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/zh/glossary" class="idx-row"><span class="idx-title">术语表</span><span class="idx-desc">50+ 条可引用、可锚点的定义——DLC、UQD、W 等级、逼近温度…</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/uqd-quick-disconnects" class="idx-row"><span class="idx-title">UQD 快接头</span><span class="idx-desc">OCP 家族 UQD04-UQD40，按公称流量列表</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-fluids" class="idx-row"><span class="idx-title">工质与 PFAS</span><span class="idx-desc">PG25 vs 油类 vs 氟化液——化学即采购决策</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/liquid-cooling-standards" class="idx-row"><span class="idx-title">标准</span><span class="idx-desc">OCP、ASHRAE W 等级、IEC 62368-1、SS 726——映射到采购清单</span><span class="idx-arrow">→</span></NuxtLink>
        <NuxtLink to="/changelog" class="idx-row"><span class="idx-title">更新日志</span><span class="idx-desc">数据层版本与文章更新</span><span class="idx-arrow">→</span></NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import meta from '~/data/meta.json'
useSeo({
  title: '液冷指南——面向微型数据中心的独立参考',
  description: '什么是液冷、液冷与风冷、11 个带实时计算器的公式、可溯源的机柜对比与 72 家厂商产业链地图。面向医院、高校与边缘部署的独立参考。',
  path: '/zh'
})
</script>
