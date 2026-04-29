import React, { useEffect, useState } from "react";
import API from "../api";

const COLORS = {
  card: "#111827",
  border: "#334155",
  text: "#e2e8f0",
  sub: "#94a3b8",
  red: "#ef4444",
  yellow: "#f59e0b",
  green: "#22c55e",
  blue: "#3b82f6"
};

function ExecutivePanel({ orgId }) {

  const [data, setData] = useState(null);
  const [findings, setFindings] = useState([]);
  const [categories, setCategories] = useState({});

  useEffect(() => {
    if (!orgId) return;

    // KPI DATA
    API.get(`/analytics/kpi/${orgId}`)
      .then(res => setData(res.data));

    // 🔥 REAL FINDINGS (from scan)
    API.get("/automation/run")
      .then(res => {
        setFindings(res.data.findings || []);
        setCategories(res.data.category_scores || {});
      });

  }, [orgId]);

  if (!data) return null;

  // ---------------------------
  // SUMMARY
  // ---------------------------
  const summary = () => {
    if (data.score >= 85)
      return "Strong compliance posture with minimal exposure.";
    if (data.score >= 70)
      return "Moderate compliance risk. Improvements recommended.";
    return "High compliance risk. Immediate action required.";
  };

  // ---------------------------
  // PRIORITIZED FINDINGS
  // ---------------------------
  const topFindings = findings
    .sort((a, b) => (b.severity || 0) - (a.severity || 0))
    .slice(0, 5);

  // ---------------------------
  // CATEGORY DISPLAY
  // ---------------------------
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

        <p style={{ color: COLORS.sub }}>
          {summary()}
        </p>

        <p style={{ marginTop: 10 }}>
          Score: <b>{data.score}%</b> | Risk: <b>{data.risk}</b>
        </p>
      </div>

      {/* 🔥 CATEGORY BREAKDOWN */}
      <div style={{
        background: COLORS.card,
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        marginBottom: 20
      }}>
        <h3>Risk Categories</h3>

        {categoryList.map(([name, value], i) => (
          <div key={i} style={{ marginTop: 8 }}>
            {name}: {value}%
          </div>
        ))}
      </div>

      {/* 🔥 REAL FINDINGS */}
      <div style={{
        background: COLORS.card,
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`
      }}>
        <h3>Top Compliance Issues</h3>

        {topFindings.length === 0 && (
          <p style={{ color: COLORS.sub }}>
            No major issues detected.
          </p>
        )}

        {topFindings.map((f, i) => (
          <div key={i} style={{
            marginTop: 10,
            padding: 10,
            borderLeft: `4px solid ${
              f.severity > 7 ? COLORS.red :
              f.severity > 4 ? COLORS.yellow :
              COLORS.green
            }`,
            background: "rgba(255,255,255,0.03)"
          }}>
            <strong>{f.title || f.issue}</strong>
            <p style={{ margin: 0, color: COLORS.sub }}>
              {f.description || "Review and remediate"}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}

export default ExecutivePanel;