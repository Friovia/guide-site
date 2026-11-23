#!/usr/bin/env node
// configurator-parity.mjs — the configurator's C0 acceptance gate.
//
// Asserts that the guide-site configurator chain (src/lib/configurator.ts) is a
// faithful parameterization of the V&V'd reference cases: with the default
// input (tropical, 8 nodes × 10 kW) its p0/p1 outputs must be BIT-IDENTICAL to
// solving the reference case files directly (simulation repo test-case
// rack-orv3.json / rack-orv3-thermal.json). Any drift = the page would be
// showing numbers the kernel never verified. Runs as part of `pnpm generate`.
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SIM = join(ROOT, '..', 'simulation')
const viaUrl = p => pathToFileURL(p).href

const { solve: solveP0 } = await import(viaUrl(join(ROOT, 'sim/p0/solve.ts')))
const { solve: solveP1 } = await import(viaUrl(join(ROOT, 'sim/p1/solve.ts')))
const { runChain, DEFAULT_INPUT } = await import(viaUrl(join(ROOT, 'src/lib/configurator.ts')))

let failures = 0
const eq = (name, a, b) => {
  const ja = JSON.stringify(a), jb = JSON.stringify(b)
  if (ja !== jb) { failures++; console.error(`✗ ${name} mismatch`); console.error('  chain :', ja?.slice(0, 300)); console.error('  ref   :', jb?.slice(0, 300)) }
  else console.log(`✓ ${name} bit-identical`)
}

// ---- 1. default input ≡ reference cases (bit-identical outputs) ----
const refP0In = JSON.parse(readFileSync(join(SIM, 'p0-hydraulics/test-case/rack-orv3.json'), 'utf8'))
const refP1In = JSON.parse(readFileSync(join(SIM, 'p1-thermal-chain/test-case/rack-orv3-thermal.json'), 'utf8'))

const chain = runChain(DEFAULT_INPUT)
eq('p0 output vs reference case', chain.p0, solveP0(refP0In))
// NOTE: refP1In's flows are a STALE snapshot of an older p0 output (curve library
// revised after capture). The honest p1 parity is chain-consistency: the reference
// case with flows replaced by the chain's LIVE p0 output must reproduce chain.p1
// bit-identically — proving the configurator adds zero physics of its own.
const refP1Live = structuredClone(refP1In)
refP1Live.case.flows = chain.p0.branches.filter(b => !b.shutdown).map(b => ({ id: b.id, qLpm: b.qLpm }))
eq('p1 output vs reference case (live flows)', chain.p1, solveP1(refP1Live))

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
    console.log(`✓ config ${cfg.scenario} ${cfg.nodes}×${cfg.kwPerNode} kW solved (verdict ${r.converged ? 'feasible' : 'gated'})`)
  }
}

// ---- 3. report must state the boundary and versions ----
const report = (await import(viaUrl(join(ROOT, 'src/lib/configurator.ts')))).buildReport(chain)
for (const must of ['not a performance guarantee', 'feasibility', 'versions', 'p0 0.2.0']) {
  if (!report.includes(must)) { failures++; console.error(`✗ report missing: "${must}"`) }
}
console.log(failures ? `✗ configurator parity FAILED (${failures})` : '✓ configurator parity passed (page numbers = kernel numbers)')
process.exit(failures ? 1 : 0)
