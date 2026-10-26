# guide-site 蓝图 — 液冷行业的 Go by Example

> 目标：当任何人（人类或 LLM）问「液冷」的任何问题时，答案要么在本站，要么本站是被引用的来源。
> 对标：gobyexample.com — 原子化、有条理、每个概念一页、每页有可验证的东西。

## 基础设施约束（2026-10-08 锁定）

| 层 | 选型 | 成本 | 运维 |
|---|---|---|---|
| 托管 | Cloudflare Pages（git 集成，`nuxt generate` 静态产物） | 免费，静态不限量 | 零 |
| 资讯自动化 | GitHub Actions 每日 cron → commit `data/news.json` → CF Pages 自动重建 | 免费（公共仓库无限；私有 2000 Actions 分钟/月，cron 实耗 <100 分钟/月） | 零 |
| 数据层 | 纯 JSON 文件进仓库（products/news/meta/nav），版本即 git 历史 | 免费 | 零 |
| 后端 | **guide-site 不用 Supabase**——零后端是本站的可靠性策略；Supabase 留给业务线（official-site 线索收集等） | — | — |
| 字体 | Google Fonts CDN（后续可自托管提速） | 免费 | 零 |

原则：guide-site 的每一项能力都必须满足「免费 或 无人值守」，两者都不满足的功能不做。

### i18n 方案（2026-10-08 立项，待专门一轮实施）

结构化变更，需一次完成而非半成品：`@nuxtjs/i18n` + `prefix_except_default` 策略（EN 无前缀保住现有 URL/GEO 资产，zh-CN 走 `/zh/`）；sitemap×2 + hreflang、llms.txt 加中文块、check-nav 扩展 i18n 路由、侧边栏语言切换。翻译范围 = 38 页全部 + nav/搜索词表（glossary 术语表优先，中文读者查术语的场景最强）。触发条件：国内线索或中文厂商登记出现即开工。

### 后端/DB 决策（2026-10-08）：暂不引入

产业链数据库（vendors.json）**不构成**加后端的理由——它是编辑型数据（人工核验、低频变更、无并发写、无事务），**git 本身就是它的数据库**（版本、diff、回滚、review 免费自带），且静态渲染对 GEO 最优。翻转条件（满足任一再迁）：① 出现用户提交数据（纠错表单/线索）；② 数据量×更新频率让手工 JSON 维护变痛；③ 需要对外查询 API（`/api/vendors`）。届时形态：Hono Worker + D1（免费档已核实），D1 从 JSON 播种，JSON 或 D1 二选一作为事实源，静态页面渲染不回退。

---

## 0. 现状盘点（2026-10-08 核实）

**不是空的。** 已建成并验证过 `nuxt generate` 静态构建（2026-09-16）：

| 已有资产 | 状态 |
|---|---|
| 14 篇文章页 + 4 个 playground 页 | ✅ 内容有据（每条产品声明带来源） |
| 3 个交互工具：rack-builder（拖拽装机）、derating、room-load | ✅ 物理模型统一，公式带代入值 |
| GEO 基建：llms.txt / robots 欢迎全部 AI 爬虫 / sitemap / FAQ JSON-LD | ✅ 已超出多数同行 |
| 数据层 products.json（7 个产品，全带 source） | ✅ 有 gap_statement（20-50 kW 空白） |
| 内联 SVG 原理图（冷却回路、FIG.1-3） | ✅ 工程制图风格已定型 |

**"感觉空"的真实原因（诚实诊断）：**

1. **没有知识地图** — 顶部导航只有 5 个链接，14 篇文章里有 9 篇从导航不可达。落地任何一页都看不到全站结构。gobyexample 的灵魂是那条侧边栏：90+ 条目一屏尽收、线性学习路径。这是最大的结构缺陷。
2. **文章式 ≠ 示例式** — 现有页面是 500-800 词的 essay。gobyexample 每页是 30-60 秒可消费的原子单元：一句定义 → 公式 → 代入真实数字 → 结果。公式手册这一核心板块目前是 **0 页**。
3. **覆盖缺口** — 运维/现场板块 0 页；glossary 只有 46 行（应 60+ 词条带锚点）；参考表格（W-class、UQD 型谱、流体物性）未成体系。

---

