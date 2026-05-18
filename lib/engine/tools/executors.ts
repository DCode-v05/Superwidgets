import type { ToolCall, ToolResult } from "./types";
import { listIntents } from "./widget-library";
import { validateWidget } from "./validate";
import { classifyPrompt } from "./classify";
import { chooseWidget } from "./choose";

/**
 * Tool dispatch. Each phase has built-in verification:
 *   - classify_prompt sanity-checks the classification
 *   - choose_widget verifies the widget exists
 *   - validate_widget runs structural checks on the HTML
 *   - render_widget re-validates as a final guard
 *
 * For the terminal tool `render_widget`, also returns a `finalRender`
 * payload — run-engine uses this to emit the widget event and end the loop.
 */

export interface FinalRender {
  html: string;
  prose: string | null;
}

export interface ExecuteResult {
  result: ToolResult;
  /** Only set when render_widget — signals the loop to terminate. */
  finalRender?: FinalRender;
}

export function executeTool(call: ToolCall): ExecuteResult {
  try {
    switch (call.name) {
      case "classify_prompt":
        return runClassify(call);
      case "choose_widget":
        return runChoose(call);
      case "validate_widget":
        return runValidate(call);
      case "render_widget":
        return runRender(call);
      default:
        return {
          result: errorResult(
            call,
            `Unknown tool "${call.name}". Available: classify_prompt, choose_widget, validate_widget, render_widget.`,
          ),
        };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { result: errorResult(call, `Tool threw: ${msg}`) };
  }
}

function runClassify(call: ToolCall): ExecuteResult {
  const r = classifyPrompt({
    prompt: String(call.input.prompt ?? ""),
    intent_description: String(call.input.intent_description ?? ""),
    needs_interactivity: Boolean(call.input.needs_interactivity),
    domain: call.input.domain != null ? String(call.input.domain) : undefined,
    complexity: call.input.complexity != null ? String(call.input.complexity) : undefined,
  });

  if (!r.ok) {
    return {
      result: errorResult(call, `classify_prompt rejected:\n${r.issues.map((i) => `  - ${i}`).join("\n")}`),
    };
  }

  const lines: string[] = [
    `ok: true`,
    `interpretation: "${r.echoed.intent_description}"`,
    `needs_interactivity: ${r.echoed.needs_interactivity}`,
  ];
  if (r.echoed.domain) lines.push(`domain: ${r.echoed.domain}`);
  if (r.echoed.complexity) lines.push(`complexity: ${r.echoed.complexity}`);
  lines.push(``, `suggested_widgets:`);
  for (const s of r.suggested_widgets) {
    lines.push(`  - ${s.intent}  (${s.reason})`);
  }
  if (r.notes.length > 0) {
    lines.push(``, `notes:`);
    for (const n of r.notes) lines.push(`  - ${n}`);
  }
  lines.push(``, `→ Next: call choose_widget with one of the suggested widgets.`);

  return {
    result: { toolCallId: call.id, name: call.name, content: lines.join("\n"), isError: false },
  };
}

function runChoose(call: ToolCall): ExecuteResult {
  const r = chooseWidget({
    widget: String(call.input.widget ?? ""),
    reasoning: String(call.input.reasoning ?? ""),
  });

  if (!r.ok || !r.chosen) {
    const issues = r.issues.length > 0
      ? r.issues.map((i) => `  - ${i}`).join("\n")
      : `  - Unknown failure. Valid widgets: ${listIntents().join(", ")}`;
    return { result: errorResult(call, `choose_widget rejected:\n${issues}`) };
  }

  const lines: string[] = [
    `chosen: ${r.chosen}`,
    `design_note: ${r.design_note}`,
    ``,
    `reference_html (INSPIRATION ONLY — vary the aesthetic):`,
    r.reference_html ?? "",
  ];
  if (r.reminders.length > 0) {
    lines.push(``, `reminders:`);
    for (const rem of r.reminders) lines.push(`  - ${rem}`);
  }
  lines.push(``, `→ Next: compose your widget HTML, then call validate_widget.`);

  return {
    result: { toolCallId: call.id, name: call.name, content: lines.join("\n"), isError: false },
  };
}

function runValidate(call: ToolCall): ExecuteResult {
  const html = String(call.input.html ?? "");
  if (!html) {
    return { result: errorResult(call, `Required parameter "html" was empty.`) };
  }
  const v = validateWidget(html);
  const lines = [`valid: ${v.valid}`, `summary: ${v.summary}`];
  if (v.issues.length > 0) {
    lines.push("issues:");
    for (const i of v.issues) lines.push(`  - ${i}`);
  }
  if (v.warnings.length > 0) {
    lines.push("warnings:");
    for (const w of v.warnings) lines.push(`  - ${w}`);
  }
  if (v.valid) {
    lines.push(``, `→ Next: call render_widget with the same html.`);
  } else {
    lines.push(``, `→ Next: fix issues above and call validate_widget AGAIN.`);
  }
  return {
    result: { toolCallId: call.id, name: call.name, content: lines.join("\n"), isError: false },
  };
}

function runRender(call: ToolCall): ExecuteResult {
  const html = String(call.input.html ?? "");
  const proseRaw = call.input.prose;
  const prose =
    typeof proseRaw === "string" && proseRaw.trim().length > 0
      ? proseRaw.trim()
      : null;

  if (!html) {
    return { result: errorResult(call, `Required parameter "html" was empty.`) };
  }

  // Final guard — terminal tool re-validates
  const v = validateWidget(html);
  if (!v.valid) {
    return {
      result: errorResult(
        call,
        `render_widget rejected — HTML has issues. Call validate_widget, fix, then retry:\n` +
          v.issues.map((i) => `  - ${i}`).join("\n"),
      ),
    };
  }

  return {
    result: {
      toolCallId: call.id,
      name: call.name,
      content: `accepted: true — widget sent to user. Loop ends.`,
      isError: false,
    },
    finalRender: { html, prose },
  };
}

function errorResult(call: ToolCall, message: string): ToolResult {
  return {
    toolCallId: call.id,
    name: call.name,
    content: message,
    isError: true,
  };
}
