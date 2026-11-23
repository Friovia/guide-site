#!/usr/bin/env node
// configurator-parity.mjs — the configurator's acceptance gate.
//
// 1. The guide-site configurator chain (src/lib/configurator.ts) must be a faithful
//    parameterization of the V&V'd reference cases: with the REFERENCE input (tropical,
//    8-OAM platform, 8 nodes × 10 kW, CDU121 at the published pump speed) its p0/p1 outputs must
//    be BIT-IDENTICAL to solving the reference case files directly (simulation repo test-case
//    rack-orv3.json / rack-orv3-thermal.json). Any drift = the page would be showing numbers the
//    kernel never verified.
// 2. Off-reference inputs must still produce a full, honest chain.
// 3. The report must state the boundary and versions.
// 4. Verdict honesty: the landing state must be feasible AND kernel-trusted; a run outside the
//    kernel's evidenced domain must fail the evidenced-domain gate; a platform without a sourced
//    hot-spot θ must say "not evaluated" rather than pass or fail; and no CJK may reach the page.
// 5. Operating-point chart and control honesty: everything drawn is the kernel's, the automatic
//    pump setpoint is adopted only when the kernel confirms it lands in the flow interval, a CDU
//    without a pump curve is never computed, and the catalog screen never invents a rating.
// Runs as part of `pnpm generate`.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SIM = join(ROOT, '..', 'simulation')
const viaUrl = p => pathToFileURL(p).href

const { solve: solveP0 } = await import(viaUrl(join(ROOT, 'sim/p0/solve.ts')))
const { solve: solveP1 } = await import(viaUrl(join(ROOT, 'sim/p1/solve.ts')))
const { interpCurve } = await import(viaUrl(join(ROOT, 'sim/p0/interp.ts')))
const { typedRackCurves } = await import(viaUrl(join(ROOT, 'sim/curves.ts')))
const {
  runChain, buildReport, speedForFlow, screenCatalog, gateShortName,
  DEFAULT_INPUT, REFERENCE_INPUT, PLATFORMS, CDUS, PUMP_CURVES,
} = await import(viaUrl(join(ROOT, 'src/lib/configurator.ts')))
const COOLING = JSON.parse(readFileSync(join(ROOT, 'data', 'hardware.json'), 'utf8')).cooling

let failures = 0
const fail = msg => { failures++; console.error(`✗ ${msg}`) }
const eq = (name, a, b) => {
  const ja = JSON.stringify(a), jb = JSON.stringify(b)
  if (ja !== jb) { fail(`${name} mismatch`); console.error('  chain :', ja?.slice(0, 300)); console.error('  ref   :', jb?.slice(0, 300)) }
  else console.log(`✓ ${name} bit-identical`)
}
const cfg = o => ({ scenario: 'hospital', platform: 'oai-8oam', nodes: 8, kwPerNode: 8, cdu: 'auto', speedPct: 'auto', ...o })
const verdictName = r => r.converged ? 'feasible' : r.trusted ? 'gated' : r.p0 === null ? 'not computable' : 'not judgeable'

// ---- 1. reference input ≡ reference cases (bit-identical outputs) ----
// The reference cases live in the SIBLING simulation repo (not vendored here),
// so this section runs only where that checkout exists (dev machines, the
// simulation repo's own CI). On the CF Pages build machine there is no sibling
// repo — sections 2-5 below still gate the chain itself.
const chain = runChain(REFERENCE_INPUT)
if (existsSync(join(SIM, 'p0-hydraulics/test-case/rack-orv3.json'))) {
  const refP0In = JSON.parse(readFileSync(join(SIM, 'p0-hydraulics/test-case/rack-orv3.json'), 'utf8'))
  const refP1In = JSON.parse(readFileSync(join(SIM, 'p1-thermal-chain/test-case/rack-orv3-thermal.json'), 'utf8'))
  eq('p0 output vs reference case', chain.p0, solveP0(refP0In))
  // Since the re-capture in the simulation repo (2026-11-23) the thermal reference case carries
  // the hydraulic reference case's own flows, so the committed file must reproduce chain.p1 as-is.
  eq('p1 output vs reference case (file as committed)', chain.p1, solveP1(refP1In))
  // Chain-consistency proof on top: the reference case with flows replaced by the chain's LIVE p0
  // output must also reproduce chain.p1 bit-identically — the configurator adds zero physics.
  const refP1Live = structuredClone(refP1In)
  refP1Live.case.flows = chain.p0.branches.filter(b => !b.shutdown).map(b => ({ id: b.id, qLpm: b.qLpm }))
  eq('p1 output vs reference case (live flows)', chain.p1, solveP1(refP1Live))
  if (!chain.trusted) fail('the reference input is not kernel-trusted — the V&V anchor left its evidenced domain')
  else console.log('✓ reference input is inside the kernel\'s evidenced domain')
} else {
  console.log('ℹ reference-case diff skipped (no sibling simulation repo on this machine) — chain self-checks below still run')
}

