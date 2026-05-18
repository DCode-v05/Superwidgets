"use client";

import type { VennDiagramPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

/** Venn — only handles 2 or 3 sets. Beyond that, Venn diagrams break visually. */
export function VennDiagramWidget({ payload, actions }: { payload: VennDiagramPayload; actions?: WidgetAction[] }) {
  const sets = (payload?.sets ?? []).slice(0, 3);
  const intersections = payload?.intersections ?? [];

  const lookup = (setIds: string[]): string[] => {
    const sorted = [...setIds].sort().join("|");
    const match = intersections.find((i) => [...i.sets].sort().join("|") === sorted);
    return match?.items ?? [];
  };

  const W = 480;
  const H = 320;
  const colors = sets.map((s, i) => s.color ?? ["#EC3B4A", "#3b82f6", "#14b8a6"][i % 3]);

  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title} subtitle="Overlap" />
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
        <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="block w-full h-auto">
          {sets.length === 2 ? (
            <>
              <circle cx={170} cy={160} r={110} fill={colors[0]} fillOpacity={0.30} stroke={colors[0]} strokeWidth="1.5" />
              <circle cx={310} cy={160} r={110} fill={colors[1]} fillOpacity={0.30} stroke={colors[1]} strokeWidth="1.5" />
              <text x={100} y={80} fontSize="14" fontWeight="700" fill={colors[0]}>{sets[0]?.label}</text>
              <text x={320} y={80} fontSize="14" fontWeight="700" fill={colors[1]}>{sets[1]?.label}</text>
              <text x={100} y={170} className="fill-[var(--foreground)]" fontSize="11">{lookup([sets[0]?.id]).slice(0, 3).join(", ")}</text>
              <text x={340} y={170} className="fill-[var(--foreground)]" fontSize="11">{lookup([sets[1]?.id]).slice(0, 3).join(", ")}</text>
              <text x={220} y={170} className="fill-[var(--foreground)]" fontSize="11" fontWeight="600">{lookup([sets[0]?.id, sets[1]?.id]).slice(0, 3).join(", ")}</text>
            </>
          ) : (
            <>
              <circle cx={170} cy={140} r={110} fill={colors[0]} fillOpacity={0.30} stroke={colors[0]} strokeWidth="1.5" />
              <circle cx={310} cy={140} r={110} fill={colors[1]} fillOpacity={0.30} stroke={colors[1]} strokeWidth="1.5" />
              <circle cx={240} cy={230} r={110} fill={colors[2]} fillOpacity={0.30} stroke={colors[2]} strokeWidth="1.5" />
              <text x={100} y={70} fontSize="14" fontWeight="700" fill={colors[0]}>{sets[0]?.label}</text>
              <text x={320} y={70} fontSize="14" fontWeight="700" fill={colors[1]}>{sets[1]?.label}</text>
              <text x={170} y={310} fontSize="14" fontWeight="700" fill={colors[2]}>{sets[2]?.label}</text>
              <text x={240} y={160} className="fill-[var(--foreground)]" fontSize="11" fontWeight="700" textAnchor="middle">{lookup([sets[0]?.id, sets[1]?.id, sets[2]?.id]).slice(0, 2).join(", ")}</text>
              <text x={240} y={130} className="fill-[var(--foreground)]" fontSize="10" textAnchor="middle">{lookup([sets[0]?.id, sets[1]?.id]).slice(0, 2).join(", ")}</text>
              <text x={185} y={210} className="fill-[var(--foreground)]" fontSize="10" textAnchor="middle">{lookup([sets[0]?.id, sets[2]?.id]).slice(0, 2).join(", ")}</text>
              <text x={290} y={210} className="fill-[var(--foreground)]" fontSize="10" textAnchor="middle">{lookup([sets[1]?.id, sets[2]?.id]).slice(0, 2).join(", ")}</text>
            </>
          )}
        </svg>
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}
