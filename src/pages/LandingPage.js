import { useNavigate } from "react-router-dom";

export default function LandingPage() {

  const nav = useNavigate();

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
          <button style={btnPrimary}>
            Run Free Compliance Scan
          </button>

          <button style={btnSecondary} onClick={() => nav("/pricing")}>
            See Plans
          </button>
        </div>

        <p style={{ marginTop: 10, fontSize: 12 }}>
          No credit card required • Instant results • Audit-ready reports
        </p>
      </div>

      {/* TRUST */}
      <div style={section}>
        <h2>Trusted by Healthcare Teams & Compliance Professionals</h2>

        <p style={{ color: "#94a3b8" }}>
          HIPAA-ready • Secure • Designed for CMS-aligned workflows
        </p>
      </div>

      {/* PROBLEM / SOLUTION */}
      <div style={sectionRow}>
        <div>
          <h3>Compliance Is Expensive, Slow, and Stressful</h3>
          <ul>
            <li>Manual audits take months</li>
            <li>Consultants cost $10K+</li>
            <li>Risk of penalties and audits</li>
          </ul>
        </div>

        <div>
          <h3>CyberClinic automates everything</h3>
          <ul>
            <li>✔ Instant HIPAA risk scoring</li>
            <li>✔ AI-powered recommendations</li>
            <li>✔ Audit-ready reports in minutes</li>
          </ul>
        </div>
      </div>

      {/* FEATURES */}
      <div style={section}>
        <h2>Platform Capabilities</h2>

        <div style={grid}>
          <Feature
            title="Compliance Scoring"
            text="Real-time HIPAA risk scoring with executive dashboards."
          />
          <Feature
            title="AI Recommendations"
            text="AI identifies compliance gaps and how to fix them."
          />
          <Feature
            title="Audit Reports"
            text="Download regulator-ready reports instantly."
          />
        </div>
      </div>

      {/* PRICING */}
      <div style={section}>
        <h2>Simple, Transparent Pricing</h2>

        <div style={grid}>
          <Pricing
            title="Starter"
            price="$49/mo"
            features={[
              "Basic compliance scan",
              "Limited reports",
              "Email support"
            ]}
          />

          <Pricing
            title="Professional"
            price="$99/mo"
            highlight
            features={[
              "Full dashboard",
              "AI recommendations",
              "Audit reports"
            ]}
          />

          <Pricing
            title="Enterprise"
            price="Custom"
            features={[
              "Multi-site",
              "Dedicated support",
              "Custom integrations"
            ]}
          />
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={section}>
        <h2>Get Compliance-Ready Today</h2>

        <button style={btnPrimary}>
          Run Free Compliance Scan
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

const sectionRow = {
  padding: "80px 20px",
  display: "flex",
  justifyContent: "space-around",
  flexWrap: "wrap",
  gap: 40
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