// ---- 2. off-reference inputs must still solve and stay honest ----
for (const c of [
  cfg({ nodes: 4, kwPerNode: 8 }),
  cfg({ scenario: 'campus', nodes: 10, kwPerNode: 12 }),
  cfg({ scenario: 'tropical', nodes: 12, kwPerNode: 20 }),
  cfg({ platform: 'hgx-h200', scenario: 'campus', nodes: 6, kwPerNode: 7.6 }),
]) {
  const r = runChain(c, { trace: false })
  if (!(r.p0 && r.p0.converged && r.p0.inputInvalid.length === 0 && r.p1 && typeof r.p1.dewPass === 'boolean')) {
    fail(`config ${JSON.stringify(c)} did not produce a full honest chain`); console.error('  ', { p0: r.p0 && r.p0.converged, p1: !!r.p1 })
  } else {
    console.log(`✓ config ${c.platform} ${c.scenario} ${c.nodes}×${c.kwPerNode} kW solved (verdict ${verdictName(r)}, ${r.cdu.id})`)
  }
}

// ---- 3. report must state the boundary and versions ----
const report = buildReport(chain)
for (const must of ['not a performance guarantee', 'feasibility', 'versions', 'p0 0.2.0']) {
  if (!report.includes(must)) fail(`report missing: "${must}"`)
}

// ---- 4. verdict honesty + zero CJK on every rendered surface ----
const CJK = /[\u4e00-\u9fff]/
const UNTRANSLATED = 'Kernel message not yet translated'
const renderedText = r => [...r.p0Warnings, ...r.p1Warnings, ...r.gates.map(g => `${g.label}: ${g.detail}`), buildReport(r)]

const landing = runChain(DEFAULT_INPUT)
if (!(landing.converged && landing.trusted)) {
  fail('landing state is not a feasible, kernel-trusted run: ' + JSON.stringify(DEFAULT_INPUT))
  console.error('  ', landing.gates.filter(g => !g.pass).map(g => `${g.id}: ${g.detail}`))
} else {
  console.log(`✓ landing state (${DEFAULT_INPUT.platform}, ${DEFAULT_INPUT.scenario} ${DEFAULT_INPUT.nodes}×${DEFAULT_INPUT.kwPerNode} kW · ${landing.cdu.label}) is feasible and inside the evidenced domain`)
}
const tcase = r => r.gates.find(g => g.id === 'tcase')
if (tcase(landing)?.notEvaluated !== true) fail('a platform without a sourced hot-spot θ must mark the T_case gate as not evaluated')
if (!landing.converged || landing.p1?.nodes.some(n => n.tCaseC !== null)) fail('T_case must not be computed for a platform without a sourced hot-spot θ')
if (tcase(chain)?.notEvaluated === true) fail('the 8-OAM platform has a sourced hot-spot θ — its T_case gate must be evaluated')
if (tcase(chain)?.pass !== true) fail('the reference input\'s T_case gate should pass')

const oamExample = runChain(cfg(), { trace: false })
if (!(oamExample.converged && oamExample.trusted)) fail('the 8-OAM example (hospital 8×8 kW, auto CDU, auto speed) is no longer feasible and trusted')
else console.log(`✓ 8-OAM example (hospital 8×8 kW · ${oamExample.cdu.id}) is feasible and inside the evidenced domain`)

const offDomain = runChain(cfg({ nodes: 4, kwPerNode: 8 }), { trace: false })
if (offDomain.trusted || offDomain.converged || offDomain.gates.find(g => g.id === 'evidenced-domain')?.pass !== false) {
  fail('off-domain run (8-OAM, hospital 4×8 kW) is not stopped by the evidenced-domain gate')
} else {
  console.log('✓ off-domain run (8-OAM, hospital 4×8 kW) fails the evidenced-domain gate — never presented as feasible')
}
// sweep the whole input range, both platforms: no CJK may reach the page or the report, and every
// kernel message the configurator can reach must have a real translation (no generic fallback)
let swept = 0, judgeable = {}
const cjkLeaks = new Set(), fallbacks = new Set()
for (const platform of Object.keys(PLATFORMS)) {
  for (const scenario of ['tropical', 'hospital', 'campus']) {
    for (let nodes = 1; nodes <= 12; nodes++) {
      for (let kw = 4; kw <= 20; kw += 1) {
        const r = runChain({ scenario, platform, nodes, kwPerNode: kw, cdu: 'auto', speedPct: 'auto' }, { trace: false })
        swept++
        if (r.converged) judgeable[platform] = (judgeable[platform] ?? 0) + 1
        for (const s of renderedText(r)) if (CJK.test(s)) cjkLeaks.add(s.slice(0, 120))
        for (const w of [...r.p0Warnings, ...r.p1Warnings]) if (w.startsWith(UNTRANSLATED)) fallbacks.add(w)
      }
    }
  }
}
if (cjkLeaks.size) { fail(`CJK reached rendered text in ${cjkLeaks.size} distinct strings`); console.error('  ', [...cjkLeaks].slice(0, 3)) }
if (fallbacks.size) fail('kernel messages without a translation fell back to the generic line')
if (!cjkLeaks.size && !fallbacks.size) console.log(`✓ swept ${swept} input states across ${Object.keys(PLATFORMS).length} platforms: no CJK, every reachable kernel message translated; judgeable states ${JSON.stringify(judgeable)}`)
if (!(judgeable['hgx-h200'] > 0)) fail('the HGX platform has no judgeable state at all — the lighter node model did not unlock anything')

