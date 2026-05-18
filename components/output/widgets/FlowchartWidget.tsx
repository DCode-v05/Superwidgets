"use client";

import { useMemo } from "react";
import type { FlowchartPayload, FlowchartNode, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

const W = 600;
const H = 320;
const NODE_W = 110;
const NODE_H = 44;
const TONE: Record<NonNullable<FlowchartNode["tone"]>, { fill: string; stroke: string; text: string }> = {
  default: { fill: "var(--surface)", stroke: "var(--border)", text: "var(--foreground)" },
  accent: { fill: "rgba(236,59,74,0.10)", stroke: "#EC3B4A", text: "#EC3B4A" },
  good: { fill: "rgba(34,197,94,0.10)", stroke: "#22c55e", text: "#22c55e" },
  warn: { fill: "rgba(245,158,11,0.10)", stroke: "#f59e0b", text: "#b45309" },
  bad: { fill: "rgba(239,68,68,0.10)", stroke: "#ef4444", text: "#ef4444" },
};

export function FlowchartWidget({ payload, actions }: { payload: FlowchartPayload; actions?: WidgetAction[] }) {
  const layout = useMemo(() => layoutGraph(payload), [payload]);
  if (!layout) {
    return (
      <WidgetShell>
        <WidgetHeader title={payload?.title} />
        <div className="rounded-lg border border-dashed border-[var(--border)] py-8 text-center text-[12px] text-[var(--secondary)]">No nodes</div>
      </WidgetShell>
    );
  }
  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title} subtitle="Flow" />
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="block w-full h-auto min-w-[480px]">
          <defs>
            <marker id="fc-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" className="fill-[var(--secondary)]" />
            </marker>
          </defs>
          {layout.edges.map((e, i) => (
            <g key={i}>
              <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="currentColor" className="text-[var(--secondary)]" strokeWidth="1.5" markerEnd="url(#fc-arrow)" />
              {e.label && (
                <text x={(e.x1 + e.x2) / 2} y={(e.y1 + e.y2) / 2 - 4} textAnchor="middle" fontSize="9" fontFamily="ui-monospace, monospace" className="fill-[var(--secondary)]">{e.label}</text>
              )}
            </g>
          ))}
          {layout.nodes.map((n) => {
            const c = TONE[n.tone ?? "default"];
            const isDiamond = n.shape === "diamond";
            const isRound = n.shape === "round" || n.shape === "pill";
            return (
              <g key={n.id}>
                {isDiamond ? (
                  <polygon points={`${n.cx},${n.cy - NODE_H / 2} ${n.cx + NODE_W / 2},${n.cy} ${n.cx},${n.cy + NODE_H / 2} ${n.cx - NODE_W / 2},${n.cy}`} fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
                ) : (
                  <rect x={n.cx - NODE_W / 2} y={n.cy - NODE_H / 2} width={NODE_W} height={NODE_H} rx={isRound ? NODE_H / 2 : 6} fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
                )}
                <text x={n.cx} y={n.cy + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill={c.text}>{n.label.length > 14 ? n.label.slice(0, 13) + "…" : n.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}

function layoutGraph(payload: FlowchartPayload) {
  const nodes = payload?.nodes ?? [];
  const edges = payload?.edges ?? [];
  if (nodes.length === 0) return null;
  const incoming = new Map<string, string[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of edges) incoming.get(e.to)?.push(e.from);
  const ranks = new Map<string, number>();
  for (const n of nodes) if ((incoming.get(n.id) ?? []).length === 0) ranks.set(n.id, 0);
  for (let i = 0; i < 12; i++) {
    let changed = false;
    for (const e of edges) {
      const from = ranks.get(e.from);
      if (from === undefined) continue;
      const to = ranks.get(e.to);
      if (to === undefined || to <= from) { ranks.set(e.to, from + 1); changed = true; }
    }
    if (!changed) break;
  }
  for (const n of nodes) if (!ranks.has(n.id)) ranks.set(n.id, 0);
  const byRank = new Map<number, FlowchartNode[]>();
  for (const n of nodes) {
    const r = ranks.get(n.id) ?? 0;
    if (!byRank.has(r)) byRank.set(r, []);
    byRank.get(r)!.push(n);
  }
  const maxRank = Math.max(...ranks.values(), 0);
  const horizontal = (payload.direction ?? "LR") === "LR";
  const placed: Array<FlowchartNode & { cx: number; cy: number }> = [];
  for (let r = 0; r <= maxRank; r++) {
    const col = byRank.get(r) ?? [];
    col.forEach((n, idx) => {
      const cx = horizontal ? ((r + 1) * W) / (maxRank + 2) : ((idx + 1) * W) / (col.length + 1);
      const cy = horizontal ? ((idx + 1) * H) / (col.length + 1) : ((r + 1) * H) / (maxRank + 2);
      placed.push({ ...n, cx, cy });
    });
  }
  const byId = new Map(placed.map((n) => [n.id, n]));
  const drawnEdges = edges
    .map((e) => {
      const a = byId.get(e.from);
      const b = byId.get(e.to);
      if (!a || !b) return null;
      const dx = b.cx - a.cx;
      const dy = b.cy - a.cy;
      const len = Math.hypot(dx, dy) || 1;
      const off = Math.max(NODE_W, NODE_H) / 2 + 4;
      return { x1: a.cx + (dx / len) * (NODE_W / 2 + 2), y1: a.cy + (dy / len) * (NODE_H / 2 + 2), x2: b.cx - (dx / len) * off, y2: b.cy - (dy / len) * off, label: e.label };
    })
    .filter((e): e is { x1: number; y1: number; x2: number; y2: number; label?: string } => !!e);
  return { nodes: placed, edges: drawnEdges };
}
