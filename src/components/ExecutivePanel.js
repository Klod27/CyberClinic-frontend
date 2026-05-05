import React from "react";

const COLORS = {
  card: "#111827",
  border: "#334155",
  text: "#e2e8f0",
  sub: "#94a3b8",
  red: "#ef4444",
  yellow: "#f59e0b",
  green: "#22c55e"
};

/* =========================
   SEVERITY
========================= */

const severityScore = (s) => {
  if (!s) return 0;
  s = s.toUpperCase();

  if (s === "CRITICAL") return 10;
  if (s === "HIGH") return 8;
  if (s === "MEDIUM") return 5;
  if (s === "LOW") return 2;

  return 0;
};

/* =========================
   COMPONENT
========================= */

function ExecutivePanel({ data }) {

  if (!data) return null;

  const summary = () => {
    if (data.score >= 85)
      return "Strong compliance posture with minimal exposure.";
    if (data.score >= 70)
      return "Moderate compliance risk. Improvements recommended.";
    return "High compliance risk. Immediate action required.";
  };

  const findings = data.findings || [];
  const categories = data.category_scores || {};

  const topFindings = [...findings]
    .sort((a, b) => severityScore(b.severity) - severityScore(a.severity))
    .slice(0, 5);

  const categoryList = Object.entries(categories);

  return (
    <div style={{ marginBottom: 30 }}>

      {/* SUMMARY */}
      <div style={{
        background: COLORS.card,
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        marginBottom: 20
      }}>
        <h3>Executive Summary</h3>

        <p style={{ color: COLORS.sub }}>{summary()}</p>

        <p style={{ marginTop: 10 }}>
          Score: <b>{data.score}%</b> | Risk: <b>{data.risk}</b>
        </p>
      </div>

      {/* CATEGORY */}
      <div style={{
        background: COLORS.card,
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        marginBottom: 20
      }}>
        <h3>Risk Categories</h3>

        {categoryList.length === 0 && (
          <p style={{ color: COLORS.sub }}>No category data</p>
        )}

        {categoryList.map(([name, value], i) => (
          <div key={i}>{name}: {value}%</div>
        ))}
      </div>

      {/* FINDINGS */}
      <div style={{
        background: COLORS.card,
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`
      }}>
        <h3>Top Compliance Issues</h3>

        {topFindings.length === 0 && (
          <p style={{ color: COLORS.sub }}>No major issues</p>
        )}

        {topFindings.map((f, i) => {
          const sev = severityScore(f.severity);

          return (
            <div key={i} style={{
              marginTop: 10,
              padding: 10,
              borderLeft: `4px solid ${
                sev >= 8 ? COLORS.red :
                sev >= 5 ? COLORS.yellow :
                COLORS.green
              }`,
              background: "rgba(255,255,255,0.03)"
            }}>
              <strong>{f.issue}</strong>
              <p style={{ margin: 0, color: COLORS.sub }}>
                {f.description}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default ExecutivePanel;