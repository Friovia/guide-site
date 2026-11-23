#!/usr/bin/env node
// configurator-parity.mjs — the configurator's acceptance gate.
//
// 1. The guide-site configurator chain (src/lib/configurator.ts) must be a faithful
//    parameterization of the V&V'd reference cases: with the REFERENCE input (tropical,
//    8 nodes × 10 kW, CDU121 at the published pump speed) its p0/p1 outputs must be
//    BIT-IDENTICAL to solving the reference case files directly (simulation repo test-case
//    rack-orv3.json / rack-orv3-thermal.json). Any drift = the page would be showing numbers
//    the kernel never verified.
// 2. Off-reference inputs must still produce a full, honest chain.
// 3. The report must state the boundary and versions.
// 4. Verdict honesty: the landing state must be feasible AND kernel-trusted; a run outside
//    the kernel's evidenced domain must fail the evidenced-domain gate; and no CJK may reach
//    the page text or the report.
// 5. Operating-point chart honesty: every drawn quantity must be the kernel's — the speed
//    control lands where the kernel says, the operating point lies on the pump curve as the
//    kernel scales it and on the traced system curve, and a CDU without a pump curve is never
//    computed.
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
  runChain, buildReport, speedForFlow, DEFAULT_INPUT, REFERENCE_INPUT, CDUS, PUMP_CURVES,
} = await import(viaUrl(join(ROOT, 'src/lib/configurator.ts')))

let failures = 0
const fail = msg => { failures++; console.error(`✗ ${msg}`) }
const eq = (name, a, b) => {
  const ja = JSON.stringify(a), jb = JSON.stringify(b)
  if (ja !== jb) { fail(`${name} mismatch`); console.error('  chain :', ja?.slice(0, 300)); console.error('  ref   :', jb?.slice(0, 300)) }
  else console.log(`✓ ${name} bit-identical`)
}

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
  // NOTE: refP1In's flows are a STALE snapshot of an older p0 output (curve library
  // revised after capture). The honest p1 parity is chain-consistency: the reference
  // case with flows replaced by the chain's LIVE p0 output must reproduce chain.p1
  // bit-identically — proving the configurator adds zero physics of its own.
  const refP1Live = structuredClone(refP1In)
  refP1Live.case.flows = chain.p0.branches.filter(b => !b.shutdown).map(b => ({ id: b.id, qLpm: b.qLpm }))
  eq('p1 output vs reference case (live flows)', chain.p1, solveP1(refP1Live))
  if (!chain.trusted) fail('the reference input is not kernel-trusted — the V&V anchor left its evidenced domain')
  else console.log('✓ reference input is inside the kernel\'s evidenced domain')
} else {
  console.log('ℹ reference-case diff skipped (no sibling simulation repo on this machine) — chain self-checks below still run')
}

