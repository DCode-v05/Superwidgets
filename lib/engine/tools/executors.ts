import type { ToolCall, ToolResult } from "./types";
import { listIntents, getSkill } from "./widget-library";
import { validateWidget } from "./validate";

export interface FinalRender {
  html: string;
  prose: string | null;
}

export interface ExecuteResult {
  result: ToolResult;
  finalRender?: FinalRender;
}

export function executeTool(call: ToolCall): ExecuteResult {
  try {
    switch (call.name) {
      case "build_widget":
        return runBuild(call);
      case "submit_widget":
        return runSubmit(call);
      default:
        return {
          result: errorResult(
            call,
            `Unknown tool "${call.name}". Available: build_widget, submit_widget.`,
          ),
        };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { result: errorResult(call, `Tool threw: ${msg}`) };
  }
}

const SENTINEL_START = "<!--bap-widget:start-->";
const SENTINEL_END = "<!--bap-widget:end-->";

function runBuild(call: ToolCall): ExecuteResult {
  const intent = String(call.input.intent ?? "").trim();
  if (!intent) {
    return { result: errorResult(call, `"intent" is required.`) };
  }
  const skill = getSkill(intent);
  if (!skill) {
    return {
      result: errorResult(
        call,
        `Unknown intent "${intent}". Valid: ${listIntents().join(", ")}.`,
      ),
    };
  }

  const lines: string[] = [
    `intent: ${intent}`,
    `design_note: ${skill.designNote}`,
  ];

  const reminders: string[] = [];
  if (skill.needsInteractivity) {
    const formNote =
      skill.intent === "quiz" || skill.intent === "form" ? " + <form>" : "";
    reminders.push(
      `Uses <script>${formNote}. IIFE wrap · unique root id="bap-w-..." · ` +
        `null-guard every querySelector · .value on <input>/<select>/<textarea>, ` +
        `.textContent on <div>/<span> · "input" event for live updates · ` +
        `no fetch/XHR/eval.`,
    );
  }
  if (skill.intent === "quiz" || skill.intent === "form") {
    reminders.push(`Form submit handler MUST call e.preventDefault() at the top.`);
  }
  if (skill.intent === "source_cards") {
    reminders.push(`<a href> is allowed in this widget ONLY.`);
  }
  if (skill.intent === "confirm_card") {
    reminders.push(`The confirm/proceed button MUST have data-bap-confirm.`);
  }

  reminders.push(
    skill.intent === "source_cards"
      ? `CLICK TARGET: each citation anchor MUST have target="_blank" rel="noopener" so it opens in a new tab.`
      : `CLICK TARGET: include at least one data-bap-prompt="..." on the natural per-item target ` +
        `(button / row / card / SVG node / table cell). Add cursor:pointer.`,
  );

  if (reminders.length > 0) {
    lines.push(`reminders:`);
    for (const r of reminders) lines.push(`  - ${r}`);
  }
  lines.push(``, `→ Compose HTML now, then call submit_widget.`);

  return {
    result: { toolCallId: call.id, name: call.name, content: lines.join("\n"), isError: false },
  };
}

function runSubmit(call: ToolCall): ExecuteResult {
  const intent = String(call.input.intent ?? "").trim();
  const html = String(call.input.html ?? "");
  const proseRaw = call.input.prose;
  const prose =
    typeof proseRaw === "string" && proseRaw.trim().length > 0
      ? proseRaw.trim()
      : null;

  const earlyIssues: string[] = [];

  if (!intent) earlyIssues.push(`"intent" is required.`);
  else if (!getSkill(intent)) {
    earlyIssues.push(
      `Unknown intent "${intent}". Valid: ${listIntents().join(", ")}.`,
    );
  }
  if (!html) earlyIssues.push(`"html" is required.`);
  if (
    html &&
    (!html.includes(SENTINEL_START) || !html.includes(SENTINEL_END))
  ) {
    earlyIssues.push(
      `HTML missing sentinels. Wrap in ${SENTINEL_START} … ${SENTINEL_END}.`,
    );
  }

  if (earlyIssues.length > 0) {
    return {
      result: rejectResult(
        call,
        earlyIssues,
        [],
        `submit_widget rejected — fix and call submit_widget AGAIN with corrected input.`,
      ),
    };
  }

  const v = validateWidget(html);
  if (!v.valid) {
    return {
      result: rejectResult(
        call,
        v.issues,
        v.warnings,
        `submit_widget rejected — fix issues above and call submit_widget AGAIN.`,
      ),
    };
  }

  return {
    result: {
      toolCallId: call.id,
      name: call.name,
      content: [
        `valid: true`,
        `intent: ${intent}`,
        `bytes: ${extractInner(html).length}`,
        ...(v.warnings.length > 0
          ? ["warnings:", ...v.warnings.map((w) => `  - ${w}`)]
          : []),
        ``,
        `accepted — widget rendered. Loop ends.`,
      ].join("\n"),
      isError: false,
    },
    finalRender: { html, prose },
  };
}

function rejectResult(
  call: ToolCall,
  issues: string[],
  warnings: string[],
  nextStep: string,
): ToolResult {
  const lines = [`valid: false`];
  if (issues.length > 0) {
    lines.push(`issues:`);
    for (const i of issues) lines.push(`  - ${i}`);
  }
  if (warnings.length > 0) {
    lines.push(`warnings:`);
    for (const w of warnings) lines.push(`  - ${w}`);
  }
  lines.push(``, `→ ${nextStep}`);
  return {
    toolCallId: call.id,
    name: call.name,
    content: lines.join("\n"),
    isError: false,
  };
}

function extractInner(raw: string): string {
  const i = raw.indexOf(SENTINEL_START);
  const j = raw.indexOf(SENTINEL_END);
  if (i === -1 || j === -1 || j <= i) return raw;
  return raw.slice(i + SENTINEL_START.length, j).trim();
}

function errorResult(call: ToolCall, message: string): ToolResult {
  return {
    toolCallId: call.id,
    name: call.name,
    content: message,
    isError: true,
  };
}
