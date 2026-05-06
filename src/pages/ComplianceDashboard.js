import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#22c55e", "#facc15", "#f97316", "#dc2626"];

function ComplianceDashboard({ assessmentId }) {
  const [data, setData] = useState(null);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState(null);

  const plan = localStorage.getItem("plan") || "free";
  const isPro = plan === "pro" || paid;

  useEffect(() => {
    const loadData = () => {
      try {
        const saved = localStorage.getItem("latest_report");

        if (saved) {
          const report = JSON.parse(saved);

          setData({
            assessment: {
              id: report.assessment_id || assessmentId || "latest",
              score: report.score || 0,
              risk_level: report.risk || report.risk_level || "UNKNOWN",
              category_scores: report.category_scores || {}
            },
            findings: report.findings || [],
            remediation: report.remediation || [],
            ai_recommendations: report.ai_recommendations || []
          });

          return;
        }

        setError("No assessment found. Please complete the HIPAA assessment first.");
      } catch (err) {
        console.error(err);
        setError("Could not load assessment data.");
      }
    };

    loadData();
  }, [assessmentId]);

  if (error) {
    return (
      <div style={{ padding: 40, background: "#0b0f19", color: "white" }}>
        <h1>CyberClinic Compliance Dashboard</h1>
        <p style={{ color: "#f87171" }}>{error}</p>
        <button onClick={() => window.location.href = "/hipaa"}>
          Start HIPAA Assessment
        </button>
      </div>
    );
  }

  if (!data) return <p>Loading...</p>;

  const categoryData = Object.entries(data.assessment.category_scores || {}).map(
    ([key, value]) => ({
      name: key,
      value
    })
  );

  const visibleFindings = isPro
    ? data.findings
    : (data.findings || []).slice(0, 3);

  const handlePayment = async () => {
    window.location.href = "/pricing";
  };

  const downloadReport = () => {
    if (!isPro) {
      alert("PDF reports are available for Pro subscribers.");
      return;
    }

    alert("PDF generation will be available after Pro report generation is enabled.");
  };

  return (
    <div style={{ padding: 40, background: "#0b0f19", color: "white", minHeight: "100vh" }}>

      <h1>CyberClinic Compliance Dashboard</h1>

      <h2>Score: {data.assessment.score}%</h2>

      <h3 style={{ color: "#facc15" }}>
        Risk Level: {data.assessment.risk_level}
      </h3>

      <div style={{ width: 400, height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={categoryData} dataKey="value">
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <hr style={{ margin: "30px 0" }} />

      <h2>Top Risk Findings</h2>

      {visibleFindings.length === 0 && (
        <p>No major findings available for this assessment.</p>
      )}

      {visibleFindings.map((f, i) => (
        <div key={i} style={{
          background: "#111827",
          padding: 20,
          marginBottom: 15,
          borderRadius: 10
        }}>
          <h3>{f.title || f.issue}</h3>
          <p><strong>Risk:</strong> {f.risk_level || f.severity}</p>
          <p><strong>Impact:</strong> {f.impact || "Potential compliance exposure."}</p>
          <p style={{ color: "#f87171" }}>
            <strong>Why this matters:</strong>{" "}
            {f.business_impact ||
              "Failure to address this issue could result in regulatory risk, operational disruption, and loss of patient trust."}
          </p>
        </div>
      ))}

      {data.ai_recommendations?.length > 0 && (
        <>
          <h2>AI Recommendations</h2>
          {Array.isArray(data.ai_recommendations)
            ? data.ai_recommendations.map((r, i) => <p key={i}>• {r}</p>)
            : <p>{data.ai_recommendations}</p>}
        </>
      )}

      {!isPro && (
        <div style={{
          marginTop: 20,
          padding: 20,
          background: "#020617",
          borderRadius: 10,
          textAlign: "center",
          border: "1px solid #facc15"
        }}>
          <h2>🔒 Full Report Locked</h2>
          <p>Unlock full findings, recommendations, PDF reports, and audit-ready documentation.</p>
          <button onClick={handlePayment}>
            Upgrade to Pro
          </button>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <button onClick={() => window.location.href = "/hipaa"}>
          Start New Assessment
        </button>

        <button onClick={() => window.location.href = "/dashboard"} style={{ marginLeft: 10 }}>
          Go to Dashboard
        </button>

        {isPro && (
          <button onClick={downloadReport} style={{ marginLeft: 10 }}>
            Download PDF
          </button>
        )}
      </div>
    </div>
  );
}

export default ComplianceDashboard;