/**
 * `npm run eval` — sweeps every (model × skill on/off) combo against the
 * test prompts, scores output structurally, prints a $/successful-render
 * ranking. Requires Node 20.12+ for process.loadEnvFile.
 */

try {
  process.loadEnvFile?.(".env.local");
} catch {
  /* missing file or unsupported runtime — fall through */
}

import { promises as fs } from "node:fs";
import path from "node:path";
import { runEngine } from "@/lib/engine/run-engine";
import { PROVIDER_IDS, type ProviderId } from "@/lib/engine/providers";
import { PROMPTS, type TestPrompt } from "./prompts";

const TRIALS = 2;
const OUTPUT_DIR = path.join("eval", "outputs");
const PASS_THRESHOLD = 0.8;

interface Combo {
  label: string;
  providerId: ProviderId;
  useSkill: boolean;
}

const COMBOS: Combo[] = PROVIDER_IDS.flatMap((id) => [
  { label: `${id}__nosk`, providerId: id, useSkill: false },
  { label: `${id}__sk`, providerId: id, useSkill: true },
]);

interface TrialResult {
  combo: string;
  providerId: ProviderId;
  useSkill: boolean;
  prompt: string;
  trial: number;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  cacheHitRate: number;
  latencyMs: number;
  widgetBytes: number;
  structureScore: number;
  passed: boolean;
  failures: string[];
  error?: string;
}

async function runOne(combo: Combo, prompt: TestPrompt): Promise<{
  text: string;
  widgetHtml: string;
  usage: { inputTokens: number; outputTokens: number; cacheHitRate: number; totalCost: number } | null;
  latencyMs: number;
}> {
  const start = Date.now();
  let text = "";
  let widgetHtml = "";
  let usage: TrialResult extends infer T
    ? T extends { usage?: infer U }
      ? U
      : never
    : never = null as never;

  for await (const ev of runEngine(prompt.text, [], {
    providerId: combo.providerId,
    useSkill: combo.useSkill,
  })) {
    if (ev.type === "text_delta") text += ev.text;
    else if (ev.type === "widget_html") widgetHtml = ev.html;
    else if (ev.type === "usage") usage = ev.usage as never;
    else if (ev.type === "error") throw new Error(ev.message);
  }
  return { text, widgetHtml, usage, latencyMs: Date.now() - start };
}

function scoreStructure(widgetHtml: string, prompt: TestPrompt): {
  score: number;
  failures: string[];
} {
  const checks: Array<{ name: string; pass: boolean }> = [];

  checks.push({ name: "has-content", pass: widgetHtml.length > 80 });

  const rootStyle = widgetHtml.match(/^<\w+[^>]*\sstyle=["']([^"']+)["']/i)?.[1] ?? "";
  checks.push({
    name: "root-has-bg-and-color",
    pass: /\bbackground/i.test(rootStyle) && /\bcolor/i.test(rootStyle),
  });

  if (prompt.requiresInteractivity) {
    checks.push({
      name: "has-data-bap-prompt",
      pass: /\sdata-bap-prompt=/i.test(widgetHtml),
    });
  }
  if (prompt.id === "chart") {
    checks.push({ name: "has-inline-svg", pass: /<svg[\s>]/i.test(widgetHtml) });
  }

  checks.push({
    name: "no-forbidden-tags",
    pass: !/<(script|iframe|style|form|object|embed)\b/i.test(widgetHtml),
  });
  checks.push({
    name: "no-event-handlers",
    pass: !/\son[a-z]+\s*=/i.test(widgetHtml),
  });

  const openTags = (widgetHtml.match(/<\w+(?:\s[^>]*)?>/g) ?? []).length;
  const closeTags = (widgetHtml.match(/<\/\w+>/g) ?? []).length;
  const selfClosing = (widgetHtml.match(/<\w+[^>]*\/>/g) ?? []).length;
  checks.push({
    name: "tags-balanced",
    pass: Math.abs(openTags - selfClosing - closeTags) <= Math.max(1, Math.floor(openTags * 0.05)),
  });

  const passed = checks.filter((c) => c.pass).length;
  return {
    score: passed / checks.length,
    failures: checks.filter((c) => !c.pass).map((c) => c.name),
  };
}

