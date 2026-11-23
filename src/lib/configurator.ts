// Configurator computation chain — the ONLY place guide-site computes liquid-cooling physics.
// Every number on the /playground/configurator page flows through here into the vendored
// kernel solvers (~/sim, MANIFEST-anchored). No hand-written physics in this file —
// only parameter wiring. All physical constants inherit the V&V'd reference cases
// (simulation repo p0-hydraulics/test-case/rack-orv3.json + p1-thermal-chain
// /test-case/rack-orv3-thermal.json): θ from the Wiwynn cold-plate entry ×1.15 PG25
// degradation, HX slope 30.25 kW/K from the Vertiv CoolChip CDU121 datasheet, UQD06
// Cv_min envelope from OCP spec v2.0.0. Changing a scenario preset changes inputs
// only — never physics.
// Kernel runtime messages are Chinese by design (their text is locked by the kernel's golden
// vectors); kernel-messages.ts rewrites them to English at the display boundary — render
// p0Warnings/p1Warnings, never p0/p1.warnings.
import { solve as solveP0 } from '../../sim/p0/solve.ts'
import type { P0Input, P0Output } from '../../sim/p0/types.ts'
import { solve as solveP1 } from '../../sim/p1/solve.ts'
import type { P1Input, P1Output } from '../../sim/p1/types.ts'
import { typedRackCurves, typedHxCurves, RACK_DATA_VERSION } from '../../sim/curves.ts'
import { englishKernelMessages } from './kernel-messages.ts'

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

// ---- CDUs the library can model: sourced pump and/or heat-exchanger curves (sim/curves.ts) ----
export type CduId = 'cdu40' | 'xcrow080' | 'cdu121'

export interface CduSpec {
  id: CduId
  label: string
  pumpCurveId: string | null // null = no pump curve in the library → hydraulics are not computable
  pumpNote: string
  hx: { curveId: string; ratedTcsLpm: number; maxKw: number; maxAtdK: number }
}

const RACK_CURVES = typedRackCurves()
const HX_CURVES = typedHxCurves()

/** Last point of an HX curve: the largest ATD (and the kW there) the vendor datasheet evidences. */
function hxCapacity(curveId: string): { maxKw: number; maxAtdK: number } {
  const pts = HX_CURVES[curveId].points
  const [maxAtdK, maxKw] = pts[pts.length - 1]
  return { maxKw, maxAtdK }
}

/** Small to large. Each entry carries only what the curve library can source. */
export const CDUS: CduSpec[] = [
  {
    id: 'cdu40', label: 'nVent rack chiller CDU40',
    pumpCurveId: 'pump-nvent-cdu40-max-pg25', pumpNote: 'CDU40 pump — maximum-performance curve',
    hx: { curveId: 'hx-nvent-rackchiller-cdu40', ratedTcsLpm: 60, ...hxCapacity('hx-nvent-rackchiller-cdu40') },
  },
  {
    id: 'xcrow080', label: 'Envicool XCRow080',
    pumpCurveId: null, pumpNote: 'no pump curve published in the library',
    hx: { curveId: 'hx-envicool-xcrow080', ratedTcsLpm: 99, ...hxCapacity('hx-envicool-xcrow080') },
  },
  {
    id: 'cdu121', label: 'Vertiv CoolChip CDU121',
    pumpCurveId: 'pump-vertiv-coolchip100kw-inrack-pg25', pumpNote: 'CoolChip 100 kW in-rack pump',
    hx: { curveId: 'hx-vertiv-coolchip-cdu121', ratedTcsLpm: 120, ...hxCapacity('hx-vertiv-coolchip-cdu121') },
  },
]
const CDU_BY_ID: Record<CduId, CduSpec> = Object.fromEntries(CDUS.map(c => [c.id, c])) as Record<CduId, CduSpec>

/** Published pump curves at nominal speed, [L/min, kPa] — for the operating-point chart. */
export const PUMP_CURVES: { cdu: CduId; points: [number, number][] }[] = CDUS
  .filter(c => c.pumpCurveId !== null)
  .map(c => ({ cdu: c.id, points: RACK_CURVES[c.pumpCurveId as string].points }))

