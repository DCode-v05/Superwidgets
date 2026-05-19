import type { ToolDefinition } from "./types";
import { WIDGET_INTENTS } from "./widget-library";

/**
 * Two tools, two phases:
 *
 *   PHASE 1: BUILD   →  build_widget(intent)            cheap pre-flight
 *   PHASE 2: SUBMIT  →  submit_widget(intent, html, …)  validates + renders (terminal)
 *
 * `build_widget` is intentionally HTML-free — it returns the chosen skill's
 * design note + interactivity reminders so the agent composes with the right
 * rules in mind. Cost: ~10 tokens to call, ~50 tokens to read. Cheap.
 *
 * `submit_widget` is the only tool that takes HTML — so the model writes
 * the widget HTML exactly once per attempt. Validates everything in one pass.
 * Terminal IF valid; returns issues for the agent to fix otherwise.
 */

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "build_widget",
    description:
      "PHASE 1 — Pre-flight. Pass the widget intent you've decided on. " +
      "Returns the skill's design note + skill-specific reminders (script " +
      "safety, special attributes, etc). HTML-free — costs only ~10 output " +
      "tokens. Call this BEFORE submit_widget so you have the design " +
      "context fresh when composing HTML.",
    input_schema: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          enum: [...WIDGET_INTENTS],
          description: "The widget skill you've chosen from the 20-item catalog.",
        },
      },
      required: ["intent"],
    },
  },
  {
    name: "submit_widget",
    description:
      "PHASE 2 — Submit a widget. Validates intent + HTML structure + " +
      "script safety in one pass. If valid → renders + ENDS the loop " +
      "(terminal). If invalid → returns {valid:false, issues}, agent " +
      "loops back with fixed HTML in the next call.",
    input_schema: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          enum: [...WIDGET_INTENTS],
          description: "Same intent passed to build_widget.",
        },
        html: {
          type: "string",
          description:
            "Full widget HTML INCLUDING <!--bap-widget:start--> and " +
            "<!--bap-widget:end--> sentinel comments. Build a complete, " +
            "considered widget with rich hierarchy, multiple sections, " +
            "and the structural / typographic tools the system prompt " +
            "describes. Use CSS shorthand for code-side neatness.",
        },
        prose: {
          type: "string",
          description: "Optional ONE-sentence preamble shown above the widget. Omit if redundant.",
        },
      },
      required: ["intent", "html"],
    },
    terminal: true,
  },
];

export function getToolDefinition(name: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.name === name);
}
