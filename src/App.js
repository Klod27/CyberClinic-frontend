import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import API from "./api";

import Login from "./Login";
import LandingPage from "./pages/LandingPage";
import HipaaAssessment from "./pages/HipaaAssessment";
import PricingPage from "./pages/PricingPage";
import Signup from "./pages/Signup";

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

function Dashboard() {
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
        if (saved) setReport(JSON.parse(saved));
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
    } catch {
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
      <div style={{ width: 240, background: "#1e293b", padding: 20, color: COLORS.text }}>
        <h2>CyberClinic</h2>

        <p style={{ cursor: "pointer" }} onClick={() => nav("/dashboard")}>Dashboard</p>
        <p style={{ cursor: "pointer" }} onClick={() => nav("/hipaa")}>Assessment</p>
        <p style={{ cursor: "pointer" }} onClick={() => nav("/pricing")}>Pricing</p>
        <p style={{ cursor: "pointer" }} onClick={() => nav("/login")}>Login</p>

        <button
          onClick={() => {
            localStorage.clear();
            nav("/");
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

      <div style={{ flex: 1, padding: 30, color: COLORS.text }}>
        <h1>Compliance Dashboard</h1>

        <OrganizationSelector
          currentOrg={currentOrg}
          setCurrentOrg={setCurrentOrg}
        />

        <div style={card}>
          <h3>Start HIPAA Assessment</h3>
          <button onClick={() => nav("/hipaa")}>Start Assessment</button>
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
                <button onClick={() => window.open(report.pdf_url, "_blank")}>
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
          <button onClick={() => nav("/pricing")}>Upgrade</button>
        </div>

        <div style={card}>
          <TeamManagement />
        </div>
      </div>
    </div>
  );
}

function App() {
  const handleLogin = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/hipaa" element={<HipaaAssessment />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;