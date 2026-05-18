---
name: architecture-html-subagent
description: Mini-bap is an HTML-widget subagent running an agentic loop (Action → Verify → OK/Loop) with 3 tools, across 7 models. Script/form allowed for interactive widgets. Rebuilt 2026-05-18 (second attempt — first revert was 2026-05-18 morning).
metadata:
  type: project
---

## Current state (2026-05-18 PM — agentic loop is BACK)

Mini-bap runs an **agentic loop** per user turn. Pattern: **Action → Verify → OK / Loop**. Loop ends only when the terminal tool `render_widget` is called.

In production, the main BAP engine (in `bap-engine` sibling at `…\BAP Product\Code\`) delegates to mini-bap with a payload. In the prototype, the payload IS the user's chat message.

### THE TOOLS ([[lib/engine/tools/]])

(2026-05-18 evening v4: settled on 2 tools after a v3 collapse to 1 tool revealed loss of pre-flight design context.)

| # | Tool | Phase | What it does | Cost | Terminal? |
|---|---|---|---|---|---|
| 1 | `build_widget(intent)` | BUILD | Returns the skill's design note + interactivity reminders. HTML-FREE — agent passes only the intent enum. | ~10 tok input, ~50 tok output | No |
| 2 | `submit_widget(intent, html, prose?)` | SUBMIT | Validates intent + HTML structure + script safety in ONE pass. If valid → renders + ENDS loop. If invalid → returns `{valid:false, issues}` for the agent to fix and call submit_widget again. | HTML bytes | **Yes (if valid)** |

**Why 2 (not 3, not 1):**
- 3 tools (build/validate/render) = agent writes the same HTML 3× → ~3× output cost. v3 collapse fixed that.
- 1 tool (submit only) = agent loses pre-flight design context. Some interactive widgets failed first try because the agent forgot a skill-specific rule.
- 2 tools = HTML written ONCE (in submit), but the agent gets the design note + script-safety reminders BEFORE composing via the cheap build_widget call.

Net cost vs. 1-tool design: +50–100 tokens overhead per turn (the build_widget call + response). Net cost vs. 3-tool design: ~60% output token reduction.

`lib/engine/tools/classify.ts` and `choose.ts` still exist as orphaned helpers; can be removed if no future tool needs them.

The 20 widget intents (chips, calculator, kanban_board, …) are framed as **individual skills** in a skill catalog — analogous to engine-peripherals' `utility_directory` user_skills table. `build_widget` picks one skill per turn (still uses classify.ts internally for the alignment check).

### System prompt (production-grade, 2026-05-18 PM v3)

[[lib/engine/system-prompt-freeform.ts]] — ~2,000 tokens (down from ~3,800 → ~2,300 → ~2,000). Structured as: agent definition → 1-tool loop → skill catalog → output contract → hard constraints (table) → **TOKEN ECONOMY** → script safety → design system → decision framework → single compact example.

**Two load-bearing sections for the user's "best UI + less output tokens" mandate:**

1. **TOKEN ECONOMY** — explicit rules pushing the model toward 800–2000-byte widgets: CSS shorthand always, no spaces in inline style values, no wrapper divs without purpose, compressed IIFEs, 4-color palette reuse, ≤1-sentence prose.

2. **DESIGN SYSTEM** — production-grade UI rules: 4-color palette + 1 accent (BAP red), 4/8/12/16/20/24 spacing rhythm, single radius per widget, 3 type sizes max, 1 chosen typography pairing (editorial / industrial / modern). Discourages: purple gradients, Inter/Roboto/Arial by name, multiple accents, random padding values.

The EXAMPLE at the end shows a ~1180-byte tip calculator with the actual compact density the model should emulate (short data-role names, no inline spaces, single-line IIFE, etc.).

### Validator fix (2026-05-18 PM)

[[lib/engine/tools/validate.ts]] tag-balance check used to false-positive on `<input>`, `<br>`, `<img>`, and SVG-leaf elements (circle, rect, path, etc.) — counted them as open tags with no matching close. Every calculator/quiz widget failed validation on this alone. Now correctly excludes void HTML elements + SVG leaf elements from the "needs close" count via a single-pass tag walker.

### Loop ([[lib/engine/run-engine.ts]])

```
PHASE 1: build_widget     (verify: intent + sentinels + alignment; returns design note + script-safety reminders)
PHASE 2: validate_widget  (verify: full structural + script safety; loop here if invalid)
PHASE 3: render_widget    (verify: re-validate; terminal — ends loop)

for iter in 1..MAX_ITERATIONS (8):
    response = provider.runAgentTurn(systemPrompt, messages, tools)
    stream text deltas
    collect tool_call events
    when turn ends:
        if no tools → break (model ended)
        for each tool_call:
            execute → emit tool_result event
            if render_widget validated → break loop
        append assistant+tools to messages
emit widget_html + summed usage + done
```

Verification happens at EVERY phase, not just at the end — each tool runs its own checks before returning.

`MAX_ITERATIONS = 8` is the circuit breaker — analogous to engine-peripherals'  `asset_directory/circuit_breaker.py` (opens after N failures on external calls).

### Provider tool-use ([[lib/engine/providers/]])

All 3 providers implement the same `AgentTurnInvoker` interface ([[lib/engine/providers/types.ts]]):
- **Anthropic** — `tool_use` / `tool_result` blocks; beta prompt-caching on system prompt
- **OpenAI** — **Responses API** (`client.responses.create`, `/v1/responses`), NOT chat completions. Uses `reasoning: { effort: "none" }` — disables reasoning entirely, ideal for the tool-dispatch loop (classify/choose/validate/render don't need it). We migrated here because `/v1/chat/completions` rejects `reasoning_effort` + `tools` for GPT-5 (returns 400). GPT-5 family's per-model vocabulary is `none/low/medium/high/xhigh` — note **NOT** `minimal` (tried first, rejected). SDK ^4.104 types only know low/medium/high; `"none"` is sent via a cast (`as "low"`). Input items: messages → `role`/`content` items, assistant tool calls → `function_call` items, tool results → `function_call_output` items.
- **Google** — `functionDeclarations`; synthesizes call IDs since Gemini doesn't issue them

### Script/form ALLOWED for interactive widgets

[[components/output/HtmlBubble.tsx]] DOMPurify config permits `<script>`, `<form>`, form controls. Stripped: `<iframe>`, `<style>`, `<object>`, `<embed>`, all `on*` handlers, `script src`, `form action/method`. The shim:
1. Owns the inner DOM manually via a ref (NOT `dangerouslySetInnerHTML`) — prevents React re-touching the inner DOM on parent re-renders and detaching input elements from their listeners
2. Sets `containerRef.current.innerHTML = clean` inside `useEffect` (gated on `[clean]`) so the DOM only changes when HTML actually changes
3. Clones each `<script>` into a fresh element so it executes (HTML5 spec: scripts inserted via innerHTML don't run)
4. Wraps the script body in `try { ... } catch(e) { console.error(...) }` so an in-script throw doesn't surface in the Next.js error overlay — does NOT rescue subsequent statements in the IIFE; that's the model's responsibility

`validate_widget` enforces script safety: rejects fetch/XHR/WebSocket, eval/new Function/document.write, missing preventDefault on form submit. Recommends (warnings, not blockers): IIFE wrap, root id scoping.

**Defensive coding rule (in system prompt):** every `querySelector` result must be guarded before calling `.addEventListener` or any method on it (`if (el) el.addEventListener(...)`). Without this, a single null deref aborts the IIFE and later listeners never bind — the widget looks alive but doesn't respond to input.

**Inline clickable keywords (2026-05-18 PM v5):** the system prompt's INTERACTIVITY section now teaches three patterns for `data-bap-prompt`: chip buttons (end-of-response), inline `<span>` keywords with dashed-underline accent treatment (like Perplexity/Claude inline follow-ups), and whole-card click targets. The global click delegator in [[components/chat/ChatShell.tsx]] uses `target.closest("[data-bap-prompt]")` so all three patterns work without code changes — only the model needed to be taught the patterns.

**Design direction (2026-05-18 PM v6, user-driven):** rewrote DESIGN section to be **flat aesthetic, brand-anchored, varied per widget**:
- **NO shadows, NO gradients, NO blur/backdrop, NO translucent overlay fills.** Solid fills only. Hierarchy from color + weight + size + structure, never depth tricks.
- **Free palette PER widget**, not per intent — same calculator should look different across two turns. Variation prevents user fatigue.
- **BAP red `#EC3B4A` is the ONLY brand accent** — never a second brand-strength color in one widget. Reserved for CTA / active / key live metric / inline-clickable keyword.
- **7 named mood palettes** provided as starting points (warm graphite · cool noir · paper · mint clinical · plum noir · slate · monochrome) — model can invent others as long as contrast + BAP red rules hold.
- **Kept:** borders + dividers (1px solid only), inline SVG icons (~150 bytes each, common shapes like check/arrow/chevron with `stroke="currentColor"`), number+unit pairing for metrics, 3–6 type sizes, font pairings (editorial/industrial/modern/refined).
- **TOKEN ECONOMY** target lowered to 1000–2500 bytes (flat designs are naturally leaner).

The widget should look like it BELONGS inside mini-bap's cream / espresso bubbles. No BAP product UI reference exists beyond mini-bap's own chat shell.

### UI ([[components/output/AgentTrace.tsx]])

Collapsible "Agent loop · N steps · K iter" panel above each assistant bubble. Each row: iteration #, phase label (BUILD/VERIFY/SUBMIT), tool name, input summary, result summary, status icon (spinner → ✓ → ⚠). Mirrors engine-peripherals' working_memory_log shape.

### SSE event schema

```
text_delta · tool_call · tool_result · widget_html · usage · error · done
```

### Calculator path (verified end-to-end)

1. Model receives "Build me a tip calculator"
2. (iter 1) Composes HTML with `<script>` IIFE, calls `validate_widget`
3. Validation passes (script body has no fetch/eval, root has bg+color, form not present)
4. (iter 2) Calls `render_widget` → terminal
5. Engine extracts inner HTML, emits widget_html SSE event
6. HtmlBubble injects via `dangerouslySetInnerHTML`
7. useEffect shim clones `<script>` into a new element → script executes → calculator is live

### Files

```
lib/engine/
  pricing.ts                  Pricing table + cost helpers
  system-prompt-freeform.ts   Agent definition + loop workflow + 20-intent table
  frontend-design-skill.ts    Reads frontend-design-skill.md
  run-engine.ts               Agentic loop orchestration (MAX_ITERATIONS=8)
  providers/
    types.ts                  AgentTurnInvoker, TurnEvent, StopReason
    index.ts                  ProviderId union, getProvider
    anthropic.ts              Anthropic agent turn (beta prompt-caching + tools)
    openai.ts                 OpenAI agent turn (function calling)
    google.ts                 Google agent turn (function declarations)
  tools/
    types.ts                  ToolDefinition, ToolCall, ToolResult, AgentMessage
    schemas.ts                The 4 tool definitions (classify, choose, validate, render)
    widget-library.ts         20 widget skills with keywords + needs_interactivity metadata
    classify.ts               Phase 1 — keyword + interactivity scoring → suggested skills
    choose.ts                 Phase 2 — verify chosen widget + return design note + reminders
    validate.ts               Phase 3 verify — structural + script-safety checks
    executors.ts              Dispatch + FinalRender on terminal
    index.ts                  Re-exports
components/output/
  AgentTrace.tsx              Collapsible loop-step UI (GATHER/VERIFY/SUBMIT phase labels)
  HtmlBubble.tsx              DOMPurify (script/form allowed) + script-execution shim
  OutputSystem.tsx            Picks HtmlBubble
  InlineTextRenderer.tsx      Markdown for assistant prose
```

### Cost trade-off

Per-turn cost rises ~2–3× vs single-shot because the loop typically makes 2–3 LLM calls (validate → render, or lookup → validate → render). The prompt explicitly allows skipping `lookup_example` to drop to 2 calls. Anthropic's cache_control on system+tools keeps input cost flat across iterations.

---

## History (kept for context)

Mini-bap went through three architectural shapes in one day (2026-05-18):

1. **Morning**: Pipeline + React modes were removed per user request → reduced to HTML-only single-call mode with 10 intents.
2. **Mid-day attempt 1**: Built an agentic loop (same 3 tools), user REVERTED it back to single-call. Then added 10 new widgets + opened `<script>`/`<form>` in DOMPurify (single-call mode with 20 intents).
3. **Afternoon**: User asked for the agentic loop AGAIN, this time with explicit Action→Verify→OK/Loop spec and "calculator should work as expected". This is the current state.

The key difference from attempt 1: validate.ts now permits `<script>` and `<form>` (matching the relaxed sanitizer), so the calculator widget passes validation.

See [[project-mini-bap-purpose]] for context on how mini-bap relates to the production BAP product.

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
