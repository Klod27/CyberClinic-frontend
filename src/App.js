import React, { useState, useEffect } from "react";
import OrganizationSelector from "./components/OrganizationSelector";
import TeamManagement from "./components/TeamManagement";
import KPIDashboard from "./components/KPIDashboard";
import ExecutivePanel from "./components/ExecutivePanel";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import Signup from "./pages/Signup";
import HipaaAssessment from "./pages/HipaaAssessment";
import API from "./api";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate
} from "react-router-dom";

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

        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

        <button onClick={login}>Login</button>

        <p onClick={() => nav("/signup")}>Create account</p>
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
    <div style={{ width: 240, background: COLORS.sidebar, padding: 20 }}>
      <h2>CyberClinic</h2>

      <p onClick={() => nav("/dashboard")}>Dashboard</p>
      <p onClick={() => nav("/hipaa")}>Assessments</p>

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
   DASHBOARD
========================= */

function Dashboard() {

  const nav = useNavigate(); // ✅ FIX

  const [currentOrg, setCurrentOrg] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const orgRes = await API.get("/org/list");
        const subRes = await API.get("/subscription/status");

        setCurrentOrg(orgRes.data?.[0] || null);
        setSubscription(subRes.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div style={{ display: "flex", background: COLORS.bg }}>

      <Sidebar />

      <div style={{ flex: 1, padding: 30 }}>

        <h1>Compliance Dashboard</h1>

        {currentOrg && <KPIDashboard orgId={currentOrg.id} />}
        {currentOrg && <ExecutivePanel orgId={currentOrg.id} />}

        <div style={card}>
          <h3>Subscription</h3>
          {subscription?.plan}
        </div>

        <div style={card}>
          {/* 🔥 FIXED NAVIGATION */}
          <button onClick={() => nav("/hipaa")}>
            Start New Assessment
          </button>
        </div>

        <div style={card}>
          <TeamManagement />
        </div>

      </div>
    </div>
  );
}

/* =========================
   ROUTES
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

        {/* DASHBOARD (PROTECTED) */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* 🔥 ASSESSMENT (PUBLIC ENTRY POINT) */}
        <Route path="/hipaa" element={<HipaaAssessment />} />

        {/* 🔥 OPTIONAL FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

/* =========================
   PROTECTED ROUTE
========================= */

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default AppWrapper;