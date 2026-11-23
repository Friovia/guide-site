// TEMPORARY shim (added with the C0 trust fix): the vendored kernel (sim/, MANIFEST-anchored)
// still emits its runtime messages in Chinese. The site rule is zero CJK on any en/es/ar
// surface, and the vendored copy must never be edited by hand — so messages are rewritten to
// English here, at the display boundary. Delete this file once friovia/simulation ships
// English messages and `pnpm vendor:sim` has been re-run.
//
// The rules below are the messages the configurator can actually reach (enumerated by
// sweeping its full input range). Anything else containing CJK falls back to a generic line:
// losing the wording is better than breaking the zero-CJK rule, and the `evidenced-domain`
// gate carries the trust verdict independently of the text.

const N = '([\\d.]+)' // a toFixed()-formatted number
const ID = '(\\S+)'
const SIGN = '\\s*[-−]\\s*' // the kernel uses U+2212 MINUS SIGN

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** Anchored pattern from a message template: literal parts escaped, ${N}/${ID} kept as groups. */
const rx = (lit: TemplateStringsArray, ...groups: string[]) =>
  new RegExp('^' + lit.raw.reduce((acc, part, i) => acc + escapeRe(part) + (groups[i] ?? ''), '') + '$')

type Rule = [RegExp, (m: RegExpExecArray) => string]

const RULES: Rule[] = [
  // p1 — heat-exchanger rated-flow band (the first wall any off-reference rack hits)
  [rx`TCS 实际流量 ${N} L/min 偏离 hx 曲线额定流量域 ${N} L/min 达 ${N}%（斜率仅额定流量有据，超 ±25% 登记带宽：输出不可信）`,
    m => `Rack-loop (TCS) flow ${m[1]} L/min is ${m[3]}% away from the heat-exchanger curve's rated flow of ${m[2]} L/min — outside the ±25% registered band (the capacity slope is evidenced only at rated flow): output not trustworthy`],
  [rx`TCS 实际流量 ${N} L/min 偏离 hx 曲线额定流量域 ${N} L/min 达 ${N}%（斜率仅额定流量有据，登记带宽 ±10% 起告警）`,
    m => `Rack-loop (TCS) flow ${m[1]} L/min is ${m[3]}% away from the heat-exchanger curve's rated flow of ${m[2]} L/min (the capacity slope is evidenced only at rated flow; registered warn band ±10%)`],
  [rx`FWS 回水 ${N}°C ≥ TCS 回液 ${N}°C（热力学不可行：一次侧容量不足或斜率在域外失效）`,
    m => `Facility-water return ${m[1]} °C ≥ rack-loop return ${m[2]} °C — thermodynamically infeasible (primary-side capacity shortfall, or the heat-exchanger slope is invalid this far outside its domain)`],
  // p1 — cold-plate θ data domain
  [rx`支路 ${ID} 每路流量 ${N} L/min 超出 θ 数据域 [${N}, ${N}]（冷板 θ 仅在该域有据：输出不可信）`,
    m => `Branch ${m[1]}: ${m[2]} L/min per cold plate is outside the θ data domain [${m[3]}, ${m[4]}] (cold-plate θ is evidenced only within that domain): output not trustworthy`],
  [rx`热点 ${ID} T_case ${N}°C 超厂商上限 ${N}°C（降额或提流量）`,
    m => `Hot spot ${m[1]}: T_case ${m[2]} °C exceeds the vendor limit ${m[3]} °C (derate or raise flow)`],
  // p1 — red lines and range checks the presets can reach
  [rx`供液 ${N}°C${SIGN}房间露点 ${N}°C = ${N} K < 红线 ${N} K（冷凝风险，热带安全红线：禁止出承诺）`,
    m => `Supply ${m[1]} °C − room dew point ${m[2]} °C = ${m[3]} K, below the ${m[4]} K red line (condensation risk — a safety red line: no guarantee may be issued)`],
  [rx`FWS 供水 ${N}°C 低于房间露点 ${N}°C（一次侧管路防凝露属设施域，请确认保温/封闭）`,
    m => `Facility-water supply ${m[1]} °C is below the room dew point ${m[2]} °C (condensation protection on the primary side belongs to the facility domain — confirm insulation / sealed routing)`],
  [rx`FWS 供水 ${N}°C 超出常规设施水温范围 0–60°C（一次侧为设施域，请复核输入）`,
    m => `Facility-water supply ${m[1]} °C is outside the customary 0–60 °C facility range (the primary side belongs to the facility domain — re-check the input)`],
  [rx`供水温度 ${N}°C 超出 ${ID} 上限 ${N}°C（ASHRAE W 级）`,
    m => `Supply temperature ${m[1]} °C exceeds the ${m[2]} limit of ${m[3]} °C (ASHRAE W class)`],
  [rx`输出含非有限值（NaN 守卫触发）`,
    () => 'Output contains a non-finite value (NaN guard tripped)'],
]

const CJK = /[\u4e00-\u9fff]/

/** Rewrite one kernel message to English; non-CJK text passes through untouched. */
export function englishKernelMessage(message: string): string {
  for (const [pattern, render] of RULES) {
    const m = pattern.exec(message)
    if (m) return render(m)
  }
  return CJK.test(message)
    ? 'Kernel message not yet translated — see the solver output (github.com/Friovia/simulation)'
    : message
}

/** English, de-duplicated kernel messages in first-seen order. */
export function englishKernelMessages(messages: readonly string[]): string[] {
  return [...new Set(messages.map(englishKernelMessage))]
}
