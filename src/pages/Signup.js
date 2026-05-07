import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signup = async (e) => {
    e?.preventDefault();

    if (!agree) {
      setError("You must accept the Terms & HIPAA Compliance Use.");
      return;
    }

    if (!name || !email || !password) {
      setError("Please enter organization name, email, and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/signup", {
        name,
        email,
        password
      });

      const token = res.data?.access_token;

      if (!token) {
        throw new Error("Signup succeeded, but no access token was returned.");
      }

      localStorage.setItem("token", token);

      alert("Account created successfully.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);

      setError(
        err.response?.data?.detail ||
        "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e2e8f0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
      }}
    >
      <form
        onSubmit={signup}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#111827",
          padding: 32,
          borderRadius: 14,
          border: "1px solid #334155"
        }}
      >
        <h2>Create Your CyberClinic Account</h2>

        {error && (
          <div
            style={{
              color: "#fecaca",
              background: "#7f1d1d",
              padding: 10,
              borderRadius: 8,
              marginBottom: 15
            }}
          >
            {error}
          </div>
        )}

        <input
          placeholder="Organization Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 12
          }}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 12
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 16
          }}
        />

        <label
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 18,
            color: "#cbd5e1"
          }}
        >
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          I agree to Terms & HIPAA Compliance Use
        </label>

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
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p style={{ marginTop: 18 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#60a5fa" }}>
            Login
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

export default Signup;