// ---- 5. operating-point chart and control honesty: everything drawn is the kernel's ----
const pumpCurveOf = cdu => typedRackCurves()[cdu.pumpCurveId]
function checkOperatingPoint(r, label) {
  const { p0, cdu } = r
  if (!p0 || !p0.converged || p0.qTotalLpm == null || p0.pumpDpKPa == null) return fail(`${label}: no converged operating point to check`)
  const s = r.speedPct / 100
  // on the pump curve, scaled exactly as the kernel scales it (affinity laws)
  const onPump = s * s * interpCurve(pumpCurveOf(cdu), p0.qTotalLpm / s).v
  if (Math.abs(onPump - p0.pumpDpKPa) > 1e-6) fail(`${label}: operating point is not on the drawn pump curve (${onPump.toFixed(4)} vs ${p0.pumpDpKPa.toFixed(4)} kPa)`)
  // the traced system curve ends at the operating point when the pump runs at the published speed
  const last = r.systemCurve[r.systemCurve.length - 1]
  if (r.speedPct >= 100 && (!last || Math.abs(last[0] - p0.qTotalLpm) > 1e-9 || Math.abs(last[1] - p0.pumpDpKPa) > 1e-9)) {
    fail(`${label}: traced system curve does not end at the operating point`)
  }
  if (r.systemCurve.some((p, i) => i > 0 && !(p[0] > r.systemCurve[i - 1][0] && p[1] > r.systemCurve[i - 1][1]))) {
    fail(`${label}: traced system curve is not monotonic (flow and head must rise together)`)
  }
}
checkOperatingPoint(chain, 'reference')
checkOperatingPoint(landing, 'landing')

