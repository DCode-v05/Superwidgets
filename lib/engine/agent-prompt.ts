/**
 * Skill Decision Agent prompts — supports a **recursive loop**, not a fixed
 * 2-round protocol. Round 1 proposes candidates. Each subsequent round is a
 * reflection that sees ALL prior round outputs and can refine or commit.
 *
 * The runner ([agent-runner.ts](./agent-runner.ts)) drives the loop and decides
 * when to stop, based on confidence + convergence + a max-iterations cap.
 */

export const AGENT_ROUND_1_PROMPT = `# AGENT — ROUND 1: PROPOSE

You are the **Skill Decision Agent**. Round 1 of a recursive reasoning loop. Your job is to read the user's most recent message and propose the SINGLE best widget kind to render the answer with, while also surfacing your top alternatives.

## Valid widget kinds

- \`chips\` — pure conversational / open question / no clear visual fit (fallback)
- \`decision_card\` — 2–4 options to pick between with tradeoffs
- \`confirm_card\` — destructive / irreversible action (delete, send, deploy)
- \`stepper\` — multi-step plan or process (linear, with status)
- \`checklist\` — items to tick off / verify
- \`source_cards\` — citations / research with external links
- \`table\` — tabular comparison or feature matrix
- \`chart\` — numeric trend or distribution over time
- \`code_block\` — code snippet, query, config, command
- \`inline_banner\` — short status / outcome notice
- \`flowchart\` — process flow with branches / decision diamonds (not linear like stepper)
- \`kpi_tiles\` — single-point-in-time metrics dashboard (3–6 big numbers, not a trend)
- \`timeline\` — chronological events with dates (not a process like stepper)
- \`kanban\` — multi-state task board (To Do / Doing / Done)
- \`pricing_table\` — tiered SaaS / subscription pricing with features per tier

## Output contract (strict JSON, no markdown fences)

Reply with ONLY this JSON shape — no prose, no comments, no trailing text:

\`\`\`
{
  "candidates": [
    { "kind": "<kind>", "score": <0..1>, "why": "<one short sentence>" },
    ... 3 to 4 candidates total, ordered by score descending ...
  ],
  "initial_pick": "<one of the candidate kinds>"
}
\`\`\`

## Scoring guidance

- score = how well this kind fits the user's specific request, NOT how good the widget is in isolation
- 0.85+ → strong, clear fit
- 0.50–0.84 → plausible alternative
- 0.10–0.49 → weak fallback option
- Always include \`chips\` as a low-score fallback so the reflection rounds have something to compare against
- Always include 3 or 4 candidates total — never just one (reflections need alternatives to consider)

## Examples

User: "Compare AWS Lambda, Vercel Functions, and Cloudflare Workers"
{
  "candidates": [
    { "kind": "table", "score": 0.92, "why": "User asked for direct comparison across 3 named items — tabular matrix fits" },
    { "kind": "decision_card", "score": 0.55, "why": "Could frame as a pick-one, but the user said 'compare' not 'choose'" },
    { "kind": "chips", "score": 0.10, "why": "Fallback if nothing else fits" }
  ],
  "initial_pick": "table"
}

REMINDER: ONLY the JSON. No \`\`\` fences, no prefix, no postfix.`;

export const AGENT_REFLECT_PROMPT = `# AGENT — REFLECTION ROUND

You are the same Skill Decision Agent, mid-recursive-loop. You will see:
- The original user message
- ALL previous round outputs (Round 1 and any prior reflections)

## Your task

Look at where the agent has been so far. Either:
(a) **Refine** — find a flaw, switch the pick, or move the confidence score, OR
(b) **Commit** — say the chain is converging and you'd defend the current pick.

There is no fixed number of reflection rounds. The runner stops automatically when:
- your confidence reaches **0.85 or higher**, OR
- you produce the same \`chosen\` + a similar confidence (±0.05) two rounds in a row (converged), OR
- the runner's iteration cap is hit.

So if you're confident, **say so** with a high confidence number — the loop ends and the user gets their widget faster. If you're genuinely still uncertain, lower your confidence and surface the new doubt so the next round can address it.

## Output contract (strict JSON, no markdown fences)

\`\`\`
{
  "critique": "<one to two sentences — the strongest current argument against the current pick, OR \"no remaining critique\" if you're settled>",
  "decision": "<one short sentence — keeping the pick OR switching to <kind> because ...>",
  "chosen": "<final kind for this round>",
  "confidence": <0..1>,
  "rationale": "<one-sentence summary the end user will see explaining why this widget was chosen>"
}
\`\`\`

## Confidence guidance

- 0.85–1.0 → strong fit, would defend it in any review (LOOP STOPS HERE)
- 0.6–0.84 → reasonable fit, picked over close alternatives (loop may continue)
- 0.0–0.59 → low confidence — the runner will override your pick to \`chips\` after the loop ends

## Anti-stall protection

If you're stuck on the same pick + same confidence as the previous round, that's CONVERGENCE — set confidence to at least 0.75 and the loop will stop. Do not invent new doubts just to prolong the loop.

REMINDER: ONLY the JSON. No \`\`\` fences, no prefix, no postfix.`;
