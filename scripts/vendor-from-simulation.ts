// 从 simulation 仓引入求解器（与 official-site/scripts/vendor-from-simulation.ts 同构，消费者各自持有分发工具）。
// guide-site 用途：定量演示页一律调本仓 sim/ 下的真求解器，不再页内手写物理——
// 物理真源唯一（simulation 仓，V&V 见其 README），演示数字可溯源到 MANIFEST 记录的 commit + 版本三元组。
// 做四件事：
//   0) 前置 strict 类型检查（tsc --noEmit，strict+noUncheckedIndexedAccess）——类型红线先于分发；
//   1) 拷贝纯函数求解器（零依赖、无 node: 导入）到本仓 sim/{p0,p1}/，
//      跨包 import 路径重写 ../../p0-hydraulics/src/X.ts → ../p0/X.ts；
//   2) 从 rack-orv3.json 生成 sim/curves.ts（曲线库模板随包分发，dataVersion 同步；
//      含运行时校验转换器 typedRackCurves/typedHxCurves——消除调用侧 as 断言）；
//   3) parity 对拍：原版 vs vendored 对 rack-orv3 工况对（P0+P1）输出 JSON 逐位一致，
//      并写 MANIFEST.json（源 commit + 文件 sha256 + 版本三元组）。
// 用法：node scripts/vendor-from-simulation.ts [--check] [--skip-typecheck]
//   --check：只做 parity，不写文件（CI 用）。--skip-typecheck：跳过前置 tsc（仅调试）。
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SITE = join(here, "..");
const SIM = join(SITE, "..", "simulation");
const checkOnly = process.argv.includes("--check");

if (!process.argv.includes("--skip-typecheck")) {
  try {
    execSync("npx tsc -p tsconfig.json", { cwd: SIM, stdio: "inherit" });
  } catch {
    console.error("typecheck 失败：strict 红线，禁止分发（--skip-typecheck 仅限调试）");
    process.exit(2);
  }
}

const P0_FILES = ["types.ts", "units.ts", "interp.ts", "props.ts", "friction.ts", "solve.ts"];
const P1_FILES = ["types.ts", "standards.ts", "dew.ts", "hx.ts", "thermal.ts", "solve.ts"];

function gitSha(): string {
  return execSync("git rev-parse HEAD", { cwd: SIM }).toString().trim();
}

function rewriteImports(src: string): string {
  return src.replaceAll("../../p0-hydraulics/src/", "../p0/");
}

function sha256(p: string): string {
  return createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 16);
}

