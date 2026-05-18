import type { ToolDefinition } from "./types";
import { WIDGET_INTENTS } from "./widget-library";

/**
 * The agent's tool catalog — four tools spanning three conceptual phases:
 *
 *   PHASE 1: CLASSIFY  →  classify_prompt   (analyze the user request)
 *   PHASE 2: CHOOSE    →  choose_widget     (pick the right widget skill)
 *   PHASE 3: IMPLEMENT →  validate_widget   (verify HTML) + render_widget (submit)
 *
 * Each tool also runs its own verification — so verification happens at
 * EVERY phase, not just at the end. classify_prompt sanity-checks the
 * classification; choose_widget checks the widget exists; validate_widget
 * runs the full structural check; render_widget re-validates as a final
 * guard before terminating the loop.
 */

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "classify_prompt",
    description:
      "PHASE 1 — CLASSIFY. Analyze the user's request and submit your read " +
      "of it. Pass the original prompt plus your interpretation: what kind " +
      "of intent it is, whether it needs interactivity (script/form), and " +
      "(optionally) domain and complexity. The tool VERIFIES your input " +
      "and returns a ranked shortlist of suggested widget skills to choose " +
      "from in the next phase. Call this FIRST for any non-trivial prompt. " +
      "You may skip it only for the simplest greetings (use chips directly).",
    input_schema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "The user's raw prompt — copy verbatim.",
        },
        intent_description: {
          type: "string",
          description:
            "Your read of what the user wants in 1–2 sentences. " +
            "Example: 'User wants to compare two database options with tradeoffs.'",
        },
        needs_interactivity: {
          type: "boolean",
          description:
            "True ONLY if the answer requires <script> or <form> (calculator, " +
            "quiz, live converter). False for everything else.",
        },
        domain: {
          type: "string",
          description: "Optional. e.g. 'engineering', 'marketing', 'product', 'data'.",
        },
        complexity: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Optional. Rough sense of how detailed the response should be.",
        },
      },
      required: ["prompt", "intent_description", "needs_interactivity"],
    },
  },
  {
    name: "choose_widget",
    description:
      "PHASE 2 — CHOOSE. Commit to ONE widget skill from the catalog. The " +
      "tool VERIFIES the widget exists, returns its design note + a short " +
      "reference HTML example (do NOT copy verbatim — vary the aesthetic), " +
      "and surfaces phase-specific reminders (e.g. 'this widget uses " +
      "<script> — wrap in IIFE'). Use the suggested_widgets list from " +
      "classify_prompt as your candidate set.",
    input_schema: {
      type: "object",
      properties: {
        widget: {
          type: "string",
          enum: [...WIDGET_INTENTS],
          description:
            "The widget intent you're committing to. Must be one of the 20 " +
            "catalog skills.",
        },
        reasoning: {
          type: "string",
          description:
            "Brief 1-sentence justification of why this widget fits the " +
            "user's request.",
        },
      },
      required: ["widget", "reasoning"],
    },
  },
  {
    name: "validate_widget",
    description:
      "PHASE 3 — VERIFY (part of IMPLEMENT). Runs the same structural " +
      "checks the production sanitizer enforces: sentinels present, root " +
      "sets background AND color inline (contrast), no forbidden tags " +
      "(<iframe>, <style>, <object>, <embed>), no inline on* handlers, " +
      "tag balance, ≤ 6KB. If <script> is present: no fetch/XHR, no " +
      "eval/new Function/document.write, no <script src>, no form-action. " +
      "Returns {valid, issues, warnings, summary}. Call this BEFORE every " +
      "render_widget. If invalid, fix issues and call validate_widget AGAIN.",
    input_schema: {
      type: "object",
      properties: {
        html: {
          type: "string",
          description:
            "Full widget HTML INCLUDING <!--bap-widget:start--> and " +
            "<!--bap-widget:end--> sentinel comments. Same string you " +
            "intend to pass to render_widget.",
        },
      },
      required: ["html"],
    },
  },
  {
    name: "render_widget",
    description:
      "PHASE 3 — SUBMIT (terminal). Submits the final widget to the user. " +
      "The loop ENDS after this call. Only call AFTER validate_widget " +
      "returned valid:true. Optionally include a short prose preamble " +
      "(1–2 sentences) shown above the widget. EXACTLY ONCE per turn.",
    input_schema: {
      type: "object",
      properties: {
        html: {
          type: "string",
          description: "Full widget HTML including sentinel comments. Same as validated.",
        },
        prose: {
          type: "string",
          description: "Optional 1–2 sentence preamble shown above the widget.",
        },
      },
      required: ["html"],
    },
    terminal: true,
  },
];

export function getToolDefinition(name: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.name === name);
}
