---
name: architecture-html-subagent
description: Mini-bap's HTML-output subagent runs in two modes (Anthropic-only Sonnet 4.6 OR a weak model + Frontend Design Skill), with free-form widget templates. Decisions current as of 2026-05-12.
metadata:
  type: project
---

**Architecture pattern:** Subagent. The subagent will be invoked by a router in bap-engine; in mini-bap (the prototype) it IS the main agent.

**Output format:** HTML strings directly — no typed JSON envelopes, no `<ui-widget>` directive grammar, no client-side renderer registry. bap-web drops the HTML into the chat bubble after sanitization. **Templates are NOT fixed** — model picks visual aesthetic per response.

**Why HTML-only:** Minimal-integration path into bap-web. Trades theme/a11y rigidity, higher token cost, presentation coupling for a simpler frontend. Acceptable for MVP.

**Two selectable modes (Mode toggle in [[components/chat/ModeSelector.tsx]]) — each with a sub-model dropdown:**

1. **"Anthropic" mode** (no skill) — Sub-selector: **Sonnet 4.6** (default) or **Haiku 4.5**. Prompt caching enabled via beta endpoint (`cache_control: ephemeral`). Relies on Claude's design intuition without an external skill.
2. **"Other Models + Skill" mode** — Sub-selector: **Gemini 2.5 Flash** (default), **Gemini 3 Flash (preview)** [`gemini-3-flash-preview`], **Llama 3.3 70B (Groq)**, **GPT-5.4 Mini** [`gpt-5.4-mini`, ~$0.75/$4.50, UI-tuned for "complex subagent tasks"], **GPT-5.4** [`gpt-5.4`, ~$1.25/$10, UI flagship per OpenAI's own positioning]. The OpenAI streamer sets `reasoning_effort: "low"` for any `gpt-5*` model to keep output budget intact. The Anthropic Claude Code Frontend Design Skill (vendored from `https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/frontend-design/skills/frontend-design/SKILL.md`) is prepended to the system prompt to compensate for weaker design intuition. Llama on Groq has NO prompt caching — UI shows a quota warning when it's selected. OpenAI provides automatic caching for prompts ≥1024 tokens (50% off cached input). Google context caching available but minimum cacheable size (~4096 tokens) likely above current prompt size, so not used.

**Sonnet 4.6 is the Anthropic-mode model** (after iterating: Haiku 4.5 was tried first and swapped back to Sonnet 4.6 on 2026-05-13 — quality over cost for the Anthropic baseline).

**System prompt is free-form** ([[lib/engine/system-prompt-freeform.ts]], ~80 lines). It defines: sentinel grammar, sanitizer-relevant forbidden tags, `data-bap-prompt` interactivity, widget intent hints (NOT templates), explicit design-freedom directive. **No `bap-*` class taxonomy** — model invents class names per response. Inline `style` attributes are allowed (sanitizer permits the `style` attr).

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
