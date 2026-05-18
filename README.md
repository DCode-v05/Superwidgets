# Mini-BAP

A self-contained Next.js prototype where every assistant reply is a **freeform HTML widget** instead of a wall of text. The user types → the engine streams a short prose intro + one widget (decision card, table, chart, flowchart, calculator, quiz, etc.) → clicking any chip / CTA fires the next turn automatically.

> Built to compare how **different models**, **prompt skills**, and **a recursive decision agent** trade off on widget quality, latency, and cost — with **token usage shown on every reply** so the trade-offs are measurable.

---

## What you can toggle

| Axis | Control | Values |
|---|---|---|
| **Model** | Dropdown in the footer | Sonnet 4.6, Haiku 4.5, Gemini 2.5 Flash, Gemini 2.0 Flash Lite, GPT-4o Mini, GPT-4o, GPT-5 |
| **Skill** | Wand pill (🪄) | ON / OFF — prepends a design-coaching doc to the prompt |
| **Agent** | Brain pill (🧠) | ON / OFF — runs the **recursive Skill Decision Agent** before the widget specialist |

Output is HTML — DOMPurify-sanitized and dropped into the chat bubble via `innerHTML`.

---

## The 22 widget intents

The model picks ONE intent per turn from this catalogue:

**Conversational & decision** — `chips`, `decision_card`, `confirm_card`
**Plans & lists** — `stepper`, `checklist`, `timeline`
**Data** — `table`, `chart`, `pie_chart`, `heatmap`, `source_cards`
**Diagrams** — `flowchart`, `venn_diagram`, `mind_map`
**Dashboards** — `kpi_dashboard`, `profile_card`, `kanban_board`, `pricing_table`
**Interactive** — `calculator`, `quiz`
**Code & status** — `code_block`, `inline_banner`

Each intent has its own specialist prompt at [`lib/engine/skills/<kind>.ts`](lib/engine/skills/), giving the model a focused worked example and aesthetic guidance for that one widget.

---

## The Agent (recursive decision loop)

When **Agent ON**, every turn fires a **recursive reasoning loop** instead of a single model call:

```
user message
   │
   ▼
┌──────────────────────────────────────┐
│  ROUND 1 — PROPOSE                   │
│  Score 3–4 candidate widgets (0..1)  │
│  Output: { candidates, initial_pick }│
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  ROUNDS 2..N — REFLECT (1..3 times)  │
│  See own prior rounds. Refine OR     │
│  commit. Output: { critique, chosen, │
│  confidence, rationale }             │
└──────────────┬───────────────────────┘
               │  Stops when ANY of:
               │  • confidence ≥ 0.85
               │  • pick converged + Δconf ≤ 0.05
               │  • iteration cap = 4
               │  • invalid JSON
               ▼
   if conf < 0.55 → force "chips" (override)
               │
               ▼
┌──────────────────────────────────────┐
│  SPECIALIST                          │
│  Focused skill prompt for the chosen │
│  intent renders the widget HTML.     │
└──────────────────────────────────────┘
```

**Files**:
- [`lib/engine/agent-prompt.ts`](lib/engine/agent-prompt.ts) — Round-1 (Propose) + Round-2..N (Reflect) prompts.
- [`lib/engine/agent-runner.ts`](lib/engine/agent-runner.ts) — the loop, parser, confidence guard, per-round cost.
- [`components/chat/AgentDecisionPanel.tsx`](components/chat/AgentDecisionPanel.tsx) — brain panel above the widget showing candidates, critique, stop reason, and reasoning cost.

**Cost** (Haiku 4.5, typical turn):
- Agent OFF → ~$0.005 (one LLM call)
- Agent ON → ~$0.014 (propose + 1 reflect + specialist = 3 calls)

The brain panel breaks down the agent reasoning cost separately from the specialist render cost.

---

## Setup

```bash
npm install
cp .env.local.example .env.local   # then paste your real keys
npm run dev
# open http://localhost:3000
```

### Environment variables ([`.env.local`](.env.local))

| Variable | Required for |
|---|---|
| `ANTHROPIC_API_KEY` | Sonnet 4.6, Haiku 4.5 |
| `OPENAI_API_KEY` | GPT-4o Mini, GPT-4o, GPT-5 |
| `GOOGLE_API_KEY` | Gemini 2.5 Flash, Gemini 2.0 Flash Lite |
| `GROQ_API_KEY` | Reserved (no provider currently consumes it) |

**⚠️ Google quota note**: if your Google project hits its monthly spend cap, all Gemini calls return `429 RESOURCE_EXHAUSTED`. Manage at <https://ai.studio/spend>.

---

## Architecture in 20 seconds

