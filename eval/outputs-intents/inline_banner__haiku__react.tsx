import React from "react";

export default function DeployConfirmation() {
  return (
    <div
      style={{
        background: "#0f1116",
        color: "#e6e6e6",
        padding: 24,
        borderRadius: 14,
        fontFamily: "system-ui, -apple-system, sans-serif",
        border: "1px solid #2a2d35",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            fontSize: 24,
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          ✓
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#fff" }}>
            Deploy to Production
          </h3>
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "#b0b0b0", lineHeight: 1.6 }}>
            Your changes have been successfully deployed to the production environment.
          </p>
          <div
            style={{
              fontSize: 12,
              color: "#808080",
              marginBottom: 16,
              fontFamily: "monospace",
            }}
          >
            Timestamp: {new Date().toISOString().slice(0, 19)}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              data-bap-prompt="Show me the deployment logs"
              style={{
                background: "#EC3B4A",
                color: "#fff",
                border: 0,
                padding: "10px 16px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View Logs
            </button>
            <button
              data-bap-prompt="Check production metrics"
              style={{
                background: "transparent",
                color: "#EC3B4A",
                border: "1px solid #EC3B4A",
                padding: "10px 16px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Check Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}