// ---- 2. off-reference inputs must still solve and stay honest ----
for (const cfg of [
  { scenario: 'hospital', nodes: 4, kwPerNode: 8 },
  { scenario: 'campus', nodes: 10, kwPerNode: 12 },
  { scenario: 'tropical', nodes: 12, kwPerNode: 20 },
]) {
  const r = runChain({ ...cfg, cdu: 'auto', speedPct: 100 }, { trace: false })
  if (!(r.p0 && r.p0.converged && r.p0.inputInvalid.length === 0 && r.p1 && typeof r.p1.dewPass === 'boolean')) {
    fail(`config ${JSON.stringify(cfg)} did not produce a full honest chain`); console.error('  ', { p0: r.p0 && r.p0.converged, p1: !!r.p1 })
  } else {
    console.log(`✓ config ${cfg.scenario} ${cfg.nodes}×${cfg.kwPerNode} kW solved (verdict ${r.converged ? 'feasible' : r.trusted ? 'gated' : 'outside evidenced domain'})`)
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
  console.error('  ', landing.gates.filter(g => !g.pass).map(g => g.id))
} else {
  console.log(`✓ landing state (${DEFAULT_INPUT.scenario} ${DEFAULT_INPUT.nodes}×${DEFAULT_INPUT.kwPerNode} kW · ${landing.cdu.label}) is feasible and inside the evidenced domain`)
}
const offDomain = runChain({ scenario: 'hospital', nodes: 4, kwPerNode: 8, cdu: 'auto', speedPct: 100 }, { trace: false })
const domainGate = offDomain.gates.find(g => g.id === 'evidenced-domain')
if (offDomain.trusted || offDomain.converged || domainGate?.pass !== false) {
  fail('off-domain run (hospital 4×8 kW) is not stopped by the evidenced-domain gate')
} else {
  console.log('✓ off-domain run (hospital 4×8 kW) fails the evidenced-domain gate — never presented as feasible')
}
// sweep the whole input range: no CJK may reach the page or the report, and every kernel message
// the configurator can reach must have a real translation (no generic fallback line)
let swept = 0
const cjkLeaks = new Set(), fallbacks = new Set()
for (const scenario of ['tropical', 'hospital', 'campus']) {
  for (let nodes = 1; nodes <= 12; nodes++) {
    for (let kw = 4; kw <= 20; kw += 1) {
      const r = runChain({ scenario, nodes, kwPerNode: kw, cdu: 'auto', speedPct: 100 }, { trace: false })
      swept++
      for (const s of renderedText(r)) if (CJK.test(s)) cjkLeaks.add(s.slice(0, 120))
      for (const w of [...r.p0Warnings, ...r.p1Warnings]) if (w.startsWith(UNTRANSLATED)) fallbacks.add(w)
    }
  }
}
if (cjkLeaks.size) { fail(`CJK reached rendered text in ${cjkLeaks.size} distinct strings`); console.error('  ', [...cjkLeaks].slice(0, 3)) }
if (fallbacks.size) fail('kernel messages without a translation fell back to the generic line')
if (!cjkLeaks.size && !fallbacks.size) console.log(`✓ swept ${swept} input states: no CJK in gate details, kernel messages or reports; every reachable kernel message translated`)

// ---- 5. operating-point chart honesty: everything drawn is the kernel's ----
const pumpCurveOf = cdu => typedRackCurves()[cdu.pumpCurveId]
function checkOperatingPoint(r, label) {
  const { p0, cdu, input } = r
  if (!p0 || !p0.converged || p0.qTotalLpm == null || p0.pumpDpKPa == null) return fail(`${label}: no converged operating point to check`)
  const s = input.speedPct / 100
  // on the pump curve, scaled exactly as the kernel scales it (affinity laws)
  const onPump = s * s * interpCurve(pumpCurveOf(cdu), p0.qTotalLpm / s).v
  if (Math.abs(onPump - p0.pumpDpKPa) > 1e-6) fail(`${label}: operating point is not on the drawn pump curve (${onPump.toFixed(4)} vs ${p0.pumpDpKPa.toFixed(4)} kPa)`)
  // the traced system curve ends at the operating point when the pump runs at the published speed
  const last = r.systemCurve[r.systemCurve.length - 1]
  if (input.speedPct >= 100 && (!last || Math.abs(last[0] - p0.qTotalLpm) > 1e-9 || Math.abs(last[1] - p0.pumpDpKPa) > 1e-9)) {
    fail(`${label}: traced system curve does not end at the operating point`)
  }
  if (r.systemCurve.some((p, i) => i > 0 && !(p[0] > r.systemCurve[i - 1][0] && p[1] > r.systemCurve[i - 1][1]))) {
    fail(`${label}: traced system curve is not monotonic (flow and head must rise together)`)
  }
}
checkOperatingPoint(chain, 'reference')
checkOperatingPoint(landing, 'landing')

const base = { scenario: 'hospital', nodes: 8, kwPerNode: 8, cdu: 'auto' }
const throttled = speedForFlow({ ...base, speedPct: 100 }, 70)
if (throttled === null || throttled >= 100) fail('speedForFlow returned no throttled speed')
else {
  const r = runChain({ ...base, speedPct: throttled })
  if (Math.abs(r.p0.qTotalLpm - 70) > 1) fail(`speed control missed the target flow (${r.p0.qTotalLpm.toFixed(2)} vs 70 L/min at ${throttled}%)`)
  else console.log(`✓ speed control: ${throttled}% lands at ${r.p0.qTotalLpm.toFixed(2)} L/min for a 70 L/min request`)
  checkOperatingPoint(r, 'throttled')
}
const noPump = runChain({ ...base, cdu: 'xcrow080', speedPct: 100 })
if (noPump.p0 !== null || noPump.systemCurve.length || noPump.converged || !noPump.gates.some(g => g.id === 'pump-curve' && !g.pass)) {
  fail('a CDU without a pump curve was computed')
} else console.log('✓ CDU without a pump curve (XCRow080) stays uncomputed and red')
const overCapacity = runChain({ scenario: 'hospital', nodes: 12, kwPerNode: 20, cdu: 'cdu40', speedPct: 100 }, { trace: false })
if (overCapacity.gates.find(g => g.id === 'capacity')?.pass !== false) fail('an over-capacity load passed the HX capacity gate')
if (CDUS.length !== 3 || PUMP_CURVES.length !== 2 || chain.comparison.length !== CDUS.length) fail('CDU table shape changed unexpectedly')

console.log(failures ? `✗ configurator parity FAILED (${failures})` : '✓ configurator parity passed (page numbers = kernel numbers)')
process.exit(failures ? 1 : 0)
