import React, { useState, useEffect } from "react";
import OrganizationSelector from "./components/OrganizationSelector";
import TeamManagement from "./components/TeamManagement";
import KPIDashboard from "./components/KPIDashboard";
import ExecutivePanel from "./components/ExecutivePanel";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import Signup from "./pages/Signup"; // ✅ NEW
import API from "./api";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate
} from "react-router-dom";

import HipaaAssessment from "./pages/HipaaAssessment";

/* =========================
   DESIGN SYSTEM
========================= */

const COLORS = {
  bg: "#0f172a",
  sidebar: "#1e293b",
  panel: "#111827",
  border: "#334155",
  text: "#e2e8f0",
  sub: "#94a3b8",
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444"
};

const card = {
  background: COLORS.panel,
  padding: 24,
  borderRadius: 12,
  marginBottom: 20,
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 6px 24px rgba(0,0,0,0.4)"
};

/* =========================
   LOGIN
========================= */

function Login({ setToken }) {

  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.access_token);
      setToken(res.data.access_token);

      nav("/dashboard");

    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: COLORS.bg,
      color: COLORS.text
    }}>
      <div style={{ width: 360 }}>
        <h2>CyberClinic Secure Login</h2>

        <input
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: 12, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: 12 }}
        />

        <button
          onClick={login}
          style={{
            width: "100%",
            marginTop: 15,
            padding: 12,
            background: COLORS.blue,
            border: "none",
            color: "white",
            borderRadius: 8
          }}
        >
          Login
        </button>

        <p style={{ marginTop: 15 }}>
          New?{" "}
          <span
            style={{ color: COLORS.blue, cursor: "pointer" }}
            onClick={() => nav("/signup")}
          >
            Create account
          </span>
        </p>

      </div>
    </div>
  );
}

/* =========================
   SIDEBAR
========================= */

function Sidebar() {

  const nav = useNavigate();

  return (
    <div style={{
      width: 240,
      background: COLORS.sidebar,
      padding: 20,
      color: COLORS.text
    }}>
      <h2>CyberClinic</h2>

      <p onClick={() => nav("/dashboard")}>Dashboard</p>
      <p onClick={() => nav("/hipaa")}>Assessments</p>

      <hr />

      <button onClick={() => {
        localStorage.clear();
        window.location.href = "/";
      }}>
        Logout
      </button>
    </div>
  );
}

/* =========================
   TOP BAR
========================= */

function TopBar({ currentOrg, setCurrentOrg }) {

  return (
    <div style={{
      height: 70,
      background: "#111827",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 30px"
    }}>
      <h2>CyberClinic SaaS</h2>

      <OrganizationSelector
        currentOrg={currentOrg}
        setCurrentOrg={setCurrentOrg}
      />

      <span>AI Compliance Engine</span>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard() {

  const [currentOrg, setCurrentOrg] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [reportPaid, setReportPaid] = useState(false);

  const isPro = subscription?.is_active;

  useEffect(() => {

    API.get("/org/list").then(res => {
      setCurrentOrg(res.data[0]);
    });

    API.get("/subscription/status").then(res => {
      setSubscription(res.data);
    });

  }, []);

  useEffect(() => {
    if (!reportId) return;

    API.get(`/reports/status/${reportId}`)
      .then(res => setReportPaid(res.data.is_paid));

  }, [reportId]);

 const runScan = async () => {
  try {
    alert("Running scan...");

    const res = await API.get("/automation/run");

    console.log("✅ Dashboard scan:", res.data);

    alert("Scan complete!");

  } catch (err) {
    console.error("❌ Dashboard scan failed:", err);

    alert("Scan failed. Backend may be waking up.");
  }
};

  const generateReport = async () => {

    if (!isPro) {
      return alert("Upgrade required");
    }

    const res = await API.post(`/reports/generate?org_id=${currentOrg.id}`);
    setReportId(res.data.report_id);
  };

  const unlockReport = async () => {
    const res = await API.post(`/billing/create-checkout-session?mode=report&report_id=${reportId}`);
    window.location.href = res.data.url;
  };

  const upgrade = async () => {
    const res = await API.post(`/billing/create-checkout-session?mode=subscription`);
    window.location.href = res.data.url;
  };

  return (
    <div style={{ display: "flex", background: COLORS.bg }}>

      <Sidebar />

      <div style={{ flex: 1 }}>

        <TopBar currentOrg={currentOrg} setCurrentOrg={setCurrentOrg} />

        <div style={{ padding: 30 }}>

          <h1>Compliance Intelligence Dashboard</h1>

          <KPIDashboard orgId={currentOrg?.id} />
          <ExecutivePanel orgId={currentOrg?.id} />

          <div style={card}>
            <h3>Subscription</h3>
            {subscription && (
              <>
                <p>{subscription.plan}</p>
                {!isPro && <button onClick={upgrade}>Upgrade</button>}
              </>
            )}
          </div>

          <div style={card}>
            <button onClick={runScan}>Run Compliance Scan</button>
            <button onClick={generateReport}>Generate Report</button>
          </div>

          {reportId && (
            <div style={card}>
              {reportPaid
                ? <button onClick={() => window.open(`/reports/download/${reportId}`)}>Download PDF</button>
                : <button onClick={unlockReport}>Pay to Unlock</button>}
            </div>
          )}

          <div style={card}>
            <TeamManagement />
          </div>

        </div>
      </div>
    </div>
  );
}

/* =========================
   PROTECTED ROUTE
========================= */

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

/* =========================
   APP ROOT
========================= */

function AppWrapper() {

  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Router>

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />

        {/* PROTECTED */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/hipaa" element={
          <PrivateRoute>
            <HipaaAssessment />
          </PrivateRoute>
        } />

      </Routes>

    </Router>
  );
}

export default AppWrapper;