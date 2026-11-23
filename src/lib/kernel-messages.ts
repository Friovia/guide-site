// Kernel message translation (render layer) — the permanent home of it on this site.
//
// The vendored kernel (sim/, MANIFEST-anchored) emits its runtime warnings in Chinese, and that
// text is deliberately locked: the simulation repo's golden vectors and the official site's API
// contract snapshots assert on it. So messages are rewritten to English here, at the display
// boundary — the same approach as official-site's utils/warnI18n.ts, whose pattern table this
// file mirrors (English only: this page is an English surface).
//
// Two deliberate differences from the official layer:
//  - an unmatched message containing CJK becomes a generic English line instead of passing
//    through — this site has a zero-CJK rule on user-visible surfaces;
//  - the parity gate sweeps the configurator's input range and fails on any CJK that reaches
//    gate details, kernel messages or the report.
//
// Sync duty: when friovia/simulation adds a `warnings.add(...)`, add its pattern here and in
// official-site/utils/warnI18n.ts.

interface WarnPattern { re: RegExp; en: string }

const NUM = String.raw`[-\d.]+`
const TXT = String.raw`.+?`

const PATTERNS: WarnPattern[] = [
  // ---- p0-hydraulics ----
  { re: new RegExp(`^曲线 (${TXT}) 为水基准（(${TXT})）用于 PG25 工况，未做黏度修正（政策 5）$`), en: `Curve $1 is water-based ($2) used for PG25 duty without viscosity correction (policy 5)` },
  { re: new RegExp(`^关断支路：(${TXT})（再分配情景）$`), en: `Shut-down branches: $1 (redistribution scenario)` },
  { re: new RegExp(`^泵曲线越界：查表流量 (${NUM}) > 域 (${NUM}) L/min（变频 (${NUM})%，输出不可信）$`), en: `Pump curve out of range: lookup flow $1 > domain $2 L/min (VFD $3%, output untrusted)` },
  { re: new RegExp(`^泵曲线下界越界：查表流量 (${NUM}) < (${NUM}) L/min（已按起端值钳位，m3）$`), en: `Pump curve lower-bound exceedance: lookup flow $1 < $2 L/min (clamped to start value, m3)` },
  { re: new RegExp(`^支路 (${TXT}) 零流量（可用压差不足或低于曲线起端 ΔP，m3）$`), en: `Branch $1 zero flow (insufficient available head or below curve start ΔP, m3)` },
  { re: new RegExp(`^支路 (${TXT}) 曲线 (${TXT}) 越界：(${NUM}) > (${NUM}) L/min（输出不可信）$`), en: `Branch $1 curve $2 out of range: $3 > $4 L/min (output untrusted)` },
  { re: new RegExp(`^支路 (${TXT}) 曲线 (${TXT}) 下界平顶：q=(${NUM}) < 曲线起端 (${NUM}) L/min（已按起端值钳位，m3）$`), en: `Branch $1 curve $2 lower flat: q=$3 < curve start $4 L/min (clamped to start value, m3)` },
  { re: new RegExp(`^支路 (${TXT}) 流量 (${NUM}) 低于 min 保证 (${NUM}) L/min$`), en: `Branch $1 flow $2 below guaranteed minimum $3 L/min` },
  { re: new RegExp(`^支路 (${TXT}) Re=(${NUM}) 落过渡带 2300–4000（q=(${NUM}) L/min，d=(${NUM})mm）：摩擦关联式不确定度 ±25% 级（Churchill 对拍见 docs/friction-churchill-compare.md），压降按保守区间解读$`), en: `Branch $1 Re=$2 in transition band 2300–4000 (q=$3 L/min, d=$4 mm): friction correlation uncertainty ±25% (Churchill comparison in docs/friction-churchill-compare.md), read ΔP as a conservative range` },
  { re: new RegExp(`^过滤器堵塞情景：\\+(${NUM}) kPa/支路$`), en: `Filter clogging scenario: +$1 kPa/branch` },
  // ---- p1-thermal-chain ----
  { re: new RegExp(`^机柜总流量 (${NUM}) L/min 带载 (${NUM}) kW：零流量带载过热无解（温度不出数）$`), en: `Rack total flow $1 L/min under load $2 kW: zero-flow-with-load has no thermal solution (no temperature output)` },
  { re: new RegExp(`^FWS 供水 (${NUM})°C 超出常规设施水温范围 0–60°C（一次侧为设施域，请复核输入）$`), en: `FWS supply $1°C outside the usual facility water range 0–60°C (primary side is the facility domain, please review inputs)` },
  { re: new RegExp(`^TCS 实际流量 (${NUM}) L/min 偏离 hx 曲线额定流量域 (${NUM}) L/min 达 (${NUM})%（斜率仅额定流量有据，超 ±25% 登记带宽：输出不可信）$`), en: `TCS actual flow $1 L/min deviates from hx curve rated flow $2 L/min by $3% (slope is only evidenced at rated flow, beyond the registered ±25% band: output untrusted)` },
  { re: new RegExp(`^TCS 实际流量 (${NUM}) L/min 偏离 hx 曲线额定流量域 (${NUM}) L/min 达 (${NUM})%（斜率仅额定流量有据，登记带宽 ±10% 起告警）$`), en: `TCS actual flow $1 L/min deviates from hx curve rated flow $2 L/min by $3% (slope is only evidenced at rated flow, registered ±10% advisory band)` },
  { re: new RegExp(`^FWS 回水 (${NUM})°C ≥ TCS 回液 (${NUM})°C（热力学不可行：一次侧容量不足或斜率在域外失效）$`), en: `FWS return $1°C ≥ TCS return $2°C (thermodynamically infeasible: primary-side capacity insufficient or slope invalid out of domain)` },
  { re: new RegExp(`^支路 (${TXT}) 零流量但带 (${NUM}) W 液体负荷：过热无解（tOut/T_case 不出数）$`), en: `Branch $1 zero flow while carrying $2 W liquid load: no thermal solution (no tOut/T_case output)` },
  { re: new RegExp(`^支路 (${TXT}) 能量平衡定点未收敛$`), en: `Branch $1 energy-balance fixed point did not converge` },
  { re: new RegExp(`^支路 (${TXT}) 每路流量 (${NUM}) L/min 超出 θ 数据域 \\[(${NUM}), (${NUM})\\]（冷板 θ 仅在该域有据：输出不可信）$`), en: `Branch $1 per-plate flow $2 L/min outside θ data domain [$3, $4] (cold-plate θ only evidenced in this domain: output untrusted)` },
  { re: new RegExp(`^热点 (${TXT}) T_case (${NUM})°C 超厂商上限 (${NUM})°C（降额或提流量）$`), en: `Hotspot $1 T_case $2°C exceeds vendor limit $3°C (derate or raise flow)` },
  { re: new RegExp(`^物性评估温度超 Dow LC 25 表域 0–60°C（(${NUM}) 处，极端 (${NUM})/(${NUM})°C——端点钳位，域外无据：输出不可信）$`), en: `Property evaluation temperature outside Dow LC 25 table domain 0–60°C ($1 spots, extremes $2/$3°C — end-point clamped, no evidence out of domain: output untrusted)` },
  { re: new RegExp(`^TCS 温度 (${NUM})°C 超 PG25 常压沸点 (${NUM})°C（memo §1.1）——物理荒谬，请检查输入$`), en: `TCS temperature $1°C exceeds PG25 atmospheric boiling point $2°C (memo §1.1) — physically absurd, check inputs` },
  { re: new RegExp(`^TCS 温度 (${NUM})°C 超 LC 25 产品许用上限 (${NUM})°C（memo §1.1，许用 −10…90°C：输出不可信）$`), en: `TCS temperature $1°C exceeds LC 25 product allowable limit $2°C (memo §1.1, allowable −10…90°C: output untrusted)` },
  { re: new RegExp(`^房间温度 (${NUM})°C 超出 A-E 露点式拟合域 −40…\\+50°C（memo G8，结果无据）$`), en: `Room temperature $1°C outside A-E dew-point fit domain −40…+50°C (memo G8, result unevidenced)` },
  { re: new RegExp(`^露点系数交叉核差 (${NUM}) K > 0\\.15 K（实现异常）$`), en: `Dew-point coefficient cross-check difference $1 K > 0.15 K (implementation anomaly)` },
  { re: new RegExp(`^供液 (${NUM})°C − 房间露点 (${NUM})°C = (${NUM}) K < 红线 (${NUM}) K（冷凝风险，热带安全红线：禁止出承诺）$`), en: `Supply $1°C − room dew point $2°C = $3 K < red line $4 K (condensation risk, tropical safety red line: commitments prohibited)` },
  { re: new RegExp(`^FWS 供水 (${NUM})°C 低于房间露点 (${NUM})°C（一次侧管路防凝露属设施域，请确认保温/封闭）$`), en: `FWS supply $1°C below room dew point $2°C (primary-side anti-condensation is the facility domain, confirm insulation/sealing)` },
  { re: new RegExp(`^given 模式无设施信息：W 级按 TCS 供液 (${NUM})°C 检查（从严——设施供水 ≤ TCS 供液）$`), en: `given mode has no facility info: W-class checked against TCS supply $1°C (conservative — facility supply ≤ TCS supply)` },
  { re: new RegExp(`^供水温度 (${NUM})°C 超出 (${TXT}) 上限 (${NUM})°C（ASHRAE W 级）$`), en: `Supply temperature $1°C exceeds $2 limit $3°C (ASHRAE W-class)` },
  { re: new RegExp(`^供水温度 (${NUM})°C 低于 ASHRAE 全级下限 (${NUM})°C（官方表脚注 a）$`), en: `Supply temperature $1°C below ASHRAE all-class lower limit $2°C (official table footnote a)` },
  { re: new RegExp(`^定点末步差 (${NUM}) > (${NUM})（§6.1 P1 等价判据不满足）$`), en: `Fixed-point last-step difference $1 > $2 (§6.1 P1 equivalence criterion not met)` },
  // ---- not in the official table (unreachable there): numerical guards ----
  { re: new RegExp(`^输出含非有限值（NaN 守卫触发）$`), en: `Output contains a non-finite value (NaN guard tripped)` },
]

const CJK = /[\u4e00-\u9fff]/
export const UNTRANSLATED_KERNEL_MESSAGE =
  'Kernel message not yet translated — see the solver output (github.com/Friovia/simulation)'

/** Rewrite one kernel message to English; text without CJK passes through untouched. */
export function englishKernelMessage(message: string): string {
  for (const p of PATTERNS) {
    const m = message.match(p.re)
    if (m) {
      let out = p.en
      for (let i = 1; i < m.length; i++) out = out.split(`$${i}`).join(m[i] ?? '')
      return out
    }
  }
  return CJK.test(message) ? UNTRANSLATED_KERNEL_MESSAGE : message
}

/** English, de-duplicated kernel messages in first-seen order. */
export function englishKernelMessages(messages: readonly string[]): string[] {
  return [...new Set(messages.map(englishKernelMessage))]
}
