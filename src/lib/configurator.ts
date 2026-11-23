// Configurator computation chain — the ONLY place guide-site computes liquid-cooling physics.
// Every number on the /playground/configurator page flows through here into the vendored
// kernel solvers (~/sim, MANIFEST-anchored). No hand-written physics in this file —
// only parameter wiring. All physical constants inherit the V&V'd reference cases
// (simulation repo p0-hydraulics/test-case/rack-orv3.json + p1-thermal-chain
// /test-case/rack-orv3-thermal.json): θ from the Wiwynn cold-plate entry ×1.15 PG25
// degradation, HX slope 30.25 kW/K from the Vertiv CoolChip CDU121 datasheet, UQD06
// Cv_min envelope from OCP spec v2.0.0. Changing a scenario preset changes inputs
// only — never physics.
import { solve as solveP0 } from '../../sim/p0/solve.ts'
import type { P0Input, P0Output } from '../../sim/p0/types.ts'
import { solve as solveP1 } from '../../sim/p1/solve.ts'
import type { P1Input, P1Output } from '../../sim/p1/types.ts'
import { typedRackCurves, typedHxCurves, RACK_DATA_VERSION } from '../../sim/curves.ts'

export type ScenarioId = 'hospital' | 'campus' | 'tropical'

export interface ScenarioPreset {
  id: ScenarioId
  label: string
  blurb: string
  room: { tAirC: number; rhPct: number; minDewMarginK: number }
  fwsSupplyC: number
}

/** Scenario presets — room conditions and facility-water temperature only. */
export const SCENARIOS: Record<ScenarioId, ScenarioPreset> = {
  tropical: {
    id: 'tropical', label: 'Tropical micro-DC',
    blurb: 'Hot & humid — the hardest case: 35 °C air, 60% RH, facility water 29 °C (cooling tower + economizer).',
    room: { tAirC: 35, rhPct: 60, minDewMarginK: 1.5 },
    fwsSupplyC: 29,
  },
  hospital: {
    id: 'hospital', label: 'Hospital room',
    blurb: 'Clinical space, moderate ambient: 24 °C air, 50% RH, chilled facility water 22 °C.',
    room: { tAirC: 24, rhPct: 50, minDewMarginK: 1.5 },
    fwsSupplyC: 22,
  },
  campus: {
    id: 'campus', label: 'Campus edge room',
    blurb: 'Repurposed campus space: 28 °C air, 55% RH, facility water 25 °C.',
    room: { tAirC: 28, rhPct: 55, minDewMarginK: 1.5 },
    fwsSupplyC: 25,
  },
}

export interface ConfigInput {
  scenario: ScenarioId
  nodes: number       // liquid-cooled nodes in the rack (1..12)
  kwPerNode: number   // IT load per node, kW (8-OAM platform assumption)
}

export const DEFAULT_INPUT: ConfigInput = { scenario: 'tropical', nodes: 8, kwPerNode: 10 }

// ---- Reference-case inherited constants (see file header for provenance) ----
const SUPPLY_C = 32
const RETURN_C = 42
const THETA_K_PER_W = 0.02185        // Wiwynn 8-OAM case-to-inlet ×1.15 PG25
const T_CASE_MAX_C = 80              // placeholder cap — swap for server vendor spec before quoting
const THETA_FLOW_RANGE: [number, number] = [1.5, 3.5]
const FWS_FLOW_LPM = 100             // facility-side flow, reference case
const FWS_CP = 4180                  // water, Incropera Table A.6 order
const FWS_RHO = 1000
const HX_CURVE_ID = 'hx-vertiv-coolchip-cdu121'
const HX_RATED_TCS_LPM = 120
const PUMP_ID = 'pump-vertiv-coolchip100kw-inrack-pg25'
const BRANCH_CURVE_IDS = ['coldplate-oai-8oam-4x2-pcl-pg25', 'qd-ocp-uqd06-mincv-envelope-pg25']
const BRANCH_PIPE = { dMm: 19.1, lenM: 2.5, k: 2 }
const SUPPLY_PIPE = { dMm: 50.8, lenM: 3, k: 3, epsMm: 0.045 }
/** OAI flow guideline: 1.25–2.0 L/min per kW of heat (liquid side). */
export const OAI_FLOW_WINDOW: [number, number] = [1.25, 2.0]

function rackCurves(): P0Input['curves'] {
  const all = typedRackCurves()
  const need = [PUMP_ID, ...BRANCH_CURVE_IDS]
  return Object.fromEntries(need.map(id => [id, all[id]]))
}