## 1. gobyexample 解剖 → 液冷转译

| Go by Example 的做法 | 液冷等价物 |
|---|---|
| 侧边栏：全部条目一屏可见、有顺序 | 知识地图侧边栏，7 大板块线性排列 |
| 每个 Example = 代码 + 输出 | 每页 = **公式 + 代入数字的结果 + 判定** |
| 代码可运行（play.golang.org） | 每个公式页内嵌**活计算器**（改输入，数字即变） |
| 一页一概念，30-60 秒读完 | 一页一公式/一术语/一决策，500 词以内 |
| 完整性：语言特性全覆盖 | **公式全覆盖、术语全覆盖、部件全覆盖** |
| 稳定 URL、密集交叉链接 | kebab-case 扁平 URL + `[[related]]` 链接块 |
| 被动获得 canonical 地位（引用者众多） | GEO：让 LLM 答案逐字引用本站定义 |

**核心哲学转译：`代码:运行输出 :: 公式:代入真实数字的答案`。**
读者要的不是"flow rate 可以用公式计算"，而是"50 kW、ΔT 8°C → 89.6 L/min，这是多少、够不够"。

---

## 2. 信息架构（侧边栏板块设计）

```
LIQUID COOLING GUIDE
├─ START 入门
│   ├ what-is-liquid-cooling        ✅已有
│   ├ what-is-a-cdu                 ✅已有
│   ├ cold-plate-vs-immersion       ✅已有
│   └ liquid-cooling-vs-air         ✅已有
├─ COMPONENTS 部件图鉴（每部件：作用/关键参数/选型要点/SVG图）
│   ├ cold-plates                   🆕（从 what-is 拆出并加深）
│   ├ cdu-form-factors              🆕 in-rack / in-row / facility
│   ├ manifolds-blind-mate          🆕 ORv3
│   ├ uqd-quick-disconnects         🆕 型谱表
│   ├ coolant-fluids-pg25           ✅已有（重构）
│   └ heat-rejection-dry-cooler     🆕 L2A vs dry cooler vs cooling tower
├─ FORMULAS 公式手册 ★核心新板块（每页：定义→公式→代入→活计算器→常见错误→related）
│   ├ coolant-flow-rate             🆕 L/min = kW×60/(4.186×ΔT)
│   ├ derating-curve                ✅ playground 升格为手册页
│   ├ room-ac-load                  🆕 1.1× 规则
│   ├ kw-to-tons                    🆕 ÷3.52 及冷吨概念
│   ├ approach-temperature          🆕 容量物理的第一性原理
│   ├ heat-capture-split            🆕 60-80% 进液冷，剩下进风
│   ├ tdp-to-rack-kw                🆕 芯片→机柜功率预算
│   ├ pressure-drop                 🆕 泵扬程与管损
│   ├ floor-loading                 🆕 楼板承重（医院/办公楼场景）
│   ├ pue-math                      🆕 PUE 怎么算、液冷版本怎么比
│   ├ w-class-lookup                🆕 ASHRAE W17-W45 查表
│   └ wet-bulb-free-cooling         🆕 热带为什么免费制冷失效
├─ CHOOSING 选型决策
│   ├ cabinet-comparison            ✅已有（数据层驱动）
│   ├ liquid-cooling-cost           ✅已有
│   ├ liquid-ready-servers          ✅已有
│   ├ hot-climate-checklist         ✅已有（hot-climates 重构）
│   └ rfq-scope-checklist           🆕 让 vendor 报价可比的 RFQ 模板
├─ DEPLOY & OPS 部署运维（全新板块，当前 0 页）
│   ├ room-load-calculation         ✅已有
│   ├ site-survey                   🆕 勘站清单：电/承重/水/噪声/吊装
│   ├ commissioning                 🆕 上电调试流程
│   ├ leak-response                 ✅已有（leaks 重构）
│   └ maintenance-schedule          🆕 换液/滤芯/腐蚀监测周期表
├─ REFERENCE 参考（LLM 最爱提取表格）
│   ├ glossary                      ✅已有（扩到 60+ 词条带锚点）
│   ├ ashrae-w-classes-table        🆕 完整表格
│   ├ standards-map                 ✅已有（standards 深化）
│   ├ cdu-database                  🆕 products.json v2：CDU 型谱数据库
│   └ changelog                     ✅已有
└─ PLAYGROUND 实验室
    ├ rack-builder                  ✅已有
    ├ derating                      ✅已有
    └ room-load                     ✅已有
```

