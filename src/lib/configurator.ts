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

// ---- Node platforms: what ONE rack branch contains, from the sourced curve library (sim/curves.ts) ----
export type PlatformId = 'oai-8oam' | 'hgx-h200'

export interface HotSpotModel {
  thetaKPerW: number                    // case-to-inlet, K/W
  flowLpmRange: [number, number]        // per cold plate, the flow range θ is evidenced for
  splitN: number                        // cold plates per node the branch flow splits across
  note: string
}

export interface PlatformSpec {
  id: PlatformId
  label: string
  summary: string
  branchCurveIds: string[]              // series elements of one node branch
  couplers: string                      // how couplers are modelled — say it when it is an assumption
  capture: number                       // share of the node's IT load that reaches the liquid (registered assumption)
  designKw: number                      // IT load per node the branch model was evidenced for
  minLpm: number                        // guaranteed minimum branch flow, L/min (the kernel reports a branch below it)
  hotSpot: HotSpotModel | null          // null = the library has no sourced hot-spot θ → T_case is not evaluated
}

export const PLATFORMS: Record<PlatformId, PlatformSpec> = {
  'oai-8oam': {
    id: 'oai-8oam', label: 'OAI 8-OAM accelerator tray',
    summary: 'One branch = the OAI 8-OAM PCL 4x2 chain (OCP OAI liquid-cooling guidelines) plus the OCP UQD06 worst-case envelope.',
    branchCurveIds: ['coldplate-oai-8oam-4x2-pcl-pg25', 'qd-ocp-uqd06-mincv-envelope-pg25'],
    couplers: 'the OCP UQD06 worst-case compliant pair',
    capture: 1, designKw: 10, minLpm: 8,
    hotSpot: { thetaKPerW: 0.02185, flowLpmRange: [1.5, 3.5], splitN: 8, note: 'Wiwynn per-plate 0.019 upper bound ×1.15 PG25 (cold-plate.jsonc entry)' },
  },
  'hgx-h200': {
    id: 'hgx-h200', label: 'HGX H100/H200-class 8-GPU node',
    summary: 'One branch = the ToneCooling HGX H200 8-GPU + NVSwitch cold-plate group (vendor page, PG25-corrected, anchored at its max-ΔP limit) plus a worst-case UQD04 pair.',
    branchCurveIds: ['coldplate-hgx-h200-8gpu-tonecooling-tx-45c-pg25', 'qd-ocp-uqd04-mincv-envelope-pg25'],
    couplers: 'one worst-case compliant UQD04 pair (OCP envelope) — the tray\u2019s actual coupler type is not in the library, so the conservative one is modelled',
    capture: 0.8, designKw: 7.6, minLpm: 6,
    hotSpot: null,
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

/** Published pump curves at nominal speed, [L/min, kPa] — for the operating-point chart. */
export const PUMP_CURVES: { cdu: CduId; points: [number, number][] }[] = CDUS
  .filter(c => c.pumpCurveId !== null)
  .map(c => ({ cdu: c.id, points: RACK_CURVES[c.pumpCurveId as string].points }))

export interface ConfigInput {
  scenario: ScenarioId
  platform: PlatformId
  nodes: number                      // liquid-cooled nodes in the rack (1..12)
  kwPerNode: number                  // IT load per node, kW
  cdu: CduId | 'auto'                // 'auto' = the CDU whose evidence covers this operating point best
  speedPct: number | 'auto'          // pump speed, % of the published pump curve (100 = as published); 'auto' = hold the flow window
}

/** The reference-case input: same network, CDU and 8 × 10 kW load as the V&V anchor, pump at the
 *  published speed. The parity gate pins this one bit-for-bit. It is NOT the landing state — its
 *  flow sits just under the OAI window, so it opens red. */
export const REFERENCE_INPUT: ConfigInput = { scenario: 'tropical', platform: 'oai-8oam', nodes: 8, kwPerNode: 10, cdu: 'cdu121', speedPct: 100 }

/** Landing state: six HGX-class nodes (45.6 kW) in a hospital room — feasible AND inside the
 *  kernel's evidenced domain, so the page opens on a judgment the kernel stands behind. */
export const DEFAULT_INPUT: ConfigInput = { scenario: 'hospital', platform: 'hgx-h200', nodes: 6, kwPerNode: 7.6, cdu: 'auto', speedPct: 'auto' }

export const SPEED_RANGE: [number, number] = [30, 100]

// ---- Reference-case inherited constants (see file header for provenance) ----
const SUPPLY_C = 32
const RETURN_C = 42
const T_CASE_MAX_C = 80              // placeholder cap — swap for server vendor spec before quoting
const FWS_FLOW_LPM = 100             // facility-side flow, reference case
const FWS_CP = 4180                  // water, Incropera Table A.6 order
const FWS_RHO = 1000
const BRANCH_PIPE = { dMm: 19.1, lenM: 2.5, k: 2 }
const SUPPLY_PIPE = { dMm: 50.8, lenM: 3, k: 3, epsMm: 0.045 }
/** OAI flow guideline: 1.25–2.0 L/min per kW of heat carried by the liquid. */
export const OAI_FLOW_WINDOW: [number, number] = [1.25, 2.0]
/** Heat-exchanger rated-flow bands as registered in the kernel (sim/p1/solve.ts FLOWBAND_*_PCT):
 *  ±10% advisory, ±25% the edge of trust. Display only — the verdict itself comes from the kernel. */
const HX_WARN_PCT = 10
const HX_TRUST_PCT = 25

export function buildP0Input(input: ConfigInput, cdu: CduSpec, platform: PlatformSpec, speedPct: number): P0Input {
  if (cdu.pumpCurveId === null) throw new Error(`${cdu.label}: no pump curve — hydraulics are not computable`)
  const branch = (i: number) => ({
    id: `node-${i + 1}`,
    curveIds: platform.branchCurveIds,
    pipe: BRANCH_PIPE,
    minLpm: platform.minLpm,
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
    meta: { 工具: 'liquidcoolingguide.com configurator', 场景: input.scenario, 节点: `${input.nodes} × ${input.kwPerNode} kW` },
    case: {
      tSupplyC: SUPPLY_C,
      tReturnC: RETURN_C,
      pump,
      supplyPipe: SUPPLY_PIPE,
      branches: Array.from({ length: input.nodes }, (_, i) => branch(i)),
    },
    curves: Object.fromEntries([cdu.pumpCurveId, ...platform.branchCurveIds].map(id => [id, RACK_CURVES[id]])),
  }
}

export function buildP1Input(input: ConfigInput, cdu: CduSpec, platform: PlatformSpec, p0: P0Output): P1Input {
  const sc = SCENARIOS[input.scenario]
  const nodeW = input.kwPerNode * 1000
  const hotSpot = platform.hotSpot
    ? {
        qW: nodeW / 8,                // hottest die of the platform
        thetaKPerW: platform.hotSpot.thetaKPerW,
        thetaRef: 'inlet' as const,
        tCaseMaxC: T_CASE_MAX_C,
        thetaFlowLpmRange: platform.hotSpot.flowLpmRange,
        thetaFlowSplitN: platform.hotSpot.splitN,
        note: platform.hotSpot.note,
      }
    : undefined
  const load = (id: string) => ({ id, qW: nodeW, ...(platform.capture < 1 ? { capturePct: platform.capture * 100 } : {}), ...(hotSpot ? { hotSpot } : {}) })
  return {
    schema: 'p1/v0.1',
    dataVersion: RACK_DATA_VERSION,
    meta: { 工具: 'liquidcoolingguide.com configurator', 场景: input.scenario },
    case: {
      fluid: 'pg25',
      supplySource: {
        mode: 'hx',
        hx: { mode: 'slope', curveId: cdu.hx.curveId, ratedTcsLpm: cdu.hx.ratedTcsLpm, note: `flowBasis per datasheet: TCS rated ${cdu.hx.ratedTcsLpm} L/min` },
        fws: { supplyC: sc.fwsSupplyC, flowLpm: FWS_FLOW_LPM, cpJkgK: FWS_CP, rhoKgM3: FWS_RHO, note: `scenario preset ${input.scenario}: facility water ${sc.fwsSupplyC} °C; water properties, Incropera A.6 order` },
      },
      flows: p0.branches.filter(b => !b.shutdown).map(b => ({ id: b.id, qLpm: b.qLpm })),
      loads: p0.branches.map(b => load(b.id)),
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

export interface Gate { id: string; label: string; pass: boolean; detail: string; notEvaluated?: boolean }

/** Registered data-domain bounds on flow — display only, so the page can say WHICH bound binds. */
export interface FlowBounds {
  liquidKw: number                                              // per node: the IT load that reaches the liquid
  perNode: {
    oai: [number, number]                                       // L/min per node
    theta: [number, number] | null                              // cold-plate θ domain, when the platform has one
    curve: [number, number]                                     // the branch curves' own flow domain
  }
  total: { hxWarn: [number, number]; hxTrust: [number, number] } // L/min, vs the selected HX's rated flow
}

export interface CduComparison {
  cdu: CduSpec
  feasible: boolean   // every gate green with the pump at its automatic setpoint
  trusted: boolean    // the kernel stands behind its own output
  failing: string[]   // gate ids that fail
}

/** One cooling product from the rack builder's catalog, screened on nameplate only. */
export interface CatalogProduct {
  id: string
  name: string
  type?: string
  ratedKw?: number | null
  coolantC?: number | null
  ratedRoomC?: number | null
  minApproachK?: number | null
  facility?: string
}
export interface CatalogRow {
  product: CatalogProduct
  verdict: 'fits' | 'undersized' | 'not published'
  note: string
}

export interface ChainResult {
  input: ConfigInput
  cdu: CduSpec
  platform: PlatformSpec
  speedPct: number                    // resolved: 'auto' becomes the setpoint the kernel confirmed
  speedAuto: boolean
  loadKw: number                      // total rack IT load
  p0: P0Output | null                 // null = the selected CDU has no pump curve
  p1: P1Output | null
  gates: Gate[]
  trusted: boolean                    // the kernel stands behind its own output (p1.converged): no data-domain excursion
  converged: boolean                  // all gates green (gates marked notEvaluated do not block)
  p0Warnings: string[]                // kernel messages, English (kernel-messages.ts)
  p1Warnings: string[]
  bounds: FlowBounds
  systemCurve: [number, number][]     // kernel-traced [L/min, kPa] points on this network's system curve
  comparison: CduComparison[]         // every CDU at its automatic setpoint — what 'auto' chooses from
  catalog: CatalogRow[]               // nameplate screen of the rack builder's catalog for this load
}

function hydraulicOk(p0: P0Output | null): p0 is P0Output {
  return p0 !== null && p0.converged && p0.inputInvalid.length === 0
}

/** Flow range a branch curve is evidenced for: between the first and the last published point. */
function branchDomain(platform: PlatformSpec): [number, number] {
  let lo = 0
  let hi = Infinity
  for (const id of platform.branchCurveIds) {
    const pts = RACK_CURVES[id].points
    lo = Math.max(lo, pts[0][0])
    hi = Math.min(hi, pts[pts.length - 1][0])
  }
  return [lo, hi]
}

/** Per-node flow that satisfies the registered bounds at once — the OAI window on the liquid load,
 *  the cold-plate θ domain, the branch curves' own domain and (unless `withHx` is false) the HX's
 *  trust band, kept one point inside its edge so rounding the pump speed cannot tip the run
 *  outside. Null when they do not overlap: no pump can make that configuration judgeable.
 *  Policy over registered data, not physics. */
function flowInterval(input: ConfigInput, cdu: CduSpec, platform: PlatformSpec, withHx = true): [number, number] | null {
  const [cLo, cHi] = branchDomain(platform)
  const margin = (HX_TRUST_PCT - 1) / 100
  let lo = Math.max(input.kwPerNode * platform.capture * OAI_FLOW_WINDOW[0], cLo)
  let hi = Math.min(input.kwPerNode * platform.capture * OAI_FLOW_WINDOW[1], cHi)
  if (withHx) {
    lo = Math.max(lo, (cdu.hx.ratedTcsLpm * (1 - margin)) / input.nodes)
    hi = Math.min(hi, (cdu.hx.ratedTcsLpm * (1 + margin)) / input.nodes)
  }
  if (platform.hotSpot) {
    lo = Math.max(lo, platform.hotSpot.splitN * platform.hotSpot.flowLpmRange[0])
    hi = Math.min(hi, platform.hotSpot.splitN * platform.hotSpot.flowLpmRange[1])
  }
  // A zero-width interval is treated as none: a single admissible flow value is not a band a pump
  // speed (an integer percent) can be trusted to hit.
  return lo < hi ? [lo, hi] : null
}

/** Pump speed (integer %) that puts the operating point nearest a target total flow, by asking
 *  the kernel (flow rises monotonically with speed). Null when the CDU has no pump curve. */
export function speedForFlow(input: ConfigInput, cdu: CduSpec, platform: PlatformSpec, qTarget: number): number | null {
  if (cdu.pumpCurveId === null) return null
  // Search on the kernel's raw flow, converged or not: a solve that left a curve's domain still
  // reports a flow, and discarding it would break the monotonicity the search relies on. Whether
  // the result is admissible is the caller's question (see autoSpeed).
  const qAt = (s: number): number => {
    const q = solveP0(buildP0Input(input, cdu, platform, s)).qTotalLpm
    return q !== null && Number.isFinite(q) ? q : 0
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

/** The pump's automatic setpoint: a CDU holds its flow window by slowing the pump when the
 *  published-speed flow overshoots it. The full interval (flow window ∩ curve ranges ∩ HX band) is
 *  tried first; when the HX band cannot be met at any flow this node can take, the pump still holds
 *  the part it controls (flow window ∩ curve ranges), so the chain runs and the evidenced-domain
 *  gate names the HX band. A throttled speed is adopted only if the kernel confirms a converged
 *  solve inside that interval; otherwise the pump stays at the published speed. */
function autoSpeed(input: ConfigInput, cdu: CduSpec, platform: PlatformSpec): number {
  if (cdu.pumpCurveId === null) return 100
  const interval = flowInterval(input, cdu, platform) ?? flowInterval(input, cdu, platform, false)
  if (!interval) return 100
  const qNominal = solveP0(buildP0Input(input, cdu, platform, 100)).branches[0]?.qLpm ?? NaN
  if (!(qNominal > interval[1])) return 100
  const target = (interval[1] - 0.25 * (interval[1] - interval[0])) * input.nodes
  const s = speedForFlow(input, cdu, platform, target)
  if (s === null || s >= 100) return 100
  const r = solveP0(buildP0Input(input, cdu, platform, s))
  const q = r.branches[0]?.qLpm ?? NaN
  return hydraulicOk(r) && q >= interval[0] && q <= interval[1] ? s : 100
}

function solveChain(input: ConfigInput, cdu: CduSpec, platform: PlatformSpec, trace: boolean): ChainResult {
  const loadKw = input.nodes * input.kwPerNode
  const gates: Gate[] = []
  const speedPct = input.speedPct === 'auto' ? autoSpeed(input, cdu, platform) : input.speedPct
  const p0 = cdu.pumpCurveId === null ? null : solveP0(buildP0Input(input, cdu, platform, speedPct))
  const ok = hydraulicOk(p0)
  // p1.converged doubles as the kernel's trust flag: it goes false whenever the run leaves an
  // evidenced data domain (HX rated-flow band, cold-plate θ range), yet the temperatures still
  // come back finite. So it has to be gated explicitly — an untrusted run is never a judgment.
  const p1 = ok ? solveP1(buildP1Input(input, cdu, platform, p0)) : null
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
    detail: `${loadKw.toFixed(1)} kW vs ${cdu.hx.maxKw} kW at ${cdu.hx.maxAtdK} K ATD (last point of the sourced HX curve)`,
  })

  const qPerNode = ok ? (p0.branches[0]?.qLpm ?? 0) : 0
  const liquidKw = input.kwPerNode * platform.capture
  const lo = liquidKw * OAI_FLOW_WINDOW[0]
  const hi = liquidKw * OAI_FLOW_WINDOW[1]
  gates.push({
    id: 'flow-window',
    label: 'Flow in OAI window (1.25-2.0 L/min/kW)',
    pass: ok && qPerNode >= lo && qPerNode <= hi,
    detail: ok
      ? `${qPerNode.toFixed(2)} L/min per node vs ${lo.toFixed(1)}-${hi.toFixed(1)} L/min window (${liquidKw.toFixed(1)} kW carried by the liquid)`
      : p0 === null ? 'not computable — no pump curve' : 'not computable — hydraulic solve did not converge',
  })

  if (p1) {
    gates.push({
      id: 'evidenced-domain',
      label: 'Inside the kernel\u2019s evidenced domain',
      pass: trusted,
      detail: trusted
        ? 'HX rated-flow band and branch curve ranges hold — the temperatures below are a judgment'
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
    if (platform.hotSpot === null) {
      gates.push({
        id: 'tcase',
        label: 'Cold-plate case-temperature margin',
        pass: true,
        notEvaluated: true,
        detail: `not evaluated — the library has no sourced hot-spot θ for ${platform.label}; get the server vendor\u2019s case limit before quoting`,
      })
    } else {
      const worst = Math.min(...p1.nodes.map(n => n.tCaseMarginC ?? Infinity))
      gates.push({
        id: 'tcase',
        label: 'Cold-plate case-temperature margin',
        pass: p1.nodes.every(n => n.tCaseMarginC !== null && n.tCaseMarginC > 0),
        detail: `worst node margin ${worst === Infinity ? 'n/a' : worst.toFixed(1) + ' K'} to T_case ${T_CASE_MAX_C} °C (placeholder cap)`,
      })
    }
  } else {
    const why = p0 === null ? 'not computable — no pump curve' : 'thermal chain skipped — hydraulic solve did not converge'
    for (const id of ['evidenced-domain', 'dew', 'wclass', 'tcase']) gates.push({ id, label: id, pass: false, detail: why })
  }

  const rated = cdu.hx.ratedTcsLpm
  const bounds: FlowBounds = {
    liquidKw,
    perNode: {
      oai: [lo, hi],
      theta: platform.hotSpot ? [platform.hotSpot.splitN * platform.hotSpot.flowLpmRange[0], platform.hotSpot.splitN * platform.hotSpot.flowLpmRange[1]] : null,
      curve: branchDomain(platform),
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
      const r = solveP0(buildP0Input(input, cdu, platform, s))
      if (hydraulicOk(r) && (r.qTotalLpm ?? 0) > 0 && r.pumpDpKPa !== null) systemCurve.push([r.qTotalLpm as number, r.pumpDpKPa])
    }
    systemCurve.reverse()
  }

  return {
    input,
    cdu,
    platform,
    speedPct,
    speedAuto: input.speedPct === 'auto',
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
    catalog: [],
  }
}

/** Nameplate screen of the rack builder's catalog for this load — a first filter, not a model:
 *  no derating, no hydraulics. L2A ratings are at their rated room temperature; the room-heat and
 *  derating questions belong to the derating simulator. Unpublished ratings stay a red light. */
export function screenCatalog(products: readonly CatalogProduct[], loadKw: number, roomC: number): CatalogRow[] {
  const load = loadKw.toFixed(1)
  return products.map(product => {
    if (product.ratedKw == null) return { product, verdict: 'not published', note: 'no published rating — a red light, never a guess' }
    if (loadKw > product.ratedKw) return { product, verdict: 'undersized', note: `${product.ratedKw} kW rating vs ${load} kW load` }
    const air = typeof product.type === 'string' && product.type.toUpperCase() === 'L2A'
    if (!air) return { product, verdict: 'fits', note: `${product.ratedKw} kW rating covers the ${load} kW load; needs a tempered facility-water loop` }
    const ratedRoom = product.ratedRoomC ?? Number.NaN
    return {
      product,
      verdict: 'fits',
      note: `${product.ratedKw} kW at ${Number.isNaN(ratedRoom) ? 'rated' : ratedRoom + ' °C'} room air covers the ${load} kW load`
        + (roomC > ratedRoom ? ` — this scenario is ${roomC} °C: derating is modelled in the derating simulator, not here` : '')
        + '; the room must absorb the air share',
    }
  })
}

function atAutoSetpoint(input: ConfigInput, cdu: CduSpec, platform: PlatformSpec) {
  const r = solveChain({ ...input, speedPct: 'auto' }, cdu, platform, false)
  const cmp: CduComparison = { cdu, feasible: r.converged, trusted: r.trusted, failing: r.gates.filter(g => !g.pass).map(g => g.id) }
  return { r, cmp }
}

/** 'auto' ranks every CDU by evidence, not by nameplate: fewest failing gates first, then the run
 *  closest to its HX rated flow, then the smaller unit. */
function rankCdu(input: ConfigInput, platform: PlatformSpec) {
  return CDUS
    .map((cdu, order) => {
      const { r, cmp } = atAutoSetpoint(input, cdu, platform)
      return { cdu, cmp, order, dev: r.p1?.hx?.ratedFlowDevPct ?? Infinity }
    })
    .sort((a, b) => a.cmp.failing.length - b.cmp.failing.length || a.dev - b.dev || a.order - b.order)
}

export interface RunOptions {
  trace?: boolean                              // false skips the system-curve ladder (sweeps don't draw it)
  catalog?: readonly CatalogProduct[]          // the rack builder's cooling products, for the nameplate screen
}

/** One full chain. */
export function runChain(input: ConfigInput, opts: RunOptions = {}): ChainResult {
  const platform = PLATFORMS[input.platform]
  const ranked = rankCdu(input, platform)
  const picked = input.cdu === 'auto' ? ranked[0].cdu : ranked.find(x => x.cdu.id === input.cdu)?.cdu ?? ranked[0].cdu
  const result = solveChain(input, picked, platform, opts.trace !== false)
  result.comparison = ranked.map(x => x.cmp)
  result.catalog = opts.catalog ? screenCatalog(opts.catalog, result.loadKw, SCENARIOS[input.scenario].room.tAirC) : []
  return result
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
  lines.push(`- Load: **${input.nodes} × ${input.kwPerNode.toFixed(1)} kW = ${r.loadKw.toFixed(1)} kW** IT (${(r.bounds.liquidKw * input.nodes).toFixed(1)} kW carried by the liquid at ${Math.round(r.platform.capture * 100)}% capture)`)
  lines.push(`- Node platform: **${r.platform.label}** — ${r.platform.summary}`)
  lines.push(`- Branch model: couplers = ${r.platform.couplers}; branch curves evidenced for ${r.bounds.perNode.curve[0]}–${r.bounds.perNode.curve[1]} L/min per node`)
  lines.push(`- Network: ORv3-style rack, supply/return ${SUPPLY_C}/${RETURN_C} °C, PG25`)
  lines.push(`- CDU: **${r.cdu.label}**${input.cdu === 'auto' ? ' (chosen automatically — best-evidenced for this operating point)' : ''}; pump ${r.speedAuto ? `automatic setpoint → ${r.speedPct}% of the published curve speed` : `at ${r.speedPct >= 100 ? 'the published curve speed' : `${r.speedPct}% of the published curve speed (affinity laws)`}`}`)
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
    if (r.platform.hotSpot) {
      const worstNode = p1.nodes.length
        ? p1.nodes.reduce((w, n) => ((n.tCaseMarginC ?? Infinity) < (w.tCaseMarginC ?? Infinity) ? n : w), p1.nodes[0])
        : null
      if (worstNode) lines.push(`- Worst node (${worstNode.id}): T_case ${num(worstNode.tCaseC)} °C, margin ${num(worstNode.tCaseMarginC)} K (cap ${T_CASE_MAX_C} °C placeholder)`)
    } else {
      lines.push(`- T_case: not evaluated — the library has no sourced hot-spot θ for ${r.platform.label}`)
    }
    if (r.p1Warnings.length) lines.push(`- Kernel messages: ${r.p1Warnings.join('; ')}`)
    lines.push('')
  }
  lines.push(`## CDUs compared (pump at its automatic setpoint)`)
  lines.push('')
  for (const c of r.comparison) {
    lines.push(`- ${c.cdu.label}: ${c.feasible ? 'feasible' : c.trusted ? 'gated' : 'not judgeable'}${c.failing.length ? ` — fails ${c.failing.map(gateShortName).join(', ')}` : ''}`)
  }
  if (r.catalog.length) {
    lines.push('')
    lines.push(`## Catalog screen (nameplate only — no derating, no hydraulics)`)
    lines.push('')
    for (const c of r.catalog) lines.push(`- ${c.product.name}: ${c.verdict} — ${c.note}`)
  }
  lines.push('')
  lines.push(`## Verdict`)
  lines.push('')
  for (const g of r.gates) lines.push(`- ${g.pass ? (g.notEvaluated ? 'NOT EVALUATED' : 'PASS') : 'FAIL'} — ${g.label}: ${g.detail}`)
  lines.push('')
  lines.push(`---`)
  lines.push(`Solver versions: p0 ${p0?.versions.solver ?? '—'} / p1 ${p1?.versions.solver ?? '—'} · props ${p0?.versions.props ?? '—'} · data ${p0?.versions.dataVersion ?? RACK_DATA_VERSION}`)
  lines.push(`Boundary: results are feasibility judgments up to the UQD coupling plane — not a performance guarantee. θ cap ${T_CASE_MAX_C} °C is a placeholder; replace with the server vendor's spec before quoting. Generated by the liquid cooling guide configurator (kernel-driven, no hand-written physics).`)
  return lines.join('\n')
}

/** Short names for gate ids — what the comparison table and the calculation note print. */
const GATE_SHORT: Record<string, string> = {
  'pump-curve': 'no pump curve', 'p0-converged': 'hydraulic solve', capacity: 'HX capacity', 'flow-window': 'OAI window',
  'evidenced-domain': 'evidenced domain', dew: 'dew point', wclass: 'ASHRAE W32', tcase: 'T_case margin',
}
export const gateShortName = (id: string): string => GATE_SHORT[id] ?? id
