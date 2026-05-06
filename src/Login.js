import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e) => {
    e?.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", {
        email,
        password
      });

      const token = res.data?.access_token || res.data?.token;

      if (!token) {
        throw new Error("No token returned from login.");
      }

      localStorage.setItem("token", token);

      let user = null;

      try {
        const userRes = await API.get("/me");
        user = userRes.data;
      } catch {
        user = { email };
      }

      if (onLogin) {
        onLogin(user);
      }

      navigate("/dashboard");

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err.response?.data?.detail ||
        "Login failed. Please check your email and password."
      );

      localStorage.removeItem("token");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "#e2e8f0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 20
    }}>
      <form
        onSubmit={login}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#111827",
          padding: 30,
          borderRadius: 14,
          border: "1px solid #334155"
        }}
      >
        <h2>CyberClinic Secure Login</h2>

        {error && (
          <div style={{
            color: "#fecaca",
            background: "#7f1d1d",
            padding: 10,
            borderRadius: 8,
            marginBottom: 15
          }}>
            {error}
          </div>
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: 12, marginBottom: 12 }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: 12, marginBottom: 16 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ marginTop: 18 }}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" style={{ color: "#60a5fa" }}>
            Create account
          </Link>
        </p>

        <p style={{ marginTop: 10 }}>
          <Link to="/" style={{ color: "#94a3b8" }}>
            Back to home
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;