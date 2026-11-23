import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { seoHead } from '~/lib/seo'
import { PageToc } from '~/components/PageToc'
import { PumpChart } from '~/components/PumpChart'
import hw from '~/data/hardware.json'
import {
  runChain, buildReport, speedForFlow, gateShortName, SCENARIOS, DEFAULT_INPUT, CDUS, PUMP_CURVES, PLATFORMS, SPEED_RANGE,
  type ConfigInput, type ScenarioId, type PlatformId,
} from '~/lib/configurator'

export const Route = createFileRoute('/playground/configurator')({
  head: () => ({
    ...seoHead({
      title: 'Rack configurator — scenario to feasibility note, kernel-driven',
      description: 'Pick a scenario, node platform, rack load and CDU; the same liquid-cooling simulation kernel that powers our playground solves the pump operating point, hydraulic network and thermal chain live — flow distribution, OAI flow window, dew-point red line, ASHRAE W-class — and writes a downloadable calculation note. Every curve carries its datasheet source.',
      path: '/playground/configurator',
    }),
  }),
  component: ConfiguratorPage,
})

const GREEN = '#1a7f37'
const RED = '#c0392b'
const fmt = (n: number | null | undefined, d = 1) => (n === null || n === undefined || Number.isNaN(n) ? '—' : n.toFixed(d))

