/**
 * Focused eval for widget intents 6–10 (source_cards, table, chart, code_block, inline_banner)
 * across the working models, in both HTML and React output formats.
 *
 * Captures:
 *  - input/output/cached tokens
 *  - USD cost per call (via the same pricing module the UI uses)
 *  - latency
 *  - widget byte size
 *  - intent-specific structural score (did the model actually emit the right shape?)
 *
 * Writes:
 *  - eval/outputs-intents/<intent>__<model>__<format>.html  (HTML — open in browser)
 *  - eval/outputs-intents/<intent>__<model>__<format>.tsx   (React — for inspection)
 *  - eval/results-intents-<ts>.json                          (raw)
 *  - eval/report-intents-<ts>.md                             (human-readable recommendation)
 *
 * Run: npx tsx eval/intents-6-10.ts
 */

try {
  // @ts-expect-error process.loadEnvFile is Node 20.12+
  process.loadEnvFile?.(".env.local");
} catch {
  /* ignore */
}

import { promises as fs } from "node:fs";
import path from "node:path";
import { runEngine } from "@/lib/engine/run-engine";
import type { ProviderId } from "@/lib/engine/providers";
import { MODEL_INFO } from "@/lib/engine/model-info";
import type { OutputFormat } from "@/lib/types/engine-widgets";

interface IntentCase {
  intent: string;
  prompt: string;
  /** Structural check predicates the widget must satisfy. */
  checks: Array<{ name: string; test: (html: string) => boolean }>;
}