```
ChatInput ─► useChat.send({ providerId, useSkill, pipeline })
                │
                └─► POST /api/engine/execute  (SSE)
                          │
                          └─ lib/engine/run-engine.ts
                                     │
                                     ├─ if Agent ON: runAgent() — recursive loop
                                     │     ├─ Round 1 (Propose) + Reflect loop
                                     │     ├─ Confidence guard → "chips" fallback
                                     │     └─ Emits agent_decision event
                                     │
                                     └─ Specialist call: composeSpecialistPrompt(intent, useSkill)
                                            │
                                            ▼  text_delta + widget_html + usage events
useChat reducer ─► ChatMessage { text, widgetHtml, agentDecision, usage }
                                            ▼
                  ChatMessage ─► AgentDecisionPanel + HtmlBubble + UsageFooter
                                                          │
                                            ▼  DOMPurify-sanitized HTML in the bubble
```

---

## Mode matrix — what each combination teaches you

| Combination | What it tests |
|---|---|
| Cheap model + Skill OFF + Agent OFF | Baseline cost. Does Haiku/GPT-4o Mini produce passable widgets unprompted? |
| Premium + Skill OFF + Agent OFF | Quality ceiling at minimum cost. Best widget per dollar? |
| Any + Skill ON + Agent OFF | Does design coaching change visual quality enough to justify the prompt tokens? |
| Any + Agent ON | Recursive loop picks the widget — see the brain panel for the *why* |
| Premium + Skill ON + Agent ON | Most "complete" combo. Most expensive. Anchor for "as good as it gets". |

The token-usage footer on each reply (input / output / cache% / USD) makes these directly comparable.

---

## Adding a new widget intent

1. Add the intent name to the `WidgetIntent` union and `WIDGET_INTENTS` array in [`lib/engine/skills/index.ts`](lib/engine/skills/index.ts).
2. Create [`lib/engine/skills/<name>.ts`](lib/engine/skills/) — one `export const SKILL = "..."` string with a worked HTML example wrapped in `<!--bap-widget:start--> … <!--bap-widget:end-->`.
3. Register it in the `SKILLS` map.
4. Add the intent name to [`lib/engine/agent-prompt.ts`](lib/engine/agent-prompt.ts) and [`lib/engine/router-prompt.ts`](lib/engine/router-prompt.ts).
5. Optionally add a demo prompt in [`lib/test-prompts.ts`](lib/test-prompts.ts) so the EmptyState has a chip for it.

If the widget needs HTML tags outside the sanitizer allowlist, extend [`HtmlBubble.tsx`](components/output/HtmlBubble.tsx)'s `SANITIZE_CONFIG`. Don't remove existing entries.

---

## Cost calculator

The "Calculator" link in the header opens a model-comparison modal — punch in expected input/output tokens + cache hit %, see USD/call across all 7 models with the cheapest highlighted. Pricing rows in [`lib/engine/pricing.ts`](lib/engine/pricing.ts) match the registry 1:1.

---

## Key files

- [`app/api/engine/execute/route.ts`](app/api/engine/execute/route.ts) — SSE handler.
- [`lib/engine/run-engine.ts`](lib/engine/run-engine.ts) — orchestrator: single-call vs Agent.
- [`lib/engine/agent-runner.ts`](lib/engine/agent-runner.ts) — recursive decision loop, confidence guard, cost.
- [`lib/engine/agent-prompt.ts`](lib/engine/agent-prompt.ts) — Round 1 (Propose) + Reflect prompts.
- [`lib/engine/providers/`](lib/engine/providers/) — Anthropic / Google / OpenAI invokers.
- [`lib/engine/skills/`](lib/engine/skills/) — base contract + 22 specialist prompts.
- [`lib/engine/system-prompt-freeform.ts`](lib/engine/system-prompt-freeform.ts) — single-call prompt (covers all 22 intents).
- [`lib/engine/widget-parser.ts`](lib/engine/widget-parser.ts) — splits the LLM stream into text + widget events.
- [`lib/engine/pricing.ts`](lib/engine/pricing.ts) — per-model pricing + `computeCost` / `estimateCost`.
- [`lib/hooks/useChat.ts`](lib/hooks/useChat.ts) — client SSE consumer + reducer.
- [`components/output/HtmlBubble.tsx`](components/output/HtmlBubble.tsx) — DOMPurify-sanitized HTML render.
- [`components/chat/ModeSelector.tsx`](components/chat/ModeSelector.tsx) — model / skill / agent toggles.
- [`components/chat/AgentDecisionPanel.tsx`](components/chat/AgentDecisionPanel.tsx) — recursive reasoning trace + cost breakdown.
- [`components/chat/CostCalculator.tsx`](components/chat/CostCalculator.tsx) — cost-comparison modal.
- [`components/chat/ChatMessage.tsx`](components/chat/ChatMessage.tsx) — assistant bubble + UsageFooter + download/copy actions.

---

## Non-goals

- No auth, no persistence — refresh = new chat.
- No artifact panel, no voice, no file uploads.
- No streaming widget deltas — widgets are emitted whole (one `widget_html` event per turn).
- No Socket.IO. SSE only.

---

## License

Prototype — internal use.
