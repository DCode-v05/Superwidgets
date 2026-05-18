"use client";

import type { DecisionCardPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

export function DecisionCardWidget({
  payload,
  actions,
}: {
  payload: DecisionCardPayload;
  actions?: WidgetAction[];
}) {
  const options = payload?.options ?? [];
  return (
    <WidgetShell>
      <WidgetHeader title={payload?.question ?? "Pick one"} subtitle="Decision" />
      <div className={`grid gap-3 ${options.length >= 2 ? "md:grid-cols-2" : ""}`}>
        {options.map((opt) => (
          <div
            key={opt.id}
            className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3.5"
          >
            <div>
              <div className="text-[14px] font-semibold text-[var(--foreground)]">{opt.title}</div>
              {opt.subtitle && (
                <div className="text-[11px] text-[var(--secondary)] mt-0.5">{opt.subtitle}</div>
              )}
            </div>
            {opt.pros && opt.pros.length > 0 && (
              <ul className="text-[12px] text-[var(--foreground)] space-y-0.5">
                {opt.pros.map((p, i) => (
                  <li key={i}>
                    <span className="text-green-600 dark:text-green-400 mr-1.5">+</span>
                    {p}
                  </li>
                ))}
              </ul>
            )}
            {opt.cons && opt.cons.length > 0 && (
              <ul className="text-[12px] text-[var(--secondary)] space-y-0.5">
                {opt.cons.map((p, i) => (
                  <li key={i}>
                    <span className="text-red-500 mr-1.5">−</span>
                    {p}
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              data-bap-prompt={opt.cta.prompt}
              className="mt-auto inline-flex items-center justify-center rounded-md bg-accent text-white px-3 py-1.5 text-[12px] font-semibold cursor-pointer hover:bg-accent/90 transition-colors"
            >
              {opt.cta.label}
            </button>
          </div>
        ))}
      </div>
      <ActionChips actions={actions} />
    </WidgetShell>
  );
}
