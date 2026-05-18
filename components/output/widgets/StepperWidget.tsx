"use client";

import { Check, Loader2 } from "lucide-react";
import type { StepperPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

export function StepperWidget({
  payload,
  actions,
}: {
  payload: StepperPayload;
  actions?: WidgetAction[];
}) {
  const steps = payload?.steps ?? [];
  return (
    <WidgetShell>
      <WidgetHeader subtitle="Plan" />
      <ol className="space-y-3">
        {steps.map((s, i) => {
          const status = s.status ?? "todo";
          return (
            <li key={s.id ?? i} className="flex gap-3">
              <div className="relative flex flex-col items-center">
                <div
                  className={
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-semibold font-mono " +
                    (status === "done"
                      ? "bg-accent border-accent text-white"
                      : status === "doing"
                        ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400"
                        : "bg-[var(--surface)] border-[var(--border)] text-[var(--secondary)]")
                  }
                >
                  {status === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : status === "doing" ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <span className="h-full w-px bg-[var(--border)] mt-1 grow" />
                )}
              </div>
              <div className="pb-3 flex-1">
                <div className="text-[13px] font-semibold text-[var(--foreground)] leading-snug">{s.title}</div>
                {s.body && <div className="text-[12px] text-[var(--secondary)] mt-0.5 leading-relaxed">{s.body}</div>}
              </div>
            </li>
          );
        })}
      </ol>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}
