---
name: architecture-html-subagent
description: Mini-bap's HTML-output subagent runs in two modes (Anthropic-only Sonnet 4.6 OR a weak model + Frontend Design Skill), with free-form widget templates. Decisions current as of 2026-05-12.
metadata:
  type: project
---

**Architecture pattern:** Subagent. The subagent will be invoked by a router in bap-engine; in mini-bap (the prototype) it IS the main agent.

**Output format:** HTML strings directly — no typed JSON envelopes, no `<ui-widget>` directive grammar, no client-side renderer registry. bap-web drops the HTML into the chat bubble after sanitization. **Templates are NOT fixed** — model picks visual aesthetic per response.

**Why HTML-only:** Minimal-integration path into bap-web. Trades theme/a11y rigidity, higher token cost, presentation coupling for a simpler frontend. Acceptable for MVP.

**UI controls (after 2026-05-13 React-mode addition):** single model dropdown (grouped by family) + `HTML | React` segmented pill (output format) + `Skill ON/OFF` toggle (Frontend Design Skill prepend) + `Pipeline ON/OFF` toggle (router→specialist mode). All independent — 7 models × 2 formats × 2 skill × 2 pipeline = 56 distinct configurations.

**Output format toggle:**
- `HTML` (default): model emits sanitizable HTML, rendered live in the chat bubble via DOMPurify + injection ([[components/output/HtmlBubble.tsx]]). Downloads as standalone `.html` document.
- `React`: model emits a complete TSX functional component (raw source). Rendered LIVE via [[components/output/ReactLiveBubble.tsx]] using `react-live` + `sucrase` (browser-side TSX→JS compilation + eval). Bubble has tabs (Preview | Code) — Preview shows the actually-rendered component, Code shows syntax-highlighted source. `data-bap-prompt` clicks still fire follow-ups because the rendered DOM picks them up via the global delegator in [[components/chat/ChatShell.tsx]]. Downloads as `.tsx`. The React mode override prompt is appended to whichever base prompt the engine selected (single-mode, single+skill, pipeline-specialist, pipeline+skill) — single override file [[lib/engine/react-mode-override.ts]]. The live bubble strips ES6 imports + `export default` and adds `render(<Component />)` for react-live noInline mode; common React hooks (`useState`, `useEffect`, `useMemo`, `useRef`, `useCallback`, `useReducer`, `useId`, `Fragment`) provided via `scope`. Dynamic import in [[components/output/OutputSystem.tsx]] (`ssr: false`) keeps the ~200KB react-live + sucrase bundle out of the initial page load.

**Two execution modes:**

1. **Single-call mode (Pipeline OFF, current default):** One LLM call. System prompt = SYSTEM_PROMPT_FREEFORM (agent-structured) optionally prepended with the Frontend Design Skill.

2. **Pipeline mode (Pipeline ON):** Two LLM calls per turn.
   - **Stage 1 (Router):** Tiny classifier with [[lib/engine/router-prompt.ts]] (~250 tokens) returns a single bare intent name. Parsed in [[lib/engine/run-engine.ts]] with fallback to `chips` on garbled output.
   - **Stage 2 (Specialist):** Loads the corresponding per-widget skill from [[lib/engine/skills/]] (one file per intent: chips, decision_card, confirm_card, stepper, checklist, table, chart, source_cards, code_block, inline_banner). Each specialist gets `SKILL_BASE` (shared contract) + its widget-specific prompt + optional Frontend Design Skill prepend.
   - Usage from both calls is summed and reported as ONE combined `usage` SSE event.
   - The router's chosen intent is surfaced to the user as a one-line italic breadcrumb at the top of the response (e.g. `_Router picked **decision_card**._`).

Models available:
- **Anthropic:** Sonnet 4.6 (default), Haiku 4.5 — both cached via beta `cache_control: ephemeral`
- **Google:** Gemini 2.5 Flash, Gemini 3 Flash preview (`gemini-3-flash-preview`)
- **OpenAI:** GPT-5.4 Mini (UI-tuned, `gpt-5.4-mini`, ~$0.75/$4.50), GPT-5.4 (UI flagship, `gpt-5.4`, ~$1.25/$10). Both reasoning models; `reasoning_effort: "low"` set for any `gpt-5*` to preserve output budget. Auto-caching on prompts ≥ 1024 tokens.
- **Groq:** Llama 3.3 70B (`llama-3.3-70b-versatile`, no caching, UI banner warns)

**Per-response telemetry:** each assistant message renders a usage footer with input tokens, output tokens, cache hit rate, and computed cost in USD. Server captures usage from each SDK (Anthropic `finalMessage().usage`, OpenAI/Groq `stream_options: include_usage` final-chunk usage, Google `result.response.usageMetadata`), normalizes to `UsageMetadata`, and run-engine computes cost via [[lib/engine/pricing.ts]] table before emitting a `usage` SSE event. The Anthropic Claude Code Frontend Design Skill (vendored from `https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/frontend-design/skills/frontend-design/SKILL.md`) is prepended to the system prompt to compensate for weaker design intuition. Llama on Groq has NO prompt caching — UI shows a quota warning when it's selected. OpenAI provides automatic caching for prompts ≥1024 tokens (50% off cached input). Google context caching available but minimum cacheable size (~4096 tokens) likely above current prompt size, so not used.

**Sonnet 4.6 is the Anthropic-mode model** (after iterating: Haiku 4.5 was tried first and swapped back to Sonnet 4.6 on 2026-05-13 — quality over cost for the Anthropic baseline).

**System prompt is an agent-structured definition** ([[lib/engine/system-prompt-freeform.ts]], ~180 lines as of 2026-05-13 restructure). Organized into explicit sections: AGENT DEFINITION (identity), PURPOSE, SCOPE (in/out), CAPABILITIES (output channels + widget intents table), OUTPUT CONTRACT (sentinel grammar + interactivity convention), CONSTRAINTS (hard/format/trust model), AESTHETIC PRINCIPLES (design freedom + contrast), DECISION FRAMEWORK, ERROR RECOVERY, EXAMPLE. No `bap-*` class taxonomy — model invents class names per response. Inline `style` attributes allowed.

**Locked decisions (latest, 2026-05-12):**

- One widget per response. Streaming: prose deltas first, then exactly one `widget_html` event with a complete HTML block.
- Sanitization (DOMPurify) lives in bap-web only.
- `data-bap-prompt` attribute = interactivity convention; bap-web event-delegates clicks globally.
- Sentinel comments `<!--bap-widget:start-->` / `<!--bap-widget:end-->` mark widget boundaries (parser-essential).
- No evaluation harness. User A/B-tests modes through real chat use.
- API quota is constrained — caching is mandatory wherever supported.

**SSE event schema (unchanged from before):**
- `text_delta` — `{ "text": "..." }`
- `widget_html` — `{ "html": "<div>...</div>" }`
- `done`
- `error` — `{ "message": "..." }`

**Provider abstraction:** [[lib/engine/providers/]] — three streaming wrappers (`anthropic.ts`, `google.ts`, `groq.ts`) all returning `AsyncGenerator<string>`. [[lib/engine/run-engine.ts]] looks up the provider by `ProviderId` and pipes through the unchanged sentinel parser at [[lib/engine/widget-parser.ts]].

See [[project-mini-bap-purpose]] for context on how mini-bap relates to the production BAP product.
