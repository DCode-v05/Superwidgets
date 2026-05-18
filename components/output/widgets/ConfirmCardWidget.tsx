"use client";

import { ShieldAlert } from "lucide-react";
import type { ConfirmCardPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips } from "./shared";

export function ConfirmCardWidget({
  payload,
  actions,
}: {
  payload: ConfirmCardPayload;
  actions?: WidgetAction[];
}) {
  const danger = payload?.tone !== "neutral";
  return (
    <div
      className={
        "rounded-xl border-2 p-4 " +
        (danger ? "border-red-500/40 bg-red-500/[0.04]" : "border-[var(--border)] bg-[var(--surface)]")
      }
    >
      <div className="flex items-start gap-3 mb-3">
        <ShieldAlert
          className={`h-5 w-5 mt-0.5 shrink-0 ${danger ? "text-red-600 dark:text-red-400" : "text-[var(--foreground)]"}`}
          strokeWidth={1.75}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-[var(--foreground)] leading-snug">
            {payload?.title ?? "Confirm action"}
          </div>
          {payload?.body && (
            <div className="mt-0.5 text-[12px] text-[var(--secondary)] leading-relaxed">{payload.body}</div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-bap-prompt={payload?.proceed?.prompt ?? "Confirmed — proceed"}
          data-bap-confirm=""
          className={
            "inline-flex items-center justify-center rounded-md px-4 py-1.5 text-[12px] font-semibold cursor-pointer transition-colors " +
            (danger ? "bg-red-600 text-white hover:bg-red-700" : "bg-accent text-white hover:bg-accent/90")
          }
        >
          {payload?.proceed?.label ?? "Proceed"}
        </button>
        {payload?.cancel && (
          <button
            type="button"
            data-bap-prompt={payload.cancel.prompt}
            className="inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-transparent px-4 py-1.5 text-[12px] font-semibold text-[var(--foreground)] cursor-pointer hover:border-accent transition-colors"
          >
            {payload.cancel.label}
          </button>
        )}
      </div>
      {actions && actions.length > 0 && <ActionChips actions={actions} />}
    </div>
  );
}