function ConfiguratorPage() {
  const [input, setInput] = useState<ConfigInput>(DEFAULT_INPUT)
  const result = useMemo(() => runChain(input, { catalog: hw.cooling }), [input])
  const report = useMemo(() => buildReport(result), [result])
  const { p0, p1 } = result
  const platform = result.platform

  const set = (patch: Partial<ConfigInput>) => setInput(prev => ({ ...prev, ...patch }))
  // dragging the operating point switches to a manual speed: the kernel says which speed lands there
  const seekFlow = (lpm: number) => {
    const s = speedForFlow(input, result.cdu, platform, lpm)
    if (s !== null) set({ speedPct: s })
  }

  const download = () => {
    const blob = new Blob([report], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `liquid-cooling-note-${input.scenario}-${input.platform}-${input.nodes}x${input.kwPerNode}kW.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const hydraulicOk = p0 !== null && p0.converged && p0.inputInvalid.length === 0
  const qTotal = hydraulicOk ? (p0.qTotalLpm ?? 0) : null
  const qPerNode = hydraulicOk ? (p0.branches[0]?.qLpm ?? 0) : null
  const operating = hydraulicOk && p0.pumpDpKPa !== null && qTotal !== null ? { q: qTotal, dp: p0.pumpDpKPa } : null

  // rack flow that satisfies the OAI window AND every per-node data domain (null when they do not overlap)
  const B = result.bounds
  const lower = [
    { name: 'the OAI window', v: B.perNode.oai[0] },
    ...(B.perNode.theta ? [{ name: 'the cold-plate θ domain', v: B.perNode.theta[0] }] : []),
    { name: 'the branch curves', v: B.perNode.curve[0] },
  ].sort((a, b) => b.v - a.v)
  const upper = [
    { name: 'the OAI window', v: B.perNode.oai[1] },
    ...(B.perNode.theta ? [{ name: 'the cold-plate θ domain', v: B.perNode.theta[1] }] : []),
    { name: 'the branch curves', v: B.perNode.curve[1] },
  ].sort((a, b) => a.v - b.v)
  const flowBand: [number, number] | null = lower[0].v < upper[0].v ? [lower[0].v * input.nodes, upper[0].v * input.nodes] : null

  const boundRows: { name: string; scope: string; lo: number; hi: number; d: number; actual: number | null }[] = [
    { name: 'OAI flow window', scope: 'per node', lo: B.perNode.oai[0], hi: B.perNode.oai[1], d: 2, actual: qPerNode },
    ...(B.perNode.theta ? [{ name: 'Cold-plate θ data domain', scope: 'per node', lo: B.perNode.theta[0], hi: B.perNode.theta[1], d: 2, actual: qPerNode as number | null }] : []),
    { name: 'Branch curve domain (cold plates + couplers)', scope: 'per node', lo: B.perNode.curve[0], hi: B.perNode.curve[1], d: 2, actual: qPerNode },
    { name: 'HX evidenced flow (±10% advisory)', scope: 'rack total', lo: B.total.hxWarn[0], hi: B.total.hxWarn[1], d: 1, actual: qTotal },
    { name: 'HX trust edge (±25%)', scope: 'rack total', lo: B.total.hxTrust[0], hi: B.total.hxTrust[1], d: 1, actual: qTotal },
  ]

  const tcaseGate = result.gates.find(g => g.id === 'tcase')

  return (
    <main className="container" style={{ padding: '40px 20px' }}>
      <p className="updated">Playground · one chain, kernel-driven · live on arrival</p>
      <h1>Rack configurator</h1>
      <p style={{ maxWidth: '680px' }}>
        One workflow instead of four separate toys: <b>scenario → nodes → CDU &amp; pump operating point → thermal chain → calculation note</b>.
        Every number below is computed by the{' '}
        <a href="https://github.com/Friovia/simulation">open-source simulation kernel</a> (p0-hydraulics + p1-thermal-chain,
        Apache-2.0) — the same golden-vector-verified solvers behind this site. Change any input and the whole chain re-solves instantly.
      </p>

      <PageToc />

      <h2>① Scenario &amp; load</h2>
      <div style={{ display: 'grid', gap: '10px', maxWidth: '760px' }}>
        {(Object.values(SCENARIOS) as (typeof SCENARIOS)[ScenarioId][]).map(s => (
          <label key={s.id} className="idx-row" style={{
            display: 'block', padding: '10px 14px', cursor: 'pointer',
            border: input.scenario === s.id ? '2px solid #476582' : '1px solid #e3e3e3',
            borderRadius: '8px', background: input.scenario === s.id ? '#f6f8fa' : 'transparent',
          }}>
            <input type="radio" name="scenario" checked={input.scenario === s.id} onChange={() => set({ scenario: s.id })} style={{ marginRight: '8px' }} />
            <b>{s.label}</b>
            <span className="src" style={{ display: 'block', marginLeft: '22px', marginTop: '2px' }}>{s.blurb}</span>
          </label>
        ))}
      </div>

      <figure className="fig" style={{ marginInline: '0', maxWidth: '760px', marginTop: '14px' }}>
        <table>
          <tbody>
            <tr>
              <th>Node platform</th>
              <td style={{ minWidth: '260px' }}>
                <select value={input.platform} aria-label="Node platform"
                  onChange={e => { const id = e.target.value as PlatformId; set({ platform: id, kwPerNode: PLATFORMS[id].designKw }) }}
                  style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #c9c9c9', fontSize: '14px' }}>
                  {(Object.values(PLATFORMS) as (typeof PLATFORMS)[PlatformId][]).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </td>
              <td className="src">{platform.summary} Couplers: {platform.couplers}.</td>
            </tr>
            <tr>
              <th>Liquid-cooled nodes</th>
              <td>
                <input type="range" min={1} max={12} value={input.nodes} aria-label="Liquid-cooled nodes" onChange={e => set({ nodes: +e.target.value })} style={{ width: '220px', verticalAlign: 'middle' }} />
                <b style={{ marginLeft: '10px', fontSize: '16px' }}>{input.nodes}</b>
              </td>
              <td className="src">ORv3-style rack, one branch each</td>
            </tr>
            <tr>
              <th>IT load per node</th>
              <td>
                <input type="range" min={4} max={20} step={0.1} value={input.kwPerNode} aria-label="IT load per node" onChange={e => set({ kwPerNode: +e.target.value })} style={{ width: '220px', verticalAlign: 'middle' }} />
                <b style={{ marginLeft: '10px', fontSize: '16px' }}>{input.kwPerNode.toFixed(1)} kW</b>
              </td>
              <td className="src">branch model evidenced at {platform.designKw} kW per node</td>
            </tr>
            <tr>
              <th>Rack IT load</th>
              <td><b style={{ fontSize: '16px' }}>{result.loadKw.toFixed(1)} kW</b></td>
              <td className="src">{input.nodes} × {input.kwPerNode.toFixed(1)} kW · {(B.liquidKw * input.nodes).toFixed(1)} kW carried by the liquid ({Math.round(platform.capture * 100)}% capture)</td>
            </tr>
          </tbody>
        </table>
      </figure>

      <h2>② CDU &amp; pump operating point <GateBadge ok={hydraulicOk} text="p0" /></h2>
      <p style={{ maxWidth: '680px' }}>
        The kernel solves the pump-versus-network operating point: {input.nodes} parallel branches, PG25, 32 °C supply.
        Pick a CDU, or let automatic mode take the one whose evidence covers this operating point best.
        A CDU without a published pump curve cannot be computed — and stays a red light rather than a guess.
      </p>
      <figure className="fig" style={{ marginInline: '0', maxWidth: '760px' }}>
        <table>
          <tbody>
            <tr>
              <th>CDU</th>
              <td style={{ minWidth: '260px' }}>
                <select value={input.cdu} aria-label="CDU" onChange={e => set({ cdu: e.target.value as ConfigInput['cdu'] })} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #c9c9c9', fontSize: '14px' }}>
                  <option value="auto">Automatic — best-evidenced CDU</option>
                  {CDUS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </td>
              <td className="src">
                {input.cdu === 'auto' ? `automatic chose ${result.cdu.label}: fewest failing gates, then closest to its HX rated flow` : result.cdu.pumpNote}
              </td>
            </tr>
            <tr>
              <th>Pump speed</th>
              <td style={{ whiteSpace: 'nowrap' }}>
                <label style={{ marginRight: '14px' }}>
                  <input type="radio" name="speed" checked={input.speedPct === 'auto'} onChange={() => set({ speedPct: 'auto' })} style={{ marginRight: '5px' }} disabled={p0 === null} />Automatic
                </label>
                <label>
                  <input type="radio" name="speed" checked={input.speedPct !== 'auto'} onChange={() => set({ speedPct: result.speedPct })} style={{ marginRight: '5px' }} disabled={p0 === null} />Manual
                </label>
                {input.speedPct !== 'auto' && (
                  <>
                    <input type="range" min={SPEED_RANGE[0]} max={SPEED_RANGE[1]} value={input.speedPct} aria-label="Pump speed" onChange={e => set({ speedPct: +e.target.value })} style={{ width: '160px', verticalAlign: 'middle', marginLeft: '14px' }} />
                    <b style={{ marginLeft: '8px', fontSize: '16px' }}>{input.speedPct}%</b>
                  </>
                )}
              </td>
              <td className="src">
                {p0 === null
                  ? '—'
                  : result.speedAuto
                    ? `automatic setpoint: ${result.speedPct}% of the published curve — the pump slows down when the published-speed flow overshoots the flow window`
                    : 'manual: 100% = the published pump curve; lower = affinity-law scaling. Or drag the point on the chart.'}
              </td>
            </tr>
            {p0 && hydraulicOk && (
              <>
                <tr><th>Operating point</th><td><b>{fmt(qTotal, 2)} L/min</b> at <b>{fmt(p0.pumpDpKPa, 1)} kPa</b></td><td className="src">pump curve ∩ system curve</td></tr>
                <tr><th>Flow per node</th><td><b>{fmt(qPerNode, 2)} L/min</b> ({fmt(p0.branches[0]?.sharePct, 1)}% each)</td><td className="src">each branch identical by construction</td></tr>
              </>
            )}
            <tr>
              <th>Heat exchanger</th>
              <td>evidenced to <b>{result.cdu.hx.maxKw} kW</b> at {result.cdu.hx.maxAtdK} K ATD</td>
              <td className="src">rated rack-loop flow {result.cdu.hx.ratedTcsLpm} L/min — last point of the sourced HX curve</td>
            </tr>
          </tbody>
        </table>
      </figure>

      <PumpChart
        pumpCurves={PUMP_CURVES}
        selected={result.cdu.id}
        speedPct={result.speedPct}
        systemCurve={result.systemCurve}
        operating={operating}
        flowBand={flowBand}
        hxTrustBand={B.total.hxTrust}
        onSeekFlow={seekFlow}
      />

      <h3 style={{ marginTop: '28px' }}>Which flow bound binds</h3>
      <p style={{ maxWidth: '680px' }}>
        Every curve is sourced for a range, not for a point. These are the registered ranges the kernel checks — and where this
        run sits in each. When the per-node ranges no longer overlap, no pump can make the configuration judgeable.
      </p>
      <figure className="fig" style={{ marginInline: '0', maxWidth: '860px' }}>
        <table>
          <tbody>
            <tr><th>Bound</th><th>Applies to</th><th>Requires</th><th>This run</th></tr>
            {boundRows.map(r => {
              const inside = r.actual !== null && r.actual >= r.lo && r.actual <= r.hi
              return (
                <tr key={r.name}>
                  <th>{r.name}</th>
                  <td>{r.scope}</td>
                  <td>{r.lo.toFixed(r.d)}–{r.hi.toFixed(r.d)} L/min</td>
                  <td>
                    {r.actual === null ? '—' : <b style={{ color: inside ? GREEN : RED }}>{fmt(r.actual, r.d)} L/min · {inside ? 'in' : 'out'}</b>}
                  </td>
                </tr>
              )
            })}
            {flowBand === null && (
              <tr>
                <th>Per-node overlap</th>
                <td colSpan={3}>
                  <b style={{ color: RED }}>no overlap</b>{' '}
                  <span className="src">— {upper[0].name} cap each node at {upper[0].v.toFixed(1)} L/min, {lower[0].name} need at least {lower[0].v.toFixed(1)} L/min</span>
                </td>
              </tr>
            )}
            {B.perNode.theta === null && (
              <tr>
                <th>Cold-plate θ</th>
                <td colSpan={3}>
                  <span className="src">no sourced hot-spot θ for {platform.label} in the library — T_case is not evaluated; the flow bounds above are what the branch curves themselves evidence</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <figcaption>
          HX bands are display values only: the verdict comes from the kernel, which flags a run beyond ±25% as not trustworthy.
        </figcaption>
      </figure>

      {result.p0Warnings.length > 0 && (
        <p className="src" style={{ maxWidth: '860px' }}><b>Kernel messages (hydraulics):</b> {result.p0Warnings.join(' · ')}</p>
      )}

      <h3 style={{ marginTop: '28px' }}>Every CDU the library can model</h3>
      <figure className="fig" style={{ marginInline: '0', maxWidth: '860px' }}>
        <table>
          <tbody>
            <tr>
              <th>CDU</th>
              {result.comparison.map(c => <td key={c.cdu.id}><b>{c.cdu.id === result.cdu.id ? '▸ ' : ''}{c.cdu.label}</b></td>)}
            </tr>
            <tr>
              <th>Pump curve</th>
              {result.comparison.map(c => <td key={c.cdu.id}>{c.cdu.pumpCurveId ? c.cdu.pumpNote : <b style={{ color: RED }}>not published</b>}</td>)}
            </tr>
            <tr>
              <th>HX evidenced to</th>
              {result.comparison.map(c => <td key={c.cdu.id}>{c.cdu.hx.maxKw} kW at {c.cdu.hx.maxAtdK} K ATD</td>)}
            </tr>
            <tr>
              <th>At automatic setpoint</th>
              {result.comparison.map(c => (
                <td key={c.cdu.id}>
                  <b style={{ color: c.feasible ? GREEN : RED }}>{c.feasible ? 'feasible' : c.trusted ? 'gated' : 'not judgeable'}</b>
                  {c.failing.length > 0 && <span className="src"> — {c.failing.map(gateShortName).join(', ')}</span>}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <figcaption>Same scenario, nodes and network; only the CDU changes. This is what automatic mode chooses from.</figcaption>
      </figure>

      <h3 style={{ marginTop: '28px' }}>Catalog screen — {result.catalog.length} products, nameplate only</h3>
      <p style={{ maxWidth: '680px' }}>
        A first filter over the rack builder’s catalog: does the published rating cover this load? No derating, no hydraulics —
        those live in the <a href="/playground/derating">derating simulator</a> and in the kernel-driven chain above.
        An unpublished rating stays a red light.
      </p>
      <figure className="fig" style={{ marginInline: '0', maxWidth: '860px' }}>
        <table>
          <tbody>
            {result.catalog.map(c => (
              <tr key={c.product.id}>
                <th>{c.product.name}</th>
                <td>{c.product.type ?? '—'}</td>
                <td>{c.product.ratedKw == null ? <b style={{ color: RED }}>not published</b> : `${c.product.ratedKw} kW`}</td>
                <td>
                  <b style={{ color: c.verdict === 'fits' ? GREEN : RED }}>{c.verdict}</b>
                  <span className="src"> — {c.note}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <figcaption>Against {result.loadKw.toFixed(1)} kW of IT load. L2A ratings are at their rated room temperature; L2L units need a tempered facility-water loop.</figcaption>
      </figure>

      <h2>③ Thermal chain {p1 ? <GateBadge ok={result.trusted} text="p1" /> : null}</h2>
      {p1 ? (
        <>
          <p style={{ maxWidth: '680px' }}>
            Heat flows chip → cold plate → coolant → CDU heat exchanger → facility water. The kernel checks the dew-point
            red line (condensation), the ASHRAE W32 facility-water class, and cold-plate case temperature against the load.
            It also refuses to judge outside its evidenced data domain: every curve is sourced for a rated flow range, and a
            run that leaves it is reported as extrapolation — not as a verdict.
          </p>
          {!result.trusted && (
            <p style={{ maxWidth: '760px', marginInline: '0', borderLeft: '3px solid #c0392b', paddingLeft: '12px' }}>
              <b>Outside the kernel’s evidenced domain.</b> This run left the flow range its curves are sourced for, so the
              temperatures below are extrapolation and cannot back a feasibility judgment. The kernel messages say which range.
            </p>
          )}
          <figure className="fig" style={{ marginInline: '0', maxWidth: '760px', opacity: result.trusted ? 1 : 0.55 }}>
            <table>
              <tbody>
                <tr><th>Rack supply / return</th><td><b>{fmt(p1.tSupplyC)} / {fmt(p1.tReturnC)} °C</b></td><td className="src">ΔT rack {fmt(p1.dtRackK)} K</td></tr>
                {p1.hx && <tr><th>CDU heat exchanger</th><td><b>{fmt(p1.hx.qKw)} kW</b> at ATD {fmt(p1.hx.atdK)} K</td><td className="src">facility water {SCENARIOS[input.scenario].fwsSupplyC} °C</td></tr>}
                <tr>
                  <th>Dew-point red line</th>
                  <td>{p1.dewPass === true ? <b style={{ color: GREEN }}>PASS</b> : <b style={{ color: RED }}>FAIL</b>}</td>
                  <td className="src">margin {fmt(p1.dewMarginK)} K (min {fmt(p1.dewMarginMinK)} K) — dew point {fmt(p1.dewPointC)} °C</td>
                </tr>
                <tr>
                  <th>ASHRAE W32</th>
                  <td>{p1.wClassPass === true ? <b style={{ color: GREEN }}>PASS</b> : <b style={{ color: RED }}>FAIL</b>}</td>
                  <td className="src">checked {fmt(p1.wClassCheckC)} °C vs max {fmt(p1.wClassMaxSupplyC)} °C</td>
                </tr>
                <tr>
                  <th>Worst T_case margin</th>
                  {tcaseGate?.notEvaluated ? (
                    <>
                      <td><b style={{ color: 'var(--text2)' }}>not evaluated</b></td>
                      <td className="src">no sourced hot-spot θ for {platform.label} in the library — get the server vendor’s case limit before quoting</td>
                    </>
                  ) : (
                    <>
                      <td>{(() => { const worst = Math.min(...p1.nodes.map(n => n.tCaseMarginC ?? Infinity)); return worst === Infinity ? '—' : <b style={{ color: worst > 0 ? GREEN : RED }}>{fmt(worst)} K</b> })()}</td>
                      <td className="src">cap 80 °C is a placeholder — swap in the server vendor spec before quoting</td>
                    </>
                  )}
                </tr>
                {result.p1Warnings.length > 0 && <tr><th>Kernel messages</th><td colSpan={2} className="src">{result.p1Warnings.join(' · ')}</td></tr>}
              </tbody>
            </table>
            <figcaption>
              {platform.hotSpot
                ? <>θ = {platform.hotSpot.thetaKPerW} K/W ({platform.hotSpot.note}) — assumption registered, not invented.</>
                : <>Supply and return temperatures come from the kernel’s energy balance; case temperature needs a hot-spot θ this platform has no source for.</>}
            </figcaption>
          </figure>
        </>
      ) : (
        <p className="src">
          {p0 === null
            ? 'Thermal chain not computed — the selected CDU has no pump curve in the library.'
            : 'Thermal chain skipped — the hydraulic solve did not converge for this configuration.'}
        </p>
      )}

      <h2>④ Calculation note</h2>
      <p style={{ maxWidth: '680px' }}>
        The same run emits a calculation note you can hand to a reviewer — inputs, results, verdicts, versions and the
        boundary statement (feasibility judgment up to the UQD plane, not a performance guarantee).
      </p>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <b style={{ fontSize: '15px' }}>
          Verdict:{' '}
          {result.converged
            ? <span style={{ color: GREEN }}>configuration feasible</span>
            : p0 === null
              ? <span style={{ color: RED }}>not computable — this CDU has no published pump curve</span>
              : result.trusted
                ? <span style={{ color: RED }}>check the red gates above</span>
                : <span style={{ color: RED }}>not judgeable with this CDU — outside the kernel’s evidenced domain</span>}
        </b>
        <button onClick={download} style={{ padding: '6px 14px', borderRadius: '9999px', border: '1px solid #476582', background: '#f1f1f1', cursor: 'pointer', fontSize: '13px' }}>
          Download note (.md)
        </button>
      </div>
      <figure className="formula" style={{ marginInline: '0', maxWidth: '860px', overflowX: 'auto' }}>
        <pre style={{ margin: '0', fontSize: '12px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{report}</pre>
      </figure>

      <h2>Related</h2>
      <p>
        <a href="/playground/rack-builder">Rack builder (product picker)</a> ·
        <a href="/playground/derating">Derating simulator</a> ·
        <a href="/coolant-flow-rate">Coolant flow rate</a> ·
        <a href="/approach-temperature">Approach temperature</a> ·
        <a href="/uqd-quick-disconnects">UQD reference</a>
      </p>

      <p className="src">
        Solver: <a href="https://github.com/Friovia/simulation">friovia/simulation</a> (Apache-2.0) — p0-hydraulics + p1-thermal-chain,
        golden-vector verified; curve library {p0?.versions.dataVersion ?? '—'}. This page contains no hand-written physics.
      </p>
    </main>
  )
}

function GateBadge({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span style={{
      fontSize: '12px', verticalAlign: 'middle', marginLeft: '8px', padding: '2px 10px',
      borderRadius: '9999px', background: ok ? 'rgba(26,127,55,.12)' : 'rgba(192,57,43,.12)',
      color: ok ? GREEN : RED, fontWeight: 500,
    }}>
      {text} {ok ? '✓' : '✗'}
    </span>
  )
}