export interface ConfigInput {
  scenario: ScenarioId
  nodes: number        // liquid-cooled nodes in the rack (1..12)
  kwPerNode: number    // IT load per node, kW (8-OAM platform assumption)
  cdu: CduId | 'auto'  // 'auto' = the CDU whose evidence covers this operating point best
  speedPct: number     // pump speed, % of the published pump curve (100 = as published)
}

/** The reference-case input: same network, CDU and 8 × 10 kW load as the V&V anchor, pump at the
 *  published speed. The parity gate pins this one bit-for-bit. It is NOT the landing state — its
 *  flow sits just under the OAI window, so it opens red. */
export const REFERENCE_INPUT: ConfigInput = { scenario: 'tropical', nodes: 8, kwPerNode: 10, cdu: 'cdu121', speedPct: 100 }

/** Landing state: feasible AND inside the kernel's evidenced domain, so the page opens on a
 *  judgment the kernel stands behind. */
export const DEFAULT_INPUT: ConfigInput = { scenario: 'hospital', nodes: 8, kwPerNode: 8, cdu: 'auto', speedPct: 100 }

export const SPEED_RANGE: [number, number] = [30, 100]

// ---- Reference-case inherited constants (see file header for provenance) ----
const SUPPLY_C = 32
const RETURN_C = 42
const THETA_K_PER_W = 0.02185        // Wiwynn 8-OAM case-to-inlet ×1.15 PG25
const T_CASE_MAX_C = 80              // placeholder cap — swap for server vendor spec before quoting
const THETA_FLOW_RANGE: [number, number] = [1.5, 3.5]   // per cold plate, L/min
const THETA_SPLIT_N = 8
const FWS_FLOW_LPM = 100             // facility-side flow, reference case
const FWS_CP = 4180                  // water, Incropera Table A.6 order
const FWS_RHO = 1000
const BRANCH_CURVE_IDS = ['coldplate-oai-8oam-4x2-pcl-pg25', 'qd-ocp-uqd06-mincv-envelope-pg25']
const BRANCH_PIPE = { dMm: 19.1, lenM: 2.5, k: 2 }
const SUPPLY_PIPE = { dMm: 50.8, lenM: 3, k: 3, epsMm: 0.045 }
/** OAI flow guideline: 1.25–2.0 L/min per kW of heat (liquid side). */
export const OAI_FLOW_WINDOW: [number, number] = [1.25, 2.0]
/** Heat-exchanger rated-flow bands as registered in the kernel (sim/p1/solve.ts FLOWBAND_*_PCT):
 *  ±10% advisory, ±25% the edge of trust. Display only — the verdict itself comes from the kernel. */
const HX_WARN_PCT = 10
const HX_TRUST_PCT = 25

export function buildP0Input(input: ConfigInput, cdu: CduSpec, speedPct: number): P0Input {
  if (cdu.pumpCurveId === null) throw new Error(`${cdu.label}: no pump curve — hydraulics are not computable`)
  const branch = (i: number) => ({
    id: `node-${i + 1}`,
    curveIds: BRANCH_CURVE_IDS,
    pipe: BRANCH_PIPE,
    minLpm: 8,
  })
  // The pump curves carry no rated frequency (the datasheets state none) and only the speed RATIO
  // enters the kernel's affinity-law scaling — so speed is carried in percent of the published
  // curve. ratedHz = 100 is a unit choice, never a claim about the motor; pumpHz in the output is
  // therefore that same percent and is not shown as a frequency.
  const pump = speedPct >= 100
    ? { curveId: cdu.pumpCurveId, yIs: 'kPa' as const }
    : { curveId: cdu.pumpCurveId, yIs: 'kPa' as const, ratedHz: 100, speedHz: speedPct }
  return {
    schema: 'p0/v0.1',
    dataVersion: RACK_DATA_VERSION,
    meta: { 工具: 'liquidcoolingguide.com configurator (C0)', 场景: input.scenario, 节点: `${input.nodes} × ${input.kwPerNode} kW` },
    case: {
      tSupplyC: SUPPLY_C,
      tReturnC: RETURN_C,
      pump,
      supplyPipe: SUPPLY_PIPE,
      branches: Array.from({ length: input.nodes }, (_, i) => branch(i)),
    },
    curves: Object.fromEntries([cdu.pumpCurveId, ...BRANCH_CURVE_IDS].map(id => [id, RACK_CURVES[id]])),
  }
}

