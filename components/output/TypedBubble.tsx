"use client";

import type { TypedWidget } from "@/lib/types/widgets-typed";
import { renderTypedWidget } from "./widgets/registry";

/**
 * Bubble container for typed-widget mode. Walks the list of typed widgets
 * the engine emitted in this turn and dispatches each through the registry.
 * Multiple widgets per turn are supported (e.g. chart followed by chips).
 */
export function TypedBubble({ widgets }: { widgets: TypedWidget[] }) {
  if (!widgets || widgets.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {widgets.map((w) => (
        <div key={w.id}>{renderTypedWidget(w)}</div>
      ))}
    </div>
  );
}