export function buildP0Input(input: ConfigInput): P0Input {
  const branch = (i: number) => ({
    id: `node-${i + 1}`,
    curveIds: BRANCH_CURVE_IDS,
    pipe: BRANCH_PIPE,
    minLpm: 8,
  })
  return {
    schema: 'p0/v0.1',
    dataVersion: RACK_DATA_VERSION,
    meta: { 工具: 'liquidcoolingguide.com configurator (C0)', 场景: input.scenario, 节点: `${input.nodes} × ${input.kwPerNode} kW` },
    case: {
      tSupplyC: SUPPLY_C,
      tReturnC: RETURN_C,
      pump: { curveId: PUMP_ID, yIs: 'kPa' },
      supplyPipe: SUPPLY_PIPE,
      branches: Array.from({ length: input.nodes }, (_, i) => branch(i)),
    },
    curves: rackCurves(),
  }
}

export function buildP1Input(input: ConfigInput, p0: P0Output): P1Input {
  const sc = SCENARIOS[input.scenario]
  const nodeW = input.kwPerNode * 1000
  const hotSpot = {
    qW: nodeW / 8,                    // hottest die of the 8-OAM platform
    thetaKPerW: THETA_K_PER_W,
    thetaRef: 'inlet' as const,
    tCaseMaxC: T_CASE_MAX_C,
    thetaFlowLpmRange: THETA_FLOW_RANGE,
    thetaFlowSplitN: 8,
    note: 'Wiwynn per-plate 0.019 upper bound ×1.15 PG25 (cold-plate.jsonc entry)',
  }
  return {
    schema: 'p1/v0.1',
    dataVersion: RACK_DATA_VERSION,
    meta: { 工具: 'liquidcoolingguide.com configurator (C0)', 场景: input.scenario },
    case: {
      fluid: 'pg25',
      supplySource: {
        mode: 'hx',
        hx: { mode: 'slope', curveId: HX_CURVE_ID, ratedTcsLpm: HX_RATED_TCS_LPM, note: 'flowBasis per datasheet: TCS rated 120 L/min, 1.15 bar' },
        fws: { supplyC: sc.fwsSupplyC, flowLpm: FWS_FLOW_LPM, cpJkgK: FWS_CP, rhoKgM3: FWS_RHO, note: `scenario preset ${input.scenario}: facility water ${sc.fwsSupplyC} °C; water properties, Incropera A.6 order` },
      },
      flows: p0.branches.filter(b => !b.shutdown).map(b => ({ id: b.id, qLpm: b.qLpm })),
      loads: p0.branches.map(b => ({ id: b.id, qW: nodeW, hotSpot })),
      room: { ...sc.room },
      wClass: 'W32',
    },
    curves: { [HX_CURVE_ID]: typedHxCurves()[HX_CURVE_ID] },
  }
}

export interface Gate { id: string; label: string; pass: boolean; detail: string }

export interface ChainResult {
  input: ConfigInput
  loadKw: number                      // total rack IT load
  p0: P0Output
  p1: P1Output | null
  gates: Gate[]
  converged: boolean                  // all gates green
}

export function runChain(input: ConfigInput): ChainResult {
  const p0 = solveP0(buildP0Input(input))
  const p1 = p0.inputInvalid.length === 0 && p0.converged ? solveP1(buildP1Input(input, p0)) : null
  const gates: Gate[] = []
  const loadKw = input.nodes * input.kwPerNode

  gates.push({
    id: 'p0-converged',
    label: 'Hydraulic solve converged',
    pass: p0.converged && p0.inputInvalid.length === 0,
    detail: p0.inputInvalid.length ? `invalid input: ${p0.inputInvalid.join('; ')}` : `pump operating point at ${p0.qTotalLpm?.toFixed(1)} L/min total, ${p0.pumpDpKPa?.toFixed(1)} kPa`,
  })

  const qPerNode = p0.branches[0]?.qLpm ?? 0
  const lo = input.kwPerNode * OAI_FLOW_WINDOW[0]
  const hi = input.kwPerNode * OAI_FLOW_WINDOW[1]
  gates.push({
    id: 'flow-window',
    label: 'Flow in OAI window (1.25-2.0 L/min/kW)',
    pass: qPerNode >= lo && qPerNode <= hi,
    detail: `${qPerNode.toFixed(2)} L/min per node vs ${lo.toFixed(1)}-${hi.toFixed(1)} L/min window`,
  })

  if (p1) {
    gates.push({
      id: 'dew',
      label: 'Dew-point red line',
      pass: p1.dewPass === true,
      detail: `supply ${p1.tSupplyC?.toFixed(1)} °C vs dew point ${p1.dewPointC?.toFixed(1)} °C — margin ${(p1.dewMarginK ?? 0).toFixed(1)} K (min ${(p1.dewMarginMinK ?? 0).toFixed(1)} K)`,
    })
    gates.push({
      id: 'wclass',
      label: 'ASHRAE W32 facility-water check',
      pass: p1.wClassPass === true,
      detail: `checked ${p1.wClassCheckC?.toFixed(1)} °C vs W32 max ${p1.wClassMaxSupplyC} °C`,
    })
    const worst = Math.min(...p1.nodes.map(n => n.tCaseMarginC ?? Infinity))
    gates.push({
      id: 'tcase',
      label: 'Cold-plate case-temperature margin',
      pass: p1.nodes.every(n => n.tCaseMarginC !== null && n.tCaseMarginC > 0),
      detail: `worst node margin ${worst === Infinity ? 'n/a' : worst.toFixed(1) + ' K'} to T_case ${T_CASE_MAX_C} °C (placeholder cap)`,
    })
  } else {
    for (const id of ['dew', 'wclass', 'tcase']) gates.push({ id, label: id, pass: false, detail: 'thermal chain skipped — hydraulic solve failed' })
  }

  return { input, loadKw, p0, p1, gates, converged: gates.every(g => g.pass) }
}

