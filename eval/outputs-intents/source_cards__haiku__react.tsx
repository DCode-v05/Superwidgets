import React from "react";

export default function YCombinatorSources() {
  const sources = [
    {
      title: "Y Combinator Official Site",
      description: "The primary resource for program details, alumni, and investment information.",
      url: "https://www.ycombinator.com",
    },
    {
      title: "Paul Graham's Essays on YC",
      description: "Foundational essays explaining YC's philosophy, selection criteria, and impact on startups.",
      url: "https://paulgraham.com/articles.html",
    },
    {
      title: "Crunchbase YC Profile",
      description: "Comprehensive data on YC investments, portfolio companies, and fund performance metrics.",
      url: "https://www.crunchbase.com/organization/y-combinator",
    },
    {
      title: "The YC Startup School",
      description: "Free online courses and resources directly from Y Combinator founders and mentors.",
      url: "https://www.startupschool.org",
    },
  ];

  return (
    <div
      style={{
        background: "#faf8f3",
        color: "#2a2a2a",
        padding: 24,
        borderRadius: 12,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h3
        style={{
          margin: "0 0 20px",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.3px",
        }}
      >
        Key sources on Y Combinator
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: 14,
              borderLeft: "3px solid #EC3B4A",
              background: "#fff",
              borderRadius: 6,
              textDecoration: "none",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(4px)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(236,59,74,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#EC3B4A", marginBottom: 4 }}>
              {source.title}
            </div>
            <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
              {source.description}
            </div>
          </a>
        ))}
      </div>
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e0e0e0" }}>
        <div style={{ fontSize: 12, color: "#999" }}>
          💡 Tip: Start with the official site for current programs, then dive into Paul Graham's essays for philosophy and context.
        </div>
      </div>
    </div>
  );
}