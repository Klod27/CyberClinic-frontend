import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

import KPIDashboard from "../components/KPIDashboard";
import ExecutivePanel from "../components/ExecutivePanel";
import TeamManagement from "../components/TeamManagement";
import OrganizationSelector from "../components/OrganizationSelector";

const layout = {
  display: "flex",
  minHeight: "100vh",
  background: "#0f172a",
  color: "#e2e8f0"
};

const sidebar = {
  width: 240,
  background: "#1e293b",
  padding: 20
};

const main = {
  flex: 1,
  padding: 30
};

const card = {
  background: "#111827",
  padding: 24,
  borderRadius: 14,
  marginTop: 20,
  border: "1px solid #334155",
  boxShadow: "0 6px 20px rgba(0,0,0,0.4)"
};

const buttonPrimary = {
  background: "#3b82f6",
  color: "white",
  padding: "12px 20px",
  borderRadius: 8,
  border: "none",
  fontWeight: "bold",
  cursor: "pointer"
};

const ReportPreview = ({ report, onDownload, plan }) => {
  if (!report) return null;

  return (
    <div style={card}>
      <h3>Executive Summary</h3>
      <p><strong>Compliance Score:</strong> {report.score ?? 0}%</p>
      <p><strong>Risk Level:</strong> {report.risk || report.risk_level || "UNKNOWN"}</p>

      <p>
        This organization demonstrates a{" "}
        <strong>
          {(report.score ?? 0) >= 85 ? "strong" :
           (report.score ?? 0) >= 60 ? "moderate" : "high-risk"}
        </strong>{" "}
        compliance posture.
      </p>

      {report.findings?.slice(0, 3).map((f, i) => (
        <div key={i} style={{
          marginTop: 10,
          padding: 10,
          borderLeft: "4px solid #f59e0b",
          background: "rgba(255,255,255,0.03)"
        }}>
          <strong>{f.issue || f.title}</strong>
          <p style={{ margin: 0 }}>{f.description || f.recommendation}</p>
        </div>
      ))}

      {plan === "pro" && report.pdf_url ? (
        <button onClick={onDownload} style={{ marginTop: 15 }}>
          Download Full Report PDF
        </button>
      ) : (
        <p style={{ color: "#f59e0b", marginTop: 10 }}>
          Upgrade to download PDF reports.
        </p>
      )}
    </div>
  );
};

