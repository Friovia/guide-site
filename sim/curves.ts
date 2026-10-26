// 由 guide-site/scripts/vendor-from-simulation.ts 生成——勿手改。
// 源：p0-hydraulics/test-case/rack-orv3.json + p1-thermal-chain/test-case/rack-orv3-thermal.json
// （dataVersion component-curves@2026-10-20-hx78）。政策：无源不入库；本文件只是曲线库既源条目的
// 分发形态，溯源看各 provenance 字段。
// typedRackCurves/typedHxCurves：运行时逐条结构校验后返回求解器类型——调用侧不再 as 断言。
import type { Curve } from './p0/types.ts'
import type { HxCurve } from './p1/types.ts'

interface RawCurve {
  x?: unknown; y?: unknown; points?: unknown; flowBasis?: unknown;
  basis?: unknown; provenance?: unknown;
}

function mustPoints(id: string, raw: RawCurve): [number, number][] {
  if (!Array.isArray(raw.points)) throw new Error(`curves: 条目 ${id} points 缺失`)
  const points: [number, number][] = []
  for (const p of raw.points) {
    if (!Array.isArray(p) || p.length !== 2 || typeof p[0] !== 'number' || typeof p[1] !== 'number') {
      throw new Error(`curves: 条目 ${id} 点结构非法`)
    }
    points.push([p[0], p[1]])
  }
  return points
}

export const RACK_DATA_VERSION = "component-curves@2026-10-20-hx78";

