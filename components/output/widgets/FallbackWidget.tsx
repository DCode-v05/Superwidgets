"use client";

import { AlertCircle } from "lucide-react";
import type { TypedWidget } from "@/lib/types/widgets-typed";

/**
 * Catch-all renderer for unknown widget kinds OR for kinds that exist in
 * the registry but failed to render. Shows the payload as collapsed JSON so
 * the user (and any debugging engineer) can see what the model emitted.
 */
export function FallbackWidget({ widget }: { widget: TypedWidget }) {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/[0.06] px-3.5 py-2.5">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-amber-800 dark:text-amber-300 leading-snug">
            Unknown widget kind: <span className="font-mono">{widget.kind}</span>
          </div>
          <details className="mt-1.5">
            <summary className="text-[11px] text-amber-700/85 dark:text-amber-300/80 cursor-pointer select-none">
              Show payload
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-amber-500/10 p-2 text-[11px] font-mono leading-relaxed text-amber-900 dark:text-amber-200">
              {JSON.stringify(widget.payload, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
