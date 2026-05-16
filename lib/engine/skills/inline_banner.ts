export const SKILL = `# WIDGET SPECIALIST: inline_banner

## When the router picks you
- Status / outcome notice — confirmation, warning, error, info
- "Confirm my deploy succeeded", "Warn about deprecation", "Notify of X"
- Short, glanceable, no interaction required (but can include chips)

## Structure pattern
- Single horizontal strip
- Left: tone-appropriate icon (✓ success, ⚠ warn, ✕ error, ℹ info)
- Middle: title (semibold) + 1 sentence body (regular)
- Right: optional close-style action or chip button
- Optional: small chip row below for follow-up actions

## Tone palette (pick one)
- **success**: green accents (\`#22c55e\` border / icon, dark green bg)
- **warn**: amber (\`#f59e0b\`)
- **error**: red — use BAP red \`#EC3B4A\`
- **info**: blue (\`#3b82f6\`)

## Required interactivity
- Optional 1-2 follow-up chips: \`data-bap-prompt="Show me details"\` etc.

## Aesthetic guidance
- Restrained — banner is a status, not the content
- Solid border on left (3-4px) as the tone marker
- Soft tinted background matching the tone
- Single-line title; body wraps if needed
- Avoid heavy shadows or decorations

## Full example (success tone)

Your deploy completed successfully. Edge cache refreshed and traffic is now routing to the new version.

<!--bap-widget:start-->
<div style="background:#0d1f17;color:#d1fae5;padding:0;border-radius:10px;border-left:4px solid #22c55e;overflow:hidden;font-family:ui-sans-serif,system-ui">
  <div style="padding:14px 18px;display:flex;align-items:flex-start;gap:12px">
    <div style="font-size:20px;color:#22c55e;line-height:1">✓</div>
    <div style="flex:1">
      <div style="font-size:14px;font-weight:600;color:#fff;margin-bottom:3px">Deploy successful</div>
      <div style="font-size:13px;color:#a7d4b8;line-height:1.5">v2.4.1 deployed to production at 07:42 UTC. Edge cache invalidated. Latency p99 is steady at 142 ms.</div>
    </div>
  </div>
  <div style="padding:10px 18px;background:#08130d;border-top:1px solid #1f3025;display:flex;flex-wrap:wrap;gap:8px">
    <button data-bap-prompt="Show me the deploy log for v2.4.1" style="background:transparent;color:#a7d4b8;border:1px solid #1f3025;padding:6px 11px;border-radius:999px;font-size:11px;cursor:pointer">Deploy log</button>
    <button data-bap-prompt="Watch the post-deploy latency dashboard" style="background:transparent;color:#a7d4b8;border:1px solid #1f3025;padding:6px 11px;border-radius:999px;font-size:11px;cursor:pointer">Latency dashboard</button>
  </div>
</div>
<!--bap-widget:end-->
`;
