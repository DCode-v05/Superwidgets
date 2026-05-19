---
name: architecture-html-subagent
description: Mini-bap is an HTML-widget subagent. Agentic 2-tool loop (build_widget, submit_widget) across 7 models, 30 widget skills. Script + form allowed for interactive widgets.
metadata:
  type: project
---

# Mini-BAP — current state

A UI-development subagent that produces ONE interactive HTML widget per user turn. In production, the main BAP engine delegates to it with a payload; in the prototype, the user prompt IS the payload.

## The loop

Two tools, one phase each:

| # | Tool | What it does | Terminal? |
|---|---|---|---|
| 1 | `build_widget(intent)` | HTML-free pre-flight. Returns the chosen skill's design note + skill-specific reminders (script safety, attrs, etc). | No |
| 2 | `submit_widget(intent, html, prose?)` | Validates intent + HTML structure + script safety in one pass. If valid → renders + ends the loop. If invalid → returns `{valid:false, issues}` for the agent to fix and call again. | **Yes (if valid)** |

`MAX_ITERATIONS = 8` in [[lib/engine/run-engine.ts]] is the safety cap.

## Widget catalog (30 skills)

[[lib/engine/tools/widget-library.ts]]

| Family | Skills |
|---|---|
| Static | chips · decision_card · confirm_card · stepper · checklist · timeline · table · chart · source_cards · code_block · inline_banner |
| Diagrams | flowchart · venn_diagram · mind_map · sequence_diagram · tree_diagram · gantt_chart · map |
| Charts | pie_chart · heatmap · scatter_plot · funnel_chart · radar_chart |
| Dashboards | kpi_dashboard · profile_card · kanban_board · pricing_table |
| Interactive (script ± form) | calculator · quiz · form |

## Providers ([[lib/engine/providers/]])

All implement `AgentTurnInvoker` — same normalized interface, native translation per API:

