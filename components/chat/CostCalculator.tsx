"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Calculator as CalcIcon, X } from "lucide-react";
import { PROVIDER_IDS, type ProviderId } from "@/lib/engine/providers";
import { estimateCost, getPricing } from "@/lib/engine/pricing";
import { cn } from "@/lib/utils";

const LABELS: Record<ProviderId, string> = {
  sonnet: "Sonnet 4.6",
  haiku: "Haiku 4.5",
  "gemini-3": "Gemini 3 Flash",
  "gemini-3.1": "Gemini 3.1 Flash Lite",
  "gpt-5.4-mini": "GPT-5.4 Mini",
  "gpt-5.4": "GPT-5.4",
  "gpt-5.5": "GPT-5.5",
};

const FAMILY: Record<ProviderId, string> = {
  sonnet: "Anthropic",
  haiku: "Anthropic",
  "gemini-3": "Google",
  "gemini-3.1": "Google",
  "gpt-5.4-mini": "OpenAI",
  "gpt-5.4": "OpenAI",
  "gpt-5.5": "OpenAI",
};

const PRESETS: Array<{ label: string; input: number; output: number }> = [
  { label: "Tiny", input: 500, output: 100 },
  { label: "Small", input: 1500, output: 300 },
  { label: "Typical", input: 2500, output: 500 },
  { label: "Large", input: 10000, output: 2000 },
];

function formatUSD(usd: number): string {
  if (usd <= 0) return "$0";
  if (usd < 0.000001) return "<$0.000001";
  if (usd < 0.01) return `$${usd.toFixed(6)}`;
  if (usd < 1) return `$${usd.toFixed(4)}`;
  if (usd < 100) return `$${usd.toFixed(2)}`;
  return `$${Math.round(usd).toLocaleString()}`;
}

export function CostCalculator() {
  const [open, setOpen] = useState(false);
  const [inputTokens, setInputTokens] = useState(2500);
  const [outputTokens, setOutputTokens] = useState(500);
  const [cacheHitRate, setCacheHitRate] = useState(0);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const rows = useMemo(() => {
    const items = PROVIDER_IDS.map((id) => {
      const p = getPricing(id);
      const cost = estimateCost(id, inputTokens, outputTokens, cacheHitRate);
      return {
        id,
        label: LABELS[id],
        family: FAMILY[id],
        cost,
        rates: p,
      };
    });
    items.sort((a, b) => a.cost - b.cost);
    return items;
  }, [inputTokens, outputTokens, cacheHitRate]);

  const cheapest = rows[0]?.cost ?? 0;
  const mostExpensive = rows[rows.length - 1]?.cost ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-mono text-[var(--secondary)] hover:text-accent transition-colors"
        title="Open the cost calculator"
      >
        <CalcIcon className="h-3 w-3" strokeWidth={1.5} />
        Calculator
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-up">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight leading-none">
                  Cost Calculator
                </h2>
                <p className="text-[11px] text-[var(--secondary)] mt-1.5 font-mono">
                  Per request, across all models · prices as of 2026-05
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--secondary)] hover:text-accent p-1 -m-1"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 mb-3">
              <NumberField
                label="Input tokens"
                value={inputTokens}
                onChange={setInputTokens}
              />
              <NumberField
                label="Output tokens"
                value={outputTokens}
                onChange={setOutputTokens}
              />
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--secondary)] font-mono block mb-1.5">
                  Cache hit: <span className="text-[var(--foreground)]">{Math.round(cacheHitRate * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(cacheHitRate * 100)}
                  onChange={(e) => setCacheHitRate(Number(e.target.value) / 100)}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--secondary)] font-mono">
                Presets
              </span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setInputTokens(p.input);
                    setOutputTokens(p.output);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--secondary)] hover:border-accent hover:text-accent transition-colors"
                  title={`${p.input.toLocaleString()} in · ${p.output.toLocaleString()} out`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Cost table */}
            <div className="border border-[var(--border)] rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[var(--surface-2)]">
                  <tr>
                    <th className="text-left p-3 font-mono uppercase tracking-[0.15em] text-[10px] text-[var(--secondary)]">
                      Model
                    </th>
                    <th className="text-right p-3 font-mono uppercase tracking-[0.15em] text-[10px] text-[var(--secondary)]">
                      Per call
                    </th>
                    <th className="text-right p-3 font-mono uppercase tracking-[0.15em] text-[10px] text-[var(--secondary)]">
                      Per 1K
                    </th>
                    <th className="text-right p-3 font-mono uppercase tracking-[0.15em] text-[10px] text-[var(--secondary)]">
                      Per 100K
                    </th>
                    <th className="text-right p-3 font-mono uppercase tracking-[0.15em] text-[10px] text-[var(--secondary)]">
                      vs Cheap
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const mult = cheapest > 0 ? row.cost / cheapest : 1;
                    const isCheapest = i === 0;
                    const isMostExpensive =
                      i === rows.length - 1 && row.cost > cheapest;
                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "border-t border-[var(--border)]",
                          isCheapest && "bg-accent/5",
                        )}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                isCheapest
                                  ? "text-accent font-semibold"
                                  : "text-[var(--foreground)]"
                              }
                            >
                              {row.label}
                            </span>
                            <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--secondary)] opacity-60">
                              {row.family}
                            </span>
                            {isCheapest && (
                              <span className="text-[9px] font-mono uppercase tracking-wider text-accent">
                                ★ Cheapest
                              </span>
                            )}
                            {isMostExpensive && (
                              <span className="text-[9px] font-mono uppercase tracking-wider text-amber-500">
                                Premium
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[var(--secondary)] font-mono mt-0.5">
                            {row.rates.input.toFixed(2)}/{row.rates.output.toFixed(2)} ·
                            cached {row.rates.cachedInput.toFixed(3)} per MTok
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono">
                          {formatUSD(row.cost)}
                        </td>
                        <td className="p-3 text-right font-mono text-[var(--secondary)]">
                          {formatUSD(row.cost * 1_000)}
                        </td>
                        <td className="p-3 text-right font-mono text-[var(--secondary)]">
                          {formatUSD(row.cost * 100_000)}
                        </td>
                        <td className="p-3 text-right font-mono text-[var(--secondary)]">
                          {isCheapest ? "1.0×" : `${mult.toFixed(1)}×`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-[11px] text-[var(--secondary)] flex items-center justify-between flex-wrap gap-2">
              <span>
                Cheapest{" "}
                <span className="font-mono text-[var(--foreground)]">
                  {formatUSD(cheapest)}
                </span>{" "}
                · Most expensive{" "}
                <span className="font-mono text-[var(--foreground)]">
                  {formatUSD(mostExpensive)}
                </span>
              </span>
              <span className="font-mono uppercase tracking-wider text-[10px]">
                Spread: {cheapest > 0 ? (mostExpensive / cheapest).toFixed(0) : "—"}×
              </span>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--secondary)] font-mono block mb-1.5">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) =>
          onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))
        }
        className="w-full bg-[var(--background)] border border-[var(--border)] rounded px-2.5 py-1.5 text-sm font-mono focus:outline-none focus:border-accent text-[var(--foreground)]"
        min={0}
        step={100}
      />
    </div>
  );
}