/** Markdown calculation note — same discipline as the kernel's calc-note output. */
export function buildReport(r: ChainResult): string {
  const { input, p0, p1 } = r
  const sc = SCENARIOS[input.scenario]
  const lines: string[] = []
  lines.push(`# Liquid cooling rack feasibility note (C0 configurator)`)
  lines.push('')
  lines.push(`- Scenario: **${sc.label}** — ${sc.blurb}`)
  lines.push(`- Load: **${input.nodes} × ${input.kwPerNode} kW = ${r.loadKw} kW** (8-OAM per-node platform assumption)`)
  lines.push(`- Network: ORv3-style rack, in-rack CDU (Vertiv CoolChip 100 kW class), OAI 8-OAM cold plates 4x2 PCL + UQD06, supply/return ${SUPPLY_C}/${RETURN_C} °C, PG25`)
  lines.push('')
  lines.push(`## Hydraulics (p0-hydraulics v${p0.versions.solver})`)
  lines.push('')
  lines.push(`- Converged: ${p0.converged}; total flow **${p0.qTotalLpm?.toFixed(2)} L/min** at pump ${p0.pumpDpKPa?.toFixed(1)} kPa (${p0.pumpHeadM?.toFixed(1)} m head)`)
  lines.push(`- Per-branch: ${p0.branches.map(b => `${b.id} ${b.qLpm.toFixed(2)} L/min (${b.sharePct.toFixed(1)}%)`).join(' · ')}`)
  if (p0.warnings.length) lines.push(`- Warnings: ${p0.warnings.join('; ')}`)
  lines.push('')
  if (p1) {
    lines.push(`## Thermal chain (p1-thermal-chain v${p1.versions.solver})`)
    lines.push('')
    lines.push(`- Rack supply/return: **${p1.tSupplyC.toFixed(1)} / ${p1.tReturnC.toFixed(1)} °C** (ΔT rack ${p1.dtRackK.toFixed(1)} K)`)
    if (p1.hx) lines.push(`- HX: ${p1.hx.mode} — Q=${p1.hx.qKw.toFixed(1)} kW, ATD ${p1.hx.atdK?.toFixed(1)} K${p1.hx.ratedFlowDevPct !== null ? ` (rated-flow deviation ${p1.hx.ratedFlowDevPct.toFixed(1)}%)` : ''}`)
    lines.push(`- Dew point ${p1.dewPointC?.toFixed(1)} °C vs supply ${p1.tSupplyC.toFixed(1)} °C — margin **${(p1.dewMarginK ?? 0).toFixed(1)} K**, pass=${p1.dewPass}`)
    lines.push(`- W32 check: ${p1.wClassCheckC?.toFixed(1)} °C vs max ${p1.wClassMaxSupplyC} °C — pass=${p1.wClassPass}`)
    const worstNode = p1.nodes.length
      ? p1.nodes.reduce((w, n) => ((n.tCaseMarginC ?? Infinity) < (w.tCaseMarginC ?? Infinity) ? n : w), p1.nodes[0])
      : null
    if (worstNode) lines.push(`- Worst node (${worstNode.id}): T_case ${worstNode.tCaseC?.toFixed(1)} °C, margin ${worstNode.tCaseMarginC?.toFixed(1)} K (cap ${T_CASE_MAX_C} °C placeholder)`)
    if (p1.warnings.length) lines.push(`- Warnings: ${p1.warnings.join('; ')}`)
    lines.push('')
  }
  lines.push(`## Verdict`)
  lines.push('')
  for (const g of r.gates) lines.push(`- ${g.pass ? 'PASS' : 'FAIL'} — ${g.label}: ${g.detail}`)
  lines.push('')
  lines.push(`---`)
  lines.push(`Solver versions: p0 ${p0.versions.solver} / p1 ${p1?.versions.solver ?? '—'} · props ${p0.versions.props} · data ${p0.versions.dataVersion}`)
  lines.push(`Boundary: results are feasibility judgments up to the UQD coupling plane — not a performance guarantee. θ cap ${T_CASE_MAX_C} °C is a placeholder; replace with the server vendor's spec before quoting. Generated by the liquid cooling guide configurator (kernel-driven, no hand-written physics).`)
  return lines.join('\n')
}
