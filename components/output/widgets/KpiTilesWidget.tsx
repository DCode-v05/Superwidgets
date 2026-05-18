"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KpiTilesPayload, KpiTile, KpiTone, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

/**
 * KPI tiles — grid of single-point-in-time metrics. Each tile shows a label,
 * a big number, an optional delta with tone, and an optional sparkline.
 *
 * Distinct from `chart`: charts show a trend; tiles show *the current state*.
 */

const TONE_STYLES: Record<KpiTone, { border: string; deltaText: string; spark: string }> = {
  good: { border: "border-l-green-500", deltaText: "text-green-600 dark:text-green-400", spark: "#22c55e" },
  warn: { border: "border-l-amber-500", deltaText: "text-amber-600 dark:text-amber-400", spark: "#f59e0b" },
  bad: { border: "border-l-red-500", deltaText: "text-red-600 dark:text-red-400", spark: "#ef4444" },
  neutral: { border: "border-l-[var(--border)]", deltaText: "text-[var(--secondary)]", spark: "#9CA3AF" },
};

export function KpiTilesWidget({
  payload,
  actions,
}: {
  payload: KpiTilesPayload;
  actions?: WidgetAction[];
}) {
  const tiles = payload?.tiles ?? [];
  const cols = tiles.length >= 4 ? 4 : tiles.length === 1 ? 1 : tiles.length === 2 ? 2 : 3;

  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title} subtitle={payload?.subtitle ?? "Snapshot"} />
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, minmax(0, 1fr))` }}
      >
        {tiles.map((tile) => (
          <TileCard key={tile.id} tile={tile} />
        ))}
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}

function TileCard({ tile }: { tile: KpiTile }) {
  const tone = TONE_STYLES[tile.tone ?? "neutral"];
  const DeltaIcon = inferDeltaIcon(tile.delta);

  return (
    <div className={`rounded-lg border border-[var(--border)] border-l-4 ${tone.border} bg-[var(--background)] p-3.5`}>
      <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--secondary)]">
        {tile.label}
      </div>
      <div className="mt-1 text-[24px] font-display font-bold leading-none text-[var(--foreground)] tabular-nums">
        {tile.value}
      </div>
      {tile.delta && (
        <div className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold ${tone.deltaText}`}>
          {DeltaIcon && <DeltaIcon className="h-3 w-3" strokeWidth={2.5} />}
          {tile.delta}
        </div>
      )}
      {tile.spark && tile.spark.length >= 2 && (
        <Sparkline data={tile.spark} color={tone.spark} />
      )}
    </div>
  );
}

function inferDeltaIcon(delta?: string) {
  if (!delta) return null;
  if (/^[▲↑+]|\+\d|up\b/i.test(delta)) return TrendingUp;
  if (/^[▼↓-]|^-\d|down\b/i.test(delta)) return TrendingDown;
  return Minus;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 120;
  const H = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="block w-full mt-2" style={{ height: H }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
