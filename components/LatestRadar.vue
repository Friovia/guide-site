<template>
  <section class="radar-band">
    <div class="rb-head">
      <h2 class="rb-label">{{ label }}</h2>
      <span class="rb-fresh">AUTO · {{ news.last_fetched }}</span>
      <NuxtLink to="/news" class="rb-more">{{ more }} →</NuxtLink>
    </div>
    <div class="rb-grid">
      <a
        v-for="it in items"
        :key="it.url"
        :href="it.url"
        class="rb-card"
        target="_blank"
        rel="noopener"
      >
        <!-- 图卡：文章自身封面（管线抓的 og:image / RSS 内嵌图） -->
        <template v-if="it.image && !failed.has(it.url)">
          <div class="rb-media" :class="it.channel">
            <img
              :src="it.image"
              :alt="''"
              loading="lazy"
              referrerpolicy="no-referrer"
              @error="failed.add(it.url)"
            />
            <span class="rb-chan">{{ chanLabel(it.channel) }}</span>
            <span class="rb-date">{{ it.date.slice(5) }}</span>
          </div>
          <div class="rb-body">
            <span class="rb-title">{{ it.title }}</span>
            <span v-if="it.note" class="rb-note">{{ it.note }}</span>
            <span class="rb-src">{{ it.source }} ↗</span>
          </div>
        </template>
        <!-- 电讯简报卡（无图卡种）：频道色书脊 + 大号标题——排版就是这张卡的图 -->
        <div v-else class="rb-wire" :class="it.channel">
          <div class="rb-wire-head">
            <span>{{ chanLabel(it.channel) }}</span>
            <span>{{ it.date.slice(5) }}</span>
          </div>
          <div class="rb-wmid">
            <span class="rb-wtitle">{{ it.title }}</span>
            <span v-if="it.note" class="rb-note">{{ it.note }}</span>
          </div>
          <span class="rb-src">{{ it.source }} ↗</span>
        </div>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import news from '~/data/news.json'

// 首页「最新动态」大图卡片流：数据来自 data/news.json（每日管线自动换血）。
// 配图纪律（2026-11-09 定调）：**真图优先**——用文章自己的封面（管线 best-effort
// 抓 og:image / RSS 内嵌图，只存 URL 热链不复制文件）；无图条目（google 重定向
// 物理拿不到）回落到纯设计纹样（网格底 + 频道色线稿，不描绘任何实物）。
// 绝不用生成图冒充新闻现场。
const props = withDefaults(defineProps<{ label: string; more: string; limit?: number }>(), { limit: 6 })
// 首页带是 curation：最新条目里优先展示带真图的（最多 3 席），其余按新近补足，
// 选定后再按日期排——否则首页尖排常被无图的重定向条目占满。/news 页保持严格时间序。
const items = computed(() => {
  // 近 21 天窗口内带图优先：时间语义明确（不拿月度旧闻冒充最新），真图条目能浮上来
  const cutoff = Date.now() - 21 * 864e5
  const recent = news.items.filter(i => new Date(i.date).getTime() >= cutoff)
  return recent
    .sort((a, b) => (Number(!!b.image) - Number(!!a.image)) || (a.date < b.date ? 1 : -1))
    .slice(0, props.limit)
})
const failed = reactive(new Set<string>())

const CHANS: Record<string, string> = {
  technology: 'TECH',
  product: 'PRODUCT',
  standards: 'STD',
  investment: 'INVEST',
}
const chanLabel = (c: string) => CHANS[c] ?? c.toUpperCase()
</script>

<style scoped>
.radar-band {
  margin-top: 40px;
}
.rb-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 0 2px 10px;
}
.rb-label {
  margin: 0;
  font-size: 16px;
  letter-spacing: 0.02em;
}
.rb-fresh {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--brand, #2e7fc2);
  letter-spacing: 1px;
}
.rb-more {
  margin-left: auto;
  font-size: 13px;
  text-decoration: none;
  color: var(--brand, #2e7fc2);
}
.rb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
}
.rb-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
}
.rb-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(20, 40, 60, 0.1);
}

/* —— 媒体区：真图在上，纹样兜底 —— */
.rb-media {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background:
    repeating-linear-gradient(0deg, rgba(46, 127, 194, 0.05) 0 1px, transparent 1px 22px),
    repeating-linear-gradient(90deg, rgba(46, 127, 194, 0.05) 0 1px, transparent 1px 22px),
    #f3f6f9;
}
.rb-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s;
  z-index: 1;
}
.rb-card:hover .rb-media img {
  transform: scale(1.03);
}
/* —— 电讯简报卡（无图卡种）：书脊+大标题，密度即自信 —— */
.rb-wire {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 15px 12px 17px;
  border-inline-start: 5px solid #2e7fc2;
}
.rb-wire.product { border-inline-start-color: #2e8c5a; }
.rb-wire.standards { border-inline-start-color: #785abe; }
.rb-wire.investment { border-inline-start-color: #c0861f; }
.rb-wire-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.3px;
  color: #2e7fc2;
}
.rb-wire.product .rb-wire-head { color: #2e8c5a; }
.rb-wire.standards .rb-wire-head { color: #785abe; }
.rb-wire.investment .rb-wire-head { color: #a06a1f; }
.rb-wmid {
  /* 标题块在字眉与出处之间垂直居中——与图卡并排时视觉平衡 */
  margin-block: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
/* 关键：电讯卡内撤掉页脚继承的 margin-top:auto——
   否则它和标题块的两段 auto 平分剩余空间（实测 71/132px 斜置） */
.rb-wire .rb-src {
  margin-top: 0;
}
.rb-wtitle {
  font-size: 17.5px;
  font-weight: 650;
  line-height: 1.34;
  letter-spacing: -0.012em;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rb-card:hover .rb-wmid {
  /* 标题块在字眉与出处之间垂直居中——与图卡并排时视觉平衡 */
  margin-block: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
/* 关键：电讯卡内撤掉页脚继承的 margin-top:auto——
   否则它和标题块的两段 auto 平分剩余空间（实测 71/132px 斜置） */
.rb-wire .rb-src {
  margin-top: 0;
}
.rb-wtitle { color: #1d5a94; }

.rb-chan {
  position: absolute;
  top: 10px;
  inset-inline-start: 10px;
  z-index: 2;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.2px;
  padding: 2px 9px;
  border-radius: 20px;
  background: rgba(46, 127, 194, 0.92);
  color: #fff;
}
.rb-chan.product {
  background: rgba(46, 140, 90, 0.92);
}
.rb-chan.standards {
  background: rgba(120, 90, 190, 0.92);
}
.rb-chan.investment {
  background: rgba(190, 130, 40, 0.94);
}
.rb-date {
  position: absolute;
  top: 10px;
  inset-inline-end: 10px;
  z-index: 2;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  color: #fff;
  background: rgba(16, 28, 40, 0.55);
  padding: 2px 7px;
  border-radius: 4px;
}

.rb-body {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 13px 14px 12px;
  flex: 1;
}
.rb-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.42;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rb-note {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text2, #5b6b7f);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rb-src {
  margin-top: auto;
  padding-top: 6px;
  border-top: 1px dashed var(--line);
  font-size: 12px;
  color: var(--text2, #5b6b7f);
}
.rb-card:hover .rb-src {
  color: var(--brand, #2e7fc2);
}
</style>
