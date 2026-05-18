"use client";

import type { MindMapPayload, MindMapNode, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

const W = 640;
const H = 400;

export function MindMapWidget({ payload, actions }: { payload: MindMapPayload; actions?: WidgetAction[] }) {
  const root = payload?.root;
  if (!root) {
    return (
      <WidgetShell>
        <WidgetHeader title={payload?.title} />
        <div className="rounded-lg border border-dashed border-[var(--border)] py-6 text-center text-[12px] text-[var(--secondary)]">Empty mind map</div>
      </WidgetShell>
    );
  }
  const children = root.children ?? [];
  const cx = W / 2;
  const cy = H / 2;
  const radius = 180;
  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title} subtitle="Mind map" />
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
        <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="block w-full h-auto">
          {children.map((child, i) => {
            const angle = (i / Math.max(children.length, 1)) * Math.PI * 2 - Math.PI / 2;
            const lx = cx + Math.cos(angle) * radius;
            const ly = cy + Math.sin(angle) * radius;
            return (
              <g key={child.id}>
                <line x1={cx} y1={cy} x2={lx} y2={ly} className="stroke-[var(--border)]" strokeWidth="1" />
                <ellipse cx={lx} cy={ly} rx={70} ry={22} className="fill-[var(--surface)] stroke-[var(--border)]" strokeWidth="1" />
                <text x={lx} y={ly + 4} textAnchor="middle" fontSize="12" fontWeight="600" className="fill-[var(--foreground)]">
                  {truncate(child.label, 18)}
                </text>
                {(child.children ?? []).slice(0, 3).map((sub, j) => {
                  const subAngle = angle + (j - 1) * 0.18;
                  const sx = lx + Math.cos(subAngle) * 110;
                  const sy = ly + Math.sin(subAngle) * 60;
                  return (
                    <g key={sub.id}>
                      <line x1={lx} y1={ly} x2={sx} y2={sy} className="stroke-[var(--border)]" strokeWidth="0.75" />
                      <text x={sx} y={sy} textAnchor="middle" fontSize="10" className="fill-[var(--secondary)]">
                        {truncate(sub.label, 14)}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
          {/* Root last so it sits on top */}
          <ellipse cx={cx} cy={cy} rx={90} ry={34} fill="#EC3B4A" />
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">
            {truncate(root.label, 18)}
          </text>
        </svg>
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
