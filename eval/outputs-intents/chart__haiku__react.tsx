import React from "react";

export default function Chart() {
  const data = [
    { month: "Jan", revenue: 48000 },
    { month: "Feb", revenue: 52000 },
    { month: "Mar", revenue: 61000 },
    { month: "Apr", revenue: 58000 },
    { month: "May", revenue: 71000 },
    { month: "Jun", revenue: 84000 },
  ];

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const minRevenue = Math.min(...data.map((d) => d.revenue));
  const range = maxRevenue - minRevenue;
  const padding = range * 0.15;
  const yMax = maxRevenue + padding;
  const yMin = Math.max(0, minRevenue - padding);

  const chartHeight = 160;
  const chartWidth = 350;
  const margin = { top: 16, right: 20, bottom: 30, left: 50 };

  const scaleY = (value) => {
    const normalized = (value - yMin) / (yMax - yMin);
    return margin.top + (1 - normalized) * chartHeight;
  };

  const scaleX = (index) => {
    return margin.left + (index / (data.length - 1)) * chartWidth;
  };

  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.revenue)}`).join(" ");

  const gridLines = [0.25, 0.5, 0.75, 1].map((fraction) => {
    const value = yMin + (yMax - yMin) * fraction;
    const y = scaleY(value);
    return (
      <g key={`grid-${fraction}`}>
        <line
          x1={margin.left}
          y1={y}
          x2={margin.left + chartWidth}
          y2={y}
          stroke="#333"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.3"
        />
        <text
          x={margin.left - 10}
          y={y + 4}
          textAnchor="end"
          fontSize="11"
          fill="#666"
        >
          ${Math.round(value / 1000)}k
        </text>
      </g>
    );
  });

  return (
    <div
      style={{
        background: "#0a0e27",
        color: "#e0e0e0",
        padding: 24,
        borderRadius: 12,
        fontFamily: "'Monaco', monospace",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#fff" }}>
          Revenue Trend
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
          Last 6 months • YoY growth +32%
        </p>
      </div>

      <svg
        viewBox={`0 0 ${margin.left + chartWidth + 20} ${margin.top + chartHeight + margin.bottom}`}
        style={{ width: "100%", maxWidth: 420, height: "auto" }}
      >
        {/* Grid lines */}
        {gridLines}

        {/* Axes */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + chartHeight}
          stroke="#444"
          strokeWidth="2"
        />
        <line
          x1={margin.left}
          y1={margin.top + chartHeight}
          x2={margin.left + chartWidth}
          y2={margin.top + chartHeight}
          stroke="#444"
          strokeWidth="2"
        />

        {/* Area fill */}
        <polygon
          points={`${margin.left},${margin.top + chartHeight} ${points} ${margin.left + chartWidth},${margin.top + chartHeight}`}
          fill="#EC3B4A"
          opacity="0.2"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#EC3B4A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={`point-${i}`}
            cx={scaleX(i)}
            cy={scaleY(d.revenue)}
            r="4"
            fill="#EC3B4A"
            opacity="0.9"
          />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={`label-${i}`}
            x={scaleX(i)}
            y={margin.top + chartHeight + 20}
            textAnchor="middle"
            fontSize="11"
            fill="#888"
          >
            {d.month}
          </text>
        ))}
      </svg>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button
          data-bap-prompt="Show me the breakdown by product line"
          style={{
            flex: 1,
            background: "#EC3B4A",
            color: "#fff",
            border: 0,
            padding: 10,
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Breakdown
        </button>
        <button
          data-bap-prompt="Compare this to last year's trend"
          style={{
            flex: 1,
            background: "transparent",
            color: "#EC3B4A",
            border: "1px solid #EC3B4A",
            padding: 10,
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          YoY Compare
        </button>
      </div>
    </div>
  );
}