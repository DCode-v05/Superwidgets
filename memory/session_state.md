---
name: session-state
description: Comprehensive snapshot of mini-bap's current state as of 2026-05-13 — architecture, model lineup, verified pricing, UI controls, file layout, test rig, production recommendation, and pending optimizations. Read this BEFORE making changes; it captures decisions that aren't obvious from code alone.
metadata:
  type: project
---

# Mini-BAP — Session State (2026-05-13)

> Single source of truth for the project's current state. Cross-references [[architecture-html-subagent]], [[project-mini-bap-purpose]], [[user-profile]].

## 1 — What mini-bap is

A standalone Next.js 15 / React 19 prototype that will become a **Subagent inside the main BAP product** (`bap-engine` / `bap-web` / `bap-backend` at `D:\…\BAP Product\Code\`). Today BAP only emits plain text; mini-bap proves out the typed-widget streaming pattern that will be lifted into BAP after validation. **Templates are NOT fixed** — model picks visual aesthetic per response.

User: Deni (intern at September Platforms, sole builder). Windows / PowerShell environment.

## 2 — Current architecture (locked decisions)

**Output:** HTML (default) OR React TSX (live-rendered via `react-live` + `sucrase`). Sentinel-parsed via `<!--bap-widget:start-->` / `<!--bap-widget:end-->`. ONE widget per reply.

**Modes:**
- **Single-call** (default): one LLM call with system prompt = `SYSTEM_PROMPT_FREEFORM` (agent-structured, ~2K tokens) optionally + Frontend Design Skill (~700 tokens prepended).
- **Pipeline**: router (cheap classifier, ~250 token prompt) picks widget intent → specialist (per-widget skill, ~1.4K base + ~400 widget-specific) renders. 2 LLM calls per turn. Usage summed.

**Per-widget specialists** in [[lib/engine/skills/]]: `chips.ts`, `decision_card.ts`, `confirm_card.ts`, `stepper.ts`, `checklist.ts`, `table.ts`, `chart.ts`, `source_cards.ts`, `code_block.ts`, `inline_banner.ts`. All share `SKILL_BASE` (sentinel contract, sanitizer, interactivity, contrast rule).

**System prompt is agent-structured**: AGENT DEFINITION / PURPOSE / SCOPE / CAPABILITIES / OUTPUT CONTRACT / CONSTRAINTS / AESTHETIC PRINCIPLES / DECISION FRAMEWORK / ERROR RECOVERY / EXAMPLE.

## 3 — Verified pricing (2026-05-13, official docs)

| Model | ProviderId | Model ID | Input $/MTok | Output $/MTok | Cached input $/MTok | Cache fires? |
|---|---|---|---|---|---|---|
| Sonnet 4.6 | `sonnet` | `claude-sonnet-4-6` | 3.00 | 15.00 | 0.30 | Yes if Skill ON (>2,048 tok min) |
| Haiku 4.5 | `haiku` | `claude-haiku-4-5-20251001` | 1.00 | 5.00 | 0.10 | **NEVER** at our prompt size (4,096 min) |
| Gemini 3 Flash (preview) | `gemini-3` | `gemini-3-flash-preview` | 0.50 | 3.00 | 0.05 | Not implemented (would need `cachedContents`) |
| Gemini 3.1 Flash Lite (preview) | `gemini-3.1` | `gemini-3.1-flash-lite-preview` | 0.25 | 1.50 | 0.025 | Not implemented |
| GPT-5.4 Mini | `gpt-5.4-mini` | `gpt-5.4-mini` | 0.75 | 4.50 | 0.075 | Yes (auto, >1,024 tok min) |
| GPT-5.4 | `gpt-5.4` | `gpt-5.4` | 2.50 | 15.00 | 0.25 | Yes (auto) |
| GPT-5.5 | `gpt-5.5` | `gpt-5.5` | 5.00 | 30.00 | 0.50 | Yes (auto) |

Anthropic cache writes = input × 1.25. OpenAI auto-cache requires no `cache_control` block. GPT-5 family auto-set `reasoning_effort: "low"` in [[lib/engine/providers/openai.ts]].

**Llama / Groq REMOVED 2026-05-13.** Gemini 2.5 Flash REMOVED 2026-05-13.

## 4 — UI controls (in footer + header)

Footer (`ModeSelector`):
- **Model dropdown** (grouped Anthropic / Google / OpenAI) — default `sonnet`
- **HTML | React pill** — output format, default `html`
- **Skill ON/OFF** — Frontend Design Skill prepend
- **Pipeline ON/OFF** — router→specialist mode
- Status caption shows active combination
- Warning banner when `gpt-5.5` selected (premium tier)

Header:
- **Calculator** — modal cost calculator across all 7 models. Uses `createPortal` to escape header's `backdrop-blur` containing block.
- **Download page** — exports full chat as standalone .html via [[lib/download-page.ts]]
- **New chat** — resets selection + clears messages

Each assistant bubble has:
- Live widget render OR React code (Preview/Code tabs)
- Action buttons: Download (.html or .tsx based on format) + Copy
- Usage footer: input/output tokens · cache % · cost · model · format badge · skill badge · pipeline badge

## 5 — Cost rankings (verified pricing, HTML, single-call, cached)

| # | Combo | Cost/call | Quality |
|---|---|---|---|
| 1 | Gemini 3.1 Flash Lite + Skill OFF | $0.00111 | C (cheap but weak) |
| 2 | Gemini 3.1 Flash Lite + Skill ON | $0.00129 | C+ |
| 3 | **GPT-5.4 Mini + Skill OFF** (cached) | **$0.00195** | **B (UI-tuned)** ← PRODUCTION PICK |
| 4 | GPT-5.4 Mini + Skill ON (cached) | $0.00201 | B+ |
| 5 | Gemini 3 Flash + Skill OFF | $0.00223 | B |
| 6 | Gemini 3 Flash + Skill ON | $0.00258 | B+ |
| 7 | Haiku 4.5 + Skill OFF | $0.00405 | B |
| 8 | Haiku 4.5 + Skill ON | $0.00475 | B+ |
| 9 | GPT-5.4 + Skill OFF (cached) | $0.00651 | A |
| 10 | GPT-5.4 + Skill ON (cached) | $0.00669 | A |

Honorable: Sonnet 4.6 + Skill ON (cached) = $0.00683 (Tier A quality). GPT-5.5 = $0.013–0.017 (premium, rarely justified).

## 6 — Production recommendation (locked 2026-05-13)

**`GPT-5.4 Mini + HTML + Skill OFF + Single-call`**. Reasoning:
- UI-tuned by OpenAI ("designed for complex subagent tasks")
- Auto-caches above 1,024 tokens — system prompt always cached
- HTML output is fundamentally cheapest format (React ~2× cost)
- Single-call avoids pipeline router overhead
- Skill OFF because GPT-5.4 Mini already has strong design intuition; the Frontend Design Skill is wasted input tokens

Premium fallback for harder queries: `Sonnet 4.6 + HTML + Skill ON + Single-call` (~$0.007 cached).

## 7 — Optimization roadmap (Tier 1 — biggest impact, easiest)

For GPT-5.4 Mini specifically. ~92% of cost is OUTPUT tokens — attack there first.

| # | Optimization | Effort | Savings/call | Apply in |
|---|---|---|---|---|
| 1 | Add output verbosity caps to system prompt (≤ 800 tokens widget, 1-sentence prose, 2-4 items max, CSS shorthand, skip ARIA) | 30 min | **-$0.00045 (-23%)** | [[lib/engine/system-prompt-freeform.ts]] under `# CONSTRAINTS / ## Format constraints` |
| 2 | Lower `MAX_COMPLETION_TOKENS` 16384 → 2000 | 1 min | $0 (insurance vs runaway) | [[lib/engine/providers/openai.ts]] |
| 3 | Remove embedded HTML example from system prompt | 5 min | -$0.00003 + smaller cached prefix | [[lib/engine/system-prompt-freeform.ts]] end |
| 4 | Session cache keepalive (cheap ping every 4 min) | 1 hour | up to -$0.0010 (prevents cold-cache drop) | new code; ping with Gemini 3.1 Flash Lite |
| 5 | History truncation (last 6 turns, 500-char cap each) | 15 min | -$0.00004 (more at long chats) | [[lib/hooks/useChat.ts]] `messagesToHistory` |
| 6 | Mixed-tier pipeline (Gemini 3.1 router + GPT-5.4 Mini specialist) | 1 hour | tighter widgets at ~same cost | [[lib/engine/run-engine.ts]] router model param |
| 7 | Trivial-query bypass (`/^(hi|hello|thanks|ok)\W*$/`) → pre-built chips | 30 min | -$0.002 on ~12% of msgs | [[lib/hooks/useChat.ts]] send pre-check |
| 8 | Local prompt→HTML cache (Map keyed on prompt hash) | 1 hour | -$0.002 on cache hits | new module; useful for repeated chip-fired prompts |

After Tier 1: target **~$0.0012/call cached** (38% reduction from $0.00195). At 1M calls/mo = ~$750/mo saved.

## 8 — File layout

```
lib/engine/
  pricing.ts                  Pricing table + computeCost + estimateCost
  system-prompt-freeform.ts   Agent-structured prompt (single-call default)
  frontend-design-skill.ts    Reads frontend-design-skill.md at module init
  frontend-design-skill.md    Vendored from Anthropic Claude Code repo
  react-mode-override.ts      Appended to base prompt when outputFormat="react"
  router-prompt.ts            Tiny classifier prompt for Pipeline mode
  run-engine.ts               Branches on opts.pipeline; emits usage event
  widget-parser.ts            Sentinel state machine (provider-agnostic)
  providers/
    types.ts                  ProviderInvoker, ProviderResult, UsageMetadata
    index.ts                  ProviderId union, REGISTRY, getProvider, isProviderId
    anthropic.ts              createAnthropicStreamer factory (beta promptCaching)
    google.ts                 createGoogleStreamer factory
    openai.ts                 createOpenAIStreamer factory (auto-cache + reasoning_effort for gpt-5*)
  skills/
    base.ts                   SKILL_BASE (shared contract)
    index.ts                  Registry + composeSpecialistPrompt
    chips.ts / decision_card.ts / confirm_card.ts / stepper.ts /
    checklist.ts / table.ts / chart.ts / source_cards.ts /
    code_block.ts / inline_banner.ts
lib/
  download-widget.ts          downloadWidget(content, format), copyWidget
  download-page.ts            exportChatAsHtml, downloadChatPage
  test-prompts.ts             20 demo prompts (used by EmptyState)
lib/hooks/
  useChat.ts                  SendOpts, applyEvent (text/widget/usage/error/done)
lib/types/
  engine-widgets.ts           OutputFormat, UsageReport, EngineEvent, ChatMessage
components/chat/
  ChatShell.tsx               Header (Calculator + Download page + New chat), state, click delegation
  ModeSelector.tsx            Model dropdown + HTML/React pill + Skill + Pipeline toggles
  ChatMessage.tsx             Speaker labels, bubble, WidgetActions, UsageFooter w/ badges
  ChatInput.tsx               Textarea + send button
  ChatMessageList.tsx         Auto-scrolling list
  EmptyState.tsx              Hero + 20 grouped test prompts
  CostCalculator.tsx          Modal (createPortal!) cost comparison
components/output/
  OutputSystem.tsx            Dispatches HtmlBubble or ReactLiveBubble based on outputFormat
  HtmlBubble.tsx              DOMPurify sanitize + inject; allows `style` + `data-bap-*` + select SVG attrs
  ReactLiveBubble.tsx         react-live + sucrase; Preview / Code tabs; dynamic-imported (ssr:false)
  InlineTextRenderer.tsx      react-markdown for assistant prose
app/
  layout.tsx                  Loads Fraunces / DM Sans / JetBrains Mono via next/font
  globals.css                 CSS vars for cream (light) / espresso (dark); animations
  page.tsx                    Renders ChatShell
  api/engine/execute/route.ts SSE handler; accepts providerId, useSkill, pipeline, outputFormat
eval/
  prompts.ts                  3 test prompts: decision, stepper, chart
  run.ts                      Sweep runner — npm run eval
memory/
  MEMORY.md                   Index
  session_state.md            THIS FILE
  user_profile.md, project_mini_bap_purpose.md, architecture_html_subagent.md
```

## 9 — Test rig (`npm run eval`)

Sweeps 14 combos (7 models × Skill ON/OFF) × 3 prompts × 2 trials = 84 calls. ~$0.50-1.50 total, 8-25 min wall time. Saves each output as `eval/outputs/*.html` for manual review. Prints ranking by `cost / structural-pass-rate`.

Requires Node 20.12+ (uses `process.loadEnvFile`) and API keys in `.env.local`. Excludes Pipeline + React (deliberate — those are cost multipliers).

## 10 — Key gotchas / non-obvious things

- **`backdrop-filter` creates a new containing block for `position: fixed`.** That's why CostCalculator must use `createPortal(modal, document.body)` — otherwise the modal positions relative to the header, not the viewport.
- **GPT-5 family rejects `max_tokens`** — use `max_completion_tokens`. Already fixed in [[lib/engine/providers/openai.ts]].
- **GPT-5 family are reasoning models** — internal thinking tokens count against `max_completion_tokens`. We set `reasoning_effort: "low"` for any `gpt-5*` model to preserve visible-output budget.
- **Anthropic prompt caching** lives in beta endpoint (`client.beta.promptCaching.messages.stream`) on the installed SDK `^0.32.1`. Migrate to GA when SDK is bumped.
- **Haiku 4.5 NEVER caches** at our prompt size — min cacheable is 4,096 tokens, ours peaks at ~2,700 with Skill ON.
- **First call always shows 0% cache** — it's a cache *write*, not read. Hit appears on call 2+ within ~5 min TTL.
- **Pipeline router** is forced to HTML mode internally because it only emits one word; React override doesn't apply there.
- **React mode is code, not rendering by default** — used `react-live` to make it actually render LIVE. Tabs let user flip Preview ↔ Code.
- **Frontend Design Skill** (vendored from `https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/frontend-design/skills/frontend-design/SKILL.md`) is loaded via `readFileSync` at module init in [[lib/engine/frontend-design-skill.ts]] — works in dev; for prod build may need `outputFileTracingIncludes` in `next.config.ts`.
- **The model has design freedom** — no fixed `bap-*` class taxonomy. It invents classes/styles per response. Sanitizer permits `style` attr + any class name.
- **Contrast rule is non-negotiable** in the prompt: widget root MUST set both `background` and `color` inline. Otherwise widgets render invisibly against the bubble.

## 11 — Recent decisions log (newest first)

- **2026-05-13** Added `eval/run.ts` cost-efficiency sweep. Ranked by `$/successful-render`.
- **2026-05-13** Added in-app Cost Calculator (modal in header, sortable across all 7 models).
- **2026-05-13** Verified pricing against official docs; corrected Haiku ($1/$5), GPT-5.4 ($2.50/$15), GPT-5.5 cached ($0.50 not $2.50), Gemini cache rates added.
- **2026-05-13** Removed Llama/Groq + Gemini 2.5. Added Gemini 3.1 Flash Lite + GPT-5.5.
- **2026-05-13** Added Pipeline mode (router→specialist with per-widget skills in `skills/`).
- **2026-05-13** Added React output mode (live rendering via react-live + sucrase, tabbed Preview/Code).
- **2026-05-13** Added per-request usage telemetry (footer below each assistant bubble: tokens / cache % / cost / model / skill+pipeline+format badges).
- **2026-05-13** Added "Download page" button — exports full chat as standalone HTML.
- **2026-05-13** Restructured system prompt as agent definition (Identity / Purpose / Scope / Capabilities / Constraints / Aesthetic / Decision Framework / Error Recovery).
- **2026-05-13** Flattened ModeSelector — single model dropdown + independent Skill/Pipeline toggles.
- **2026-05-13** Swapped Haiku 4.5 → Sonnet 4.6 as Anthropic-mode default.
- **2026-05-12** Pivoted from typed-JSON+renderer-registry to free-form HTML output. Deleted 12 widget renderer components.
- **2026-05-12** Picked Subagent (not Skill) as the integration pattern for BAP.

## 12 — Open questions / what's not decided

- **When to migrate this into bap-engine?** Waiting on production-readiness gate from the test sweep.
- **bap-engine router contract** — how the main BAP agent decides to delegate to this widget subagent. Not yet designed.
- **Whether to keep React mode** in production or strip it. Useful for development (code artifact for codebase integration) but not exercised by end users.
- **Pipeline mode quality vs cost tradeoff** — eval will tell us if it's worth the +10-15% cost.
- **Frontend Design Skill license** — vendored content; need legal sign-off before production ship.
