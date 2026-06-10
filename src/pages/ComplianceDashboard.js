import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = [
  "#22c55e",
  "#facc15",
  "#f97316",
  "#dc2626"
];

const API =
  process.env.REACT_APP_API_URL ||
  "https://cyberclinic-backend.onrender.com";

function ComplianceDashboard({ assessmentId }) {

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Backend subscription state
  const [plan, setPlan] = useState("demo");
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const token = localStorage.getItem("token");

        // ============================
        // LOAD SUBSCRIPTION STATUS
        // ============================

        try {

          const subRes = await axios.get(
            `${API}/subscription/status`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          const subscriptionPlan =
            subRes.data?.plan || "demo";

          setPlan(subscriptionPlan);

          setIsPro(
            subscriptionPlan === "pro" ||
            subscriptionPlan === "enterprise"
          );

          localStorage.setItem(
            "plan",
            subscriptionPlan
          );

        } catch (subErr) {

          console.error(
            "Subscription load failed:",
            subErr
          );

          setPlan("demo");
          setIsPro(false);
        }

        // ============================
        // LOAD REPORT DATA
        // ============================

        const saved =
          localStorage.getItem("latest_report");

        if (!saved) {

          setError(
            "No assessment found. Please complete the HIPAA assessment first."
          );

          return;
        }

        const report = JSON.parse(saved);

        setData({
          assessment: {
            id:
              report.assessment_id ||
              assessmentId ||
              "latest",

            score: report.score || 0,

            risk_level:
              report.risk ||
              report.risk_level ||
              "UNKNOWN",

            category_scores:
              report.category_scores || {}
          },

          findings: report.findings || [],

          remediation:
            report.remediation || [],

          ai_recommendations:
            report.ai_recommendations || [],

          pdf_url:
            report.pdf_url || null
        });

      } catch (err) {

        console.error(err);

        setError(
          "Could not load dashboard data."
        );
      }
    };

    loadDashboard();

  }, [assessmentId]);

  // ============================
  // ERROR STATE
  // ============================

  if (error) {

    return (
      <div
        style={{
          padding: 40,
          background: "#0b0f19",
          color: "white",
          minHeight: "100vh"
        }}
      >

        <h1>
          CyberClinic Compliance Dashboard
        </h1>

        <p style={{ color: "#f87171" }}>
          {error}
        </p>

        <button
          onClick={() =>
            (window.location.href = "/hipaa")
          }
        >
          Start HIPAA Assessment
        </button>
      </div>
    );
  }

  // ============================
  // LOADING STATE
  // ============================

  if (!data) {

    return (
      <div
        style={{
          padding: 40,
          color: "white",
          background: "#0b0f19",
          minHeight: "100vh"
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  // ============================
  // CHART DATA
  // ============================

  const categoryData = Object.entries(
    data.assessment.category_scores || {}
  ).map(([key, value]) => ({
    name: key,
    value
  }));

  // ============================
  // DEMO VS PRO FINDINGS
  // ============================

  const visibleFindings = isPro
    ? data.findings
    : (data.findings || []).slice(0, 3);

  // ============================
  // PAYMENT FLOW
  // ============================

  const handlePayment = () => {
    window.location.href = "/pricing";
  };

  // ============================
  // DOWNLOAD REPORT
  // ============================

  const downloadReport = () => {

    if (!isPro) {

      alert(
        "PDF reports are available for Pro subscribers."
      );

      return;
    }

    if (data.pdf_url) {

      window.open(
        data.pdf_url,
        "_blank"
      );

      return;
    }

    alert(
      "PDF report generation is not yet available for this assessment."
    );
  };

  // ============================
  // MAIN UI
  // ============================

  return (
    <div
      style={{
        padding: 40,
        background: "#0b0f19",
        color: "white",
        minHeight: "100vh"
      }}
    >

      <h1>
        CyberClinic Compliance Dashboard
      </h1>

      {/* PLAN STATUS */}

      <div
        style={{
          marginTop: 10,
          marginBottom: 20
        }}
      >

        {plan === "demo" && (
          <div
            style={{
              color: "#facc15",
              fontWeight: "bold"
            }}
          >
            Demo Access
          </div>
        )}

        {plan === "pro" && (
          <div
            style={{
              color: "#22c55e",
              fontWeight: "bold"
            }}
          >
            Pro Subscription Active
          </div>
        )}

        {plan === "enterprise" && (
          <div
            style={{
              color: "#3b82f6",
              fontWeight: "bold"
            }}
          >
            Enterprise Subscription Active
          </div>
        )}

      </div>

      <h2>
        Score: {data.assessment.score}%
      </h2>

      <h3 style={{ color: "#facc15" }}>
        Risk Level: {data.assessment.risk_level}
      </h3>

      {/* CHART */}

      <div
        style={{
          width: 400,
          height: 300
        }}
      >

        <ResponsiveContainer>

          <PieChart>

            <Pie
              data={categoryData}
              dataKey="value"
            >

              {categoryData.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    COLORS[i % COLORS.length]
                  }
                />
              ))}

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

      <hr style={{ margin: "30px 0" }} />

      {/* FINDINGS */}

      <h2>
        Top Risk Findings
      </h2>

      {visibleFindings.length === 0 && (
        <p>
          No major findings available for this assessment.
        </p>
      )}

      {visibleFindings.map((f, i) => (

        <div
          key={i}
          style={{
            background: "#111827",
            padding: 20,
            marginBottom: 15,
            borderRadius: 10
          }}
        >

          <h3>
            {f.title || f.issue}
          </h3>

          <p>
            <strong>Risk:</strong>{" "}
            {f.risk_level || f.severity}
          </p>

          <p>
            <strong>Impact:</strong>{" "}
            {f.impact ||
              "Potential compliance exposure."}
          </p>

          <p style={{ color: "#f87171" }}>
            <strong>
              Why this matters:
            </strong>{" "}
            {f.business_impact ||
              "Failure to address this issue could result in regulatory risk, operational disruption, and loss of patient trust."}
          </p>

        </div>
      ))}

      {/* AI RECOMMENDATIONS */}

      {data.ai_recommendations?.length > 0 && (

        <>
          <h2>
            AI Recommendations
          </h2>

          {Array.isArray(
            data.ai_recommendations
          )
            ? data.ai_recommendations.map(
                (r, i) => (
                  <p key={i}>
                    • {r}
                  </p>
                )
              )
            : (
              <p>
                {data.ai_recommendations}
              </p>
            )}
        </>
      )}

      {/* DEMO PAYWALL */}

      {!isPro && (

        <div
          style={{
            marginTop: 20,
            padding: 20,
            background: "#020617",
            borderRadius: 10,
            textAlign: "center",
            border: "1px solid #facc15"
          }}
        >

          <h2>
            🔒 Demo Mode Limit Reached
          </h2>

          <p>
            Upgrade to Pro to unlock:
          </p>

          <ul
            style={{
              textAlign: "left",
              maxWidth: 500,
              margin: "0 auto"
            }}
          >
            <li>Full assessment findings</li>
            <li>AI remediation guidance</li>
            <li>PDF audit reports</li>
            <li>Audit-ready documentation</li>
            <li>Advanced compliance insights</li>
          </ul>

          <button
            onClick={handlePayment}
            style={{
              marginTop: 20
            }}
          >
            Upgrade to Pro
          </button>

        </div>
      )}

      {/* ACTIONS */}

      <div style={{ marginTop: 30 }}>

        <button
          onClick={() =>
            (window.location.href = "/hipaa")
          }
        >
          Start New Assessment
        </button>

        <button
          onClick={() =>
            (window.location.href = "/dashboard")
          }
          style={{
            marginLeft: 10
          }}
        >
          Go to Dashboard
        </button>

        {isPro && (

          <button
            onClick={downloadReport}
            style={{
              marginLeft: 10
            }}
          >
            Download PDF
          </button>
        )}

      </div>

    </div>
  );
}

export default ComplianceDashboard;