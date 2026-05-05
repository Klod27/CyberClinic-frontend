import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

import KPIDashboard from "../components/KPIDashboard";
import ExecutivePanel from "../components/ExecutivePanel";
import TeamManagement from "../components/TeamManagement";
import OrganizationSelector from "../components/OrganizationSelector";

/* =========================
   STYLES
========================= */

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

/* =========================
   REPORT PREVIEW
========================= */

const ReportPreview = ({ report, onDownload, plan }) => {
  if (!report) return null;

  return (
    <div style={card}>
      <h3>Executive Summary</h3>

      <p><strong>Compliance Score:</strong> {report.score}%</p>
      <p><strong>Risk Level:</strong> {report.risk}</p>

      <p>
        This organization demonstrates a{" "}
        <strong>
          {report.score >= 85 ? "strong" :
           report.score >= 60 ? "moderate" : "high-risk"}
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
          <strong>{f.issue}</strong>
          <p style={{ margin: 0 }}>{f.description}</p>
        </div>
      ))}

      {plan === "pro" ? (
        <button onClick={onDownload} style={{ marginTop: 15 }}>
          Download Full Report (PDF)
        </button>
      ) : (
        <p style={{ color: "#f59e0b", marginTop: 10 }}>
          Upgrade to download full reports
        </p>
      )}
    </div>
  );
};

/* =========================
   COMPONENT
========================= */

function Dashboard() {
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const plan = subscription?.plan || "free";

  /* =========================
     LOAD INITIAL DATA
  ========================= */

  useEffect(() => {
    const load = async () => {
      try {
        const orgRes = await API.get("/org/list");
        const subRes = await API.get("/subscription/status");

        const savedOrgId = localStorage.getItem("org_id");

        const currentOrg =
          orgRes.data?.find(o => String(o.id) === String(savedOrgId)) ||
          orgRes.data?.[0] ||
          null;

        setOrg(currentOrg);
        setSubscription(subRes.data);

        const saved = localStorage.getItem("latest_report");
        if (saved) setReport(JSON.parse(saved));

      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  /* =========================
     LOAD HISTORY
  ========================= */

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

  /* =========================
     RUN SCAN
  ========================= */

  const runScan = async () => {
    if (!org) return;

    setLoading(true);
    setError(null);

    try {
      const submitRes = await API.post("/hipaa/submit", {
        org_id: org.id
      });

      const scanId = submitRes.data.scan_id;

      const reportRes = await API.post("/reports/generate", {
        scan_id: scanId
      });

      const reportData = reportRes.data;

      setReport(reportData);
      localStorage.setItem("latest_report", JSON.stringify(reportData));

    } catch (err) {
      console.error(err);
      setError("Scan failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (item) => {
    if (!item?.pdf_url) return;
    window.open(item.pdf_url, "_blank");
  };

  /* =========================
     UI
  ========================= */

  return (
    <div style={layout}>

      {/* SIDEBAR */}
      <div style={sidebar}>
        <h2>CyberClinic</h2>

        <p onClick={() => navigate("/dashboard")}>Dashboard</p>
        <p onClick={() => navigate("/hipaa")}>Assessment</p>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={main}>

        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
          <h1>Compliance Dashboard</h1>
          <p style={{ color: "#94a3b8" }}>
            Monitor HIPAA compliance, risk exposure, and audit readiness
          </p>
        </div>

        <OrganizationSelector
          currentOrg={org}
          setCurrentOrg={setOrg}
        />

        {/* ACTION BAR */}
        <div style={{
          ...card,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h3>Run Compliance Scan</h3>
            <p style={{ color: "#94a3b8" }}>
              Generate a real-time HIPAA compliance report
            </p>
          </div>

          <button
            onClick={runScan}
            disabled={loading}
            style={{
              background: "#3b82f6",
              color: "white",
              padding: "12px 20px",
              borderRadius: 8,
              border: "none",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {loading ? "Running..." : "Run Scan"}
          </button>
        </div>

        {error && <p style={{ color: "#ef4444" }}>{error}</p>}

        {/* EMPTY STATE */}
        {!report && !loading && (
          <div style={card}>
            <h3>No Reports Yet</h3>
            <p style={{ color: "#94a3b8" }}>
              Run your first compliance scan to generate insights.
            </p>
          </div>
        )}

        {/* KPI + EXEC */}
        {report && (
          <>
            <KPIDashboard orgId={org?.id} data={report} />
            <ExecutivePanel data={report} />
          </>
        )}

        {/* PREVIEW */}
        <ReportPreview
          report={report}
          plan={plan}
          onDownload={() => downloadPDF(report)}
        />

        {/* FULL REPORT */}
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
                  <div key={i}>
                    <strong>{f.issue}</strong> — {f.description}
                  </div>
                ))}
              </>
            )}

            {report.remediation?.length > 0 && (
              <>
                <h4>Recommended Actions</h4>
                {report.remediation.map((r, i) => (
                  <div key={i}>
                    • {r.issue} — {r.recommendation}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* AUDIT TIMELINE */}
        <div style={card}>
          <h3>Audit Timeline</h3>

          {history.length === 0 && (
            <p style={{ color: "#94a3b8" }}>
              No previous assessments yet.
            </p>
          )}

          {history.map((h, i) => {

            const riskColor =
              h.risk === "High" ? "#ef4444" :
              h.risk === "Medium" ? "#f59e0b" :
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
                    {h.risk}
                  </span>

                  <div style={{
                    fontSize: 12,
                    color: "#94a3b8"
                  }}>
                    {new Date(h.date).toLocaleString()}
                  </div>
                </div>

                <button onClick={() => downloadPDF(h)}>
                  View Report
                </button>

              </div>
            );
          })}
        </div>

        {/* SUBSCRIPTION */}
        <div style={card}>
          <h3>Subscription</h3>
          <p>{plan}</p>

          <button onClick={() => navigate("/pricing")}>
            Upgrade
          </button>
        </div>

        {/* TEAM */}
        <div style={card}>
          <TeamManagement />
        </div>

      </div>
    </div>
  );
}

export default Dashboard;