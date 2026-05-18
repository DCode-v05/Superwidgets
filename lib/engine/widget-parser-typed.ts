import type { EngineEvent } from "@/lib/types/engine-widgets";
import { isWidgetKind, type TypedWidget } from "@/lib/types/widgets-typed";

/**
 * Parser for the typed-widget output contract.
 *
 *   <ui-widget kind="chart" id="wgt_1">
 *     { "type": "bar", "data": [...], ... }
 *   </ui-widget>
 *
 * Behaviour mirrors the freeform widget-parser: everything outside the
 * sentinels streams as `text_delta`; everything between them is buffered and
 * emitted as a single `typed_widget` event once `</ui-widget>` is seen.
 *
 * Multiple widgets per turn are supported — the parser flips back to TEXT
 * after each close tag and looks for the next `<ui-widget ...>`.
 */

const OPEN_RE = /<ui-widget\s+([^>]+)>/i;
const CLOSE = "</ui-widget>";
const SAFETY_TAIL = 64;

function parseAttrs(raw: string): { kind: string; id: string } {
  const kind = (raw.match(/kind=["']([^"']+)["']/i)?.[1] ?? "").trim();
  const id = (raw.match(/id=["']([^"']+)["']/i)?.[1] ?? "").trim();
  return { kind, id };
}

export async function* runTypedWidgetParser(
  tokens: AsyncIterable<string>,
): AsyncGenerator<EngineEvent> {
  type State = "TEXT" | "WIDGET";
  let state: State = "TEXT";
  let buffer = "";
  let widgetBuffer = "";
  let currentKind = "";
  let currentId = "";

  for await (const token of tokens) {
    buffer += token;

    let progress = true;
    while (progress) {
      progress = false;

      if (state === "TEXT") {
        const m = buffer.match(OPEN_RE);
        if (!m || m.index === undefined) {
          // No open tag yet — flush all but a small tail so we don't slice the next match in half
          if (buffer.length > SAFETY_TAIL) {
            const flush = buffer.slice(0, buffer.length - SAFETY_TAIL);
            if (flush) yield { type: "text_delta", text: flush };
            buffer = buffer.slice(buffer.length - SAFETY_TAIL);
          }
          break;
        }

        if (m.index > 0) {
          yield { type: "text_delta", text: buffer.slice(0, m.index) };
        }
        const { kind, id } = parseAttrs(m[1]);
        currentKind = kind;
        currentId = id || `wgt_${Date.now().toString(36)}`;
        buffer = buffer.slice(m.index + m[0].length);
        state = "WIDGET";
        widgetBuffer = "";
        progress = true;
      } else {
        const idx = buffer.indexOf(CLOSE);
        if (idx === -1) {
          if (buffer.length > SAFETY_TAIL) {
            const flush = buffer.length - SAFETY_TAIL;
            widgetBuffer += buffer.slice(0, flush);
            buffer = buffer.slice(flush);
          }
          break;
        }
        widgetBuffer += buffer.slice(0, idx);
        buffer = buffer.slice(idx + CLOSE.length);

        const raw = widgetBuffer.trim();
        const widget = tryParseWidget(currentKind, currentId, raw);
        if (widget) {
          yield { type: "typed_widget", widget };
        } else {
          yield {
            type: "error",
            message: `Failed to parse widget kind="${currentKind}" id="${currentId}" — bad JSON or unknown kind. Raw: ${raw.slice(0, 240)}`,
          };
        }

        widgetBuffer = "";
        state = "TEXT";
        progress = true;
      }
    }
  }

  if (state === "TEXT" && buffer) {
    yield { type: "text_delta", text: buffer };
    return;
  }

  if (state === "WIDGET") {
    // Same recovery story as the HTML parser, but here the partial buffer
    // is JSON-shaped so emitting it as widget_html would render garbage.
    // We only surface a structured error and skip the partial.
    yield {
      type: "error",
      message:
        `Unclosed widget block (no </ui-widget> seen) — kind="${currentKind}". ` +
        "The model's response was truncated mid-widget, most likely because output hit the max_tokens limit. " +
        "Try a shorter prompt or switch to a model with a higher output cap.",
    };
  }
}

function tryParseWidget(kind: string, id: string, raw: string): TypedWidget | null {
  if (!isWidgetKind(kind)) return null;
  // Strip a leading "json" hint or markdown fence the model may emit despite instructions
  let body = raw;
  body = body.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  body = body.trim();
  if (!body) return null;

  try {
    const parsed = JSON.parse(body) as { payload?: unknown; actions?: unknown } & Record<string, unknown>;
    // Two accepted shapes:
    //   { payload: {...}, actions?: [...] }            (preferred, explicit)
    //   { ...payload fields..., actions?: [...] }      (shorthand — payload is the whole object)
    if ("payload" in parsed && parsed.payload !== undefined) {
      return {
        id,
        kind,
        payload: parsed.payload,
        actions: Array.isArray(parsed.actions) ? (parsed.actions as TypedWidget["actions"]) : undefined,
      };
    }
    const { actions, ...rest } = parsed;
    return {
      id,
      kind,
      payload: rest,
      actions: Array.isArray(actions) ? (actions as TypedWidget["actions"]) : undefined,
    };
  } catch {
    return null;
  }
}
