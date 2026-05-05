import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import Signup from "./pages/Signup";
import HipaaAssessment from "./pages/HipaaAssessment";
import Dashboard from "./pages/Dashboard";

import API from "./api";

/* =========================
   LOGIN
========================= */

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.access_token);
      setToken(res.data.access_token);

      window.location.href = "/dashboard";
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <br />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <br />

      <button onClick={login}>Login</button>
    </div>
  );
}

/* =========================
   PRIVATE ROUTE
========================= */

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

/* =========================
   APP ROUTES
========================= */

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />

        {/* IMPORTANT: assessment PUBLIC */}
        <Route path="/hipaa" element={<HipaaAssessment />} />

        {/* PROTECTED DASHBOARD */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;