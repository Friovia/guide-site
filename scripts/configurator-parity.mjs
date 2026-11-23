#!/usr/bin/env node
// configurator-parity.mjs — the configurator's acceptance gate.
//
// 1. The guide-site configurator chain (src/lib/configurator.ts) must be a faithful
//    parameterization of the V&V'd reference cases: with the REFERENCE input (tropical,
//    8 nodes × 10 kW) its p0/p1 outputs must be BIT-IDENTICAL to solving the reference case
//    files directly (simulation repo test-case rack-orv3.json / rack-orv3-thermal.json).
//    Any drift = the page would be showing numbers the kernel never verified.
// 2. Off-reference inputs must still produce a full, honest chain.
// 3. The report must state the boundary and versions.
// 4. Verdict honesty: the landing state must be feasible AND kernel-trusted; a run outside
//    the kernel's evidenced domain must fail the evidenced-domain gate; and no CJK may reach
//    the page text or the report.
// Runs as part of `pnpm generate`.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SIM = join(ROOT, '..', 'simulation')
const viaUrl = p => pathToFileURL(p).href

const { solve: solveP0 } = await import(viaUrl(join(ROOT, 'sim/p0/solve.ts')))
const { solve: solveP1 } = await import(viaUrl(join(ROOT, 'sim/p1/solve.ts')))
const { runChain, buildReport, DEFAULT_INPUT, REFERENCE_INPUT } = await import(viaUrl(join(ROOT, 'src/lib/configurator.ts')))

let failures = 0
const eq = (name, a, b) => {
  const ja = JSON.stringify(a), jb = JSON.stringify(b)
  if (ja !== jb) { failures++; console.error(`✗ ${name} mismatch`); console.error('  chain :', ja?.slice(0, 300)); console.error('  ref   :', jb?.slice(0, 300)) }
  else console.log(`✓ ${name} bit-identical`)
}

// ---- 1. reference input ≡ reference cases (bit-identical outputs) ----
// The reference cases live in the SIBLING simulation repo (not vendored here),
// so this section runs only where that checkout exists (dev machines, the
// simulation repo's own CI). On the CF Pages build machine there is no sibling
// repo — sections 2-4 below still gate the chain itself.
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
  if (!chain.trusted) { failures++; console.error('✗ the reference input is not kernel-trusted — the V&V anchor left its evidenced domain') }
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
  const r = runChain(cfg)
  if (!(r.p0.converged && r.p0.inputInvalid.length === 0 && r.p1 && typeof r.p1.dewPass === 'boolean')) {
    failures++; console.error(`✗ config ${JSON.stringify(cfg)} did not produce a full honest chain`, { p0Conv: r.p0.converged, p1: !!r.p1 })
  } else {
    console.log(`✓ config ${cfg.scenario} ${cfg.nodes}×${cfg.kwPerNode} kW solved (verdict ${r.converged ? 'feasible' : r.trusted ? 'gated' : 'outside evidenced domain'})`)
  }
}

// ---- 3. report must state the boundary and versions ----
const report = buildReport(chain)
for (const must of ['not a performance guarantee', 'feasibility', 'versions', 'p0 0.2.0']) {
  if (!report.includes(must)) { failures++; console.error(`✗ report missing: "${must}"`) }
}

// ---- 4. verdict honesty + zero CJK on every rendered surface ----
const CJK = /[\u4e00-\u9fff]/
const UNTRANSLATED = 'Kernel message not yet translated'
const renderedText = r => [...r.p0Warnings, ...r.p1Warnings, ...r.gates.map(g => `${g.label}: ${g.detail}`), buildReport(r)]

const landing = runChain(DEFAULT_INPUT)
if (!(landing.converged && landing.trusted)) {
  failures++; console.error('✗ landing state is not a feasible, kernel-trusted run:', JSON.stringify(DEFAULT_INPUT), landing.gates.filter(g => !g.pass).map(g => g.id))
} else {
  console.log(`✓ landing state (${DEFAULT_INPUT.scenario} ${DEFAULT_INPUT.nodes}×${DEFAULT_INPUT.kwPerNode} kW) is feasible and inside the evidenced domain`)
}
const offDomain = runChain({ scenario: 'hospital', nodes: 4, kwPerNode: 8 })
const domainGate = offDomain.gates.find(g => g.id === 'evidenced-domain')
if (offDomain.trusted || offDomain.converged || domainGate?.pass !== false) {
  failures++; console.error('✗ off-domain run (hospital 4×8 kW) is not stopped by the evidenced-domain gate')
} else {
  console.log('✓ off-domain run (hospital 4×8 kW) fails the evidenced-domain gate — never presented as feasible')
}
// sweep the whole input range: no CJK may reach the page or the report, and every kernel message
// the configurator can reach must have a real translation (no generic fallback line)
let swept = 0, trustedStates = 0
const cjkLeaks = new Set(), fallbacks = new Set()
for (const scenario of ['tropical', 'hospital', 'campus']) {
  for (let nodes = 1; nodes <= 12; nodes++) {
    for (let kw = 4; kw <= 20; kw += 1) {
      const r = runChain({ scenario, nodes, kwPerNode: kw })
      swept++
      if (r.trusted) trustedStates++
      for (const s of renderedText(r)) if (CJK.test(s)) cjkLeaks.add(s.slice(0, 120))
      for (const w of [...r.p0Warnings, ...r.p1Warnings]) if (w.startsWith(UNTRANSLATED)) fallbacks.add(w)
    }
  }
}
if (cjkLeaks.size) { failures++; console.error(`✗ CJK reached rendered text in ${cjkLeaks.size} distinct strings`, [...cjkLeaks].slice(0, 3)) }
if (fallbacks.size) { failures++; console.error('✗ kernel messages without a translation fell back to the generic line') }
if (!cjkLeaks.size && !fallbacks.size) console.log(`✓ swept ${swept} input states: no CJK in gate details, kernel messages or reports; every reachable kernel message translated`)

console.log(failures ? `✗ configurator parity FAILED (${failures})` : '✓ configurator parity passed (page numbers = kernel numbers)')
process.exit(failures ? 1 : 0)