const RACK_RAW = {
  "pump-vertiv-coolchip100kw-inrack-pg25": {
    "x": "L/min",
    "y": "kPa",
    "points": [
      [
        0,
        149.0675
      ],
      [
        40,
        146.0458
      ],
      [
        80,
        134.9665
      ],
      [
        120,
        118.8511
      ],
      [
        160,
        95.6852
      ],
      [
        200,
        66.476
      ]
    ],
    "basis": "PG25 @ 25°C（库条目按 SG 1.0334 修正；单锚点+形状插值 ±15%；2026-10-20 评审统一）",
    "provenance": {
      "url": "https://www.vertiv.com/49c795/globalassets/products/thermal-management/high-density-solutions/vertiv-coolchip-cdu/vertiv-coolchip-cdu-100kw-data-sheet-sl-71348.pdf",
      "type": "datasheet",
      "retrieved": "2026-10-17",
      "uncertainty": "单锚点（100 kW 级额定点）+ 同类离心泵形状插值（政策 2），±15% 起"
    }
  },
  "coldplate-oai-8oam-4x2-pcl-pg25": {
    "x": "L/min",
    "y": "kPa",
    "points": [
      [
        6,
        24.8
      ],
      [
        8,
        44.1
      ],
      [
        10,
        68.9
      ],
      [
        12,
        99.2
      ],
      [
        14,
        135.7
      ]
    ],
    "basis": "PG25（OCP OAI System Liquid Cooling Guidelines，8-OAM 整链 PCL 4x2）",
    "provenance": {
      "url": "https://www.opencompute.org/documents/oai-system-liquid-cooling-guidelines-in-ocp-template-mar-3-2023-update-pdf",
      "type": "ocp-spec",
      "retrieved": "2026-10-17",
      "uncertainty": "OAI 指南官方曲线（8x1 为两点锚，4x2 形状借同族）"
    }
  },
  "qd-ocp-uqd06-mincv-envelope-pg25": {
    "x": "L/min",
    "y": "kPa",
    "points": [
      [
        5,
        2.5835
      ],
      [
        11.36,
        13.2275
      ],
      [
        15,
        23.1482
      ],
      [
        20,
        41.1293
      ]
    ],
    "basis": "PG25 @ 25°C（水基准 ×SG 1.0334 修正；OCP UQD Design Spec v2.0.0 法定 Cv_min 包络）",
    "provenance": {
      "url": "https://www.opencompute.org/documents/quick-disconnect-uqd-design-specification-v2-0-0-pdf",
      "type": "ocp-spec",
      "retrieved": "2026-10-17",
      "uncertainty": "法定最差情况包络（Cv_min=2.2 经 ΔP=(Q/Cv)²·SG 换算）；实际压降 ≤ 此值"
    }
  },
  "pump-nvent-cdu40-pg25": {
    "x": "L/min",
    "y": "kPa",
    "points": [
      [
        0,
        243.1591
      ],
      [
        5,
        224.6612
      ],
      [
        10,
        205.0266
      ],
      [
        15,
        185.5987
      ],
      [
        20,
        166.0674
      ],
      [
        25,
        146.7428
      ],
      [
        30,
        127.5216
      ],
      [
        35,
        108.197
      ],
      [
        40,
        88.8724
      ],
      [
        45,
        69.6512
      ],
      [
        50,
        50.4299
      ],
      [
        55,
        31.4154
      ]
    ],
    "basis": "PG25 @ 25°C（数字化水基准 ×SG 1.0334 修正：ΔP∝ρ）",
    "provenance": {
      "url": "https://d14aeh40s5zf9b.cloudfront.net/userfiles/productdocuments/HOFFCDU0402R001Q/SPEC_56278578_SpecificationSheet.pdf",
      "type": "datasheet",
      "retrieved": "2026-10-20",
      "uncertainty": "像素轨迹数字化（±1 psi/±1 LPM，±3%）+ PG25 密度修正（黏度项 2-3% 未计）；20 psi bypass：<26 LPM 段泵本体能力偏乐观；Default Pump Mode"
    }
  },
  "pump-nvent-cdu40-max-pg25": {
    "x": "L/min",
    "y": "kPa",
    "points": [
      [
        0,
        248.4294
      ],
      [
        5,
        231.7917
      ],
      [
        10,
        214.1205
      ],
      [
        15,
        196.5527
      ],
      [
        20,
        179.1916
      ],
      [
        25,
        161.8305
      ],
      [
        30,
        144.8827
      ],
      [
        35,
        127.8316
      ],
      [
        40,
        110.7805
      ],
      [
        45,
        93.9361
      ],
      [
        50,
        77.2983
      ],
      [
        55,
        60.8673
      ],
      [
        60,
        44.4362
      ]
    ],
    "basis": "PG25 @ 25°C（数字化水基准 ×SG 1.0334 修正：ΔP∝ρ）",
    "provenance": {
      "url": "https://d14aeh40s5zf9b.cloudfront.net/userfiles/productdocuments/HOFFCDU0402R001Q/SPEC_56278578_SpecificationSheet.pdf",
      "type": "datasheet",
      "retrieved": "2026-10-20",
      "uncertainty": "像素轨迹数字化 ±3%（Maximum Pump Performance 红线）+ PG25 密度修正；bypass <33 LPM 段偏乐观；功耗 970W"
    }
  }
} as Record<string, RawCurve>;
const HX_RAW = {
  "hx-vertiv-coolchip-cdu121": {
    "x": "°C",
    "y": "kW",
    "points": [
      [
        0,
        0
      ],
      [
        2,
        60.5
      ],
      [
        4,
        121
      ],
      [
        6,
        181.5
      ]
    ],
    "flowBasis": "二次侧额定 120 L/min, 1.15 bar",
    "basis": "二次侧 Water 或 PG-25 with inhibitors（数据表双口径未区分额定条件）",
    "provenance": {
      "url": "https://www.vertiv.com/49c795/globalassets/products/thermal-management/high-density-solutions/vertiv-coolchip-cdu/vertiv-coolchip-cdu-100kw-data-sheet-sl-71348.pdf",
      "type": "datasheet",
      "retrieved": "2026-10-17",
      "uncertainty": "官方数据表仅单点额定 121 kW @ 4°C ATD；斜率 30.25 kW/K=121/4，非锚点为 ε-NTU 线性外推；一次侧流量未给，UA 无法反演"
    }
  },
  "hx-nvent-rackchiller-cdu40": {
    "x": "°C",
    "y": "kW",
    "points": [
      [
        0,
        0
      ],
      [
        5,
        20
      ],
      [
        10,
        40
      ],
      [
        15,
        60
      ]
    ],
    "flowBasis": "额定一次侧 64 LPM（max 80）/ 二次侧 60 LPM(双泵)·75 LPM(三泵)",
    "basis": "两侧均为 treated water with up to 25% PG（官方 spec 明示）",
    "provenance": {
      "url": "https://d14aeh40s5zf9b.cloudfront.net/userfiles/productdocuments/HOFFCDU0402R001Q/SPEC_56278578_SpecificationSheet.pdf",
      "type": "datasheet",
      "retrieved": "2026-10-20",
      "uncertainty": "官方 spec sheet Spec-01466A（Cloudfront 官方 CDN 镜像）：40 kW at 10 C Approach (64 LPM Primary)；斜率 4.0 kW/K，非锚点为 ε-NTU 线性外推；min approach 5K 对应容量未公布"
    }
  },
  "hx-envicool-xcrow080": {
    "x": "°C",
    "y": "kW",
    "points": [
      [
        0,
        0
      ],
      [
        2.5,
        40
      ],
      [
        5,
        80
      ],
      [
        7.5,
        120
      ]
    ],
    "flowBasis": "二次侧（PG25）额定 99 LPM；一次侧流量未公布",
    "basis": "二次侧 SoluKing PG25；一次侧软化水（官方规格表明示）",
    "provenance": {
      "url": "https://en.envicool.com/upload/file/20250402/1743565940169841.pdf",
      "type": "datasheet",
      "retrieved": "2026-10-20",
      "uncertainty": "官方英文 PDF 规格表：Heat Exchange Capacity 80 kW；ATD=5K 为推导值（40−35°C 供液口径）非厂商原文，斜率可信度低于厂商直标 ATD 条目；斜率 16 kW/K，非锚点为 ε-NTU 线性外推"
    }
  }
} as Record<string, RawCurve>;

// 运行时校验边界上的 as（字面量 x/y）：校验通过后断言，不是逃生舱
export function typedRackCurves(): Record<string, Curve> {
  const out: Record<string, Curve> = {}
  for (const [id, raw] of Object.entries(RACK_RAW)) {
    if (typeof raw.x !== 'string' || typeof raw.y !== 'string') throw new Error(`curves: 条目 ${id} x/y 非法`)
    out[id] = { x: raw.x as Curve['x'], y: raw.y as Curve['y'], points: mustPoints(id, raw) }
  }
  return out
}

export function typedHxCurves(): Record<string, HxCurve> {
  const out: Record<string, HxCurve> = {}
  for (const [id, raw] of Object.entries(HX_RAW)) {
    if (raw.x !== '°C' || raw.y !== 'kW') throw new Error(`curves: hx 条目 ${id} 量纲非法（须 x=°C y=kW）`)
    out[id] = {
      x: '°C', y: 'kW', points: mustPoints(id, raw),
      flowBasis: typeof raw.flowBasis === 'string' ? raw.flowBasis : undefined,
      basis: typeof raw.basis === 'string' ? raw.basis : undefined,
      provenance: (raw.provenance as HxCurve['provenance']) ?? undefined,
    }
  }
  return out
}