export function buildP1Input(input: ConfigInput, cdu: CduSpec, p0: P0Output): P1Input {
  const sc = SCENARIOS[input.scenario]
  const nodeW = input.kwPerNode * 1000
  const hotSpot = {
    qW: nodeW / 8,                    // hottest die of the 8-OAM platform
    thetaKPerW: THETA_K_PER_W,
    thetaRef: 'inlet' as const,
    tCaseMaxC: T_CASE_MAX_C,
    thetaFlowLpmRange: THETA_FLOW_RANGE,
    thetaFlowSplitN: THETA_SPLIT_N,
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
        hx: { mode: 'slope', curveId: cdu.hx.curveId, ratedTcsLpm: cdu.hx.ratedTcsLpm, note: `flowBasis per datasheet: TCS rated ${cdu.hx.ratedTcsLpm} L/min` },
        fws: { supplyC: sc.fwsSupplyC, flowLpm: FWS_FLOW_LPM, cpJkgK: FWS_CP, rhoKgM3: FWS_RHO, note: `scenario preset ${input.scenario}: facility water ${sc.fwsSupplyC} °C; water properties, Incropera A.6 order` },
      },
      flows: p0.branches.filter(b => !b.shutdown).map(b => ({ id: b.id, qLpm: b.qLpm })),
      loads: p0.branches.map(b => ({ id: b.id, qW: nodeW, hotSpot })),
      room: { ...sc.room },
      wClass: 'W32',
    },
    curves: { [cdu.hx.curveId]: HX_CURVES[cdu.hx.curveId] },
  }
}

/** The pump curve as the kernel scales it for a speed (affinity laws: flow ∝ speed, head ∝ speed²). */
export function pumpCurveAt(points: readonly [number, number][], speedPct: number): [number, number][] {
  const s = speedPct / 100
  return points.map(([q, h]) => [q * s, h * s * s])
}

export interface Gate { id: string; label: string; pass: boolean; detail: string }

/** Short names for gate ids — what the comparison table and the calculation note print. */
const GATE_SHORT: Record<string, string> = {
  'pump-curve': 'no pump curve', 'p0-converged': 'hydraulic solve', capacity: 'HX capacity', 'flow-window': 'OAI window',
  'evidenced-domain': 'evidenced domain', dew: 'dew point', wclass: 'ASHRAE W32', tcase: 'T_case margin',
}
export const gateShortName = (id: string): string => GATE_SHORT[id] ?? id

/** Registered data-domain bounds on flow — display only, so the page can say WHICH bound binds. */
export interface FlowBounds {
  perNode: { oai: [number, number]; theta: [number, number] }  // L/min per node
  total: { hxWarn: [number, number]; hxTrust: [number, number] } // L/min, vs the selected HX's rated flow
}

export interface CduComparison {
  cdu: CduSpec
  feasible: boolean   // every gate green at the published pump speed
  trusted: boolean    // the kernel stands behind its own output
  failing: string[]   // gate ids that fail
}

export interface ChainResult {
  input: ConfigInput
  cdu: CduSpec
  loadKw: number                      // total rack IT load
  p0: P0Output | null                 // null = the selected CDU has no pump curve
  p1: P1Output | null
  gates: Gate[]
  trusted: boolean                    // the kernel stands behind its own output (p1.converged): no data-domain excursion
  converged: boolean                  // all gates green
  p0Warnings: string[]                // kernel messages, English (kernel-messages.ts)
  p1Warnings: string[]
  bounds: FlowBounds
  systemCurve: [number, number][]     // kernel-traced [L/min, kPa] points on this network's system curve
  comparison: CduComparison[]         // every CDU at the published pump speed — what 'auto' chooses from
}

function hydraulicOk(p0: P0Output | null): p0 is P0Output {
  return p0 !== null && p0.converged && p0.inputInvalid.length === 0
}