// manual speed control lands where the kernel says
const manualBase = cfg()
const throttled = speedForFlow(manualBase, CDUS.find(c => c.id === 'cdu121'), PLATFORMS['oai-8oam'], 70)
if (throttled === null || throttled >= 100) fail('speedForFlow returned no throttled speed')
else {
  const r = runChain({ ...manualBase, cdu: 'cdu121', speedPct: throttled })
  if (Math.abs(r.p0.qTotalLpm - 70) > 1) fail(`speed control missed the target flow (${r.p0.qTotalLpm.toFixed(2)} vs 70 L/min at ${throttled}%)`)
  else console.log(`✓ manual speed control: ${throttled}% lands at ${r.p0.qTotalLpm.toFixed(2)} L/min for a 70 L/min request`)
  checkOperatingPoint(r, 'throttled')
}
// automatic setpoint: adopted only when the kernel confirms it lands inside the flow interval
const autoThrottled = runChain({ scenario: 'hospital', platform: 'hgx-h200', nodes: 10, kwPerNode: 7.6, cdu: 'cdu121', speedPct: 'auto' })
const qPerNode = autoThrottled.p0?.branches[0]?.qLpm ?? NaN
const liquidKw = 7.6 * PLATFORMS['hgx-h200'].capture
if (!(autoThrottled.speedAuto && autoThrottled.speedPct < 100 && autoThrottled.converged && autoThrottled.trusted)) {
  fail('automatic setpoint did not throttle the CDU121 for ten HGX nodes into a judgeable state')
  console.error('  ', { speed: autoThrottled.speedPct, verdict: verdictName(autoThrottled), q: qPerNode, gates: autoThrottled.gates.filter(g => !g.pass).map(g => `${g.id}: ${g.detail}`) })
} else {
  const inside = qPerNode >= liquidKw * 1.25 && qPerNode <= liquidKw * 2.0
  if (!inside) fail(`automatic setpoint landed outside the OAI window (${qPerNode.toFixed(2)} L/min per node)`)
  else console.log(`✓ automatic setpoint: ten HGX nodes on the CDU121 → pump throttled to ${autoThrottled.speedPct}%, ${qPerNode.toFixed(2)} L/min per node, judgeable`)
  checkOperatingPoint(autoThrottled, 'auto-setpoint')
}
// when no flow can satisfy both the node curves and the CDU's HX band, the pump still holds the
// part it controls — the chain must run (converged hydraulics, thermal chain present) and the
// evidenced-domain gate must be the one that stops it, naming the HX band
const hxUnreachable = runChain({ scenario: 'hospital', platform: 'hgx-h200', nodes: 4, kwPerNode: 7.6, cdu: 'cdu40', speedPct: 'auto' })
if (!(hxUnreachable.speedAuto && hxUnreachable.speedPct < 100 && hxUnreachable.p0?.converged && hxUnreachable.p1)) {
  fail('with an unreachable HX band the pump should still throttle into the node curves\u2019 range so the chain can run')
  console.error('  ', { speed: hxUnreachable.speedPct, p0: hxUnreachable.p0?.converged, p1: !!hxUnreachable.p1 })
} else if (hxUnreachable.trusted || hxUnreachable.converged || !hxUnreachable.gates.find(g => g.id === 'evidenced-domain' && !g.pass)) {
  fail('with an unreachable HX band the run must stay not judgeable, stopped by the evidenced-domain gate')
} else {
  console.log(`✓ unreachable HX band (four HGX nodes on the CDU40): pump throttled to ${hxUnreachable.speedPct}%, hydraulics converge, verdict not judgeable via the evidenced-domain gate`)
}
// when the published-speed flow already sits inside the window, the setpoint must not move the pump
if (landing.speedPct !== 100) fail(`landing state: pump was moved off the published speed (${landing.speedPct}%) although its flow is already inside the window`)
const noPump = runChain(cfg({ cdu: 'xcrow080' }))
if (noPump.p0 !== null || noPump.systemCurve.length || noPump.converged || !noPump.gates.some(g => g.id === 'pump-curve' && !g.pass)) {
  fail('a CDU without a pump curve was computed')
} else console.log('✓ CDU without a pump curve (XCRow080) stays uncomputed and red')
const overCapacity = runChain(cfg({ nodes: 12, kwPerNode: 20, cdu: 'cdu40', speedPct: 100 }), { trace: false })
if (overCapacity.gates.find(g => g.id === 'capacity')?.pass !== false) fail('an over-capacity load passed the HX capacity gate')
if (CDUS.length !== 3 || PUMP_CURVES.length !== 2 || chain.comparison.length !== CDUS.length) fail('CDU table shape changed unexpectedly')

// catalog screen: nameplate only, and it never invents a rating
const cat = screenCatalog(COOLING, 60.8, 24)
const byId = Object.fromEntries(cat.map(c => [c.product.id, c]))
if (cat.length !== COOLING.length) fail('catalog screen did not cover every cooling product')
if (byId['envicool-l2a']?.verdict !== 'not published') fail('an unpublished rating was not flagged as such')
if (COOLING.some(p => p.ratedKw != null && p.ratedKw < 60.8) && !cat.some(c => c.verdict === 'undersized')) fail('an undersized product was not flagged')
if (cat.some(c => c.verdict === 'fits' && c.product.ratedKw != null && c.product.ratedKw < 60.8)) fail('an undersized product passed the nameplate screen')
if (cat.some(c => !['fits', 'undersized', 'not published'].includes(c.verdict))) fail('catalog screen returned an unknown verdict')
if (cat.some(c => /undefined|NaN/.test(c.note))) fail('catalog screen printed an undefined value')
if (!failures) console.log(`✓ catalog screen: ${cat.length} products at 60.8 kW → ${cat.filter(c => c.verdict === 'fits').length} fit by nameplate, ${cat.filter(c => c.verdict === 'undersized').length} undersized, ${cat.filter(c => c.verdict === 'not published').length} not published`)
const landingCat = runChain(DEFAULT_INPUT, { catalog: COOLING, trace: false }).catalog
if (landingCat.length !== COOLING.length || !buildReport({ ...landing, catalog: landingCat }).includes('Catalog screen')) fail('the catalog screen did not reach the calculation note')
for (const id of ['pump-curve', 'capacity', 'flow-window', 'evidenced-domain', 'dew', 'wclass', 'tcase']) if (gateShortName(id) === id) fail(`gate ${id} has no short name`)

console.log(failures ? `✗ configurator parity FAILED (${failures})` : '✓ configurator parity passed (page numbers = kernel numbers)')
process.exit(failures ? 1 : 0)
