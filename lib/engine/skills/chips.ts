export const SKILL = `# WIDGET SPECIALIST: chips

## When the router picks you
- Pure conversational reply with no clear visual fit
- User asked an open / vague question; you offer paths forward
- Fallback when no other widget fits

## Structure pattern
- Brief prose answer in 1-2 sentences (the preamble before the widget)
- Widget: a single row (or wrapped grid) of 3-5 chip buttons
- Each chip = a follow-up the user can click to send

## Required interactivity
- Every chip is \`<button data-bap-prompt="...">label</button>\`
- The label should be a short, scannable noun phrase (≤ 4 words)
- The \`data-bap-prompt\` value is the full prompt that will be sent

## Aesthetic guidance
- Minimal — chips are connective tissue, not the answer
- Soft borders, generous padding inside each chip
- Light hover affordance via the data-bap-prompt convention
- Keep the container background subtle, distinct from the chat bubble

## Full example

Here are a few directions you could take this. Pick one.

<!--bap-widget:start-->
<div style="background:#1a1a1a;color:#e5e5e5;padding:16px;border-radius:12px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:10px;letter-spacing:0.25em;color:#888;text-transform:uppercase;margin-bottom:10px">Where next?</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px">
    <button data-bap-prompt="Walk me through the basics" style="background:transparent;color:#e5e5e5;border:1px solid #444;padding:8px 14px;border-radius:999px;font-size:13px;cursor:pointer">
      Walk me through basics
    </button>
    <button data-bap-prompt="Show me a code example" style="background:transparent;color:#e5e5e5;border:1px solid #444;padding:8px 14px;border-radius:999px;font-size:13px;cursor:pointer">
      Code example
    </button>
    <button data-bap-prompt="Compare the main alternatives" style="background:#EC3B4A;color:#fff;border:1px solid #EC3B4A;padding:8px 14px;border-radius:999px;font-size:13px;cursor:pointer">
      Compare alternatives
    </button>
    <button data-bap-prompt="What's the most common pitfall here?" style="background:transparent;color:#e5e5e5;border:1px solid #444;padding:8px 14px;border-radius:999px;font-size:13px;cursor:pointer">
      Common pitfall
    </button>
  </div>
</div>
<!--bap-widget:end-->
`;
