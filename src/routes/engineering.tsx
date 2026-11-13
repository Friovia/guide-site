import { createFileRoute } from '@tanstack/react-router'
import { seoHead, articleJsonLd, jsonLdHead } from '~/lib/seo'

export const Route = createFileRoute('/engineering')({
  head: () => ({
    ...seoHead({
      title: 'Engineering & calculators — every liquid cooling formula with live tools',
      description: 'The engineering channel: TDP-to-rack-kW budgets, coolant flow, heat capture split, approach-temperature derating, ASHRAE W-classes, wet-bulb free cooling, room AC load (1.1× rule), UQD interfaces and PG25 fluids — one concept per page, live calculators, sourced.',
      path: '/engineering',
    }),
    ...jsonLdHead(articleJsonLd({
      path: '/engineering',
      title: 'Engineering & calculators',
      description: 'Channel hub: every formula with a live tool.',
      datePublished: '2026-11-13',
      dateModified: '2026-11-13',
    })),
  }),
  component: EngineeringPage,
})

const ChanList = ({ items }: { items: [string, string, string][] }) => (
  <ul className="chan">
    {items.map(([href, title, desc]) => (
      <li key={href}><a href={href}><b>{title}</b></a> — {desc}</li>
    ))}
  </ul>
)

function EngineeringPage() {
  return (
    <main className="container" style={{ padding:"40px 20px" }}>
      <p className="updated">Channel · engineering tools</p>
      <h1>Engineering &amp; calculators</h1>

      <p style={{ maxWidth:"680px" }}>
        The engineering layer of this guide: every formula a rack-level liquid cooling decision actually
        uses — load budgets, flow, derating, room heat, interfaces, fluids. Each page is one concept with
        a live calculator: real physics in, honest envelope out. Numbers here are derived in the open —
        the same derivations the configurator on
        <a href="https://friovia.com" rel="noopener">friovia.com</a> runs.
      </p>

      <h2>Load &amp; flow</h2>
      <ChanList items={[
        ['/tdp-to-rack-kw', 'TDP to rack kW', 'power budget from public specs: (ΣGPU + ΣCPU) × 1.2'],
        ['/coolant-flow-rate', 'Coolant flow rate', <>Q = P / (ρ · c<sub>p</sub> · ΔT), with live calculator</>],
        ['/heat-capture-split', 'Heat capture split', 'how much of rack heat goes liquid vs air (60–80% DLC)'],
      ]} />

      <h2>Capacity &amp; climate</h2>
      <ChanList items={[
        ['/approach-temperature', 'Approach temperature', 'the derating physics: why capacity halves from 25 °C to 35 °C'],
        ['/ashrae-w-classes', 'ASHRAE W-classes', 'W17–W45 supply-temperature ladder with site lookup'],
        ['/wet-bulb-free-cooling', 'Wet-bulb & free cooling', 'where chiller-free operation dies geographically'],
        ['/pue-math', 'PUE math', 'cooling energy in the efficiency fraction, computed honestly'],
      ]} />

      <h2>The room</h2>
      <ChanList items={[
        ['/room-ac-load', 'Room AC load', 'the 1.1× rule: what the building must extract'],
        ['/room-load-calculation', 'Room load calculation', 'full worksheet for a real site'],
        ['/floor-loading', 'Floor loading', 'kN/m² of a full 42U liquid rack vs office floors'],
      ]} />

      <h2>Interfaces &amp; fluids</h2>
      <ChanList items={[
        ['/uqd-quick-disconnects', 'UQD quick disconnects', 'sizes UQD04–UQD40, the coupling AI racks converged on'],
        ['/liquid-cooling-fluids', 'Coolant fluids', 'PG25 vs dielectric oils, PFAS exit, water quality'],
        ['/pressure-drop', 'Pressure drop', 'hose/fitting loss calculator for loop sizing'],
        ['/kw-to-tons', 'kW to refrigeration tons', 'unit conversion for AC conversations'],
      ]} />

      <h2>Hands-on</h2>
      <p style={{ maxWidth:"680px" }}>
        Want to drag sliders instead of reading? The <a href="/playground">playground</a> turns
        the same physics interactive — rack builder, derating explorer, room-load sandbox.
      </p>

      <h2>Related channels</h2>
      <p>
        <a href="/what-is-liquid-cooling">Learn</a> ·
        <a href="/cabinet-comparison">Select &amp; buy</a> ·
        <a href="/site-survey">Deploy &amp; operate</a> ·
        <a href="/liquid-cooling-standards">Standards</a> ·
        <a href="/supply-chain">Supply chain</a>
      </p>
    </main>
  )
}