function solveChain(input: ConfigInput, cdu: CduSpec, trace: boolean): ChainResult {
  const loadKw = input.nodes * input.kwPerNode
  const gates: Gate[] = []
  const p0 = cdu.pumpCurveId === null ? null : solveP0(buildP0Input(input, cdu, input.speedPct))
  const ok = hydraulicOk(p0)
  // p1.converged doubles as the kernel's trust flag: it goes false whenever the run leaves an
  // evidenced data domain (HX rated-flow band, cold-plate θ range), yet the temperatures still
  // come back finite. So it has to be gated explicitly — an untrusted run is never a judgment.
  const p1 = ok ? solveP1(buildP1Input(input, cdu, p0)) : null
  const trusted = p1 !== null && p1.converged === true

  if (p0 === null) {
    gates.push({
      id: 'pump-curve',
      label: 'Pump curve available',
      pass: false,
      detail: `${cdu.label}: the library holds its heat-exchanger curve but no pump curve — hydraulics cannot be computed (an unpublished curve stays a red light)`,
    })
  } else {
    gates.push({
      id: 'p0-converged',
      label: 'Hydraulic solve converged',
      pass: ok,
      detail: p0.inputInvalid.length
        ? `invalid input: ${englishKernelMessages(p0.inputInvalid).join('; ')}`
        : ok
          ? `pump operating point at ${p0.qTotalLpm?.toFixed(1)} L/min total, ${p0.pumpDpKPa?.toFixed(1)} kPa`
          : 'hydraulic solve did not converge — see kernel messages',
    })
  }
  gates.push({
    id: 'capacity',
    label: 'Inside the heat exchanger\u2019s evidenced range',
    pass: loadKw <= cdu.hx.maxKw,
    detail: `${loadKw} kW vs ${cdu.hx.maxKw} kW at ${cdu.hx.maxAtdK} K ATD (last point of the sourced HX curve)`,
  })

  const qPerNode = ok ? (p0.branches[0]?.qLpm ?? 0) : 0
  const lo = input.kwPerNode * OAI_FLOW_WINDOW[0]
  const hi = input.kwPerNode * OAI_FLOW_WINDOW[1]
  gates.push({
    id: 'flow-window',
    label: 'Flow in OAI window (1.25-2.0 L/min/kW)',
    pass: ok && qPerNode >= lo && qPerNode <= hi,
    detail: ok
      ? `${qPerNode.toFixed(2)} L/min per node vs ${lo.toFixed(1)}-${hi.toFixed(1)} L/min window`
      : p0 === null ? 'not computable — no pump curve' : 'not computable — hydraulic solve did not converge',
  })

  if (p1) {
    gates.push({
      id: 'evidenced-domain',
      label: 'Inside the kernel\u2019s evidenced domain',
      pass: trusted,
      detail: trusted
        ? 'HX rated-flow band and cold-plate θ range both hold — the temperatures below are a judgment'
        : 'kernel flags this run as outside its evidenced domain — the temperatures below are extrapolation, not a judgment (see kernel messages)',
    })
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
    const why = p0 === null ? 'not computable — no pump curve' : 'thermal chain skipped — hydraulic solve did not converge'
    for (const id of ['evidenced-domain', 'dew', 'wclass', 'tcase']) gates.push({ id, label: id, pass: false, detail: why })
  }

  const rated = cdu.hx.ratedTcsLpm
  const bounds: FlowBounds = {
    perNode: {
      oai: [input.kwPerNode * OAI_FLOW_WINDOW[0], input.kwPerNode * OAI_FLOW_WINDOW[1]],
      theta: [THETA_FLOW_RANGE[0] * THETA_SPLIT_N, THETA_FLOW_RANGE[1] * THETA_SPLIT_N],
    },
    total: {
      hxWarn: [rated * (1 - HX_WARN_PCT / 100), rated * (1 + HX_WARN_PCT / 100)],
      hxTrust: [rated * (1 - HX_TRUST_PCT / 100), rated * (1 + HX_TRUST_PCT / 100)],
    },
  }

  // The system curve is not re-derived here: solve the kernel at a ladder of pump speeds and keep
  // the operating points — each one lies on the network's system curve by construction.
  const systemCurve: [number, number][] = []
  if (trace && cdu.pumpCurveId !== null) {
    for (let s = SPEED_RANGE[1]; s >= SPEED_RANGE[0]; s -= 4) {
      const r = solveP0(buildP0Input(input, cdu, s))
      if (hydraulicOk(r) && (r.qTotalLpm ?? 0) > 0 && r.pumpDpKPa !== null) systemCurve.push([r.qTotalLpm as number, r.pumpDpKPa])
    }
    systemCurve.reverse()
  }

  return {
    input,
    cdu,
    loadKw,
    p0,
    p1,
    gates,
    trusted,
    converged: gates.every(g => g.pass),
    p0Warnings: englishKernelMessages(p0?.warnings ?? []),
    p1Warnings: englishKernelMessages(p1?.warnings ?? []),
    bounds,
    systemCurve,
    comparison: [],
  }
}

