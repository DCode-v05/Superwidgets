export const SKILL = `# WIDGET SPECIALIST: confirm_card

## When the router picks you
- User requested a destructive / irreversible action
- "Send email to N users", "Delete X", "Run migration", "Deploy to prod"
- Any action that can't be undone with one click

## Structure pattern
- Title at top stating the action being confirmed
- 1-2 sentence summary of what will happen
- Bulleted details (audience size, scope, impact)
- Two buttons at bottom: Cancel (left, ghost) + Proceed (right, danger)
- Proceed button gets BOTH \`data-bap-prompt\` AND \`data-bap-confirm\`

## Required interactivity
- Proceed: \`<button data-bap-prompt="Confirmed — [describe action]. Proceed." data-bap-confirm>...</button>\`
- Cancel: \`<button data-bap-prompt="Cancelled. Suggest a safer alternative.">Cancel</button>\`
- \`data-bap-confirm\` makes the web app gate the click behind a native confirm() dialog

## Aesthetic guidance
- Visually serious — borderline alarming for truly destructive actions
- Use warning iconography (⚠ unicode or inline SVG)
- Background tint: subtle red wash if dangerous
- Border: solid 1-2px in red or amber
- NOT playful — sober, functional, clear

## Full example

This action will reach 200 inboxes and can't be recalled. Please confirm before proceeding.

<!--bap-widget:start-->
<div style="background:#1c1517;color:#f5e5e5;padding:22px;border:1px solid #5a2128;border-radius:12px;font-family:ui-sans-serif,system-ui">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
    <span style="font-size:22px;color:#EC3B4A">⚠</span>
    <h3 style="margin:0;font-size:18px;font-weight:700;letter-spacing:-0.3px;color:#fff">Send to 200 users?</h3>
  </div>
  <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#d8c5c8">
    You're about to send the onboarding email to every user in your "Q2 cohort" audience. This cannot be recalled once sent.
  </p>
  <ul style="margin:0 0 18px;padding-left:18px;font-size:13px;line-height:1.7;color:#b89a9d">
    <li>Audience: 200 users (Q2 cohort)</li>
    <li>Channel: transactional email via SendGrid</li>
    <li>Delivery starts immediately, no scheduling delay</li>
  </ul>
  <div style="display:flex;gap:10px;justify-content:flex-end">
    <button data-bap-prompt="Cancelled. Suggest a safer alternative — maybe a smaller test send first."
            style="background:transparent;color:#d8c5c8;border:1px solid #5a2128;padding:10px 18px;border-radius:7px;font-weight:500;font-size:13px;cursor:pointer">
      Cancel
    </button>
    <button data-bap-prompt="Confirmed — send the onboarding email to all 200 users in the Q2 cohort. Proceed."
            data-bap-confirm
            style="background:#EC3B4A;color:#fff;border:1px solid #EC3B4A;padding:10px 18px;border-radius:7px;font-weight:600;font-size:13px;cursor:pointer">
      Send now
    </button>
  </div>
</div>
<!--bap-widget:end-->
`;
