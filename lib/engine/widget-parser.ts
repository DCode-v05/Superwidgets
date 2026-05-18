import type { EngineEvent } from "@/lib/types/engine-widgets";

const START = "<!--bap-widget:start-->";
const END = "<!--bap-widget:end-->";
const SAFETY_TAIL = Math.max(START.length, END.length);

/**
 * Parse an async stream of LLM text tokens into engine events.
 * Streams everything outside <!--bap-widget:start-->...<!--bap-widget:end-->
 * sentinels as text_delta. Buffers content between sentinels and emits a
 * single widget_html event per widget block. Tail-buffering handles sentinel
 * splits across token boundaries.
 */
export async function* runWidgetParser(
  tokens: AsyncIterable<string>,
): AsyncGenerator<EngineEvent> {
  type State = "TEXT" | "WIDGET";
  let state: State = "TEXT";
  let buffer = "";
  let widgetBuffer = "";

  for await (const token of tokens) {
    buffer += token;

    let progress = true;
    while (progress) {
      progress = false;

      if (state === "TEXT") {
        const idx = buffer.indexOf(START);
        if (idx === -1) {
          if (buffer.length > SAFETY_TAIL) {
            const flushLen = buffer.length - SAFETY_TAIL;
            const text = buffer.slice(0, flushLen);
            if (text) yield { type: "text_delta", text };
            buffer = buffer.slice(flushLen);
          }
          break;
        }
        if (idx > 0) {
          yield { type: "text_delta", text: buffer.slice(0, idx) };
        }
        buffer = buffer.slice(idx + START.length);
        state = "WIDGET";
        widgetBuffer = "";
        progress = true;
      } else {
        const idx = buffer.indexOf(END);
        if (idx === -1) {
          if (buffer.length > SAFETY_TAIL) {
            const flushLen = buffer.length - SAFETY_TAIL;
            widgetBuffer += buffer.slice(0, flushLen);
            buffer = buffer.slice(flushLen);
          }
          break;
        }
        widgetBuffer += buffer.slice(0, idx);
        buffer = buffer.slice(idx + END.length);
        yield { type: "widget_html", html: widgetBuffer.trim() };
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
    // Best-effort recovery: stream ended mid-widget (usually max_tokens hit).
    // Flush whatever HTML we already buffered as a widget so the partial
    // render is at least visible, THEN surface a structured error so the UI
    // banner can explain what happened.
    const partial = (widgetBuffer + buffer).trim();
    if (partial) {
      yield { type: "widget_html", html: partial };
    }
    yield {
      type: "error",
      message:
        "Unclosed widget block — the model's response was truncated before it could emit <!--bap-widget:end-->. " +
        "Most likely the output hit the max_tokens limit mid-widget. " +
        "Try a shorter prompt, switch to a model with a higher output cap, or use Typed mode (smaller payloads).",
    };
  }
}
