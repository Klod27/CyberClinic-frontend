import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createCheckoutSession } from "../api";

export default function LandingPage() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  /* =========================
     PRIMARY FLOW (FIXED)
  ========================= */
  const runScan = () => {
    try {
      nav("/hipaa");
    } catch {
      window.location.href = "/hipaa";
    }
  };

  /* =========================
     SAFE DEMO PREVIEW (NEW)
  ========================= */
  const runPreview = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔥 SIMULATED DEMO DATA (NO BROKEN API)
      const demo = {
        score: 78,
        risk: "Medium",
        findings: [
          { issue: "Access Control Weakness", description: "User permissions not properly enforced" },
          { issue: "Encryption Gap", description: "Data not encrypted at rest" }
        ]
      };

      setTimeout(() => {
        setResult(demo);
        setLoading(false);
      }, 800);

    } catch {
      setError("Preview failed.");
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

      const res = await createCheckoutSession("subscription");

      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error();
      }

    } catch {
      setError("Upgrade failed.");
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
          AI-powered compliance audits based on real HIPAA Security Rule controls.
        </p>

        <div style={{ marginTop: 30 }}>
          <button style={btnPrimary} onClick={runScan}>
           Start Demo Assessment
          </button>

          <button style={btnSecondary} onClick={() => nav("/pricing")}>
            See Plans
          </button>
        </div>

        <p style={{ marginTop: 10, fontSize: 12 }}>
          Demo assessment • Real scoring • Audit-ready reports
        </p>

        {/* SAFE PREVIEW */}
        <div style={{ marginTop: 20 }}>
          <button style={btnGhost} onClick={runPreview}>
            Preview AI Engine (Demo)
          </button>
        </div>

        {loading && <p style={{ marginTop: 10 }}>Loading preview...</p>}

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

      {/* PREVIEW RESULT */}
      {result && (
        <div style={section}>
          <h2>AI Engine Preview</h2>

          <pre style={{
            textAlign: "left",
            background: "#020617",
            padding: 20,
            borderRadius: 10,
            overflowX: "auto"
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>

          <button style={btnPrimary} onClick={runScan}>
            Continue Full Assessment
          </button>
        </div>
      )}

      {/* TRUST */}
      <div style={section}>
        <h2>Trusted by Healthcare Teams & Compliance Professionals</h2>
        <p style={{ color: "#94a3b8", maxWidth: 600, margin: "0 auto" }}>
          Evaluate HIPAA safeguards, calculate risk, and generate audit-ready reports.
        </p>
      </div>

      {/* FEATURES */}
      <div style={section}>
        <h2>Platform Capabilities</h2>

        <div style={grid}>
          <Feature title="Compliance Scoring" text="Real questionnaire-based scoring." />
          <Feature title="AI Recommendations" text="Actionable remediation insights." />
          <Feature title="Audit Reports" text="Download hospital-grade reports." />
        </div>
      </div>

      {/* PRICING */}
      <div style={section}>
        <h2>Simple, Transparent Pricing</h2>

        <div style={grid}>
          <Pricing title="Demo" price="Included" features={[
            "HIPAA Assessment",
            "Compliance Score",
            "Limited AI Insights"
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

        <button
          style={btnPrimary}
          onClick={handleUpgrade}
          disabled={upgradeLoading}
        >
          {upgradeLoading ? "Redirecting..." : "Upgrade Now"}
        </button>
      </div>

      {/* FINAL CTA */}
      <div style={section}>
        <h2>Start Your HIPAA Assessment Today</h2>
        <button style={btnPrimary} onClick={runScan}>
          Start Assessment
        </button>
      </div>

    </div>
  );
}

/* =========================
   UI STYLES
========================= */

const section = {
  padding: "60px 20px",
  textAlign: "center"
};

const grid = {
  display: "flex",
  gap: 20,
  justifyContent: "center",
  flexWrap: "wrap",
  marginTop: 30
};

const btnPrimary = {
  background: "#2563eb",
  color: "white",
  padding: "12px 24px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  marginRight: 10
};

const btnSecondary = {
  background: "transparent",
  border: "1px solid #3b82f6",
  color: "#3b82f6",
  padding: "12px 24px",
  borderRadius: 8,
  cursor: "pointer"
};

const btnGhost = {
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  marginLeft: 10,
  cursor: "pointer"
};

const Feature = ({ title, text }) => (
  <div style={{ maxWidth: 250 }}>
    <h4>{title}</h4>
    <p style={{ color: "#94a3b8" }}>{text}</p>
  </div>
);

const Pricing = ({ title, price, features, highlight }) => (
  <div style={{
    padding: 20,
    borderRadius: 10,
    background: highlight ? "#1e293b" : "#111827",
    border: "1px solid #334155",
    width: 220
  }}>
    <h3>{title}</h3>
    <h2>{price}</h2>

    {features.map((f, i) => (
      <p key={i} style={{ fontSize: 14 }}>{f}</p>
    ))}
  </div>
);