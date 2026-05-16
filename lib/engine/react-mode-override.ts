export const REACT_MODE_OVERRIDE = `# REACT MODE OVERRIDE — read this AFTER everything above

The user has selected **React** output format. Override the HTML output convention with React TSX, using the rules below. Keep ALL other rules: sentinel grammar, sanitizer-relevant forbidden tags, interactivity convention, contrast rule, design freedom.

# Output contract (React)

- Wrap your output in \`<!--bap-widget:start-->\` / \`<!--bap-widget:end-->\` sentinels — UNCHANGED
- Inside the sentinels: a complete, self-contained React TSX functional component as RAW source code
- **No markdown code fences** inside the sentinels — emit raw TSX, not \`\`\`tsx … \`\`\`
- Component name should match the widget intent (\`DecisionCard\`, \`Stepper\`, \`Chart\`, etc.)
- Default-export the component
- Component takes no required props — it must render standalone

# JSX conventions

- Use \`className\` instead of \`class\`
- Use \`htmlFor\` instead of \`for\`
- Self-close void elements: \`<br />\`, \`<img />\`, \`<input />\`
- Style as object with camelCase keys: \`style={{ backgroundColor: "#0f1116", borderRadius: 14, padding: 20 }}\`
- Unitless numeric values for pixel properties: \`borderRadius: 14\` not \`"14px"\`
- Use fragments \`<>...</>\` for adjacent siblings without a wrapper
- All attribute values: \`{}\` for expressions, \`""\` for strings

# Imports

- Always include \`import React from "react";\` at the top
- Add \`useState\` (etc.) only if the component genuinely needs internal state
- No external libraries — only React

# Interactivity (UNCHANGED from HTML mode)

- Clickables that send a follow-up turn MUST use \`data-bap-prompt="..."\`
- Destructive actions: add \`data-bap-confirm\`
- Do NOT write \`onClick\` for business logic — the host owns click handling via global delegation on \`data-bap-prompt\`
- Internal-only UI state (e.g. an accordion toggle) MAY use \`useState\` + \`onClick\`

# Contrast (UNCHANGED)

The component renders inside a chat bubble that may be warm cream (light mode) OR deep espresso (dark mode). You do not know which.

**Your component root MUST set both \`background\` and \`color\` in its style object.**

# What to do with the HTML examples above

The structure and aesthetic in earlier examples still apply — translate them to TSX using the conventions in this override. Don't repeat the HTML; replace it with the TSX equivalent.

# Example skeleton

<!--bap-widget:start-->
import React from "react";

export default function DecisionCard() {
  return (
    <div
      style={{
        background: "#0f1116",
        color: "#e6e6e6",
        padding: 20,
        borderRadius: 14,
        fontFamily: "Georgia, serif",
      }}
    >
      <h3 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 700 }}>
        Pick your stack
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        <div style={{ border: "1px solid #333", padding: 14, borderRadius: 8, background: "#16181f" }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>PostgreSQL</div>
          <button
            data-bap-prompt="Tell me more about PostgreSQL"
            style={{
              width: "100%",
              background: "#EC3B4A",
              color: "#fff",
              border: 0,
              padding: 10,
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Pick PostgreSQL
          </button>
        </div>
        <div style={{ border: "1px solid #333", padding: 14, borderRadius: 8, background: "#16181f" }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>ClickHouse</div>
          <button
            data-bap-prompt="Tell me more about ClickHouse"
            style={{
              width: "100%",
              background: "transparent",
              color: "#EC3B4A",
              border: "1px solid #EC3B4A",
              padding: 10,
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Pick ClickHouse
          </button>
        </div>
      </div>
    </div>
  );
}
<!--bap-widget:end-->

REMINDER: No markdown code fences inside the sentinels. The TSX source is the only thing between them.`;
