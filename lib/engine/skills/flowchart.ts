export const SKILL = `# WIDGET SPECIALIST: flowchart

## When the router picks you
- Process flow, system flow, branching logic ("how does X work", "trace the request")
- Decision tree (yes/no/maybe branches)
- Multi-path workflows (not a linear stepper)
- NOT for chronological events (use timeline) and NOT for linear plans (use stepper)

## Structure pattern
- Header with title (e.g. "How OAuth 2.0 works")
- Inline SVG, viewBox 0 0 600 400
- 3–8 nodes arranged left-to-right OR top-to-bottom
- Node shapes: rectangles for steps, diamonds for decisions, pills for start/end
- Edges as straight lines or simple curves with optional labels ("yes" / "no")
- End with 1–2 follow-up chips ("explain X step", "what about Y branch")

## Aesthetic guidance
- Clean technical-doc feel — no decoration overload
- BAP red \`#EC3B4A\` for the primary path; gray for branches
- Node fill: light neutral; border: 1.5px stroke
- Label inside node, centered, sans-serif
- Edge labels: small mono font, midpoint of the edge

## Full example (OAuth flow)

Here's how an OAuth 2.0 authorization-code flow works.

<!--bap-widget:start-->
<div style="background:#fdfcf8;color:#1a1a1a;padding:22px;border-radius:14px;font-family:ui-sans-serif,system-ui">
  <div style="font-size:11px;letter-spacing:0.25em;color:#8a8a8a;text-transform:uppercase;margin-bottom:4px">Flow</div>
  <h3 style="margin:0 0 14px;font-size:19px;font-weight:600;letter-spacing:-0.3px;font-family:Georgia,serif">OAuth 2.0 — authorization code flow</h3>

  <svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;background:#fff;border:1px solid #ece5d4;border-radius:8px">
    <!-- Edges -->
    <line x1="120" y1="80" x2="220" y2="80" stroke="#888" stroke-width="1.5"/>
    <line x1="320" y1="80" x2="420" y2="80" stroke="#888" stroke-width="1.5"/>
    <line x1="470" y1="110" x2="470" y2="170" stroke="#888" stroke-width="1.5"/>
    <line x1="420" y1="200" x2="320" y2="200" stroke="#EC3B4A" stroke-width="2"/>
    <line x1="220" y1="200" x2="120" y2="200" stroke="#EC3B4A" stroke-width="2"/>

    <!-- Arrowheads (single shared) -->
    <polygon points="218,76 230,80 218,84" fill="#888"/>
    <polygon points="418,76 430,80 418,84" fill="#888"/>
    <polygon points="466,168 470,180 474,168" fill="#888"/>
    <polygon points="322,196 310,200 322,204" fill="#EC3B4A"/>
    <polygon points="122,196 110,200 122,204" fill="#EC3B4A"/>

    <!-- Nodes -->
    <rect x="30" y="60"  width="90" height="40" rx="20" fill="#16181f" stroke="#16181f"/>
    <text x="75" y="86" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">User</text>

    <rect x="220" y="60" width="100" height="40" rx="6" fill="#fff" stroke="#333"/>
    <text x="270" y="86" text-anchor="middle" fill="#1a1a1a" font-size="12">Client app</text>

    <rect x="420" y="60" width="100" height="40" rx="6" fill="#fff" stroke="#333"/>
    <text x="470" y="86" text-anchor="middle" fill="#1a1a1a" font-size="12">Auth server</text>

    <rect x="420" y="180" width="100" height="40" rx="6" fill="#fff" stroke="#333"/>
    <text x="470" y="206" text-anchor="middle" fill="#1a1a1a" font-size="12">Token endpoint</text>

    <rect x="220" y="180" width="100" height="40" rx="6" fill="#fff" stroke="#EC3B4A" stroke-width="1.5"/>
    <text x="270" y="206" text-anchor="middle" fill="#EC3B4A" font-size="12" font-weight="600">Access token</text>

    <rect x="30" y="180" width="90" height="40" rx="20" fill="#16181f" stroke="#16181f"/>
    <text x="75" y="206" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">User</text>

    <!-- Edge labels -->
    <text x="170" y="74" text-anchor="middle" font-size="10" fill="#666" font-family="ui-monospace,monospace">login</text>
    <text x="370" y="74" text-anchor="middle" font-size="10" fill="#666" font-family="ui-monospace,monospace">authorize</text>
    <text x="486" y="146" font-size="10" fill="#666" font-family="ui-monospace,monospace">code</text>
    <text x="370" y="194" text-anchor="middle" font-size="10" fill="#EC3B4A" font-family="ui-monospace,monospace">exchange</text>
    <text x="170" y="194" text-anchor="middle" font-size="10" fill="#EC3B4A" font-family="ui-monospace,monospace">access</text>
  </svg>

  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
    <button data-bap-prompt="Why is PKCE needed for mobile apps?" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Why PKCE?</button>
    <button data-bap-prompt="Compare authorization code vs implicit flow" style="background:transparent;color:#1a1a1a;border:1px solid #d8cfbe;padding:7px 13px;border-radius:999px;font-size:12px;cursor:pointer">Vs implicit flow</button>
  </div>
</div>
<!--bap-widget:end-->
`;
