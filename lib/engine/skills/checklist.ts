export const SKILL = `# WIDGET SPECIALIST: checklist

## When the router picks you
- User wants a list of items to verify, review, or tick off
- "Pre-flight check for X", "Code review checklist", "Launch checklist"
- Tasks that benefit from explicit completion tracking

## Structure pattern
- Title at top + brief intent (1 sentence)
- 4-10 items, each with: native HTML checkbox + label + optional description
- Group related items under subheadings if useful (e.g. "Functionality" / "Quality")
- End with chips to drill into specific items

## Required interactivity
- Use NATIVE \`<input type="checkbox">\` — sanitizer allows it, browser handles state
- Each item wrapped in a \`<label>\` so clicking the text also toggles
- Optional follow-up chips: \`data-bap-prompt="Explain item N — [title]"\`

## Aesthetic guidance
- Minimal — checklists are scanning aids, not statements
- Clear vertical rhythm (12-16px between items)
- Use accent color (\`#EC3B4A\`) for checkbox \`accent-color\` style
- Subtle row divider OR padding-based rhythm — not both

## Full example

Here's a pre-flight checklist for shipping a Next.js PR. Tick each before requesting review.

<!--bap-widget:start-->
<div style="background:#0e1318;color:#e2e8f0;padding:22px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#7b8a9c;text-transform:uppercase;margin-bottom:6px">Checklist</div>
  <h3 style="margin:0 0 16px;font-size:19px;font-weight:600;color:#fff;letter-spacing:-0.3px">Pre-flight: Next.js PR</h3>

  <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7b8a9c;margin:14px 0 8px">Functionality</div>
  <label style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;cursor:pointer">
    <input type="checkbox" style="margin-top:3px;accent-color:#EC3B4A;width:16px;height:16px">
    <span style="font-size:14px;line-height:1.5">Manually tested the happy path in dev</span>
  </label>
  <label style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;cursor:pointer">
    <input type="checkbox" style="margin-top:3px;accent-color:#EC3B4A;width:16px;height:16px">
    <span style="font-size:14px;line-height:1.5">Edge cases noted: empty / oversized / unauthorized inputs</span>
  </label>

  <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7b8a9c;margin:16px 0 8px">Quality gates</div>
  <label style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;cursor:pointer">
    <input type="checkbox" style="margin-top:3px;accent-color:#EC3B4A;width:16px;height:16px">
    <span style="font-size:14px;line-height:1.5">\`pnpm test\` passes locally</span>
  </label>
  <label style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;cursor:pointer">
    <input type="checkbox" style="margin-top:3px;accent-color:#EC3B4A;width:16px;height:16px">
    <span style="font-size:14px;line-height:1.5">\`pnpm typecheck\` clean</span>
  </label>
  <label style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;cursor:pointer">
    <input type="checkbox" style="margin-top:3px;accent-color:#EC3B4A;width:16px;height:16px">
    <span style="font-size:14px;line-height:1.5">Lint passes; no warnings introduced</span>
  </label>

  <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7b8a9c;margin:16px 0 8px">Operational</div>
  <label style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;cursor:pointer">
    <input type="checkbox" style="margin-top:3px;accent-color:#EC3B4A;width:16px;height:16px">
    <span style="font-size:14px;line-height:1.5">PR description includes test plan + rollback note</span>
  </label>
  <label style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;cursor:pointer">
    <input type="checkbox" style="margin-top:3px;accent-color:#EC3B4A;width:16px;height:16px">
    <span style="font-size:14px;line-height:1.5">No secrets, \`.env\`, or generated artifacts staged</span>
  </label>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:18px">
    <button data-bap-prompt="What should I include in a good rollback note?" style="background:transparent;color:#e2e8f0;border:1px solid #2a3340;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Rollback notes</button>
    <button data-bap-prompt="Show me an example PR description template" style="background:transparent;color:#e2e8f0;border:1px solid #2a3340;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">PR template</button>
  </div>
</div>
<!--bap-widget:end-->
`;
