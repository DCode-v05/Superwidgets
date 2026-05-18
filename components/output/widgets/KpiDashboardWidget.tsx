"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KpiDashboardPayload, KpiTile, KpiTone, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

const TONE_STYLES: Record<KpiTone, { border: string; deltaText: string; spark: string }> = {
  good: { border: "border-l-green-500", deltaText: "text-green-600 dark:text-green-400", spark: "#22c55e" },
  warn: { border: "border-l-amber-500", deltaText: "text-amber-600 dark:text-amber-400", spark: "#f59e0b" },
  bad: { border: "border-l-red-500", deltaText: "text-red-600 dark:text-red-400", spark: "#ef4444" },
  neutral: { border: "border-l-[var(--border)]", deltaText: "text-[var(--secondary)]", spark: "#9CA3AF" },
};

export function KpiDashboardWidget({ payload, actions }: { payload: KpiDashboardPayload; actions?: WidgetAction[] }) {
  const tiles = payload?.tiles ?? [];
  const cols = tiles.length >= 4 ? 4 : tiles.length === 1 ? 1 : tiles.length === 2 ? 2 : 3;
  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title} subtitle={payload?.subtitle ?? "Dashboard"} />
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, minmax(0, 1fr))` }}>
        {tiles.map((t) => <TileCard key={t.id} tile={t} />)}
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}

function TileCard({ tile }: { tile: KpiTile }) {
  const t = TONE_STYLES[tile.tone ?? "neutral"];
  const DeltaIcon = inferIcon(tile.delta);
  return (
    <div className={`rounded-lg border border-[var(--border)] border-l-4 ${t.border} bg-[var(--background)] p-3.5`}>
      <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--secondary)]">{tile.label}</div>
      <div className="mt-1 text-[24px] font-display font-bold leading-none text-[var(--foreground)] tabular-nums">{tile.value}</div>
      {tile.delta && (
        <div className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold ${t.deltaText}`}>
          {DeltaIcon && <DeltaIcon className="h-3 w-3" strokeWidth={2.5} />}
          {tile.delta}
        </div>
      )}
      {tile.spark && tile.spark.length >= 2 && <Sparkline data={tile.spark} color={t.spark} />}
    </div>
  );
}

function inferIcon(delta?: string) {
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
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * W).toFixed(1)},${(H - ((v - min) / range) * (H - 4) - 2).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="block w-full mt-2" style={{ height: H }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
