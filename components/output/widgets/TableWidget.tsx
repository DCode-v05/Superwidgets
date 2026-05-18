"use client";

import type { TablePayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

/**
 * Table — structured comparison or feature matrix. Native HTML <table>
 * (no @tanstack/react-table — overkill for read-only widgets). Supports
 * per-cell highlight via `payload.highlight` so the LLM can call out the
 * "winning" cell in each row.
 */
export function TableWidget({
  payload,
  actions,
}: {
  payload: TablePayload;
  actions?: WidgetAction[];
}) {
  const columns = payload?.columns ?? [];
  const rows = payload?.rows ?? [];
  const highlights = new Map<number, Set<string>>();
  for (const h of payload?.highlight ?? []) {
    highlights.set(h.row, new Set(h.columns));
  }

  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title} subtitle={payload?.subtitle ? "Comparison" : undefined} />
      {payload?.subtitle && (
        <p className="-mt-2 mb-3 text-[12px] text-[var(--secondary)]">{payload.subtitle}</p>
      )}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={
                    "px-3.5 py-2.5 font-semibold text-[var(--foreground)] border-b border-[var(--border)] " +
                    alignClass(col.align)
                  }
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const hl = highlights.get(i);
              return (
                <tr key={i} className={i % 2 === 1 ? "bg-[var(--background)]/40" : ""}>
                  {columns.map((col) => {
                    const isHL = hl?.has(col.id);
                    const value = row[col.id];
                    return (
                      <td
                        key={col.id}
                        className={
                          "px-3.5 py-2.5 border-t border-[var(--border)] " +
                          alignClass(col.align) +
                          " " +
                          (isHL ? "text-accent font-semibold" : "text-[var(--foreground)]")
                        }
                      >
                        {renderCell(value, col.type)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}

function alignClass(a: "left" | "right" | "center" | undefined): string {
  if (a === "right") return "text-right";
  if (a === "center") return "text-center";
  return "text-left";
}

function renderCell(value: string | number | boolean, type?: string): React.ReactNode {
  if (typeof value === "boolean" || type === "boolean") {
    const v = typeof value === "boolean" ? value : value === "true" || value === 1;
    return v ? <span className="text-green-600 dark:text-green-400">✓</span> : <span className="text-[var(--secondary)] opacity-60">—</span>;
  }
  if (type === "badge" && typeof value === "string") {
    return (
      <span className="inline-block rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px]">
        {value}
      </span>
    );
  }
  return String(value ?? "");
}
