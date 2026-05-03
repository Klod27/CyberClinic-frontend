import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API, { createCheckoutSession } from "../api";

export default function LandingPage() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  /* =========================
     SAFE STYLE ACCESS FIX
     Prevents cssRules crash
  ========================= */
  useEffect(() => {
    try {
      const sheets = document.styleSheets;

      for (let i = 0; i < sheets.length; i++) {
        try {
          // 🔥 safe access
          const rules = sheets[i].cssRules;
        } catch (err) {
          console.warn("⚠️ Skipping inaccessible stylesheet:", sheets[i].href);
        }
      }
    } catch (err) {
      console.warn("Stylesheet check failed:", err);
    }
  }, []);

  /* =========================
     RUN COMPLIANCE SCAN
  ========================= */

  const runScan = async (e) => {
    if (e) e.preventDefault();

    console.log("🔥 BUTTON CLICKED");

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const FULL_URL = "https://cyberclinic-backend.onrender.com/automation/run";

      console.log("🚀 Calling API:", FULL_URL);

      const res = await fetch(FULL_URL);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      console.log("✅ Scan result:", data);

      setResult(data);

    } catch (err) {
      console.error("❌ FULL ERROR:", err);

      if (err.message.includes("Failed to fetch")) {
        setError("🌐 Network/CORS issue. Backend blocked request.");
      } else {
        setError(`❌ Scan failed: ${err.message}`);
      }

    } finally {
      setLoading(false);
    }
  };

  /* =========================
     STRIPE UPGRADE
  ========================= */

  const handleUpgrade = async () => {
    try {
      setUpgradeLoading(true);
      setError(null);

      console.log("💳 Creating checkout session...");

      const res = await createCheckoutSession("subscription");

      console.log("✅ Stripe response:", res);

      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error("Missing Stripe URL");
      }

    } catch (err) {
      console.error("❌ Upgrade error:", err);
      setError("Upgrade failed. Backend or Stripe issue.");
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div style={{
      background: "#0f172a",
      color: "#e2e8f0",
      fontFamily: "sans-serif"
    }}>

      {/* NAVBAR */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "20px 40px"
      }}>
        <h2>CyberClinic</h2>

        <div>
          <button onClick={() => nav("/pricing")} style={btnGhost}>Pricing</button>
          <button onClick={() => nav("/login")} style={btnGhost}>Login</button>
        </div>
      </div>

      {/* HERO */}
      <div style={{
        textAlign: "center",
        padding: "100px 20px"
      }}>
        <h1 style={{ fontSize: 48 }}>
          Automate HIPAA Compliance in Minutes — Not Months
        </h1>

        <p style={{ marginTop: 20, color: "#94a3b8" }}>
          AI-powered compliance audits, risk scoring, and audit-ready reports
          for clinics, hospitals, and healthcare startups.
        </p>

        <div style={{ marginTop: 30 }}>
          <button
            style={btnPrimary}
            onClick={runScan}
            disabled={loading}
          >
            {loading ? "Running Scan..." : "Run Free Compliance Scan"}
          </button>

          <button
            style={btnSecondary}
            onClick={() => nav("/pricing")}
          >
            See Plans
          </button>
        </div>

        <p style={{ marginTop: 10, fontSize: 12 }}>
          No credit card required • Instant results • Audit-ready reports
        </p>

        {/* ERROR DISPLAY */}
        {error && (
          <div style={{
            marginTop: 20,
            color: "#ef4444",
            background: "#1e293b",
            padding: 12,
            borderRadius: 8
          }}>
            {error}
          </div>
        )}
      </div>

      {/* RESULT */}
      {result && (
        <div style={section}>
          <h2>Scan Result</h2>

          <pre style={{
            textAlign: "left",
            background: "#020617",
            padding: 20,
            borderRadius: 10,
            overflowX: "auto"
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* TRUST */}
      <div style={section}>
        <h2>Trusted by Healthcare Teams & Compliance Professionals</h2>
        <p style={{ color: "#94a3b8" }}>
          HIPAA-ready • Secure • Designed for CMS-aligned workflows
        </p>
      </div>

      {/* FEATURES */}
      <div style={section}>
        <h2>Platform Capabilities</h2>

        <div style={grid}>
          <Feature title="Compliance Scoring" text="Real-time HIPAA risk scoring." />
          <Feature title="AI Recommendations" text="AI identifies gaps instantly." />
          <Feature title="Audit Reports" text="Download regulator-ready reports." />
        </div>
      </div>

      {/* PRICING */}
      <div style={section}>
        <h2>Simple, Transparent Pricing</h2>

        <div style={grid}>
          <Pricing title="Starter" price="$49/mo" features={[
            "Basic compliance scan",
            "Limited reports",
            "Email support"
          ]} />

          <Pricing title="Professional" price="$99/mo" highlight features={[
            "Full dashboard",
            "AI recommendations",
            "Audit reports"
          ]} />

          <Pricing title="Enterprise" price="Custom" features={[
            "Multi-site",
            "Dedicated support",
            "Custom integrations"
          ]} />
        </div>

        <div style={{ marginTop: 30 }}>
          <button
            style={btnPrimary}
            onClick={handleUpgrade}
            disabled={upgradeLoading}
          >
            {upgradeLoading ? "Redirecting..." : "Upgrade Now"}
          </button>
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={section}>
        <h2>Get Compliance-Ready Today</h2>

        <button style={btnPrimary} onClick={runScan}>
          {loading ? "Running Scan..." : "Run Free Compliance Scan"}
        </button>
      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const section = {
  padding: "80px 20px",
  textAlign: "center"
};

const grid = {
  display: "flex",
  justifyContent: "center",
  gap: 30,
  flexWrap: "wrap",
  marginTop: 40
};

const btnPrimary = {
  padding: "12px 24px",
  background: "#3b82f6",
  border: "none",
  color: "white",
  borderRadius: 8,
  marginRight: 10,
  cursor: "pointer"
};

const btnSecondary = {
  padding: "12px 24px",
  background: "transparent",
  border: "1px solid #3b82f6",
  color: "#3b82f6",
  borderRadius: 8,
  cursor: "pointer"
};

const btnGhost = {
  marginLeft: 10,
  background: "transparent",
  border: "none",
  color: "#e2e8f0",
  cursor: "pointer"
};

/* ================= COMPONENTS ================= */

function Feature({ title, text }) {
  return (
    <div style={{
      width: 260,
      padding: 20,
      border: "1px solid #334155",
      borderRadius: 12
    }}>
      <h3>{title}</h3>
      <p style={{ color: "#94a3b8" }}>{text}</p>
    </div>
  );
}

function Pricing({ title, price, features, highlight }) {
  return (
    <div style={{
      width: 260,
      padding: 20,
      borderRadius: 12,
      border: highlight ? "2px solid #3b82f6" : "1px solid #334155"
    }}>
      <h3>{title}</h3>
      <h2>{price}</h2>

      <ul>
        {features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
    </div>
  );
}