async function main(): Promise<void> {
  const manifestFiles: Record<string, string> = {};

  if (!checkOnly) {
    rmSync(join(SITE, "sim"), { recursive: true, force: true });
    mkdirSync(join(SITE, "sim", "p0"), { recursive: true });
    mkdirSync(join(SITE, "sim", "p1"), { recursive: true });
    for (const f of P0_FILES) {
      const src = join(SIM, "p0-hydraulics", "src", f);
      const dst = join(SITE, "sim", "p0", f);
      writeFileSync(dst, readFileSync(src, "utf8"), "utf8");
      manifestFiles[`sim/p0/${f}`] = sha256(dst);
    }
    for (const f of P1_FILES) {
      const src = join(SIM, "p1-thermal-chain", "src", f);
      const dst = join(SITE, "sim", "p1", f);
      writeFileSync(dst, rewriteImports(readFileSync(src, "utf8")), "utf8");
      manifestFiles[`sim/p1/${f}`] = sha256(dst);
    }

    // 曲线模板：rack-orv3.json（水力）+ rack-orv3-thermal.json（换热器）→ sim/curves.ts
    const rack = JSON.parse(readFileSync(join(SIM, "p0-hydraulics", "test-case", "rack-orv3.json"), "utf8"));
    const rackT = JSON.parse(readFileSync(join(SIM, "p1-thermal-chain", "test-case", "rack-orv3-thermal.json"), "utf8"));
    const curvesTs = `// 由 guide-site/scripts/vendor-from-simulation.ts 生成——勿手改。
// 源：p0-hydraulics/test-case/rack-orv3.json + p1-thermal-chain/test-case/rack-orv3-thermal.json
// （dataVersion ${rack.dataVersion}）。政策：无源不入库；本文件只是曲线库既源条目的
// 分发形态，溯源看各 provenance 字段。
// typedRackCurves/typedHxCurves：运行时逐条结构校验后返回求解器类型——调用侧不再 as 断言。
import type { Curve } from './p0/types.ts'
import type { HxCurve } from './p1/types.ts'

interface RawCurve {
  x?: unknown; y?: unknown; points?: unknown; flowBasis?: unknown;
  basis?: unknown; provenance?: unknown;
}

function mustPoints(id: string, raw: RawCurve): [number, number][] {
  if (!Array.isArray(raw.points)) throw new Error(\`curves: 条目 \${id} points 缺失\`)
  const points: [number, number][] = []
  for (const p of raw.points) {
    if (!Array.isArray(p) || p.length !== 2 || typeof p[0] !== 'number' || typeof p[1] !== 'number') {
      throw new Error(\`curves: 条目 \${id} 点结构非法\`)
    }
    points.push([p[0], p[1]])
  }
  return points
}

export const RACK_DATA_VERSION = ${JSON.stringify(rack.dataVersion)};

const RACK_RAW = ${JSON.stringify(rack.curves, null, 2)} as Record<string, RawCurve>;
const HX_RAW = ${JSON.stringify(rackT.curves, null, 2)} as Record<string, RawCurve>;

// 运行时校验边界上的 as（字面量 x/y）：校验通过后断言，不是逃生舱
export function typedRackCurves(): Record<string, Curve> {
  const out: Record<string, Curve> = {}
  for (const [id, raw] of Object.entries(RACK_RAW)) {
    if (typeof raw.x !== 'string' || typeof raw.y !== 'string') throw new Error(\`curves: 条目 \${id} x/y 非法\`)
    out[id] = { x: raw.x as Curve['x'], y: raw.y as Curve['y'], points: mustPoints(id, raw) }
  }
  return out
}

export function typedHxCurves(): Record<string, HxCurve> {
  const out: Record<string, HxCurve> = {}
  for (const [id, raw] of Object.entries(HX_RAW)) {
    if (raw.x !== '°C' || raw.y !== 'kW') throw new Error(\`curves: hx 条目 \${id} 量纲非法（须 x=°C y=kW）\`)
    out[id] = {
      x: '°C', y: 'kW', points: mustPoints(id, raw),
      flowBasis: typeof raw.flowBasis === 'string' ? raw.flowBasis : undefined,
      basis: typeof raw.basis === 'string' ? raw.basis : undefined,
      provenance: (raw.provenance as HxCurve['provenance']) ?? undefined,
    }
  }
  return out
}
`;
    writeFileSync(join(SITE, "sim", "curves.ts"), curvesTs, "utf8");
    manifestFiles["sim/curves.ts"] = sha256(join(SITE, "sim", "curves.ts"));

    // 版本探测（从 vendored solve 源码读 SOLVER_VERSION 常量行，不执行）
    const v0 = /SOLVER_VERSION = "([^"]+)"/.exec(readFileSync(join(SITE, "sim", "p0", "solve.ts"), "utf8"))![1];
    const v1 = /SOLVER_VERSION = "([^"]+)"/.exec(readFileSync(join(SITE, "sim", "p1", "solve.ts"), "utf8"))![1];
    const pv = /PROP_SET_VERSION = "([^"]+)"/.exec(readFileSync(join(SITE, "sim", "p0", "props.ts"), "utf8"))![1];
    writeFileSync(join(SITE, "sim", "MANIFEST.json"), JSON.stringify({
      sourceCommit: gitSha(),
      sourceRepo: "liquid-cooling-system/simulation",
      generatedAt: new Date().toISOString(),
      versions: { p0Solver: v0, p1Solver: v1, propSet: pv, dataVersion: rack.dataVersion },
      files: manifestFiles,
    }, null, 2) + "\n", "utf8");
    console.log(`vendored: sim/p0 ×${P0_FILES.length}，sim/p1 ×${P1_FILES.length}，curves.ts，MANIFEST.json（源 ${gitSha().slice(0, 8)}）`);
  }

  // ---- parity：原版 vs vendored 逐位一致（rack-orv3 工况对 + 全 P1 向量输入）----
  const { solve: solveP0 } = await import(pathToFileURL(join(SIM, "p0-hydraulics", "src", "solve.ts")).href);
  const { solve: solveP1 } = await import(pathToFileURL(join(SIM, "p1-thermal-chain", "src", "solve.ts")).href);
  const { solve: vP0 } = await import(pathToFileURL(join(SITE, "sim", "p0", "solve.ts")).href);
  const { solve: vP1 } = await import(pathToFileURL(join(SITE, "sim", "p1", "solve.ts")).href);

  const p0In = JSON.parse(readFileSync(join(SIM, "p0-hydraulics", "test-case", "rack-orv3.json"), "utf8"));
  const p0Out = solveP0(p0In);
  const v0Out = vP0(structuredClone(p0In));
  if (JSON.stringify(p0Out) !== JSON.stringify(v0Out)) throw new Error("parity 失败：P0 rack-orv3 输出不一致");

  const p1In = JSON.parse(readFileSync(join(SIM, "p1-thermal-chain", "test-case", "rack-orv3-thermal.json"), "utf8"));
  p1In.case.flows = p0Out.branches.map((b: { id: string; qLpm: number }) => ({ id: b.id, qLpm: b.qLpm }));
  const p1Out = solveP1(structuredClone(p1In));
  const v1Out = vP1(structuredClone(p1In));
  if (JSON.stringify(p1Out) !== JSON.stringify(v1Out)) throw new Error("parity 失败：P1 rack-orv3-thermal 输出不一致");

  // 加一层：全部 P1 金向量输入过一遍（覆盖失败路径/无效输入）
  const vecDir = join(SIM, "p1-thermal-chain", "vectors");
  let n = 0;
  for (const f of readdirSync(vecDir).filter((x) => x.endsWith(".json"))) {
    const v = JSON.parse(readFileSync(join(vecDir, f), "utf8"));
    if (JSON.stringify(solveP1(structuredClone(v.input))) !== JSON.stringify(vP1(structuredClone(v.input)))) {
      throw new Error(`parity 失败：P1 向量 ${f}`);
    }
    n++;
  }
  console.log(`parity 通过：P0 工况对 + P1 工况对 + P1 全部 ${n} 向量输入，输出逐位一致`);
}

main().catch((e) => {
  console.error(String(e));
  process.exit(1);
});