function atPublishedSpeed(input: ConfigInput, cdu: CduSpec) {
  const r = solveChain({ ...input, speedPct: 100 }, cdu, false)
  const cmp: CduComparison = { cdu, feasible: r.converged, trusted: r.trusted, failing: r.gates.filter(g => !g.pass).map(g => g.id) }
  return { r, cmp }
}

/** 'auto' ranks every CDU by evidence, not by nameplate: fewest failing gates first, then the run
 *  closest to its HX rated flow, then the smaller unit. */
function rankCdu(input: ConfigInput) {
  return CDUS
    .map((cdu, order) => {
      const { r, cmp } = atPublishedSpeed(input, cdu)
      return { cdu, r, cmp, order, dev: r.p1?.hx?.ratedFlowDevPct ?? Infinity }
    })
    .sort((a, b) => a.cmp.failing.length - b.cmp.failing.length || a.dev - b.dev || a.order - b.order)
}

function resolveCdu(input: ConfigInput, ranked: ReturnType<typeof rankCdu>) {
  return input.cdu === 'auto' ? ranked[0] : ranked.find(x => x.cdu.id === input.cdu) ?? ranked[0]
}

/** One full chain. `trace: false` skips the system-curve ladder (sweeps and gates don't draw it). */
export function runChain(input: ConfigInput, opts: { trace?: boolean } = {}): ChainResult {
  const ranked = rankCdu(input)
  const picked = resolveCdu(input, ranked)
  const result = solveChain(input, picked.cdu, opts.trace !== false)
  result.comparison = ranked.map(x => x.cmp)
  return result
}

/** Pump speed (integer %) that puts the operating point nearest a target total flow, by asking
 *  the kernel (flow rises monotonically with speed). Null when the CDU has no pump curve. */
export function speedForFlow(input: ConfigInput, qTarget: number): number | null {
  const cdu = resolveCdu(input, rankCdu(input)).cdu
  if (cdu.pumpCurveId === null) return null
  const qAt = (s: number): number => {
    const r = solveP0(buildP0Input(input, cdu, s))
    return hydraulicOk(r) ? (r.qTotalLpm ?? 0) : 0
  }
  let lo = SPEED_RANGE[0]
  let hi = SPEED_RANGE[1]
  if (qTarget >= qAt(hi)) return hi
  if (qTarget <= qAt(lo)) return lo
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2
    if (qAt(mid) < qTarget) lo = mid
    else hi = mid
  }
  return Math.round(hi)
}

const num = (n: number | null | undefined, d = 1) => (n === null || n === undefined || !Number.isFinite(n) ? '—' : n.toFixed(d))

