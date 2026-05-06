import React from "react";

const COLORS = {
  bg: "#0f172a",
  card: "#111827",
  border: "#334155",
  text: "#e2e8f0",
  sub: "#94a3b8",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#f59e0b"
};

function PricingPage() {
  const startFree = () => {
    localStorage.setItem("plan", "free");
    window.location.href = "/hipaa";
  };

  const upgradeDemo = () => {
    localStorage.setItem("plan", "pro");
    alert("Demo Pro access enabled. In production, this button will connect to Stripe checkout.");
    window.location.href = "/dashboard";
  };

  const contactSales = () => {
    window.location.href =
      "mailto:info@cyberclinicsaas.com?subject=CyberClinic Enterprise Inquiry";
  };

  const planCard = {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: 30,
    margin: 20,
    width: 300,
    minHeight: 360
  };

  return (
    <div style={{
      background: COLORS.bg,
      color: COLORS.text,
      minHeight: "100vh",
      padding: 40
    }}>
      <h1 style={{ textAlign: "center" }}>
        Pricing Plans
      </h1>

      <p style={{
        textAlign: "center",
        color: COLORS.sub,
        maxWidth: 760,
        margin: "12px auto 0"
      }}>
        Start with a free HIPAA readiness assessment. Upgrade to unlock full
        dashboard access, PDF reporting, AI recommendations, and team workflows.
      </p>

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        flexWrap: "wrap",
        marginTop: 50
      }}>
        <div style={planCard}>
          <h2>Free</h2>
          <p style={{ color: COLORS.sub }}>Basic assessment access</p>

          <ul>
            <li>✔ Limited HIPAA assessment</li>
            <li>✔ Basic score preview</li>
            <li>✔ Starter AI insights</li>
          </ul>

          <h3>$0 / month</h3>

          <button
            onClick={startFree}
            style={{
              marginTop: 20,
              padding: "10px 16px",
              background: COLORS.green,
              border: "none",
              color: "white",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Start Free Assessment
          </button>
        </div>

        <div style={{
          ...planCard,
          border: `2px solid ${COLORS.blue}`,
          boxShadow: "0 10px 30px rgba(59,130,246,0.25)"
        }}>
          <h2>Pro</h2>

          <p style={{ color: COLORS.sub }}>
            Designed for clinics and healthcare teams
          </p>

          <ul style={{ marginTop: 10 }}>
            <li>✔ Full compliance scoring dashboard</li>
            <li>✔ AI recommendations</li>
            <li>✔ PDF audit reports</li>
            <li>✔ Team collaboration</li>
            <li>✔ Audit timeline</li>
          </ul>

          <h3>$99/month</h3>

          <button
            onClick={upgradeDemo}
            style={{
              marginTop: 20,
              padding: "10px 16px",
              background: COLORS.blue,
              border: "none",
              color: "white",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Enable Pro Demo
          </button>

          <p style={{
            marginTop: 12,
            fontSize: 12,
            color: COLORS.yellow
          }}>
            Stripe checkout can be re-enabled after login and billing are finalized.
          </p>
        </div>

        <div style={planCard}>
          <h2>Enterprise</h2>
          <p style={{ color: COLORS.sub }}>
            Multi-clinic, polyclinic, hospital, and network deployments
          </p>

          <ul>
            <li>✔ Dedicated support</li>
            <li>✔ Custom integrations</li>
            <li>✔ Compliance consulting</li>
            <li>✔ Multi-site reporting</li>
          </ul>

          <h3>Custom</h3>

          <button
            onClick={contactSales}
            style={{
              marginTop: 20,
              padding: "10px 16px",
              background: "transparent",
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Contact Sales
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button
          onClick={() => window.location.href = "/"}
          style={{
            padding: "10px 16px",
            background: "transparent",
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default PricingPage;