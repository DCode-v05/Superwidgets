"use client";

import { useMemo } from "react";
import type { HeatmapPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

export function HeatmapWidget({ payload, actions }: { payload: HeatmapPayload; actions?: WidgetAction[] }) {
  const rows = payload?.rows ?? [];
  const cols = payload?.cols ?? [];
  const cells = payload?.cells ?? [];

  const { min, max } = useMemo(() => {
    let mn = Infinity;
    let mx = -Infinity;
    for (const row of cells) for (const v of row) {
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    if (!isFinite(mn)) mn = 0;
    if (!isFinite(mx)) mx = 1;
    return { min: mn, max: mx };
  }, [cells]);

  const range = max - min || 1;

  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title} subtitle={payload?.subtitle ?? "Density"} />
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="text-[11px] font-mono border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-1.5"></th>
              {cols.map((c) => (
                <th key={c} className="px-3 py-1.5 font-semibold text-[var(--secondary)] text-center">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row}>
                <td className="px-2 py-1 font-semibold text-[var(--foreground)]">{row}</td>
                {cols.map((_, j) => {
                  const v = cells[i]?.[j] ?? 0;
                  const t = (v - min) / range;
                  const opacity = 0.05 + t * 0.85;
                  const lightText = t > 0.55;
                  return (
                    <td
                      key={j}
                      className="px-3 py-2 text-center tabular-nums"
                      style={{
                        background: `rgba(236,59,74,${opacity.toFixed(3)})`,
                        color: lightText ? "#fff" : "var(--foreground)",
                      }}
                      title={`${row} × ${cols[j]} = ${v}${payload.unit ? " " + payload.unit : ""}`}
                    >
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {payload?.unit && (
        <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--secondary)]">
          unit: {payload.unit} · range: {min} → {max}
        </div>
      )}
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}
