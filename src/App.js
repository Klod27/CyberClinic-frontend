import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "./api";

// Only import files you CONFIRMED exist
import OrganizationSelector from "./components/OrganizationSelector";
import KPIDashboard from "./components/KPIDashboard";
import ExecutivePanel from "./components/ExecutivePanel";
import TeamManagement from "./components/TeamManagement";

const COLORS = {
  bg: "#0f172a",
  text: "#e2e8f0",
  sub: "#94a3b8",
  blue: "#3b82f6",
  red: "#ef4444"
};

const card = {
  background: "#111827",
  padding: 20,
  borderRadius: 10,
  marginBottom: 20
};

function App() {
  const nav = useNavigate();

  const [currentOrg, setCurrentOrg] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const [report, setReport] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState(null);

  const plan = subscription?.plan || localStorage.getItem("plan") || "free";

  useEffect(() => {
    const load = async () => {
      try {
        const orgRes = await API.get("/org/list").catch(() => ({ data: [] }));
        const subRes = await API.get("/subscription/status").catch(() => ({ data: null }));

        setCurrentOrg(orgRes.data?.[0] || null);
        setSubscription(subRes.data || null);

        const saved = localStorage.getItem("latest_report");

        if (saved) {
          try {
            setReport(JSON.parse(saved));
          } catch {
            localStorage.removeItem("latest_report");
          }
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const refreshLatestReport = () => {
    setScanLoading(true);
    setError(null);

    try {
      const saved = localStorage.getItem("latest_report");

      if (!saved) {
        setReport(null);
        setError("No completed assessment found. Please complete the HIPAA assessment first.");
        return;
      }

      setReport(JSON.parse(saved));
    } catch (err) {
      console.error("Refresh report error:", err);
      setError("Could not load latest report.");
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: "white", padding: 40 }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh" }}>

      {/* ✅ BUILT-IN SIDEBAR (NO IMPORT NEEDED) */}
      <div style={{
        width: 240,
        background: "#1e293b",
        padding: 20,
        color: "#e2e8f0"
      }}>
        <h2>CyberClinic</h2>

        <p style={{ cursor: "pointer" }} onClick={() => nav("/dashboard")}>
          Dashboard
        </p>

        <p style={{ cursor: "pointer" }} onClick={() => nav("/hipaa")}>
          Assessment
        </p>

        <p style={{ cursor: "pointer" }} onClick={() => nav("/pricing")}>
          Pricing
        </p>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          style={{
            marginTop: 20,
            padding: 8,
            width: "100%",
            background: "#ef4444",
            color: "white",
            border: "none"
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: 30, color: COLORS.text }}>
        <h1>Compliance Dashboard</h1>

        <OrganizationSelector
          currentOrg={currentOrg}
          setCurrentOrg={setCurrentOrg}
        />

        <div style={card}>
          <h3>Start HIPAA Assessment</h3>
          <button onClick={() => nav("/hipaa")}>
            Start Assessment
          </button>
        </div>

        <div style={card}>
          <h3>Latest Report</h3>
          <button onClick={refreshLatestReport}>
            {scanLoading ? "Loading..." : "Refresh Report"}
          </button>
        </div>

        {error && <p style={{ color: COLORS.red }}>{error}</p>}

        {!report && (
          <div style={card}>
            <p>No reports yet.</p>
          </div>
        )}

        {report && (
          <>
            <KPIDashboard orgId={currentOrg?.id} data={report} />
            <ExecutivePanel data={report} />

            <div style={card}>
              {plan === "pro" && report.pdf_url ? (
                <button onClick={() => window.open(report.pdf_url)}>
                  Download PDF
                </button>
              ) : (
                <p>Upgrade to Pro to download reports.</p>
              )}
            </div>
          </>
        )}

        <div style={card}>
          <h3>Subscription</h3>
          <p>{subscription?.plan || "Free Plan"}</p>
          <button onClick={() => nav("/pricing")}>
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

export default App;