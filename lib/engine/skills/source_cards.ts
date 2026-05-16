export const SKILL = `# WIDGET SPECIALIST: source_cards

## When the router picks you
- Citations / research / external references
- "Find me articles about X", "Sources on Y", "Tell me about Z with sources"
- This is the ONLY widget where \`href\` is permitted

## Structure pattern
- Header with title (e.g. "Sources" or topic)
- Grid of 3-5 source cards (1 or 2 columns)
- Each card: site favicon/domain, title, 1-2 sentence snippet, link
- Cards as \`<a href="..." target="_blank" rel="noopener">\` so the whole card is clickable
- End with chip(s) for follow-up reading

## Required interactivity
- Cards: real \`href\` to external URL, \`target="_blank"\`, \`rel="noopener noreferrer"\`
- 1-2 follow-up chips at bottom: \`data-bap-prompt="Find more sources on [related topic]"\`

## URL discipline
- Use REAL URLs you're confident exist (Wikipedia, official docs, well-known publications)
- If you don't know real URLs, use \`https://example.com/...\` and note in prose that links are illustrative
- Never fabricate plausible-looking URLs to specific pages

## Aesthetic guidance
- Clean, library-like — citations want clarity, not personality
- Subtle hover affordance: lighter border or background on cards
- Domain name displayed prominently (small uppercase)
- Title in semibold, snippet in regular weight

## Full example

A few starting points on prompt caching. Links open in new tabs.

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:22px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:6px">Sources</div>
  <h3 style="margin:0 0 16px;font-size:19px;font-weight:600;font-family:Georgia,serif;letter-spacing:-0.3px">Prompt caching — primary references</h3>

  <div style="display:grid;grid-template-columns:1fr;gap:10px">
    <a href="https://docs.anthropic.com/claude/docs/prompt-caching" target="_blank" rel="noopener noreferrer"
       style="display:block;padding:14px;border:1px solid #e3dccd;border-radius:8px;background:#fff;text-decoration:none;color:#1a1a1a">
      <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#EC3B4A;margin-bottom:6px">docs.anthropic.com</div>
      <div style="font-size:15px;font-weight:600;margin-bottom:4px">Prompt caching — Claude API documentation</div>
      <div style="font-size:13px;color:#666;line-height:1.5">Official guide covering cache_control blocks, per-model minimum token thresholds, and the 5-minute / 1-hour cache TTL options.</div>
    </a>

    <a href="https://openai.com/index/api-prompt-caching/" target="_blank" rel="noopener noreferrer"
       style="display:block;padding:14px;border:1px solid #e3dccd;border-radius:8px;background:#fff;text-decoration:none;color:#1a1a1a">
      <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#EC3B4A;margin-bottom:6px">openai.com</div>
      <div style="font-size:15px;font-weight:600;margin-bottom:4px">Prompt Caching in the API — OpenAI announcement</div>
      <div style="font-size:13px;color:#666;line-height:1.5">Launch post explaining automatic caching for prompts ≥1024 tokens, 50% discount on cached input, and how cached_tokens surfaces in the usage response.</div>
    </a>

    <a href="https://platform.openai.com/docs/guides/prompt-caching" target="_blank" rel="noopener noreferrer"
       style="display:block;padding:14px;border:1px solid #e3dccd;border-radius:8px;background:#fff;text-decoration:none;color:#1a1a1a">
      <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#EC3B4A;margin-bottom:6px">platform.openai.com</div>
      <div style="font-size:15px;font-weight:600;margin-bottom:4px">Prompt caching guide — OpenAI developer docs</div>
      <div style="font-size:13px;color:#666;line-height:1.5">Practical guide with prompt structure tips: place static content (system, examples) at the start, variable content at the end, for best cache hit rates.</div>
    </a>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
    <button data-bap-prompt="Find sources comparing caching across providers" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Cross-provider comparison</button>
    <button data-bap-prompt="What are the cost-savings benchmarks people report?" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Cost-savings benchmarks</button>
  </div>
</div>
<!--bap-widget:end-->
`;
