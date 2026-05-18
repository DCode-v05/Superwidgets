"use client";

import { useState } from "react";
import { Check, Square } from "lucide-react";
import type { ChecklistPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

export function ChecklistWidget({
  payload,
  actions,
}: {
  payload: ChecklistPayload;
  actions?: WidgetAction[];
}) {
  const items = payload?.items ?? [];
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.checked).map((i) => i.id)),
  );

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title ?? "Checklist"} subtitle="Checklist" />
      <ul className="space-y-2">
        {items.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-[var(--background)] transition-colors cursor-pointer"
              >
                <span
                  className={
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 " +
                    (isChecked ? "bg-accent border-accent" : "border-[var(--border)]")
                  }
                >
                  {isChecked ? (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  ) : (
                    <Square className="h-3 w-3 text-transparent" />
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span
                    className={
                      "block text-[13px] " +
                      (isChecked ? "text-[var(--secondary)] line-through" : "text-[var(--foreground)] font-medium")
                    }
                  >
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="block text-[11px] text-[var(--secondary)] mt-0.5">{item.description}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}
