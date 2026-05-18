export const SKILL = `# WIDGET SPECIALIST: pricing_table

## When the router picks you
- "Compare plans", "show pricing", "what's the difference between Free / Pro / Enterprise"
- Tiered subscription / SaaS pricing with features per tier
- NOT for generic comparison (use table) and NOT for 2–4 unstructured options (use decision_card)

## Structure pattern
- Header with title + optional subtitle
- 3 (most common) or 4 tier cards in a row, each containing:
  - Tier name (semibold)
  - Price (big, distinctive)
  - One-line tagline
  - Feature list: ✓ included / ✗ not included
  - CTA button at the bottom (data-bap-prompt)
- ONE tier marked as recommended — visually emphasized (BAP red border + ribbon)
- End with 1–2 follow-up chips

## Aesthetic guidance
- SaaS-marketing feel — restrained, scannable
- Recommended tier: BAP red border, slightly elevated, "Recommended" pill at top
- Price in a distinctive font (serif works); /period in smaller mono
- Features in a vertical list with green ✓ or muted ✗

## Full example (SaaS pricing)

Here are the three plans. Pro is the sweet spot for most teams.

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:22px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Pricing</div>
  <h3 style="margin:0 0 16px;font-size:20px;font-weight:600;letter-spacing:-0.3px;font-family:Georgia,serif">Choose your plan</h3>

  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
    <div style="background:#fff;border:1px solid #e3dccd;border-radius:10px;padding:16px;display:flex;flex-direction:column">
      <div style="font-size:13px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:0.1em">Free</div>
      <div style="font-family:Georgia,serif;font-size:32px;font-weight:700;margin:8px 0 2px">$0<span style="font-size:13px;font-family:ui-monospace,monospace;color:#999;font-weight:400">/mo</span></div>
      <div style="font-size:12px;color:#666;margin-bottom:14px">Try it before you commit</div>
      <ul style="list-style:none;padding:0;margin:0 0 14px;font-size:13px;line-height:1.9;flex:1">
        <li><span style="color:#2d7a3e">✓</span> 1 project</li>
        <li><span style="color:#2d7a3e">✓</span> 100 events / mo</li>
        <li><span style="color:#bbb">✗</span> Email support</li>
        <li><span style="color:#bbb">✗</span> Custom domains</li>
      </ul>
      <button data-bap-prompt="Sign me up for the Free plan" style="width:100%;background:#fff;color:#1a1a1a;border:1px solid #1a1a1a;padding:9px;border-radius:6px;font-weight:600;cursor:pointer">Start free</button>
    </div>

    <div style="background:#fff;border:2px solid #EC3B4A;border-radius:10px;padding:16px;display:flex;flex-direction:column;position:relative;box-shadow:0 6px 18px rgba(236,59,74,0.12)">
      <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#EC3B4A;color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:999px;letter-spacing:0.15em;text-transform:uppercase">Recommended</div>
      <div style="font-size:13px;font-weight:600;color:#EC3B4A;text-transform:uppercase;letter-spacing:0.1em">Pro</div>
      <div style="font-family:Georgia,serif;font-size:32px;font-weight:700;margin:8px 0 2px">$29<span style="font-size:13px;font-family:ui-monospace,monospace;color:#999;font-weight:400">/mo</span></div>
      <div style="font-size:12px;color:#666;margin-bottom:14px">For teams shipping in production</div>
      <ul style="list-style:none;padding:0;margin:0 0 14px;font-size:13px;line-height:1.9;flex:1">
        <li><span style="color:#2d7a3e">✓</span> Unlimited projects</li>
        <li><span style="color:#2d7a3e">✓</span> 1M events / mo</li>
        <li><span style="color:#2d7a3e">✓</span> Email + chat support</li>
        <li><span style="color:#2d7a3e">✓</span> Custom domains</li>
      </ul>
      <button data-bap-prompt="Sign me up for the Pro plan" style="width:100%;background:#EC3B4A;color:#fff;border:0;padding:10px;border-radius:6px;font-weight:600;cursor:pointer">Start Pro</button>
    </div>

    <div style="background:#fff;border:1px solid #e3dccd;border-radius:10px;padding:16px;display:flex;flex-direction:column">
      <div style="font-size:13px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:0.1em">Enterprise</div>
      <div style="font-family:Georgia,serif;font-size:32px;font-weight:700;margin:8px 0 2px">Custom</div>
      <div style="font-size:12px;color:#666;margin-bottom:14px">SSO, SLAs, dedicated infra</div>
      <ul style="list-style:none;padding:0;margin:0 0 14px;font-size:13px;line-height:1.9;flex:1">
        <li><span style="color:#2d7a3e">✓</span> Everything in Pro</li>
        <li><span style="color:#2d7a3e">✓</span> SSO &amp; SAML</li>
        <li><span style="color:#2d7a3e">✓</span> 99.99% SLA</li>
        <li><span style="color:#2d7a3e">✓</span> Dedicated CSM</li>
      </ul>
      <button data-bap-prompt="Book a call about Enterprise pricing" style="width:100%;background:#fff;color:#1a1a1a;border:1px solid #1a1a1a;padding:9px;border-radius:6px;font-weight:600;cursor:pointer">Talk to sales</button>
    </div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
    <button data-bap-prompt="What's the annual discount?" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Annual discount</button>
    <button data-bap-prompt="Can I downgrade later?" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Downgrade policy</button>
  </div>
</div>
<!--bap-widget:end-->
`;