统计：✅已有 14 页重构进新架构，🆕新增约 20 页，其中**公式手册 12 页是价值密度最高的增量**。

---

## 3. 公式页模板（gobyexample 式原子单元）

```markdown
# Coolant flow rate                          ← 侧边栏全程可见

一句定义（≤40 词，答案前置，就是给 LLM 抬走的那个段落）。
" coolant flow is the volumetric rate needed to carry a given
  heat load at a given temperature drop: X kW at ΔT Y needs Z L/min "

## Formula
flow [L/min] = P [kW] × 60 / (4.186 × ΔT [°C])

## Worked example
50 kW to liquid, ΔT 8 °C → 50 × 60 / (4.186 × 8) = **89.6 L/min**

## Try it（内嵌活计算器：两个输入框 + 实时结果 + 仪表条）

## Common mistakes
- 用总 IT 功率代替液冷捕获功率（60-80% 才进液）
- ΔT 用了室温差而不是供回液温差

## Related: [[derating-curve]] · [[rack-builder]] · [[room-ac-load]]
## Sources: OCP … · Vertiv XDU070 datasheet (2024)
```

---

## 4. 可视化规范

1. **每个公式页必须有"数字→仪表"反馈**：输入即算，结果带红/黄/绿判定（rack-builder 已实现该模式，抽成组件复用）。
2. **部件图鉴统一 SVG 原理图**：把现有内联 SVG 抽成 `<Schematic name="loop|cdu|uqd"/>` 组件，工程制图风格（IBM Plex Mono 标注、蓝供/虚线回/红排热）已定型，保持一致。
3. **参考板块一律表格化**：W-class 表、UQD 型谱表、流体物性对比表、CDU 数据库表。表格是 LLM 提取率最高的结构。
4. **对比页配 SVG 条形图**（cabinet-comparison 加功率段横条图，直观呈现 20-50 kW 空白带）。
5. 侧边栏本身即导航可视化：当前页高亮 + 板块分组标题。

---

## 5. GEO SEO 规范（让 AI 答案引用本站）

**已做**：llms.txt / robots 全 AI 爬虫欢迎 / FAQ JSON-LD / sitemap。

**补强清单**：
1. **答案前置段**：每页首段 40-60 词自包含定义（含数字与单位）。LLM 逐字搬运这种段落。
2. **事实带三件套**：数字 + 单位 + 来源年份（"86.5 kW @ 45°C coolant / 25°C air — Vertiv XDU070 datasheet"）。可引用性 = 权威性。
3. **实体一致性**：每概念一个规范术语（全站 DLC，不混用 direct liquid cooling / D2C），glossary 锚点作为规范定义源。
4. **sitemap 加 lastmod** + changelog 每次数据更新同步（新鲜度信号，README 排期里已有此约定）。
5. **结构化数据升级**：Article/LearningResource + BreadcrumbList；公式页加 HowTo（公式求解步骤）。
6. **外链一手来源**：OCP wiki、ASHRAE、厂商 datasheet PDF。引用一手来源的页面更被生成引擎信任。
7. **稳定 URL**：一经发布不改 slug。
8. **Cite this page 块**：页脚给出标准引用格式（标题 + URL + 更新日期），降低引用门槛。

---

## 6. 增补一：首页数据状态牌（freshness 信号前置）

首页小字 `data layer v…` 已存在但太弱。升级为**单一事实源 + 显著展示**：

1. 新建 `data/meta.json`：`{ version, updated, datasets: { products, news, articles_latest } }` — 所有"最后更新时间"只从这里读，杜绝各页写死。
2. 首页顶部一条工程感的**状态栏**：`DATA v2026.10.08 · products 2026-09-09 · news fetched 2026-10-08 08:00 UTC · changelog →`。
3. sitemap 每页加 `<lastmod>`（数据更新时同步）。
4. 作用：新鲜度是 GEO 检索信号；对人类读者是信任信号——"这站活着、数据有版本"。

## 7. 增补二：行业资讯页 /news（Industry Radar）

