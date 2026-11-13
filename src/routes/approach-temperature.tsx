import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { pageRoute } from '~/lib/page'

const faqs = [
  {
    q: 'What is approach temperature in liquid cooling?',
    a: 'Approach temperature is the difference between the coolant supply temperature and the room air temperature across the CDU\u2019s heat exchanger: approach = coolant supply °C − room air °C. Capacity scales roughly in proportion to it, so warmer rooms or cooler coolant directly reduce how much heat a liquid-to-air cabinet can reject.',
  },
  {
    q: 'Why does liquid cooling capacity drop in hot climates?',
    a: 'Because the heat exchanger\u2019s driving temperature difference shrinks. A cabinet rated 86.5 kW with 45 °C coolant in 25 °C air (20 °C approach, Vertiv XDU070) has only 10 °C of approach in a 35 °C room — roughly half the capacity. Below about 5 °C of approach, capacity effectively collapses. Always derate against the vendor\u2019s capacity-vs-ambient curve.',
  },
]

export const Route = createFileRoute('/approach-temperature')({
  ...pageRoute({
    path: '/approach-temperature',
    title: 'Approach temperature and liquid cooling derating explained',
    description: 'Approach temperature = coolant supply minus room air temperature; liquid-to-air capacity scales roughly linearly with it. Why an 86.5 kW cabinet (Vertiv XDU070, 45 °C/25 °C) halves at 35 °C ambient — formula, live simulator, and the dew-point trap.',
    article: { title: 'Approach temperature & derating', description: 'Why liquid cooling capacity halves at 35 °C ambient.', datePublished: '2026-10-08', dateModified: '2026-10-08' },
    faq: faqs,
    component: ApproachPage,
  }),
})

function ApproachPage() {
  const [rated, setRated] = useState(50)
  const [air, setAir] = useState(25)
  const [coolant, setCoolant] = useState(45)

  const approach = coolant - air
  const cap = approach <= 5 ? 0 : rated * approach / 20
  const pct = Math.round(100 * cap / Math.max(rated, 0.01))
  const verdict =
    cap === 0 ? { text: '❌ Approach ≤ 5 °C — the heat exchanger cannot reject meaningful heat. Cooler room or warmer coolant is physically required', style: { borderColor: 'var(--heat)', color: 'var(--heat)' } }
    : pct < 60 ? { text: `⚠️ Only ${pct}% of nameplate — do not buy against the brochure number`, style: { borderColor: 'var(--warn)', color: 'var(--warn)' } }
    : { text: `✅ ${pct}% of rated capacity available at ${air} °C air`, style: { borderColor: 'var(--ok)', color: 'var(--ok)' } }

  return (
    <main className="container" style="padding:40px 20px">
      <p className="updated">Formula · 3 min read</p>
      <h1>Approach temperature &amp; derating</h1>

      <p style="max-width:680px">
        Approach temperature is the gap between coolant supply and room air temperature:
        <b>approach = T<sub>coolant</sub> − T<sub>air</sub></b>. Liquid-to-air capacity scales roughly
        linearly with it — which is why a cabinet rated 86.5 kW at 45 °C coolant / 25 °C air
        (Vertiv XDU070) delivers about half at 35 °C air.
      </p>

      <h2>Formula</h2>
      <div className="formula">capacity ≈ rated × (approach / approach<sub>rated</sub>)&nbsp;&nbsp;·&nbsp;&nbsp;approach ≤ 5 °C → ≈ 0</div>
      <p style="max-width:680px">
        A heat exchanger transfers heat in proportion to the temperature difference across it.
        When room air warms from 25 °C to 35 °C, the approach on a 45 °C coolant loop falls from
        20 °C to 10 °C and capacity halves. Below roughly 5 °C of approach, the exchanger can no
        longer move meaningful heat — capacity collapses. This is the first-principles reason
        <a href="/liquid-cooling-hot-climates">hot climates derate everything</a>.
      </p>

      <h2>Worked example</h2>
      <div className="formula">
        50 kW-class @ 45 °C / 25 °C:&nbsp; 25 °C → 50 kW · 30 °C → 37.5 kW · 35 °C → <b>25 kW</b> · 40 °C → ≈ 0
      </div>

      <h2>Try it</h2>
      <div className="fcalc">
        <div className="frow">
          <label>Rated capacity (kW)<input type="number" value={rated} min={1} step={5} onChange={e => setRated(+e.target.value)} /></label>
          <label>Room air (°C) {air}<input type="range" value={air} min={18} max={45} onChange={e => setAir(+e.target.value)} /></label>
          <label>Coolant supply (°C) {coolant}<input type="range" value={coolant} min={30} max={50} onChange={e => setCoolant(+e.target.value)} /></label>
        </div>
        <div className="fresult">
          {cap.toFixed(1)} kW <small>at approach {approach} °C · {pct}% of rated</small>
        </div>
        <div className="fverdict" style={verdict.style}>{verdict.text}</div>
      </div>

      <h2>Common mistakes</h2>
      <ul>
        <li><b>Comparing nameplate to a tropical room.</b> Nameplate capacity is quoted at 25 °C air / 45 °C coolant. At 35 °C ambient you get roughly half; buy the derated number, not the brochure number.</li>
        <li><b>Chasing capacity by lowering coolant temperature.</b> Below the room's dew point, supply lines and cold plates condense water onto live electronics. This is exactly what ASHRAE W-classes exist to prevent — coolant temperature is a floor, not a free lever.</li>
        <li><b>Forgetting the model is linear.</b> Real capacity curves bow (fan power, flow limits); always get the vendor's capacity-vs-ambient table. The linear model here is the honest first pass — Vertiv is one of the few publishers of real curves (XDU070).</li>
      </ul>

      <h2>Related</h2>
      <p>
        <a href="/playground/derating">Derating simulator</a> (full curve) ·
        <a href="/playground/rack-builder">Rack builder</a> applies this model live ·
        <a href="/liquid-cooling-hot-climates">Hot &amp; tropical climates</a> ·
        <a href="/coolant-flow-rate">Coolant flow rate</a>
      </p>

      <h2>Sources</h2>
      <p className="src">
        Model anchored to Vertiv CoolChip CDU 70 (XDU070): 86.5 kW at 45 °C coolant / 25 °C air —
        <a href="https://www.vertiv.com/4a4963/globalassets/shared/vertiv-coolchip-cdu-70-data-sheet-sl-71252.pdf">datasheet SL-71252</a>
        and application guide SL-71111 (published capacity-vs-ambient curves).
      </p>
    </main>
  )
}
