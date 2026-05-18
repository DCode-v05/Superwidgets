---
name: architecture-html-subagent
description: Mini-bap's HTML-only subagent — single-call mode, model selectable, optional Frontend Design Skill. Pipeline and React features removed 2026-05-18.
metadata:
  type: project
---

**Architecture pattern:** Subagent. The subagent will be invoked by a router in bap-engine; in mini-bap (the prototype) it IS the main agent.

**Output format:** HTML strings only — no typed JSON envelopes, no `<ui-widget>` directive grammar, no client-side renderer registry. bap-web drops the HTML into the chat bubble after sanitization. **Templates are NOT fixed** — model picks visual aesthetic per response.

**Why HTML-only:** Minimal-integration path into bap-web. Trades theme/a11y rigidity, higher token cost, presentation coupling for a simpler frontend. Acceptable for MVP.

**UI controls (2026-05-18, post-cleanup):** single model dropdown (grouped by family) + `Skill ON/OFF` toggle (Frontend Design Skill prepend). 7 models × 2 skill = 14 distinct configurations.

**Execution mode:** Single-call only. One LLM call. System prompt = `SYSTEM_PROMPT_FREEFORM` (agent-structured) optionally prepended with the Frontend Design Skill.

**Widget intents (20 total):**
- Static (10, original): `chips`, `decision_card`, `confirm_card`, `stepper`, `checklist`, `table`, `chart` (bar/line/area), `source_cards`, `code_block`, `inline_banner`
- Diagrams (3, added 2026-05-18): `flowchart`, `venn_diagram`, `mind_map` — inline SVG
- Charts (2, added 2026-05-18): `pie_chart`, `heatmap`
- Dashboards/UI (3, added 2026-05-18): `kpi_dashboard`, `profile_card`, `kanban_board`
- Interactive (2, added 2026-05-18): `calculator`, `quiz` — these use `<script>` + `<form>`

**`<script>` and `<form>` are NOW ALLOWED (2026-05-18).** DOMPurify config in [[components/output/HtmlBubble.tsx]] permits both. Safety posture:
- `<script>` is allowed but `src` is stripped — **inline only, no remote loading**
- `<form>` is allowed but `action`/`method`/`formaction`/`formmethod` are stripped — **forms never submit anywhere**
- All `on*` inline event handlers stay blocked — interactivity goes through `addEventListener` inside `<script>`
- The system prompt teaches: IIFE wrap, scoped queries via unique root `id`, `e.preventDefault()` on form submit, no `fetch`/`XHR`/`eval`, ≤ 60 LOC script bodies
- HtmlBubble runs a post-mount shim that clones each `<script>` into a fresh element so it actually executes (HTML5 spec: scripts inserted via innerHTML don't run)

Models available:
- **Anthropic:** Sonnet 4.6 (default), Haiku 4.5 — both cached via beta `cache_control: ephemeral`
- **Google:** Gemini 3 Flash preview (`gemini-3-flash-preview`, $0.50/$3.00), Gemini 3.1 Flash Lite preview (`gemini-3.1-flash-lite-preview`, $0.25/$1.50 — cheapest tier)
- **OpenAI:** GPT-5.4 Mini (`gpt-5.4-mini`, $0.75/$4.50), GPT-5.4 (`gpt-5.4`, $2.50/$15), GPT-5.5 (`gpt-5.5`, $5/$30 — premium tier, UI warns when selected). All reasoning models; `reasoning_effort: "low"` set for any `gpt-5*` to preserve output budget. Auto-caching on prompts ≥ 1024 tokens.

**Per-response telemetry:** each assistant message renders a usage footer with input tokens, output tokens, cache hit rate, and computed cost in USD. Server captures usage from each SDK (Anthropic `finalMessage().usage`, OpenAI `stream_options: include_usage` final-chunk usage, Google `result.response.usageMetadata`), normalizes to `UsageMetadata`, and run-engine computes cost via [[lib/engine/pricing.ts]] table before emitting a `usage` SSE event. The Anthropic Claude Code Frontend Design Skill (vendored from `https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/frontend-design/skills/frontend-design/SKILL.md`) is prepended to the system prompt to compensate for weaker design intuition. OpenAI provides automatic caching for prompts ≥1024 tokens (50% off cached input). Google context caching available but minimum cacheable size (~4096 tokens) likely above current prompt size, so not used.

**Sonnet 4.6 is the default model** (after iterating: Haiku 4.5 was tried first and swapped back to Sonnet 4.6 on 2026-05-13 — quality over cost for the default baseline).

**System prompt is an agent-structured definition** ([[lib/engine/system-prompt-freeform.ts]], ~180 lines). Organized into explicit sections: AGENT DEFINITION (identity), PURPOSE, SCOPE (in/out), CAPABILITIES (output channels + widget intents table), OUTPUT CONTRACT (sentinel grammar + interactivity convention), CONSTRAINTS (hard/format/trust model), AESTHETIC PRINCIPLES (design freedom + contrast), DECISION FRAMEWORK, ERROR RECOVERY, EXAMPLE. No `bap-*` class taxonomy — model invents class names per response. Inline `style` attributes allowed.

**Locked decisions:**

- One widget per response. Streaming: prose deltas first, then exactly one `widget_html` event with a complete HTML block.
- Sanitization (DOMPurify) lives in bap-web only.
- `data-bap-prompt` attribute = interactivity convention; bap-web event-delegates clicks globally.
- Sentinel comments `<!--bap-widget:start-->` / `<!--bap-widget:end-->` mark widget boundaries (parser-essential).
- API quota is constrained — caching is mandatory wherever supported.

**Removed 2026-05-18 (per user request):**
- **Pipeline mode** (router → specialist). Deleted: `lib/engine/router-prompt.ts`, entire `lib/engine/skills/` folder (base + 10 widget specialists + index), Pipeline toggle in `ModeSelector`, `pipeline` field in `ChatMessage`/`SendOpts`/request body.
- **React output mode.** Deleted: `lib/engine/react-mode-override.ts`, `components/output/ReactLiveBubble.tsx`, HTML/React pill in `ModeSelector`, `outputFormat` field in `ChatMessage`/`SendOpts`/request body, `OutputFormat` type, `react-live` and `sucrase` deps from package.json.

**Tried and reverted 2026-05-18:** A full agentic-loop refactor (tools: `lookup_example`, `validate_widget`, `render_widget`; multi-iteration `runEngine` loop; provider tool-use translation across all 3 providers; `AgentTrace` UI). Reverted per user request — back to the simple single-call subagent. Files removed in the revert: `lib/engine/tools/`, `components/output/AgentTrace.tsx`.

**SSE event schema (unchanged):**
- `text_delta` — `{ "text": "..." }`
- `widget_html` — `{ "html": "<div>...</div>" }`
- `done`
- `error` — `{ "message": "..." }`

**Provider abstraction:** [[lib/engine/providers/]] — three streaming wrappers (`anthropic.ts`, `google.ts`, `openai.ts`) all returning `AsyncGenerator<string>`. [[lib/engine/run-engine.ts]] looks up the provider by `ProviderId` and pipes through the unchanged sentinel parser at [[lib/engine/widget-parser.ts]].

See [[project-mini-bap-purpose]] for context on how mini-bap relates to the production BAP product.
