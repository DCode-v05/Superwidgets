import type { ProviderInvoker, ProviderId } from "./providers";
import type { UsageMetadata } from "./providers/types";
import { AGENT_ROUND_1_PROMPT, AGENT_REFLECT_PROMPT } from "./agent-prompt";
import { isWidgetIntent, type WidgetIntent } from "./skills";
import { computeCost } from "./pricing";

/**
 * Skill Decision Agent — **recursive** reasoning loop.
 *
 * Round 1 (PROPOSE) lists candidates with scores + an initial pick.
 * Rounds 2..N (REFLECT) iteratively refine or commit. Each reflection sees
 * the original message + ALL prior round outputs.
 *
 * The loop stops when ANY of these is true:
 *   1. confidence reaches HIGH_CONFIDENCE_THRESHOLD (0.85)        → "high_confidence"
 *   2. pick converged across 2 rounds + confidence delta ≤ 0.05   → "converged"
 *   3. iteration count reaches MAX_ITERATIONS                     → "max_rounds"
 *   4. parser produces an invalid shape                           → "override"
 *
 * After the loop, the runner applies a confidence guard:
 *   if final confidence < CHIPS_FALLBACK_THRESHOLD or chosen kind isn't valid
 *   → override to `chips` (set `overridden: true`).
 */

const HIGH_CONFIDENCE_THRESHOLD = 0.85;
const CHIPS_FALLBACK_THRESHOLD = 0.55;
const CONVERGENCE_EPSILON = 0.05;
const MAX_ITERATIONS = 4; // 1 propose + up to 3 reflections

export interface AgentCandidate {
  kind: string;
  score: number;
  why: string;
}

export interface AgentRound1 {
  candidates: AgentCandidate[];
  initial_pick: string;
}

export interface AgentReflection {
  /** 1-indexed round number — Round 1 is propose, reflections start at 2. */
  round: number;
  critique: string;
  decision: string;
  chosen: string;
  confidence: number;
  rationale: string;
}

export type AgentStopReason = "high_confidence" | "converged" | "max_rounds" | "override";

/** Per-round cost + token usage breakdown — surfaced in the AgentDecisionPanel. */
export interface AgentRoundCost {
  round: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface AgentDecision {
  /** True if the runner overrode the model's pick (low confidence or invalid kind). */
  overridden: boolean;
  round1: AgentRound1;
  /** Reflection rounds in chronological order (length 1..MAX_ITERATIONS-1). */
  reflections: AgentReflection[];
  /** Total LLM calls in the decision loop (1 + reflections.length). */
  iterations: number;
  stopReason: AgentStopReason;
  /** Final widget kind we will dispatch to the specialist. */
  chosen: WidgetIntent;
  /** End-user-visible one-sentence reason. */
  rationale: string;
  /** 0..1 confidence (post-override). */
  confidence: number;
  /** Sum of tokens consumed across all agent rounds (excludes specialist). */
  agentInputTokens: number;
  agentOutputTokens: number;
  /** USD spent on the agent loop alone (excludes specialist), via lib/engine/pricing.ts. */
  agentCost: number;
  /** Per-round cost so the panel can show where the spend went. */
  perRoundCost: AgentRoundCost[];
}

export interface AgentRunResult {
  decision: AgentDecision;
  usage: UsageMetadata[];
}

export async function runAgent(
  provider: ProviderInvoker,
  providerId: ProviderId,
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<AgentRunResult> {
  const usages: UsageMetadata[] = [];

  // === ROUND 1 — PROPOSE ===
  const r1Raw = await runOne(provider, AGENT_ROUND_1_PROMPT, message, history, usages);
  const round1 = parseRound1(r1Raw);

  // === ROUNDS 2..N — RECURSIVE REFLECTION LOOP ===
  const reflections: AgentReflection[] = [];
  let stopReason: AgentStopReason = "max_rounds";
  let lastReflection: AgentReflection | null = null;

  for (let round = 2; round <= MAX_ITERATIONS; round++) {
    const ctx = buildReflectionContext(message, round1, reflections);
    const raw = await runOne(provider, AGENT_REFLECT_PROMPT, ctx, [], usages);
    const parsed = parseReflection(raw, round);
    reflections.push(parsed);

    // (cost handled at return time — one computation per round below)

    // Stop condition 1 — high confidence
    if (parsed.confidence >= HIGH_CONFIDENCE_THRESHOLD) {
      stopReason = "high_confidence";
      lastReflection = parsed;
      break;
    }

    // Stop condition 2 — convergence (same pick + similar confidence as last reflection)
    if (lastReflection !== null) {
      const samePick = lastReflection.chosen === parsed.chosen;
      const confDelta = Math.abs(lastReflection.confidence - parsed.confidence);
      if (samePick && confDelta <= CONVERGENCE_EPSILON) {
        stopReason = "converged";
        lastReflection = parsed;
        break;
      }
    }

    lastReflection = parsed;
    // Otherwise continue looping.
  }
  // If we exited without breaking, lastReflection is the last one we did.
  const finalReflection: AgentReflection =
    lastReflection ??
    // Defensive: if reflections is empty (shouldn't be — at least one runs)
    {
      round: 2,
      critique: "no reflections were produced",
      decision: "fall back to initial pick",
      chosen: round1.initial_pick,
      confidence: 0,
      rationale: "Reflection loop produced no output; defaulting to Round 1 pick.",
    };

  // === CONFIDENCE GUARD — the safety net after the loop ===
  let chosen: WidgetIntent;
  let overridden = false;
  if (!isWidgetIntent(finalReflection.chosen)) {
    chosen = "chips";
    overridden = true;
    stopReason = "override";
  } else if (finalReflection.confidence < CHIPS_FALLBACK_THRESHOLD) {
    chosen = "chips";
    overridden = true;
    stopReason = "override";
  } else {
    chosen = finalReflection.chosen;
  }

  // === COST BREAKDOWN ===
  // usages[0] = Round 1 (Propose), usages[1..] = Reflections in order.
  const perRoundCost: AgentRoundCost[] = usages.map((u, i) => ({
    round: i + 1,
    inputTokens: u.inputTokens,
    outputTokens: u.outputTokens,
    cost: computeCost(providerId, u),
  }));
  const agentInputTokens = usages.reduce((s, u) => s + u.inputTokens, 0);
  const agentOutputTokens = usages.reduce((s, u) => s + u.outputTokens, 0);
  const agentCost = perRoundCost.reduce((s, r) => s + r.cost, 0);

  return {
    decision: {
      overridden,
      round1,
      reflections,
      iterations: 1 + reflections.length,
      stopReason,
      chosen,
      rationale: overridden
        ? `Agent confidence was ${finalReflection.confidence.toFixed(2)} — falling back to chips. Original rationale: ${finalReflection.rationale}`
        : finalReflection.rationale,
      confidence: finalReflection.confidence,
      agentInputTokens,
      agentOutputTokens,
      agentCost,
      perRoundCost,
    },
    usage: usages,
  };
}

/** Builds the user-context blob for a reflection round. */
function buildReflectionContext(
  message: string,
  round1: AgentRound1,
  reflections: AgentReflection[],
): string {
  const lines: string[] = [
    `Original user message:`,
    `"""`,
    message,
    `"""`,
    ``,
    `Round 1 (Propose):`,
    JSON.stringify(round1, null, 2),
    ``,
  ];
  for (const r of reflections) {
    lines.push(`Round ${r.round} (Reflection):`);
    lines.push(
      JSON.stringify(
        {
          critique: r.critique,
          decision: r.decision,
          chosen: r.chosen,
          confidence: r.confidence,
          rationale: r.rationale,
        },
        null,
        2,
      ),
    );
    lines.push(``);
  }
  lines.push(
    reflections.length === 0
      ? `Now produce your first reflection (Round 2).`
      : `Now produce Round ${reflections.length + 2}. If you're settled, raise confidence above 0.85 and the loop will stop.`,
  );
  return lines.join("\n");
}

async function runOne(
  provider: ProviderInvoker,
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  usages: UsageMetadata[],
): Promise<string> {
  const result = provider(systemPrompt, userMessage, history);
  let text = "";
  for await (const chunk of result.stream) {
    text += chunk;
  }
  try {
    usages.push(await result.usage());
  } catch {
    /* best-effort */
  }
  return text;
}

function stripFences(s: string): string {
  return s.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

function extractJsonObject(raw: string): string | null {
  const cleaned = stripFences(raw);
  const start = cleaned.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inStr) {
      if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inStr = false;
      }
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return cleaned.slice(start, i + 1);
    }
  }
  return null;
}

