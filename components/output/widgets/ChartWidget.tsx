"use client";

import { useMemo } from "react";
import type { ChartPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

/**
 * Chart — inline-SVG bar / line / area. No external library: the renderer
 * computes the geometry from the typed payload so the model never has to
 * do SVG math itself. Multi-series supported via `payload.series`.
 *
 * viewBox is the canonical 400×220 BAP chart size. Padding leaves room for
 * y-axis labels (left 44) and x-axis labels (bottom 28).
 */

const W = 400;
const H = 220;
const PADDING = { left: 44, right: 16, top: 16, bottom: 28 };
const PLOT_W = W - PADDING.left - PADDING.right;
const PLOT_H = H - PADDING.top - PADDING.bottom;
const DEFAULT_COLORS = ["#EC3B4A", "#374151", "#9CA3AF"];

export function ChartWidget({
  payload,
  actions,
}: {
  payload: ChartPayload;
  actions?: WidgetAction[];
}) {
  const data = payload?.data ?? [];
  const series = payload?.series ?? [];
  const chartType = payload?.type ?? "line";

  const geometry = useMemo(() => {
    if (data.length === 0 || series.length === 0) return null;

    const allValues: number[] = [];
    for (const row of data) {
      for (const s of series) {
        const v = Number(row[s.key]);
        if (Number.isFinite(v)) allValues.push(v);
      }
    }
    if (allValues.length === 0) return null;

    const max = Math.max(...allValues);
    const min = Math.min(0, Math.min(...allValues));
    const range = max - min || 1;

    const xs = data.map((_, i) =>
      data.length === 1 ? PADDING.left + PLOT_W / 2 : PADDING.left + (i / (data.length - 1)) * PLOT_W,
    );
    const yFor = (v: number) => PADDING.top + PLOT_H - ((v - min) / range) * PLOT_H;

    const gridlines: number[] = [];
    const tickCount = 5;
    for (let i = 0; i < tickCount; i++) {
      gridlines.push(min + (range * i) / (tickCount - 1));
    }

    return { xs, yFor, gridlines, min, max };
  }, [data, series]);

  if (!geometry) {
    return (
      <WidgetShell>
        <WidgetHeader title={payload?.title} subtitle={payload?.subtitle} />
        <div className="rounded-lg border border-dashed border-[var(--border)] py-8 text-center text-[12px] text-[var(--secondary)]">
          No chart data
        </div>
      </WidgetShell>
    );
  }

  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title} subtitle={payload?.subtitle} />
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-auto"
          role="img"
          aria-label={payload?.title ?? "chart"}
        >
          {/* Gridlines + y-axis labels */}
          {geometry.gridlines.map((v, i) => {
            const y = geometry.yFor(v);
            return (
              <g key={i}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={W - PADDING.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-[var(--border)]"
                  strokeWidth="1"
                />
                <text
                  x={PADDING.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[var(--secondary)]"
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                >
                  {formatTick(v)}
                </text>
              </g>
            );
          })}

          {/* x-axis labels */}
          {data.map((row, i) => (
            <text
              key={i}
              x={geometry.xs[i]}
              y={H - PADDING.bottom + 14}
              textAnchor="middle"
              className="fill-[var(--secondary)]"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
            >
              {String(row[payload.x_key] ?? "")}
            </text>
          ))}

          {/* Series */}
          {series.map((s, sIdx) => {
            const color = s.color ?? DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length];
            const points = data.map((row, i) => ({
              x: geometry.xs[i],
              y: geometry.yFor(Number(row[s.key]) || 0),
            }));

            if (chartType === "bar") {
              const barW = Math.max(2, (PLOT_W / data.length) * 0.7 / series.length);
              const groupOffset = ((PLOT_W / data.length) * 0.7) / 2;
              return points.map((p, i) => {
                const baseline = geometry.yFor(geometry.min < 0 ? 0 : geometry.min);
                const top = Math.min(p.y, baseline);
                const height = Math.abs(p.y - baseline);
                return (
                  <rect
                    key={`${s.key}-${i}`}
                    x={p.x - groupOffset + sIdx * barW}
                    y={top}
                    width={barW}
                    height={height}
                    fill={color}
                    rx={1.5}
                  />
                );
              });
            }

            const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
            const areaPath =
              `M ${points[0].x} ${geometry.yFor(geometry.min < 0 ? 0 : geometry.min)} ` +
              points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
              ` L ${points[points.length - 1].x} ${geometry.yFor(geometry.min < 0 ? 0 : geometry.min)} Z`;
            return (
              <g key={s.key}>
                {chartType === "area" && <path d={areaPath} fill={color} fillOpacity={0.18} />}
                <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={2.75} fill={color} />
                ))}
              </g>
            );
          })}
        </svg>

        {series.length > 1 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 px-1 text-[11px] text-[var(--secondary)]">
            {series.map((s, i) => (
              <span key={s.key} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                />
                {s.label ?? s.key}
              </span>
            ))}
            {payload.y_unit && <span className="opacity-60 ml-auto font-mono">{payload.y_unit}</span>}
          </div>
        )}
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}

function formatTick(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}
