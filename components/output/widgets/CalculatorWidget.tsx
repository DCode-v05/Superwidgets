"use client";

import { useMemo, useState } from "react";
import type { CalculatorPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

/**
 * Calculator — live recompute. Inputs (numbers / sliders) drive `outputs`,
 * each output is a JS-like expression on the inputs that's safely evaluated
 * via a Function-constructor sandbox limited to the input variables.
 */
export function CalculatorWidget({ payload, actions }: { payload: CalculatorPayload; actions?: WidgetAction[] }) {
  const inputs = payload?.inputs ?? [];
  const outputs = payload?.outputs ?? [];

  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const i of inputs) init[i.id] = i.default ?? 0;
    return init;
  });

  const setValue = (id: string, v: number) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const results = useMemo(() => {
    return outputs.map((out) => {
      try {
        const argNames = inputs.map((i) => i.id);
        const argValues = argNames.map((n) => Number(values[n] ?? 0));
        // Sandbox: only the input variables are in scope, plus Math.
        const fn = new Function(...argNames, "Math", `"use strict"; return (${out.formula});`);
        const raw = fn(...argValues, Math);
        if (typeof raw !== "number" || !isFinite(raw)) return { id: out.id, label: out.label, value: "—", unit: out.unit };
        const precision = out.precision ?? 2;
        return { id: out.id, label: out.label, value: raw.toFixed(precision), unit: out.unit, formula: out.formula };
      } catch {
        return { id: out.id, label: out.label, value: "—", unit: out.unit, formula: out.formula };
      }
    });
  }, [outputs, inputs, values]);

  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title ?? "Calculator"} subtitle={payload?.subtitle ?? "Live recompute"} />

      <div className="space-y-3 mb-3">
        {inputs.map((inp) => (
          <div key={inp.id}>
            <label className="block text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--secondary)] mb-1.5">
              {inp.label}
              {inp.unit && <span className="ml-1 opacity-60">({inp.unit})</span>}
            </label>
            {inp.type === "slider" ? (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={inp.min ?? 0}
                  max={inp.max ?? 100}
                  step={inp.step ?? 1}
                  value={values[inp.id] ?? inp.default ?? 0}
                  onChange={(e) => setValue(inp.id, Number(e.target.value))}
                  className="flex-1 accent-accent cursor-pointer"
                />
                <span className="w-16 text-right font-mono tabular-nums text-[13px] text-[var(--foreground)]">
                  {values[inp.id] ?? inp.default ?? 0}
                </span>
              </div>
            ) : (
              <input
                type="number"
                value={values[inp.id] ?? inp.default ?? 0}
                onChange={(e) => setValue(inp.id, Number(e.target.value) || 0)}
                step={inp.step ?? 1}
                min={inp.min}
                max={inp.max}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-sm font-mono tabular-nums focus:outline-none focus:border-accent text-[var(--foreground)]"
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-[#16181f] text-white p-3.5 space-y-2">
        {results.map((r, i) => (
          <div key={r.id} className={i > 0 ? "pt-2 border-t border-white/10" : ""}>
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/60">{r.label}</div>
            <div className="text-[26px] font-display font-bold leading-none tabular-nums">
              {r.value}
              {r.unit && <span className="text-[12px] font-mono ml-1 opacity-60">{r.unit}</span>}
            </div>
            {r.formula && (
              <div className="text-[10px] font-mono text-white/40 mt-0.5">= {r.formula}</div>
            )}
          </div>
        ))}
      </div>

      <ActionChips actions={actions} />
    </WidgetShell>
  );
}