function parseRound1(raw: string): AgentRound1 {
  const json = extractJsonObject(raw);
  if (!json) {
    return {
      candidates: [
        { kind: "chips", score: 0.1, why: "agent did not return parseable JSON in Round 1" },
      ],
      initial_pick: "chips",
    };
  }
  try {
    const parsed = JSON.parse(json) as Partial<AgentRound1>;
    const candidates: AgentCandidate[] = Array.isArray(parsed.candidates)
      ? parsed.candidates
          .filter((c): c is AgentCandidate => !!c && typeof c.kind === "string")
          .map((c) => ({
            kind: c.kind,
            score: typeof c.score === "number" ? c.score : 0,
            why: typeof c.why === "string" ? c.why : "",
          }))
      : [];
    const initial_pick =
      typeof parsed.initial_pick === "string" ? parsed.initial_pick : candidates[0]?.kind ?? "chips";
    return { candidates, initial_pick };
  } catch {
    return {
      candidates: [
        { kind: "chips", score: 0.1, why: "agent's Round 1 JSON was malformed" },
      ],
      initial_pick: "chips",
    };
  }
}

function parseReflection(raw: string, roundNumber: number): AgentReflection {
  const json = extractJsonObject(raw);
  if (!json) {
    return {
      round: roundNumber,
      critique: "agent did not return parseable JSON",
      decision: "falling back to chips",
      chosen: "chips",
      confidence: 0,
      rationale: "Reflection output was unparseable; defaulted to a conversational reply.",
    };
  }
  try {
    const parsed = JSON.parse(json) as Partial<AgentReflection>;
    return {
      round: roundNumber,
      critique: typeof parsed.critique === "string" ? parsed.critique : "",
      decision: typeof parsed.decision === "string" ? parsed.decision : "",
      chosen: typeof parsed.chosen === "string" ? parsed.chosen : "chips",
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0,
      rationale: typeof parsed.rationale === "string" ? parsed.rationale : "",
    };
  } catch {
    return {
      round: roundNumber,
      critique: "agent's reflection JSON was malformed",
      decision: "falling back to chips",
      chosen: "chips",
      confidence: 0,
      rationale: "Reflection output was unparseable; defaulted to a conversational reply.",
    };
  }
}