/** Markdown calculation note — same discipline as the kernel's calc-note output. */
export function buildReport(r: ChainResult): string {
  const { input, p0, p1 } = r
  const sc = SCENARIOS[input.scenario]
  const lines: string[] = []
  lines.push(`# Liquid cooling rack feasibility note (configurator)`)
  lines.push('')
  lines.push(`- Scenario: **${sc.label}** — ${sc.blurb}`)
  lines.push(`- Load: **${input.nodes} × ${input.kwPerNode} kW = ${r.loadKw} kW** (8-OAM per-node platform assumption)`)
  lines.push(`- Network: ORv3-style rack, OAI 8-OAM cold plates 4x2 PCL + UQD06, supply/return ${SUPPLY_C}/${RETURN_C} °C, PG25`)
  lines.push(`- CDU: **${r.cdu.label}**${input.cdu === 'auto' ? ' (chosen automatically — best-evidenced for this operating point)' : ''}; pump ${input.speedPct >= 100 ? 'at the published curve speed' : `at ${input.speedPct}% of the published curve speed (affinity laws)`}`)
  lines.push('')
  lines.push(`## Hydraulics (p0-hydraulics v${p0?.versions.solver ?? '—'})`)
  lines.push('')
  if (p0) {
    lines.push(`- Converged: ${p0.converged}; total flow **${num(p0.qTotalLpm, 2)} L/min** at pump ${num(p0.pumpDpKPa, 1)} kPa (${num(p0.pumpHeadM, 1)} m head)`)
    lines.push(`- Per-branch: ${p0.branches.map(b => `${b.id} ${b.qLpm.toFixed(2)} L/min (${b.sharePct.toFixed(1)}%)`).join(' · ')}`)
  } else {
    lines.push(`- Not computed: ${r.cdu.label} has no pump curve in the source-attributed library.`)
  }
  if (r.p0Warnings.length) lines.push(`- Kernel messages: ${r.p0Warnings.join('; ')}`)
  lines.push('')
  if (p1) {
    lines.push(`## Thermal chain (p1-thermal-chain v${p1.versions.solver})`)
    lines.push('')
    lines.push(`- Evidenced domain: ${r.trusted ? 'inside — the temperatures below are a judgment' : 'OUTSIDE — the kernel flags this run as extrapolation, not a judgment'}`)
    lines.push(`- Rack supply/return: **${num(p1.tSupplyC)} / ${num(p1.tReturnC)} °C** (ΔT rack ${num(p1.dtRackK)} K)`)
    if (p1.hx) lines.push(`- HX: ${p1.hx.mode} — Q=${num(p1.hx.qKw)} kW, ATD ${num(p1.hx.atdK)} K${p1.hx.ratedFlowDevPct !== null ? ` (rated-flow deviation ${num(p1.hx.ratedFlowDevPct)}%)` : ''}`)
    lines.push(`- Dew point ${num(p1.dewPointC)} °C vs supply ${num(p1.tSupplyC)} °C — margin **${num(p1.dewMarginK)} K**, pass=${p1.dewPass}`)
    lines.push(`- W32 check: ${num(p1.wClassCheckC)} °C vs max ${num(p1.wClassMaxSupplyC)} °C — pass=${p1.wClassPass}`)
    const worstNode = p1.nodes.length
      ? p1.nodes.reduce((w, n) => ((n.tCaseMarginC ?? Infinity) < (w.tCaseMarginC ?? Infinity) ? n : w), p1.nodes[0])
      : null
    if (worstNode) lines.push(`- Worst node (${worstNode.id}): T_case ${num(worstNode.tCaseC)} °C, margin ${num(worstNode.tCaseMarginC)} K (cap ${T_CASE_MAX_C} °C placeholder)`)
    if (r.p1Warnings.length) lines.push(`- Kernel messages: ${r.p1Warnings.join('; ')}`)
    lines.push('')
  }
  lines.push(`## CDUs compared (published pump speed)`)
  lines.push('')
  for (const c of r.comparison) {
    lines.push(`- ${c.cdu.label}: ${c.feasible ? 'feasible' : c.trusted ? 'gated' : 'not judgeable'}${c.failing.length ? ` — fails ${c.failing.map(gateShortName).join(', ')}` : ''}`)
  }
  lines.push('')
  lines.push(`## Verdict`)
  lines.push('')
  for (const g of r.gates) lines.push(`- ${g.pass ? 'PASS' : 'FAIL'} — ${g.label}: ${g.detail}`)
  lines.push('')
  lines.push(`---`)
  lines.push(`Solver versions: p0 ${p0?.versions.solver ?? '—'} / p1 ${p1?.versions.solver ?? '—'} · props ${p0?.versions.props ?? '—'} · data ${p0?.versions.dataVersion ?? RACK_DATA_VERSION}`)
  lines.push(`Boundary: results are feasibility judgments up to the UQD coupling plane — not a performance guarantee. θ cap ${T_CASE_MAX_C} °C is a placeholder; replace with the server vendor's spec before quoting. Generated by the liquid cooling guide configurator (kernel-driven, no hand-written physics).`)
  return lines.join('\n')
}
