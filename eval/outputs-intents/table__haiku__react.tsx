import React from "react";

export default function ServerlessComparison() {
  const platforms = [
    {
      name: "AWS Lambda",
      coldStart: "100–300ms",
      pricing: "Pay per execution + GB-s",
      regions: "35+ global",
      vendor: "AWS",
      strength: "Ecosystem depth",
      weakness: "Complexity",
    },
    {
      name: "Vercel Functions",
      coldStart: "50–100ms",
      pricing: "$0.50 per 1M requests",
      regions: "Global CDN",
      vendor: "Vercel",
      strength: "Next.js native",
      weakness: "Node.js only",
    },
    {
      name: "Cloudflare Workers",
      coldStart: "~1ms",
      pricing: "$0.30 per 1M requests",
      regions: "300+ edge nodes",
      vendor: "Cloudflare",
      strength: "Ultra-low latency",
      weakness: "V8 sandbox limits",
    },
  ];

  return (
    <div
      style={{
        background: "#fafaf8",
        color: "#1a1a1a",
        padding: 20,
        borderRadius: 12,
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd" }}>
            <th
              style={{
                textAlign: "left",
                padding: "10px 12px",
                fontWeight: 700,
                color: "#333",
              }}
            >
              Platform
            </th>
            <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: "#333" }}>
              Cold Start
            </th>
            <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: "#333" }}>
              Pricing Model
            </th>
            <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: "#333" }}>
              Scale
            </th>
            <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: "#333" }}>
              Fit
            </th>
          </tr>
        </thead>
        <tbody>
          {platforms.map((p, i) => (
            <tr
              key={i}
              style={{
                borderBottom: "1px solid #eee",
                background: i % 2 === 0 ? "transparent" : "#f7f7f5",
              }}
            >
              <td style={{ padding: "12px", fontWeight: 600, color: "#EC3B4A" }}>{p.name}</td>
              <td style={{ padding: "12px", color: "#555" }}>{p.coldStart}</td>
              <td style={{ padding: "12px", color: "#555" }}>{p.pricing}</td>
              <td style={{ padding: "12px", color: "#555" }}>{p.regions}</td>
              <td style={{ padding: "12px" }}>
                <span style={{ fontSize: 12, color: "#888", fontStyle: "italic" }}>
                  {p.strength} · <strong style={{ color: "#EC3B4A" }}>watch out:</strong> {p.weakness}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #ddd" }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666", fontWeight: 600 }}>
          Rule of thumb:
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "#555", lineHeight: 1.8 }}>
          <li>
            <strong>Lambda</strong> if you need everything — batch jobs, WebSockets, heavy compute.
          </li>
          <li>
            <strong>Vercel</strong> if you're already in the Next.js + React ecosystem.
          </li>
          <li>
            <strong>Workers</strong> if latency is critical or you want the cheapest global scale.
          </li>
        </ul>
      </div>
    </div>
  );
}