const CASES: IntentCase[] = [
  {
    intent: "source_cards",
    prompt: "Tell me about Y Combinator with 3-4 sources",
    checks: [
      { name: "has-anchor-tag", test: (h) => /<a\s+href=/i.test(h) },
      { name: "uses-target-blank", test: (h) => /target=["']_blank["']/i.test(h) },
      { name: "has-rel-noopener", test: (h) => /rel=["'][^"']*noopener/i.test(h) },
      { name: "multiple-sources", test: (h) => (h.match(/<a\s+href=/gi) ?? []).length >= 2 },
    ],
  },
  {
    intent: "table",
    prompt: "Compare AWS Lambda, Vercel Functions, and Cloudflare Workers in a table",
    checks: [
      { name: "has-table-tag", test: (h) => /<table[\s>]/i.test(h) },
      { name: "has-thead", test: (h) => /<thead[\s>]/i.test(h) },
      { name: "has-tbody", test: (h) => /<tbody[\s>]/i.test(h) },
      { name: "has-3plus-rows", test: (h) => (h.match(/<tr[\s>]/gi) ?? []).length >= 3 },
    ],
  },
  {
    intent: "chart",
    prompt: "Show me revenue trend over the last 6 months as a chart",
    checks: [
      { name: "has-svg", test: (h) => /<svg[\s>]/i.test(h) },
      { name: "has-viewBox", test: (h) => /viewBox=/i.test(h) },
      { name: "has-data-shape", test: (h) => /<polyline|<rect|<path/i.test(h) },
      { name: "no-pie-chart", test: (h) => !/<circle[^>]+r=["'][0-9]{3,}/i.test(h) },
    ],
  },
  {
    intent: "code_block",
    prompt: "Write a Python function that fetches a URL with exponential-backoff retries",
    checks: [
      { name: "has-pre", test: (h) => /<pre[\s>]/i.test(h) },
      { name: "has-code", test: (h) => /<code[\s>]/i.test(h) },
      { name: "has-python-syntax", test: (h) => /def\s+\w+\(/i.test(h) || /import\s+/i.test(h) },
      { name: "monospace-font", test: (h) => /monospace|menlo|consolas|jetbrains/i.test(h) },
    ],
  },
  {
    intent: "inline_banner",
    prompt: "Confirm that my deploy to production went through successfully",
    checks: [
      // Banner = short, tone-coded, single block; check for tone color + concise content
      { name: "has-tone-color", test: (h) => /#22c55e|#16a34a|#4ade80|green/i.test(h) || /success/i.test(h) },
      { name: "concise", test: (h) => h.length < 4500 }, // banners are short by design
      { name: "has-title-and-body", test: (h) => /<h[1-4]|<strong|font-weight:\s*[6-9]/i.test(h) },
    ],
  },
];

const HTML_MODELS: ProviderId[] = ["haiku", "sonnet", "gpt-4o-mini"];
const REACT_MODELS: ProviderId[] = ["haiku"]; // 1 model for React, just to compare format cost

const OUT_DIR = path.join("eval", "outputs-intents");

interface RunResult {
  intent: string;
  prompt: string;
  providerId: ProviderId;
  modelLabel: string;
  outputFormat: OutputFormat;
  widgetBytes: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  cacheHitRate: number;
  totalCost: number;
  latencyMs: number;
  passedChecks: number;
  totalChecks: number;
  failures: string[];
  error?: string;
}

async function runOne(c: IntentCase, providerId: ProviderId, format: OutputFormat): Promise<RunResult> {
  const start = Date.now();
  let widgetHtml = "";
  let usage:
    | {
        inputTokens: number;
        outputTokens: number;
        cacheReadTokens: number;
        cacheWriteTokens: number;
        cacheHitRate: number;
        totalCost: number;
      }
    | null = null;
  let error: string | undefined;

  try {
    for await (const ev of runEngine(c.prompt, [], {
      providerId,
      useSkill: false,
      pipeline: false,
      outputFormat: format,
    })) {
      if (ev.type === "widget_html") widgetHtml = ev.html;
      else if (ev.type === "usage") {
        usage = {
          inputTokens: ev.usage.inputTokens,
          outputTokens: ev.usage.outputTokens,
          cacheReadTokens: ev.usage.cacheReadTokens,
          cacheWriteTokens: ev.usage.cacheWriteTokens,
          cacheHitRate: ev.usage.cacheHitRate,
          totalCost: ev.usage.totalCost,
        };
      } else if (ev.type === "error") {
        error = ev.message;
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const latencyMs = Date.now() - start;
  const fileExt = format === "react" ? "tsx" : "html";
  const outFile = path.join(OUT_DIR, `${c.intent}__${providerId}__${format}.${fileExt}`);
  if (widgetHtml) {
    const payload =
      format === "html"
        ? `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${c.intent} · ${providerId}</title>
<style>body{margin:0;padding:48px 24px;background:#1a1714;font-family:ui-sans-serif,system-ui;display:flex;justify-content:center;align-items:flex-start;min-height:100vh}
.wrap{max-width:820px;width:100%}.lbl{font-family:ui-monospace,monospace;font-size:11px;color:#9b948a;text-transform:uppercase;letter-spacing:.2em;margin-bottom:14px}</style></head>
<body><div class="wrap"><div class="lbl">${c.intent} · ${providerId} · ${format}</div>${widgetHtml}</div></body></html>`
        : widgetHtml; // TSX source as-is for React
    await fs.writeFile(outFile, payload);
  }

  // Score on the source string (for React, we score the TSX text — the
  // structural patterns we care about live in the JSX literally either way).
  const target = format === "react" ? widgetHtml.replace(/className/g, "class") : widgetHtml;
  const failures = c.checks.filter((chk) => !chk.test(target)).map((chk) => chk.name);

  return {
    intent: c.intent,
    prompt: c.prompt,
    providerId,
    modelLabel: MODEL_INFO[providerId].label,
    outputFormat: format,
    widgetBytes: widgetHtml.length,
    inputTokens: usage?.inputTokens ?? 0,
    outputTokens: usage?.outputTokens ?? 0,
    cacheReadTokens: usage?.cacheReadTokens ?? 0,
    cacheWriteTokens: usage?.cacheWriteTokens ?? 0,
    cacheHitRate: usage?.cacheHitRate ?? 0,
    totalCost: usage?.totalCost ?? 0,
    latencyMs,
    passedChecks: c.checks.length - failures.length,
    totalChecks: c.checks.length,
    failures,
    error,
  };
}

function fmtUsd(n: number): string {
  if (!isFinite(n) || n === 0) return "$0";
  if (n < 0.0001) return "<$0.0001";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(2)}`;
}

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

function buildReport(results: RunResult[]): string {
  const intents = Array.from(new Set(results.map((r) => r.intent)));
  const lines: string[] = [];

  lines.push(`# Intents 6–10 evaluation report\n`);
  lines.push(`Generated ${new Date().toISOString()}.\n`);
  lines.push(
    `Each row is one call to the engine in single-call mode with skill OFF. ` +
      `Token counts and cost come from the provider's own usage response; cost is computed ` +
      `by [lib/engine/pricing.ts](../lib/engine/pricing.ts) using the same rates the UI shows.\n`,
  );

  // === Per-intent tables ===
  for (const intent of intents) {
    const rows = results.filter((r) => r.intent === intent);
    lines.push(`\n## ${intent}\n`);
    const sample = rows[0];
    lines.push(`Prompt: _${sample.prompt}_\n`);

    lines.push(`| Model | Format | Input → Output (tokens) | Total | Cost | Latency | Bytes | Structural score | Pass? |`);
    lines.push(`|---|---|---|---|---|---|---|---|---|`);
    for (const r of rows) {
      const total = r.inputTokens + r.outputTokens;
      const pass = r.passedChecks === r.totalChecks ? "✅" : r.passedChecks >= r.totalChecks - 1 ? "⚠️" : "❌";
      lines.push(
        `| ${r.modelLabel} | ${r.outputFormat} | ${r.inputTokens.toLocaleString()} → ${r.outputTokens.toLocaleString()} | ${total.toLocaleString()} | ${fmtUsd(r.totalCost)} | ${(r.latencyMs / 1000).toFixed(1)}s | ${r.widgetBytes.toLocaleString()} | ${r.passedChecks}/${r.totalChecks} | ${pass} |`,
      );
    }

    // Find best per intent (HTML only) — highest structural score, ties broken by cost
    const html = rows.filter((r) => r.outputFormat === "html" && !r.error);
    if (html.length > 0) {
      const sorted = [...html].sort((a, b) => {
        const aRate = a.passedChecks / a.totalChecks;
        const bRate = b.passedChecks / b.totalChecks;
        if (bRate !== aRate) return bRate - aRate;
        return a.totalCost - b.totalCost;
      });
      const winner = sorted[0];
      const winnerScore = `${winner.passedChecks}/${winner.totalChecks}`;
      lines.push(
        `\n**Recommendation for \`${intent}\`**: **${winner.modelLabel}** — passed ${winnerScore} structural checks at ${fmtUsd(winner.totalCost)} per call.`,
      );
      if (winner.providerId !== "sonnet" && html.some((r) => r.providerId === "sonnet")) {
        const sonnet = html.find((r) => r.providerId === "sonnet")!;
        const ratio = sonnet.totalCost > 0 ? sonnet.totalCost / Math.max(winner.totalCost, 1e-9) : 0;
        if (ratio > 1.2) {
          lines.push(
            ` Sonnet 4.6 also passed but costs **${ratio.toFixed(1)}× more** for the same result.`,
          );
        }
      }
    }
  }

  // === HTML vs React format comparison ===
  lines.push(`\n## HTML vs React — same model, same prompt\n`);
  const formatPairs = results
    .filter((r) => r.outputFormat === "react" && !r.error)
    .map((r) => {
      const htmlEquiv = results.find(
        (h) => h.intent === r.intent && h.providerId === r.providerId && h.outputFormat === "html",
      );
      return { html: htmlEquiv, react: r };
    })
    .filter((p): p is { html: RunResult; react: RunResult } => !!p.html);

  if (formatPairs.length > 0) {
    lines.push(`| Intent | Model | HTML cost | React cost | React vs HTML | HTML tokens | React tokens |`);
    lines.push(`|---|---|---|---|---|---|---|`);
    for (const { html, react } of formatPairs) {
      const reactTokens = react.inputTokens + react.outputTokens;
      const htmlTokens = html.inputTokens + html.outputTokens;
      const costRatio = html.totalCost > 0 ? react.totalCost / html.totalCost : 0;
      lines.push(
        `| ${react.intent} | ${react.modelLabel} | ${fmtUsd(html.totalCost)} | ${fmtUsd(react.totalCost)} | ${costRatio.toFixed(2)}× | ${htmlTokens.toLocaleString()} | ${reactTokens.toLocaleString()} |`,
      );
    }
    const avgRatio =
      formatPairs.reduce((sum, p) => {
        const r = p.html.totalCost > 0 ? p.react.totalCost / p.html.totalCost : 0;
        return sum + r;
      }, 0) / formatPairs.length;
    lines.push(
      `\nAverage React-to-HTML cost ratio: **${avgRatio.toFixed(2)}×**. ` +
        (avgRatio > 1.15
          ? "React mode costs noticeably more — TSX source is more verbose than equivalent HTML."
          : avgRatio < 0.9
            ? "React mode is cheaper — surprising; likely because JSX style objects are more compact."
            : "Roughly even — pick based on rendering target, not cost."),
    );
  } else {
    lines.push(`No React/HTML pairs to compare.`);
  }

  // === Totals ===
  const totalCost = results.reduce((a, r) => a + r.totalCost, 0);
  const totalCalls = results.length;
  const errors = results.filter((r) => r.error).length;
  lines.push(`\n## Eval totals\n`);
  lines.push(`- Calls: **${totalCalls}** (${errors} errors)`);
  lines.push(`- Wall-clock cost: **${fmtUsd(totalCost)}**`);
  lines.push(`- Total tokens consumed: **${results.reduce((a, r) => a + r.inputTokens + r.outputTokens, 0).toLocaleString()}**`);
  if (errors > 0) {
    lines.push(`\n### Errors encountered`);
    for (const r of results.filter((r) => r.error)) {
      lines.push(`- ${r.modelLabel} / ${r.intent} / ${r.outputFormat}: ${r.error?.slice(0, 180)}`);
    }
  }

  return lines.join("\n");
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const all: Array<{ c: IntentCase; providerId: ProviderId; format: OutputFormat }> = [];
  for (const c of CASES) {
    for (const m of HTML_MODELS) all.push({ c, providerId: m, format: "html" });
    for (const m of REACT_MODELS) all.push({ c, providerId: m, format: "react" });
  }

  console.log(`Running ${all.length} calls — ${CASES.length} intents × (${HTML_MODELS.length} HTML + ${REACT_MODELS.length} React) models.\n`);
  console.log(pad("intent", 14) + pad("model", 16) + pad("format", 8) + pad("score", 8) + pad("tokens", 14) + pad("cost", 10) + "latency");
  console.log("-".repeat(78));

  const results: RunResult[] = [];
  for (let i = 0; i < all.length; i++) {
    const { c, providerId, format } = all[i];
    const r = await runOne(c, providerId, format);
    results.push(r);
    const totalTokens = r.inputTokens + r.outputTokens;
    const status = r.error
      ? "ERROR"
      : `${r.passedChecks}/${r.totalChecks}`;
    console.log(
      pad(c.intent, 14) +
        pad(MODEL_INFO[providerId].label, 16) +
        pad(format, 8) +
        pad(status, 8) +
        pad(`${r.inputTokens}→${r.outputTokens}`, 14) +
        pad(fmtUsd(r.totalCost), 10) +
        `${(r.latencyMs / 1000).toFixed(1)}s` +
        (r.error ? `   ${r.error.slice(0, 70)}` : ""),
    );
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const rawPath = path.join("eval", `results-intents-${ts}.json`);
  await fs.writeFile(rawPath, JSON.stringify(results, null, 2));
  console.log(`\nRaw results: ${rawPath}`);

  const report = buildReport(results);
  const reportPath = path.join("eval", `report-intents-${ts}.md`);
  await fs.writeFile(reportPath, report);
  console.log(`Report: ${reportPath}`);
  console.log(`Artifacts: ${OUT_DIR}/*.html and *.tsx — open in browser for visual review.`);

  // Print compact summary to stdout
  console.log("\n" + "=".repeat(78));
  console.log("SUMMARY");
  console.log("=".repeat(78));
  console.log(report);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