function wrapAsDoc(widgetHtml: string, title: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>body{margin:0;padding:48px 24px;background:#1a1714;font-family:ui-sans-serif,system-ui,sans-serif;display:flex;justify-content:center;align-items:flex-start;min-height:100vh}
.wrap{max-width:820px;width:100%}.label{font-family:ui-monospace,monospace;font-size:11px;color:#9b948a;text-transform:uppercase;letter-spacing:.2em;margin-bottom:14px}</style>
</head><body><div class="wrap"><div class="label">${title}</div>${widgetHtml}</div></body></html>`;
}

function pad(s: string, n: number, char = " "): string {
  return s.length >= n ? s : s + char.repeat(n - s.length);
}

function fmt(usd: number): string {
  if (!isFinite(usd)) return "  ∞   ";
  if (usd < 0.0001) return "<$.0001";
  if (usd < 1) return "$" + usd.toFixed(4);
  return "$" + usd.toFixed(2);
}

async function main(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const results: TrialResult[] = [];
  const total = COMBOS.length * PROMPTS.length * TRIALS;
  let n = 0;
  const overallStart = Date.now();

  console.log(`\n=== Mini-BAP cost-efficiency sweep ===`);
  console.log(`Combos: ${COMBOS.length} · Prompts: ${PROMPTS.length} · Trials: ${TRIALS}`);
  console.log(`Total calls: ${total} · Output dir: ${OUTPUT_DIR}`);
  console.log(`Pass threshold: ${PASS_THRESHOLD * 100}% of structural checks\n`);

  for (const combo of COMBOS) {
    for (const prompt of PROMPTS) {
      for (let trial = 1; trial <= TRIALS; trial++) {
        n++;
        const tag = `[${n.toString().padStart(3)}/${total}] ${pad(combo.label, 24)} × ${pad(prompt.id, 8)} t${trial}`;
        process.stdout.write(tag);

        try {
          const r = await runOne(combo, prompt);
          const widgetHtml = r.widgetHtml || "";
          const { score, failures } = scoreStructure(widgetHtml, prompt);
          const passed = score >= PASS_THRESHOLD;
          const cost = r.usage?.totalCost ?? 0;

          results.push({
            combo: combo.label,
            providerId: combo.providerId,
            useSkill: combo.useSkill,
            prompt: prompt.id,
            trial,
            cost,
            inputTokens: r.usage?.inputTokens ?? 0,
            outputTokens: r.usage?.outputTokens ?? 0,
            cacheHitRate: r.usage?.cacheHitRate ?? 0,
            latencyMs: r.latencyMs,
            widgetBytes: widgetHtml.length,
            structureScore: score,
            passed,
            failures,
          });

          await fs.writeFile(
            path.join(OUTPUT_DIR, `${combo.label}__${prompt.id}__t${trial}.html`),
            wrapAsDoc(widgetHtml, `${combo.label} × ${prompt.id} × t${trial}`),
          );

          const cacheStr = (r.usage?.cacheHitRate ?? 0) > 0
            ? ` cache:${Math.round((r.usage?.cacheHitRate ?? 0) * 100)}%`
            : "";
          process.stdout.write(
            ` → ${passed ? "PASS" : "FAIL"} ` +
              `(${(score * 100).toFixed(0)}%) ` +
              `${fmt(cost)} ${(r.latencyMs / 1000).toFixed(1)}s${cacheStr}\n`,
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          results.push({
            combo: combo.label,
            providerId: combo.providerId,
            useSkill: combo.useSkill,
            prompt: prompt.id,
            trial,
            cost: 0,
            inputTokens: 0,
            outputTokens: 0,
            cacheHitRate: 0,
            latencyMs: 0,
            widgetBytes: 0,
            structureScore: 0,
            passed: false,
            failures: ["error"],
            error: msg,
          });
          process.stdout.write(` → ERROR: ${msg.slice(0, 80)}\n`);
        }
      }
    }
  }

  const totalElapsed = ((Date.now() - overallStart) / 1000).toFixed(1);
  const totalCost = results.reduce((a, r) => a + r.cost, 0);
  console.log(`\nSweep complete in ${totalElapsed}s · total spend: $${totalCost.toFixed(4)}\n`);

  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const rawPath = path.join("eval", `results-${ts}.json`);
  await fs.writeFile(rawPath, JSON.stringify(results, null, 2));
  console.log(`Raw results: ${rawPath}`);

  printReport(results);
}

function printReport(results: TrialResult[]): void {
  const byCombo = new Map<string, TrialResult[]>();
  for (const r of results) {
    if (!byCombo.has(r.combo)) byCombo.set(r.combo, []);
    byCombo.get(r.combo)!.push(r);
  }

  type Row = {
    combo: string;
    avgCost: number;
    successRate: number;
    avgPass: number;
    avgLatency: number;
    avgCacheHit: number;
    costPerSuccess: number;
  };

  const rows: Row[] = Array.from(byCombo.entries()).map(([combo, rs]) => {
    const avgCost = rs.reduce((a, r) => a + r.cost, 0) / rs.length;
    const successRate = rs.filter((r) => r.passed).length / rs.length;
    const avgPass = rs.reduce((a, r) => a + r.structureScore, 0) / rs.length;
    const avgLatency = rs.reduce((a, r) => a + r.latencyMs, 0) / rs.length;
    const avgCacheHit = rs.reduce((a, r) => a + r.cacheHitRate, 0) / rs.length;
    const costPerSuccess = successRate > 0 ? avgCost / successRate : Infinity;
    return { combo, avgCost, successRate, avgPass, avgLatency, avgCacheHit, costPerSuccess };
  });

  rows.sort((a, b) => a.costPerSuccess - b.costPerSuccess);

  console.log("\n=== RANKED BY COST-PER-SUCCESSFUL-RENDER ===\n");
  console.log(
    pad("Combo", 26) +
      pad("AvgCost", 11) +
      pad("Pass%", 8) +
      pad("Succ%", 8) +
      pad("$/Succ", 11) +
      pad("Latency", 10) +
      "Cache%",
  );
  console.log("-".repeat(82));
  for (const r of rows) {
    console.log(
      pad(r.combo, 26) +
        pad(fmt(r.avgCost), 11) +
        pad((r.avgPass * 100).toFixed(0) + "%", 8) +
        pad((r.successRate * 100).toFixed(0) + "%", 8) +
        pad(fmt(r.costPerSuccess), 11) +
        pad((r.avgLatency / 1000).toFixed(1) + "s", 10) +
        (r.avgCacheHit * 100).toFixed(0) + "%",
    );
  }

  console.log("\n=== TOP 5 RECOMMENDATIONS ===\n");
  const top5 = rows.filter((r) => r.successRate >= 0.5).slice(0, 5);
  for (let i = 0; i < top5.length; i++) {
    const r = top5[i];
    console.log(`${i + 1}. ${r.combo}`);
    console.log(`   $/successful render: ${fmt(r.costPerSuccess)} · success rate: ${(r.successRate * 100).toFixed(0)}% · latency: ${(r.avgLatency / 1000).toFixed(1)}s`);
  }

  console.log(`\nFull artifacts: ${OUTPUT_DIR}/*.html — open in a browser for visual review.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
