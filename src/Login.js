import React, { useState } from "react";
import API from "../api";   // ✅ use centralized API

function Login({ onLogin }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setLoading(true);
    setError("");

    try {
      // 🔐 LOGIN
      const res = await API.post("/auth/login", {
        email,
        password
      });

      const token = res.data.access_token;

      console.log("✅ TOKEN:", token);

      // 💾 SAVE TOKEN
      localStorage.setItem("token", token);

      // 🔐 VERIFY USER (NOW AUTO-INCLUDES TOKEN)
      const userRes = await API.get("/me");

      console.log("✅ USER:", userRes.data);

      onLogin(userRes.data);

    } catch (err) {
      console.error("❌ LOGIN ERROR:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Login failed");
      }

      localStorage.removeItem("token");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: "auto" }}>
      <h2>Login to CyberClinic</h2>

      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>
          {error}
        </div>
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      <br /><br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      <br /><br />

      <button
        onClick={login}
        disabled={loading}
        style={{
          width: "100%",
          padding: 10,
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

export default Login;