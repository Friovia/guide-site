# guide-site (Liquid Cooling Guide)

Nuxt 3 (SSG) 中性知识中枢——目标：**液冷行业的 Go by Example**。
架构原则：**数据层 JSON + 静态页面 + 零后端**（每个能力必须「免费 或 无人值守」）。
域名规划：liquidcoolingguide.com。完整路线图与决策记录见 [BLUEPRINT.md](./BLUEPRINT.md)。

## 本地开发

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm generate     # check-nav 守护 + 全量静态构建 → .output/public
```

## 日常维护

### 加一个页面（四件套，缺一会被 check-nav 拦下）
1. `pages/<slug>.vue`（公式页套用现有 formula 页模板：答案前置 → 公式 → 代入 → 活计算器 → 常见错误 → Related → Sources → FAQ schema）
2. `data/nav.json` 加条目（侧边栏知识地图）
3. `public/sitemap.xml` 加 URL + lastmod
4. `public/llms.txt` 加一行描述

`pnpm check:nav`（已内置于 generate）会校验 pages/ ↔ nav.json ↔ sitemap ↔ llms.txt 四方一致。

### 数据层
- `data/products.json` — 对比表（vendor/product/form/cooling/power_class/liquid/facility_free/note/source）
- `data/news.json` — 资讯雷达（items + milestones；手工条目永不被自动管线覆盖）
- `data/meta.json` — **版本/新鲜度唯一事实源**（首页状态牌、顶栏徽标、sitemap lastmod 都从这里读）
- 更新任何数据集：改内容 + 改 `meta.json` 对应日期 + changelog 补条目 → 重新 generate
- 数据来源纪律：只用厂商页面/规格书/行业媒体，每行必须带 source；查不到的标 ❌ 不编造

### 物理求解器（vendored，与 official-site 同构）
- `sim/` 下的 p0（水力）/ p1（热链）求解器与曲线由 simulation 仓分发，**勿手改**——改物理去 simulation 改，回来重跑 `pnpm vendor:sim`
- 纪律：**定量演示页一律 import `~/sim/` 的真求解器，不在页内手写物理**；页面标注求解器版本（`sim/MANIFEST.json` 的 versions），物理真源唯一
- 重跑：`pnpm vendor:sim`（前置 simulation 仓 strict typecheck 红线 → 拷贝 → 生成 curves.ts → parity 对拍逐位一致 → 更新 MANIFEST）

### 资讯自动化（无人值守）
- 本地手动：`pnpm news:fetch`（抓 RSS → 过滤/分类/去重 → 合并写回 news.json + newsfeed.xml + meta）
- 线上自动：`.github/workflows/news.yml` 每日 03:30 UTC 跑同一脚本，有变化才 commit，推送后 Cloudflare Pages 自动重建
- 稳定性规则：feed 挂了跳过并记日志，绝不清空已有数据；手工 curated 条目永久保留

## 部署（Cloudflare Pages，免费）

1. 推本目录到 GitHub 仓库（本目录即仓库根，已 git init）
2. Cloudflare Pages → Connect to Git → 选仓库
   - Build command: `npm run generate`
   - Output directory: `.output/public`
3. 绑定 liquidcoolingguide.com（先注册域名）
4. Cloudflare Email Routing（免费）：建 `vendors@liquidcoolingguide.com` 转发到你的邮箱——supply-chain 页的厂商登记/纠错入口依赖这个地址
5. 之后每次 push 自动重建；news cron 的 commit 也会触发

## 内容排期

- [x] P0 侧边栏知识地图 + 搜索（gobyexample IA）
- [x] P0.5 首页数据状态牌 + meta.json + sitemap lastmod
- [x] P1 公式手册 11 页（活计算器）
- [x] P1.5 资讯雷达（news + 里程碑 + newsfeed.xml）
- [x] P2.5 自动化管线（fetch-news + GitHub Actions）
- [x] P3 运维板块（survey / commissioning / maintenance / RFQ）
- [x] P4 年度综述 + Cite-this + 词汇表 50+
- [ ] P2 剩余：CDU 数据库（products v2）——需真实厂商调研，遵守 facts policy 不编造
- [ ] @nuxtjs/i18n 接入 /ar/（中东线索 ≥3/月 触发）