function Dashboard() {
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  const plan = subscription?.plan || localStorage.getItem("plan") || "free";

  useEffect(() => {
    const load = async () => {
      try {
        const orgRes = await API.get("/org/list").catch(() => ({ data: [] }));
        const subRes = await API.get("/subscription/status").catch(() => ({ data: null }));

        const savedOrgId = localStorage.getItem("org_id");

        const currentOrg =
          orgRes.data?.find?.(o => String(o.id) === String(savedOrgId)) ||
          orgRes.data?.[0] ||
          null;

        setOrg(currentOrg);
        setSubscription(subRes.data);

        const saved = localStorage.getItem("latest_report");
        if (saved) {
          try {
            setReport(JSON.parse(saved));
          } catch {
            localStorage.removeItem("latest_report");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!org?.id) return;

    const loadHistory = async () => {
      try {
        const res = await API.get(`/reports/history?org_id=${org.id}`);
        setHistory(res.data.history || []);
      } catch {
        setHistory([]);
      }
    };

    loadHistory();
  }, [org]);

  const runScan = async () => {
    setLoading(true);
    setError(null);

    try {
      const submitRes = await API.post("/hipaa/submit", {
        org_id: org?.id || localStorage.getItem("org_id") || "default",
        answers: {}
      });

      const reportData = submitRes.data?.data || submitRes.data;

      setReport(reportData);
      localStorage.setItem("latest_report", JSON.stringify(reportData));
    } catch (err) {
      console.error(err);
      setError("Scan failed. Please complete the HIPAA assessment instead.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (item) => {
    if (!item?.pdf_url) return;
    window.open(item.pdf_url, "_blank");
  };

  if (pageLoading) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", padding: 40 }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={layout}>
      <div style={sidebar}>
        <h2>CyberClinic</h2>

        <p style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>Dashboard</p>
        <p style={{ cursor: "pointer" }} onClick={() => navigate("/hipaa")}>Assessment</p>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      <div style={main}>
        <div style={{ marginBottom: 20 }}>
          <h1>Compliance Dashboard</h1>
          <p style={{ color: "#94a3b8" }}>
            Monitor HIPAA compliance, risk exposure, and audit readiness.
          </p>
        </div>

        <OrganizationSelector
          currentOrg={org}
          setCurrentOrg={setOrg}
        />

        <div style={{
          ...card,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h3>Start HIPAA Assessment</h3>
            <p style={{ color: "#94a3b8" }}>
              Complete the guided assessment to generate compliance insights.
            </p>
          </div>

          <button
            onClick={() => navigate("/hipaa")}
            style={buttonPrimary}
          >
            Start Assessment
          </button>
        </div>

        <div style={{
          ...card,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h3>Use Latest Assessment Data</h3>
            <p style={{ color: "#94a3b8" }}>
              Dashboard uses the latest submitted assessment. PDF generation is reserved for Pro users.
            </p>
          </div>

          <button
            onClick={runScan}
            disabled={loading}
            style={buttonPrimary}
          >
            {loading ? "Loading..." : "Refresh Latest Report"}
          </button>
        </div>

        {error && <p style={{ color: "#ef4444" }}>{error}</p>}

        {!report && !loading && (
          <div style={card}>
            <h3>No Reports Yet</h3>
            <p style={{ color: "#94a3b8" }}>
              Start your first HIPAA assessment to generate insights.
            </p>
          </div>
        )}

        {report && (
          <>
            <KPIDashboard orgId={org?.id} data={report} />
            <ExecutivePanel data={report} />
          </>
        )}

        <ReportPreview
          report={report}
          plan={plan}
          onDownload={() => downloadPDF(report)}
        />

        {report && (
          <div style={card}>
            <h3>Detailed Report</h3>

            {report.category_scores && (
              <>
                <h4>Category Breakdown</h4>
                {Object.entries(report.category_scores).map(([k, v]) => (
                  <p key={k}>{k}: {v}%</p>
                ))}
              </>
            )}

            {report.findings?.length > 0 && (
              <>
                <h4>Findings</h4>
                {report.findings.map((f, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <strong>{f.issue || f.title}</strong> — {f.description || f.recommendation}
                  </div>
                ))}
              </>
            )}

            {report.remediation?.length > 0 && (
              <>
                <h4>Recommended Actions</h4>
                {report.remediation.map((r, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    • {r.issue} — {r.recommendation}
                  </div>
                ))}
              </>
            )}

            {report.ai_recommendations && (
              <>
                <h4>AI Recommendations</h4>
                {Array.isArray(report.ai_recommendations) ? (
                  report.ai_recommendations.map((r, i) => <p key={i}>• {r}</p>)
                ) : (
                  <p>{report.ai_recommendations}</p>
                )}
              </>
            )}
          </div>
        )}

        <div style={card}>
          <h3>Audit Timeline</h3>

          {history.length === 0 && (
            <p style={{ color: "#94a3b8" }}>
              No previous assessments yet.
            </p>
          )}

          {history.map((h, i) => {
            const risk = h.risk || h.risk_level;
            const riskColor =
              risk === "HIGH" || risk === "High" ? "#ef4444" :
              risk === "MEDIUM" || risk === "Medium" ? "#f59e0b" :
              "#22c55e";

            return (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #334155"
              }}>
                <div>
                  <strong>{h.score}%</strong>
                  <span style={{ marginLeft: 10, color: riskColor }}>
                    {risk}
                  </span>

                  <div style={{
                    fontSize: 12,
                    color: "#94a3b8"
                  }}>
                    {h.date ? new Date(h.date).toLocaleString() : "Recent"}
                  </div>
                </div>

                {h.pdf_url ? (
                  <button onClick={() => downloadPDF(h)}>
                    View Report
                  </button>
                ) : (
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>
                    PDF available on Pro
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={card}>
          <h3>Subscription</h3>
          <p>{plan}</p>

          <button onClick={() => navigate("/pricing")}>
            Upgrade
          </button>
        </div>

        <div style={card}>
          <TeamManagement />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;