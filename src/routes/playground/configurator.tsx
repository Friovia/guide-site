import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { seoHead } from '~/lib/seo'
import { PageToc } from '~/components/PageToc'
import {
  runChain, buildReport, SCENARIOS, DEFAULT_INPUT, OAI_FLOW_WINDOW,
  type ConfigInput, type ScenarioId,
} from '~/lib/configurator'

export const Route = createFileRoute('/playground/configurator')({
  head: () => ({
    ...seoHead({
      title: 'Rack configurator — scenario to feasibility note, kernel-driven',
      description: 'Pick a scenario and rack load; the same liquid-cooling simulation kernel that powers our playground solves the hydraulic network and thermal chain live — flow distribution, pump operating point, dew-point red line, ASHRAE W-class — and writes a downloadable calculation note. Every curve carries its datasheet source.',
      path: '/playground/configurator',
    }),
  }),
  component: ConfiguratorPage,
})

const fmt = (n: number | null | undefined, d = 1) => (n === null || n === undefined || Number.isNaN(n) ? '—' : n.toFixed(d))

function ConfiguratorPage() {
  const [input, setInput] = useState<ConfigInput>(DEFAULT_INPUT)
  const result = useMemo(() => runChain(input), [input])
  const report = useMemo(() => buildReport(result), [result])
  const { p0, p1 } = result

  const set = (patch: Partial<ConfigInput>) => setInput(prev => ({ ...prev, ...patch }))

  const download = () => {
    const blob = new Blob([report], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `liquid-cooling-note-${input.scenario}-${input.nodes}x${input.kwPerNode}kW.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <main className="container" style={{ padding: '40px 20px' }}>
      <p className="updated">Playground · one chain, kernel-driven · live on arrival</p>
      <h1>Rack configurator</h1>
      <p style={{ maxWidth: '680px' }}>
        One workflow instead of four separate toys: <b>scenario → load → hydraulics → thermal chain → calculation note</b>.
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
              <th>Liquid-cooled nodes</th>
              <td>
                <input type="range" min={1} max={12} value={input.nodes} onChange={e => set({ nodes: +e.target.value })} style={{ width: '220px', verticalAlign: 'middle' }} />
                <b style={{ marginLeft: '10px', fontSize: '16px' }}>{input.nodes}</b>
              </td>
              <td className="src">ORv3-style rack, one branch each</td>
            </tr>
            <tr>
              <th>IT load per node</th>
              <td>
                <input type="range" min={4} max={20} step={0.5} value={input.kwPerNode} onChange={e => set({ kwPerNode: +e.target.value })} style={{ width: '220px', verticalAlign: 'middle' }} />
                <b style={{ marginLeft: '10px', fontSize: '16px' }}>{input.kwPerNode} kW</b>
              </td>
              <td className="src">8-OAM platform assumption</td>
            </tr>
            <tr>
              <th>Rack IT load</th>
              <td><b style={{ fontSize: '16px' }}>{result.loadKw} kW</b></td>
              <td className="src">{input.nodes} × {input.kwPerNode} kW</td>
            </tr>
          </tbody>
        </table>
      </figure>

      <h2>② Hydraulics <GateBadge ok={p0.converged && p0.inputInvalid.length === 0} text="p0" /></h2>
      <p style={{ maxWidth: '680px' }}>
        The kernel solves the pump-vs-network operating point: in-rack CDU pump (Vertiv CoolChip 100 kW class),{' '}
        {input.nodes} parallel branches of OAI 8-OAM cold plates + UQD06 couplings, PG25, 32 °C supply.
      </p>
      <figure className="fig" style={{ marginInline: '0', maxWidth: '760px' }}>
        <table>
          <tbody>
            <tr><th>Total flow</th><td><b>{fmt(p0.qTotalLpm, 2)} L/min</b></td><td className="src">pump operating point</td></tr>
            <tr><th>Pump head</th><td><b>{fmt(p0.pumpHeadM, 1)} m</b> ({fmt(p0.pumpDpKPa, 1)} kPa)</td><td className="src">system curve intersection</td></tr>
            <tr>
              <th>Flow per node</th>
              <td><b>{fmt(p0.branches[0]?.qLpm, 2)} L/min</b> ({fmt(p0.branches[0]?.sharePct, 1)}% each)</td>
              <td className="src">
                OAI window {OAI_FLOW_WINDOW[0]}-{OAI_FLOW_WINDOW[1]} L/min/kW →{' '}
                {(() => { const q = p0.branches[0]?.qLpm ?? 0; const [lo, hi] = OAI_FLOW_WINDOW.map(w => w * input.kwPerNode); return q >= lo && q <= hi ? <b style={{ color: '#1a7f37' }}>in window</b> : <b style={{ color: '#c0392b' }}>outside window ({lo.toFixed(1)}-{hi.toFixed(1)})</b> })()}
              </td>
            </tr>
            {result.p0Warnings.length > 0 && <tr><th>Kernel messages</th><td colSpan={2} className="src">{result.p0Warnings.join(' · ')}</td></tr>}
          </tbody>
        </table>
        <figcaption>Curves: pump &amp; cold plate &amp; UQD from the source-attributed curve library (datasheet / OCP spec, ±15% uncertainty bands registered per curve).</figcaption>
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
              <b>Outside the kernel's evidenced domain.</b> This run left the flow range its curves are sourced for, so the
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
                  <td>{p1.dewPass === true ? <b style={{ color: '#1a7f37' }}>PASS</b> : <b style={{ color: '#c0392b' }}>FAIL</b>}</td>
                  <td className="src">margin {fmt(p1.dewMarginK)} K (min {fmt(p1.dewMarginMinK)} K) — dew point {fmt(p1.dewPointC)} °C</td>
                </tr>
                <tr>
                  <th>ASHRAE W32</th>
                  <td>{p1.wClassPass === true ? <b style={{ color: '#1a7f37' }}>PASS</b> : <b style={{ color: '#c0392b' }}>FAIL</b>}</td>
                  <td className="src">checked {fmt(p1.wClassCheckC)} °C vs max {fmt(p1.wClassMaxSupplyC)} °C</td>
                </tr>
                <tr>
                  <th>Worst T_case margin</th>
                  <td>{(() => { const worst = Math.min(...p1.nodes.map(n => n.tCaseMarginC ?? Infinity)); return worst === Infinity ? '—' : <b style={{ color: worst > 0 ? '#1a7f37' : '#c0392b' }}>{fmt(worst)} K</b> })()}</td>
                  <td className="src">cap 80 °C is a placeholder — swap in the server vendor spec before quoting</td>
                </tr>
                {result.p1Warnings.length > 0 && <tr><th>Kernel messages</th><td colSpan={2} className="src">{result.p1Warnings.join(' · ')}</td></tr>}
              </tbody>
            </table>
            <figcaption>θ = 0.02185 K/W (Wiwynn 8-OAM upper bound ×1.15 PG25) — assumption registered, not invented.</figcaption>
          </figure>
        </>
      ) : (
        <p className="src">Thermal chain skipped — the hydraulic solve did not converge for this configuration.</p>
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
            ? <span style={{ color: '#1a7f37' }}>configuration feasible</span>
            : result.trusted
              ? <span style={{ color: '#c0392b' }}>check the red gates above</span>
              : <span style={{ color: '#c0392b' }}>not judgeable with this CDU — outside the kernel's evidenced domain</span>}
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
        <a href="/coolant-flow-rate">Coolant flow rate</a> ·
        <a href="/approach-temperature">Approach temperature</a> ·
        <a href="/uqd-quick-disconnects">UQD reference</a>
      </p>

      <p className="src">
        Solver: <a href="https://github.com/Friovia/simulation">friovia/simulation</a> (Apache-2.0) — p0-hydraulics + p1-thermal-chain,
        golden-vector verified; curve library {p0.versions.dataVersion}. This page contains no hand-written physics.
      </p>
    </main>
  )
}

function GateBadge({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span style={{
      fontSize: '12px', verticalAlign: 'middle', marginLeft: '8px', padding: '2px 10px',
      borderRadius: '9999px', background: ok ? 'rgba(26,127,55,.12)' : 'rgba(192,57,43,.12)',
      color: ok ? '#1a7f37' : '#c0392b', fontWeight: 500,
    }}>
      {text} {ok ? '✓' : '✗'}
    </span>
  )
}
