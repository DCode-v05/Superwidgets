"use client";

import { useMemo } from "react";
import type { PieChartPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

const DEFAULT_COLORS = ["#EC3B4A", "#374151", "#9CA3AF", "#d1d5db", "#fb923c", "#22c55e", "#3b82f6"];

export function PieChartWidget({ payload, actions }: { payload: PieChartPayload; actions?: WidgetAction[] }) {
  const slices = payload?.slices ?? [];
  const arcs = useMemo(() => {
    const total = slices.reduce((a, s) => a + Math.max(0, s.value), 0);
    if (total <= 0) return [];
    let cumAngle = -Math.PI / 2; // start at 12 o'clock
    return slices.map((slice, i) => {
      const sweep = (slice.value / total) * Math.PI * 2;
      const a0 = cumAngle;
      const a1 = cumAngle + sweep;
      cumAngle = a1;
      const r = 90;
      const cx = 110;
      const cy = 110;
      const x0 = cx + r * Math.cos(a0);
      const y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const largeArc = sweep > Math.PI ? 1 : 0;
      const d = `M ${cx},${cy} L ${x0},${y0} A ${r},${r} 0 ${largeArc},1 ${x1},${y1} Z`;
      const pct = Math.round((slice.value / total) * 100);
      return { d, pct, color: slice.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length], label: slice.label, id: slice.id };
    });
  }, [slices]);

  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title} subtitle={payload?.subtitle ?? "Breakdown"} />
      <div className="flex items-center gap-5 flex-wrap">
        <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" className="block w-[200px] h-[200px] shrink-0">
          {arcs.map((a) => (
            <path key={a.id} d={a.d} fill={a.color} stroke="var(--surface)" strokeWidth="1.5" />
          ))}
        </svg>
        <ul className="flex-1 min-w-[160px] list-none p-0 m-0 space-y-1.5">
          {arcs.map((a) => (
            <li key={a.id} className="flex items-center gap-2.5 text-[13px]">
              <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ background: a.color }} />
              <span className="text-[var(--foreground)] flex-1 min-w-0">{a.label}</span>
              <span className="font-mono text-[var(--secondary)] tabular-nums">{a.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}
