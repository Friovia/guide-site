import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '~/lib/seo'
import { HeroChart } from '~/components/HeroChart'
import { LatestRadar } from '~/components/LatestRadar'
import meta from '~/data/meta.json'

export const Route = createFileRoute('/')({
  head: () => ({
    ...seoHead({
      title: 'Liquid cooling for micro data centers — an independent guide',
      description: 'What liquid cooling is, liquid vs air, the formulas with live calculators, and a sourced comparison of small-scale cooling cabinets. Independent reference for hospitals, universities and edge deployments.',
      path: '/',
    }),
  }),
  component: HomePage,
})

const Row = ({ href, title, desc }: { href: string, title: string, desc: React.ReactNode }) => (
  <a href={href} className="idx-row"><span className="idx-title">{title}</span><span className="idx-desc">{desc}</span><span className="idx-arrow">→</span></a>
)
const F = ({ children }: { children: React.ReactNode }) => <span className="f">{children}</span>

function HomePage() {
  return (
    <div>
      <section className="home-hero">
        <p className="eyebrow">Independent reference · every claim sourced</p>
        <h1><span className="grad">Liquid cooling</span>, made checkable.</h1>
        <p className="sub">
          GPU racks crossed 100 kW and air cannot follow. One concept per page — formulas with real
          numbers, live calculators, sourced product data — for engineers and buyers who verify instead of trust.
        </p>
        <div className="cta-row">
          <a href="/playground" className="btn btn-fill">⚡ Open the playground</a>
          <a href="/what-is-liquid-cooling" className="btn btn-ghost">Start the guide →</a>
        </div>
      </section>

      <main className="container" style={{ padding:"8px 24px 60px" }}>
        <div className="heropanel">
          <HeroChart
            label="Live — drag the point along the curve"
            caption="what a 50 kW-class liquid-to-air cabinet can still reject at {t} °C room air"
            sub="Drag toward the tropics: hotter room, smaller approach, less capacity — the one piece of physics this whole site exists to make obvious"
          />
          <div className="hp-foot">
            <span>DATA <b>v{meta.version}</b></span>
            <span>PRODUCTS {meta.datasets.products.slice(5)}</span>
            <span>VENDORS {meta.datasets.vendors.slice(5)}</span>
            <span>FORMULAS {meta.datasets.formulas.slice(5)}</span>
            <span><a href="/changelog">CHANGELOG →</a></span>
          </div>
        </div>

        <LatestRadar label="Industry radar — latest" more="All news" />

        <div className="feat-band">
          <div className="feat">
            <span className="fic">FORMULAS × 11</span>
            <h3>Verifiable</h3>
            <p>Every formula with worked examples and a live calculator — real numbers you can check, not marketing curves.</p>
          </div>
          <div className="feat">
            <span className="fic">97 COMPANIES · 16 SEGMENTS</span>
            <h3>Sourced</h3>
            <p>Product and supply-chain data linked to official sources on every row; unverifiable data is marked, never invented.</p>
          </div>
          <div className="feat">
            <span className="fic">4 TOOLS · ALL IN-BROWSER</span>
            <h3>Interactive</h3>
            <p>Rack builder, derating simulator, room-load calculator and an animated coolant loop — learn by moving numbers.</p>
          </div>
        </div>

        <h2 className="idx-sec" style={{ marginTop:"64px" }}>Start</h2>
        <div className="idx">
          <Row href="/what-is-liquid-cooling" title="What is liquid cooling?" desc="Cold plates, CDUs, manifolds, quick disconnects — the parts and the physics, with a live loop simulator" />
          <Row href="/what-is-a-cdu" title="What is a CDU?" desc="The heart of the system: pumps, heat exchangers, TCS vs facility loops, the three form factors" />
          <Row href="/cold-plate-vs-immersion" title="Cold plate vs immersion" desc="The two architectures compared: heat capture, fluids, PFAS regulation, serviceability" />
          <Row href="/liquid-cooling-vs-air" title="Liquid vs air" desc="Where the crossover really is, what PUE numbers assume, and the tropical catch nobody mentions" />
        </div>

        <h2 className="idx-sec" style={{ marginTop:"56px" }}>Formulas</h2>
        <p className="src" style={{ margin:"4px 0 0" }}>One formula per page: definition → worked example with real numbers → live calculator → the mistakes that cost money.</p>
        <div className="idx">
          <Row href="/coolant-flow-rate" title="Coolant flow rate" desc={<><F>L/min = kW × 60 / (4.186 × ΔT)</F> — 50 kW at ΔT 8 °C → 89.6 L/min</>} />
          <Row href="/heat-capture-split" title="Heat capture split" desc={<><F>P_liq = capture × P_IT</F> — 60-80% leaves through liquid; the rest still heats the room</>} />
          <Row href="/tdp-to-rack-kw" title="TDP → rack kW" desc={<><F>P_rack ≈ nodes × (Σ GPU + Σ CPU) × 1.2</F> — chip power to a rack budget</>} />
          <Row href="/room-ac-load" title="Room AC load" desc={<><F>P_AC ≈ 1.1 × P_IT</F> — 30 kW rack → 33 kW ≈ 9.4 tons of room cooling</>} />
          <Row href="/kw-to-tons" title="kW ↔ refrigeration tons" desc={<><F>1 ton = 3.517 kW = 12,000 BTU/h</F> — cooling units ≠ electrical draw</>} />
          <Row href="/approach-temperature" title="Approach temperature" desc={<><F>capacity ≈ rated × approach / 20 K</F> — why 35 °C halves a 50 kW cabinet</>} />
          <Row href="/pressure-drop" title="Pressure drop" desc={<><F>ΔP = f × (L/D) × ρv²/2</F> — 90 L/min in 25 mm hose loses ≈20 kPa over 3 m</>} />
          <Row href="/floor-loading" title="Floor loading" desc={<><F>kN/m² = kg × 9.81 ÷ m²</F> — a full rack prints ~5× an office floor's rating</>} />
          <Row href="/pue-math" title="PUE math" desc={<><F>PUE = total ÷ IT energy</F> — 1.05-1.2 liquid vs 1.4-1.6 air, and what the number hides</>} />
          <Row href="/ashrae-w-classes" title="ASHRAE W-classes" desc={<><F>W17 · W27 · W32 · W40 · W45</F> — the number ≈ max facility water supply °C</>} />
          <Row href="/wet-bulb-free-cooling" title="Wet-bulb & free cooling" desc={<><F>free cooling ⇔ wb + 6 K ≤ coolant °C</F> — why the tropics can't economize</>} />
        </div>

        <h2 className="idx-sec" style={{ marginTop:"56px" }}>Choosing</h2>
        <div className="idx">
          <Row href="/cabinet-comparison" title="Cabinet comparison" desc="Every small-scale cooling cabinet we could verify — power class, cooling type, facility needs, per-row sources" />
          <Row href="/liquid-cooling-cost" title="What drives the cost" desc="Why nobody publishes prices, the cost stack, and how to make quotes comparable" />
          <Row href="/rfq-scope-checklist" title="RFQ scope checklist" desc="Twelve line items that turn two incomparable quotes into one comparable table" />
          <Row href="/liquid-ready-servers" title="Liquid-ready servers" desc="The five compatibility checks — plates, couplings, W-class, flow, serviceability" />
          <Row href="/liquid-cooling-hot-climates" title="Hot & tropical climates" desc="Derating physics with published numbers, SS 726:2026 scope, the buying checklist" />
        </div>

        <figure className="fig" style={{ margin:"56px 0 6px" }}>
          <img src="/img/ai/immersion-tank.png" alt="Immersion cooling tank with server blades in dielectric fluid — AI illustration" loading="lazy" style={{ width:"100%", display:"block" }} />
          <figcaption><b>PLATE 2</b> — The other architecture: single-phase immersion, blades bathed in dielectric fluid. AI-generated illustration (Z-Image Turbo) — representative, not a specific product. Compared honestly in <a href="/cold-plate-vs-immersion">cold plate vs immersion</a>.</figcaption>
        </figure>

        <h2 className="idx-sec" style={{ marginTop:"40px" }}>Deploy &amp; Ops</h2>
        <div className="idx">
          <Row href="/site-survey" title="Site survey" desc="Six-point checklist — floor, power, heat egress, water, access, noise — each linked to its math" />
          <Row href="/room-load-calculation" title="Room load calculation" desc="Can your room host an L2A cabinet? The 1.1× rule, worked hospital example, full survey" />
          <Row href="/commissioning" title="Commissioning" desc="Eight steps from empty pipes to signed acceptance" />
          <Row href="/liquid-cooling-leaks" title="Leaks: risk & response" desc="Where leaks actually happen, and the four-layer detection model to demand" />
          <Row href="/maintenance-schedule" title="Maintenance schedule" desc="Weekly-to-annual intervals that keep a coolant loop boring" />
        </div>

        <h2 className="idx-sec" style={{ marginTop:"56px" }}>Reference</h2>
        <div className="idx">
          <Row href="/supply-chain" title="Supply chain map" desc="97 companies across 16 segments, chips to heat rejection — every row sourced; free listings, never paid" />
          <Row href="/news" title="Industry radar" desc="News plus the curated milestone timeline — every item sourced, nothing invented" />
          <Row href="/state-of-liquid-cooling-2026" title="State of 2026" desc="The annual digest: what changed, and the 20-50 kW turnkey gap that still doesn't exist" />
          <Row href="/glossary" title="Glossary" desc="50+ self-contained, anchorable definitions — DLC, UQD, W-class, approach temperature…" />
          <Row href="/uqd-quick-disconnects" title="UQD quick disconnects" desc="The OCP coupling family UQD04-UQD40, tabulated by nominal flow" />
          <Row href="/liquid-cooling-fluids" title="Fluids & PFAS" desc="PG25 vs oils vs fluorinated fluids — chemistry as a buying decision" />
          <Row href="/liquid-cooling-standards" title="Standards" desc="OCP, ASHRAE W-classes, IEC 62368-1, SS 726 — mapped to a buying checklist" />
          <Row href="/changelog" title="Changelog" desc="Data-layer versions and article updates" />
        </div>
      </main>
    </div>
  )
}
