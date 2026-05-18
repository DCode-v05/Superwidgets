/**
 * Phase 1 — CLASSIFY.
 *
 * The agent submits its read of the user prompt; this tool sanity-checks
 * the classification and returns a ranked list of suggested widget skills
 * based on keyword + interactivity matching.
 *
 * Verification baked in:
 *   - prompt is non-empty
 *   - intent_description is non-empty
 *   - needs_interactivity is a boolean
 *
 * The suggestion algorithm is keyword-based (fast, deterministic) and
 * intentionally not LLM-based — the agent itself is the smart classifier;
 * this tool just gives back a structured shortlist to choose from.
 */

import { WIDGET_INTENTS, listSkills, type WidgetIntent } from "./widget-library";

export interface ClassificationInput {
  prompt: string;
  intent_description: string;
  needs_interactivity: boolean;
  domain?: string;
  complexity?: string;
}

export interface ClassificationResult {
  ok: boolean;
  issues: string[];
  echoed: {
    intent_description: string;
    needs_interactivity: boolean;
    domain: string | null;
    complexity: string | null;
  };
  suggested_widgets: Array<{ intent: WidgetIntent; reason: string }>;
  notes: string[];
}

export function classifyPrompt(input: ClassificationInput): ClassificationResult {
  const issues: string[] = [];

  if (!input.prompt || !input.prompt.trim()) {
    issues.push(`"prompt" is required and must be non-empty.`);
  }
  if (!input.intent_description || !input.intent_description.trim()) {
    issues.push(`"intent_description" is required — describe what the user actually wants.`);
  }
  if (typeof input.needs_interactivity !== "boolean") {
    issues.push(`"needs_interactivity" must be a boolean.`);
  }

  const prompt = (input.prompt ?? "").toLowerCase();
  const intentText = (input.intent_description ?? "").toLowerCase();
  const haystack = `${prompt} ${intentText}`;

  // Score each skill by keyword hits in the haystack
  const allSkills = listSkills();
  const scored = allSkills.map((skill) => {
    let score = 0;
    const hits: string[] = [];
    for (const kw of skill.keywords) {
      if (haystack.includes(kw)) {
        score += kw.length >= 5 ? 2 : 1; // longer keywords are more discriminating
        hits.push(kw);
      }
    }
    // Boost interactive widgets when needs_interactivity is true
    if (input.needs_interactivity && skill.needsInteractivity) score += 5;
    // Penalize interactive widgets when needs_interactivity is false
    if (!input.needs_interactivity && skill.needsInteractivity) score -= 3;
    return { skill, score, hits };
  });

  scored.sort((a, b) => b.score - a.score);

  // Take top candidates with score > 0; fall back to chips if none
  const candidates = scored.filter((s) => s.score > 0).slice(0, 4);

  const suggested: Array<{ intent: WidgetIntent; reason: string }> =
    candidates.length > 0
      ? candidates.map((c) => ({
          intent: c.skill.intent as WidgetIntent,
          reason: c.hits.length > 0
            ? `keyword match: ${c.hits.slice(0, 3).join(", ")}`
            : `interactivity match`,
        }))
      : [{
          intent: "chips" as WidgetIntent,
          reason: "no strong keyword match — default to disambiguation chips",
        }];

  const notes: string[] = [];
  if (input.needs_interactivity) {
    notes.push(`Interactivity flagged — calculator and quiz are the only widgets that allow <script>/<form>.`);
  }
  if ((scored[0]?.score ?? 0) === 0) {
    notes.push(`No widget matched the prompt strongly. Consider chips for disambiguation.`);
  }

  return {
    ok: issues.length === 0,
    issues,
    echoed: {
      intent_description: input.intent_description,
      needs_interactivity: input.needs_interactivity,
      domain: input.domain ?? null,
      complexity: input.complexity ?? null,
    },
    suggested_widgets: suggested,
    notes,
  };
}

export { WIDGET_INTENTS };
