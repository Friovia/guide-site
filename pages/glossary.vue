<template>
  <main class="container" style="padding:40px 20px">
    <p class="updated">Updated 2026-10-08</p>
    <h1>Glossary of liquid cooling terms</h1>
    <p>Definitions are self-contained — written to be quotable. Terms alphabetized; each term is anchorable (<span class="src">/glossary#term-slug</span>).</p>

    <table>
      <tr><th>Term</th><th>Definition</th></tr>
      <tr v-for="t in terms" :key="t.t">
        <td><strong :id="slug(t.t)">{{ t.t }}</strong></td>
        <td>{{ t.d }}</td>
      </tr>
    </table>
  </main>
</template>

<script setup lang="ts">
useSeo({
  title: 'Liquid cooling glossary (DLC, CDU, UQD, W-class, PUE…)',
  description: 'Fifty-plus self-contained liquid cooling definitions: direct-to-chip, CDU, TCS/FWS, UQD sizes, blind-mate, manifold, cold plate, L2A/L2L, ASHRAE W-classes, approach temperature, capture ratio, PUE, PG25, ORv3, derating, wet-bulb, TDP, N+1, floor loading.'
})
useArticle({ path: '/glossary', title: 'Glossary of liquid cooling terms', description: 'Self-contained definitions for every term on this site.', dateModified: '2026-10-08' })

function slug(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const terms = [
  { t: '1.1× rule', d: 'The room-cooling sizing rule for liquid-to-air cabinets: room AC capacity ≈ 1.1 × IT load, the extra 10% covering pumps, losses and commissioning margin.' },
  { t: 'Adiabatic assist', d: 'Boosting a dry cooler in hot weather by pre-cooling incoming air with water evaporation — recovers capacity at the cost of water consumption and treatment.' },
  { t: 'Approach temperature', d: 'The temperature difference between the coolant and the air (or facility water) rejecting its heat. Liquid-to-air capacity scales with this difference — smaller approach means less cooling capacity.' },
  { t: 'ASHRAE W-classes', d: 'Coolant temperature classes for liquid-cooled IT: W17 through W45, where the number is the maximum facility supply temperature in °C. Higher classes enable chiller-free or high-efficiency operation if equipment supports them.' },
  { t: 'Blind-mate', d: 'A connection design where components engage automatically as they slide together — servers mate to the rack manifold by being pushed in, with no hand-plugged couplings. Specified for racks by OCP\u2019s ORv3 blind-mate manifold specification.' },
  { t: 'CDU', d: 'Coolant Distribution Unit — the component that pumps the server coolant loop and transfers its heat to a final sink (facility water or room air). Contains pumps, heat exchanger, filter and controls. Comes in in-rack, in-row and facility sizes.' },
  { t: 'Capture ratio', d: 'The share of server heat a cooling architecture removes through liquid: typically 60-80% for direct-to-chip, near 100% for immersion. Drives flow, CDU capacity and the residual air load.' },
  { t: 'Cold plate', d: 'A metal block with internal fluid channels bolted onto a CPU or GPU so heat conducts directly into the circulating coolant. The defining component of direct-to-chip cooling.' },
  { t: 'Commissioning', d: 'The staged acceptance sequence for a liquid loop: dry pressure test, fill and purge, flow and ΔT verification against design, pressure survey, dew-point check, leak-system test, load ramp, baseline snapshot.' },
  { t: 'Condensation margin', d: 'The gap between the coolest wetted surface (coolant supply) and the room dew point. Negative margin means water forms on live hardware — the reason coolant temperature has a floor, not just a ceiling.' },
  { t: 'COP', d: 'Coefficient of Performance — cooling delivered divided by electricity consumed by the refrigeration unit. A COP-3 chiller moves 3 kW of heat per 1 kW drawn; the bridge between cooling tons and electrical loads.' },
  { t: 'Cooling tower', d: 'A heat rejection device that evaporates water to chill its loop toward the ambient wet-bulb temperature. Efficient in dry climates; output floors at wet-bulb + roughly 5-8 K of tower approach.' },
  { t: 'Derating', d: 'The reduction of a cooling system\u2019s capacity as operating conditions worsen — most importantly rising ambient temperature. Capacity-vs-ambient curves state it; very few vendors publish them.' },
  { t: 'Dew point', d: 'The temperature at which air becomes saturated and water condenses. In liquid cooling it bounds how cold coolant supply may run without sweating pipes and plates in a humid room.' },
  { t: 'DLC', d: 'Direct Liquid Cooling — liquid cooling where coolant touches a plate on the chip (as opposed to immersing whole servers). The mainstream architecture; captures 60-80% of server heat.' },
  { t: 'Dry cooler', d: 'A heat rejection device that exchanges heat with ambient air without evaporating water. Output floors at dry-bulb + roughly 8-12 K of approach; no water use, worse performance in hot climates.' },
  { t: 'ΔT (delta-T)', d: 'A temperature difference. In loop design, the supply-return coolant difference that sets flow for a given heat load (flow = kW × 60 / (4.186 × ΔT)); in rooms, the air temperature rise across equipment.' },
  { t: 'Fluid analysis', d: 'Periodic coolant sampling for pH, inhibitor level, conductivity and biological growth — the early-warning system for corrosion and biofouling in water-glycol loops, typically semi-annual.' },
  { t: 'Floor loading', d: 'Structural pressure under equipment: filled mass × 9.81 ÷ footprint, in kN/m². Office floors typically design for 2.5-3.5; computer-room and industrial slabs for 7-12+. Concentrated, not averaged, load governs.' },
  { t: 'Free cooling', d: 'Rejecting data center heat without mechanical refrigeration, using ambient air (dry coolers) or evaporation (towers). Viable hours are set by the site\u2019s dry-bulb/wet-bulb statistics versus the required coolant temperature.' },
  { t: 'Friction factor (Darcy)', d: 'The dimensionless resistance coefficient in the Darcy–Weisbach pressure-drop equation — about 0.03-0.04 for smooth hose at typical coolant flows. Enters as f × (L/D) × ρv²/2.' },
  { t: 'FWS', d: 'Facility Water System — the building\u2019s water loop that ultimately carries heat away. The CDU isolates the clean server loop (TCS) from it.' },
  { t: 'Heat capture split', d: 'How a rack\u2019s heat divides between liquid and air: P_liquid = capture × P_IT. The air share (20-40% in DLC) still needs cabinet airflow and room AC.' },
  { t: 'Heat exchanger', d: 'A device transferring heat between two fluids without mixing them — the core of every CDU (technology loop ↔ facility side) and of dry coolers.' },
  { t: 'Immersion cooling', d: 'Submerging entire servers in a dielectric fluid (oil or fluorinated chemistry). Captures nearly all heat but changes hardware, service and fluid management compared to direct-to-chip.' },
  { t: 'Inhibitors', d: 'Chemical additives in water-glycol coolant that suppress corrosion and biological growth. Their depletion — tracked by fluid analysis — is the main driver of fluid replacement intervals.' },
  { t: 'kN/m²', d: 'Kilonewtons per square meter — the unit of structural floor load. 1 kN/m² ≈ 102 kg/m². A 1,200 kg rack on a 600 × 1,200 mm footprint prints about 16.4 kN/m².' },
  { t: 'kW vs kVA', d: 'Real power vs apparent power in AC systems; they differ by the power factor (< 1). Cooling and IT budgets are kW conversations; UPS, feeds and switchgear are kVA — convert explicitly, early.' },
  { t: 'L2A / L2L', d: 'Liquid-to-Air vs Liquid-to-Liquid — how a CDU rejects heat. L2A blows it into the room (self-contained, capacity derates with room temperature); L2L exchanges with facility water (higher capacity, needs building plumbing).' },
  { t: 'Manifold', d: 'The rack-level supply/return spine distributing coolant to each server position. Good manifolds are blind-mate so servers connect on insertion.' },
  { t: 'Micro data center', d: 'A self-contained compute deployment (one cabinet to a small row) in a room not built as a data center — offices, clinics, wiring closets, light-industrial spaces.' },
  { t: 'N+1', d: 'Redundancy scheme with one spare unit beyond the required count — e.g., two pumps where one suffices. In cooling, apply it to pumps, fans and AC units; the failure question belongs in every RFQ.' },
  { t: 'Nameplate capacity', d: 'The rating on the brochure, quoted at standard conditions (typically 25 °C air / 45 °C coolant). Actual capacity at your room temperature is lower — demand the derating curve.' },
  { t: 'OCP', d: 'Open Compute Project — the industry body whose specifications (UQD couplings, ORv3 racks and manifolds) make liquid cooling parts interoperable across vendors.' },
  { t: 'ORv3', d: 'Open Rack v3 — OCP\u2019s current rack standard family, including the blind-mate manifold specification (Rev 1.0, 2024) that lets compliant servers and racks interoperate.' },
  { t: 'PFAS', d: 'Per- and polyfluoroalkyl substances — the regulated chemical family behind fluorinated coolants. Global tightening and 3M\u2019s 2025 manufacturing exit pushed buyers toward water-glycol and defined the modern fluid decision.' },
  { t: 'PG25', d: 'A coolant of 75% water and 25% propylene glycol — the default fluid for direct-to-chip systems. Non-flammable, non-hazardous to ship, PFAS-free; needs corrosion inhibitors and periodic checks.' },
  { t: 'Pressure drop (ΔP)', d: 'The head a loop consumes as fluid moves: friction in hoses (Darcy–Weisbach), fittings and couplings, in kPa. If total ΔP exceeds the CDU\u2019s available head, operating flow — and capacity — fall.' },
  { t: 'PUE', d: 'Power Usage Effectiveness — total facility energy ÷ IT energy. Air-cooled sites typically run ~1.5; liquid-cooled data centers reach 1.1-1.2. Assumes facility-scale cooling; a single cabinet in a room depends on that room\u2019s AC.' },
  { t: 'Pump head', d: 'The pressure a CDU\u2019s pump can supply, in kPa, as a function of flow. The loop\u2019s resistance curve intersecting the pump curve sets real operating flow — read the intersection, not the peak.' },
  { t: 'RDHx', d: 'Rear-Door Heat Exchanger — a water-cooled door replacing a rack\u2019s rear panel, capturing exhaust air heat into a liquid loop without touching the servers inside. An air-to-liquid retrofit technology.' },
  { t: 'Refrigeration ton', d: 'A cooling unit: 1 ton = 3.517 kW = 12,000 BTU/h — historically the heat to melt one short ton of ice per day. Building HVAC still quotes in tons; divide kW by 3.517 to speak it.' },
  { t: 'Specific heat', d: 'Heat per kilogram per degree — water\u2019s 4.186 kJ/(kg·K) is the constant behind the flow formula. Glycol lowers it ~10%, which is why pure-water math slightly undersizes PG25 loops.' },
  { t: 'SS 726:2026', d: 'Singapore\u2019s national standard for liquid cooling in tropical data centers — the first of its kind. Covers direct-to-chip systems inside data centers; excludes indirect approaches and standalone edge cabinets.' },
  { t: 'TCS', d: 'Technology Cooling System — the clean, closed coolant loop circulating through server cold plates, kept separate from facility water by the CDU.' },
  { t: 'TDP', d: 'Thermal Design Power — a chip\u2019s worst-case heat output rating, in watts. The unit of rack power budgeting: sum GPUs and CPUs, add ~20% overhead, multiply by node count.' },
  { t: 'UQD', d: 'Universal Quick Disconnect — OCP-standardized dripless coolant couplings. Compliance means different vendors\u2019 parts connect and seal; the basis of open, mix-and-match liquid racks.' },
  { t: 'UQD sizes', d: 'The UQD family from UQD04 to UQD40, where the number ≈ nominal flow in L/min. Single plates run UQD04-06, accelerator nodes 08-12, rack and CDU headers 32-40.' },
  { t: 'Velocity (coolant)', d: 'Flow speed in m/s = flow ÷ pipe area. Enters pressure drop squared; above roughly 3 m/s, erosion and noise make stepping up the diameter cheaper than fighting physics.' },
  { t: 'Wet-bulb temperature', d: 'The lowest temperature achievable by evaporative cooling at a site\u2019s humidity. High wet-bulb (tropics) disables free cooling and forces mechanical refrigeration into the chain.' },
  { t: 'Wet-bulb, design', d: 'The wet-bulb exceeded only ~1% of hours at a site — the value free-cooling designs must survive. Tropical coastal sites design at 27-30 °C, Central Europe at 20-22 °C.' }
]
</script>
