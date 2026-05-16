export const SKILL = `# WIDGET SPECIALIST: decision_card

## When the router picks you
- User must pick between 2–4 options that have real tradeoffs
- Comparison where a recommendation is appropriate
- "Should I use X or Y?" / "Which is better for…" queries

## Structure pattern
- Question / framing at top (h3)
- Grid of option cards (2 columns on desktop)
- Each card: title, optional subtitle, ≤3 pros, ≤3 cons, CTA button
- Optionally mark ONE card as "recommended" with a visible badge
- End with 2-3 follow-up chips

## Required interactivity
- Each option's CTA: \`data-bap-prompt="I picked [option name]. Tell me why this is the right choice."\`
- Recommended card's CTA: filled BAP red (\`#EC3B4A\`)
- Non-recommended CTAs: outlined / ghost style

## Aesthetic guidance
- Editorial: distinctive serif headings (Georgia, Fraunces, Instrument Serif), refined body sans
- Generous internal padding (16-20px)
- Subtle border between cards, clear visual hierarchy
- Use \`✓\` for pros, \`✗\` for cons (or unicode icons)

## Full example

Here's a side-by-side. Both work; one is the safer default for your use case.

<!--bap-widget:start-->
<div style="background:#fafaf7;color:#1a1a1a;padding:24px;border-radius:14px;font-family:Georgia,serif">
  <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#888;margin-bottom:6px">Decision</div>
  <h3 style="margin:0 0 18px;font-size:22px;font-weight:600;letter-spacing:-0.5px">Which database for analytics?</h3>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
    <div style="background:#fff;border:2px solid #EC3B4A;padding:16px;border-radius:10px;position:relative">
      <div style="position:absolute;top:-10px;right:14px;background:#EC3B4A;color:#fff;font-size:10px;padding:3px 10px;border-radius:999px;font-family:ui-sans-serif;letter-spacing:0.1em;text-transform:uppercase">Recommended</div>
      <div style="font-size:18px;font-weight:700;margin-bottom:8px">PostgreSQL</div>
      <ul style="margin:0 0 12px;padding-left:0;list-style:none;font-size:13px;line-height:1.7;color:#333;font-family:ui-sans-serif,system-ui">
        <li>✓ Single ops surface you already run</li>
        <li>✓ Strong transactional guarantees</li>
        <li>✓ Mature ecosystem and tooling</li>
      </ul>
      <ul style="margin:0 0 14px;padding-left:0;list-style:none;font-size:13px;line-height:1.7;color:#888;font-family:ui-sans-serif,system-ui">
        <li>✗ Aggregations slow past a few TB</li>
      </ul>
      <button data-bap-prompt="I picked PostgreSQL. Tell me why this is the right choice for analytics."
              style="width:100%;background:#EC3B4A;color:#fff;border:0;padding:11px;border-radius:7px;font-weight:600;font-size:14px;cursor:pointer;font-family:ui-sans-serif">
        Pick PostgreSQL
      </button>
    </div>
    <div style="background:#fff;border:1px solid #ddd;padding:16px;border-radius:10px">
      <div style="font-size:18px;font-weight:700;margin-bottom:8px">ClickHouse</div>
      <ul style="margin:0 0 12px;padding-left:0;list-style:none;font-size:13px;line-height:1.7;color:#333;font-family:ui-sans-serif,system-ui">
        <li>✓ 10–100× faster on aggregations</li>
        <li>✓ Excellent for append-only workloads</li>
      </ul>
      <ul style="margin:0 0 14px;padding-left:0;list-style:none;font-size:13px;line-height:1.7;color:#888;font-family:ui-sans-serif,system-ui">
        <li>✗ No row-level transactions</li>
        <li>✗ New ops surface to learn</li>
      </ul>
      <button data-bap-prompt="I picked ClickHouse. Tell me why this is the right choice for analytics."
              style="width:100%;background:transparent;color:#EC3B4A;border:1px solid #EC3B4A;padding:11px;border-radius:7px;font-weight:600;font-size:14px;cursor:pointer;font-family:ui-sans-serif">
        Pick ClickHouse
      </button>
    </div>
  </div>
</div>
<!--bap-widget:end-->
`;