- **Anthropic** (Sonnet 4.6, Haiku 4.5) — beta promptCaching messages with `cache_control: ephemeral` on the system prompt
- **OpenAI** (GPT-5.4 Mini, 5.4, 5.5) — Responses API (`/v1/responses`), `reasoning.effort: "none"`. Chat completions rejects `reasoning_effort` + `tools` on GPT-5, so we use Responses. GPT-5 vocabulary is `none/low/medium/high/xhigh` — `minimal` is NOT accepted. SDK ^4.104 types only know low/medium/high; "none" sent via cast.
- **Google** (Gemini 3 Flash, 3.1 Flash Lite) — `functionDeclarations`; synthesizes call IDs (Gemini doesn't issue stable ones)

## Sanitizer + script-execution shim ([[components/output/HtmlBubble.tsx]])

DOMPurify config permits `<script>`, `<form>`, form controls. Stripped: `<iframe>`, `<style>`, `<object>`, `<embed>`, all `on*` handlers, `script src`, `form action/method`. `ALLOW_DATA_ATTR: true` so `data-role` and other model-emitted hooks survive.

The shim:
1. Owns the inner DOM manually via a ref (NOT `dangerouslySetInnerHTML`) — prevents React re-touching the inner DOM on parent re-renders and orphaning listeners
2. Sets `containerRef.current.innerHTML = clean` inside `useEffect` gated on `[clean]` (idempotent guard against StrictMode double-effect)
3. Rewrites `id="bap-w-X"` with a random per-instance suffix to prevent ID collisions across multiple widgets on one page
4. Clones each `<script>` into a fresh element so it executes (HTML5 spec: scripts inserted via innerHTML don't run)
5. Wraps the script body in `try/catch` so an in-script throw doesn't surface in the Next.js error overlay

## Validator ([[lib/engine/tools/validate.ts]])

Sanitizer-equivalent checks:
- Sentinels (`<!--bap-widget:start-->` / `<!--bap-widget:end-->`) present, exactly one widget block
- Forbidden tags, on* attributes, script src, form action/method
- Contrast rule: root must set `background` AND `color` inline
- Tag balance per-name (void/SVG-leaf elements: closes optional; non-void: must match exactly)
- Size cap: `MAX_WIDGET_BYTES = 12_000`
- Script safety: no fetch/XHR/WebSocket/eval/new Function/document.write
- `.value` vs `.textContent` mismatch detection (correlates `data-role` HTML elements to script variable bindings)

## Interactivity convention

**Every widget has a click target** (validator-enforced). Default: `data-bap-prompt="follow-up message"` on the natural per-item element — table rows, KPI tiles, kanban cards, timeline events, heatmap cells, SVG bars / pie slices / venn regions / flowchart nodes / mind-map branches, stepper steps, checklist items, profile-card CTA, calculator "Explain" pill, quiz "Review answers" chip (rendered post-submit by the script). The global click delegator in [[components/chat/ChatShell.tsx]] uses `target.closest("[data-bap-prompt]")` so any element type works.

**Exception:** `source_cards` uses `<a href="..." target="_blank" rel="noopener">` to open the external citation in a new tab instead of firing a follow-up.

For destructive actions, also add `data-bap-confirm` — the host gates with `window.confirm()` before sending. `code_block` carries a small in-widget `<script>` for clipboard copy (not in the interactive family because it has no live state).

## SSE event schema

```
text_delta · tool_call · tool_result · widget_html · usage · error · done
```

## File layout

```
app/api/engine/execute/route.ts   SSE handler
lib/engine/
  run-engine.ts                   Loop orchestration (MAX_ITERATIONS=8)
  system-prompt-freeform.ts       Agent definition + skill catalog + design + example
  pricing.ts                      Cost computation per provider
  frontend-design-skill.ts        Optional Frontend Design Skill prepend
  providers/
    types.ts                      AgentTurnInvoker, TurnEvent, StopReason, UsageMetadata
    index.ts                      ProviderId, registry, getProvider
    anthropic.ts · openai.ts · google.ts
  tools/
    types.ts                      ToolDefinition, ToolCall, ToolResult, AgentMessage
    schemas.ts                    The 2 tool definitions
    widget-library.ts             22 skills with design notes + reference HTMLs
    validate.ts                   Structural + script safety
    executors.ts                  Tool dispatch
    index.ts                      Re-exports
lib/hooks/useChat.ts              Client SSE parser
lib/types/engine-widgets.ts       TraceStep, EngineEvent, ChatMessage
components/output/
  HtmlBubble.tsx                  DOMPurify + script-execution shim
  AgentTrace.tsx                  Collapsible loop trace
  OutputSystem.tsx · InlineTextRenderer.tsx
components/chat/
  ChatShell.tsx                   Header + prompt library + chat list + input
  ChatMessage.tsx · ChatInput.tsx · ChatMessageList.tsx
  ModeSelector.tsx                Model dropdown + Skill toggle
  PromptLibrary.tsx               Slide-out drawer with demo prompts
  CostCalculator.tsx              Modal cost comparison
  EmptyState.tsx
```

## Design direction

[[lib/engine/system-prompt-freeform.ts]] OUTPUT CRAFT + DESIGN sections push for editorial-quality density without naming token targets:

- **Flat aesthetic** — no shadows, no gradients, no blur/backdrop, no translucent overlay fills. Hierarchy comes from color + weight + size + structure
- **Free palette per widget** — mood varies turn-to-turn (warm/cool/noir/paper/etc). BAP red `#EC3B4A` is the ONLY brand accent
- **Multiple sections per widget** — header strip, body, secondary panel, footer/metadata strip
- **3–6 inline SVG icons** per widget (check, arrow, chevron, dot, etc. with `stroke="currentColor"`)
- **4–6 typography sizes** for layered hierarchy
- **Borders + dividers liberally** — used throughout as the depth substitute

The widget should look like it BELONGS inside mini-bap's cream / espresso chat bubble.