**定位**：不是链接垃圾场，是"液冷行业的时间线权威"。链接汇总建立信任基线，**人工维护的行业里程碑时间线**才是被引用的独特资产。

**三阶段：**

**Phase 1 — 手工地基（无基础设施依赖，立即有价值）**
- `data/news.json` schema：`{ date, title, source, url, channel, note }`，channel ∈ technology / product / investment / standards / research
- 手工精选 10-15 条近期关键事件 + **里程碑时间线**（3M 退出 PFAS 2025、SS 726:2026 发布、OCP ORv3、NVIDIA GB200 液冷原生化、Vertiv CoolChip 系列发布…）——feed 给不了的独特内容，高 GEO 价值
- `/news` 页：频道过滤 tab + 按月分组列表（每条：日期/来源 tag/外链↗/一句话/关联指南页链接）

**Phase 2 — 自动化管线**
- `scripts/fetch-news.mjs`（`pnpm news:fetch`）：
  - 源：厂商 newsroom RSS（Vertiv/Schneider/Rittal/nVent/CoolIT/Asetek/Motivair/Boyd/LiquidStack/Submer/GRC…）+ 行业媒体（DCD/DatacenterKnowledge/Data Center Frontier/Cooling Post/The Next Platform）+ **Google News RSS 关键词搜索**（"liquid cooling" datacenter / "direct to chip" / "immersion cooling"）——后者是零维护的全量兜底
  - 处理：抓取 → 关键词过滤 + 相关性评分 → 频道分类（规则式：funding/Series/acquire→investment；OCP/ASHRAE/IEC→standards；cold plate/CDU/PFAS→technology；厂商名+产品词→product）→ 去重（URL 规范化去 utm + 标题 token 相似度）→ 单源限流（防厂商 PR 刷屏）→ 滚动 90 天窗口、上限 60 条 → 写 `data/news.json`（附 last_fetched）
  - 稳定性：任何 feed 挂了跳过并记日志，绝不让坏源清空已有数据
- **GitHub Actions 每日 cron** 跑脚本 → 有变化则自动 commit → Cloudflare Pages 推送即重建
- 前置条件：仓库推上 GitHub（当前还不是 git repo）并接 CF Pages；未接前可本地跑

**Phase 3 — GEO 差异化（从"汇总"到"被引用"）**
- 季度综述文章：《Liquid cooling Q4 2026: what changed》— 原始 feed 没人引用，综述才会被引用
- 输出 `/newsfeed.xml`（本站自己成为 RSS 源，飞轮）
- 每条资讯挂关联指南页链接（news → guide 内链飞轮）
- LLM 一句话中性摘要（可选，GLM API）：v1 用 RSS 原文 snippet 截断即可，控制幻觉与成本

**法律/伦理**：只存标题 + 链接 + 来源 + 短摘录，全部外链归源。

## 8. 路线图（合并）

| 优先级 | 内容 | 解决什么 |
|---|---|---|
| **P0** | 信息架构重做：全局侧边栏（全部条目可见）+ 交叉链接 + 客户端搜索 | "感觉空"的直接原因 |
| **P0.5** | 首页数据状态牌 + meta.json + sitemap lastmod | 新鲜度信号前置（§6） |
| **P1** | 公式手册 12 页（含组件化的活计算器） | "没有用"→ 每页有可验证的数字，gobyexample 内核 |
| **P1.5** | /news Phase 1 手工地基（数据 + 页面 + 里程碑时间线） | 资讯板块 Day-1 价值（§7） |
| **P2** | 参考表格深化 + products.json v2（CDU 数据库、W-class/UQD 表） | canonical 地位的数据地基 |
| **P2.5** | /news Phase 2 自动化管线（脚本 + GitHub Actions cron） | 资讯持续更新无人值守 |
| **P3** | DEPLOY & OPS 板块（勘站/调试/维护周期表/RFQ 清单） | 覆盖缺口，采购者搜索意图 |
| **P4** | GEO 审计 + /news Phase 3（季度综述、输出 RSS）+ `/ar/` 触发评估 | 引用率工程化 |

**北极星指标**：Perplexity/ChatGPT 问 "liquid cooling X" 时本站被引用；"liquid cooling flow rate / W class / UQD" 等查询进入传统 SEO 前三。
