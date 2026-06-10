import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

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
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // DEMO ACCESS
  const startDemo = () => {
    navigate("/hipaa");
  };

  // STRIPE PRO FLOW
  const upgradeToPro = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before upgrading.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post(
        "/billing/create-checkout-session",
        {
          mode: "subscription",
          plan: "pro"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("CHECKOUT RESPONSE:", res.data);

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error(
          "No Stripe checkout URL returned."
        );
      }
    } catch (err) {
      console.error("Stripe Error:", err);

      alert(
        err.response?.data?.detail ||
        "Stripe checkout failed."
      );
    } finally {
      setLoading(false);
    }
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
    <div
      style={{
        background: COLORS.bg,
        color: COLORS.text,
        minHeight: "100vh",
        padding: 40
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        Pricing Plans
      </h1>

      <p
        style={{
          textAlign: "center",
          color: COLORS.sub,
          maxWidth: 760,
          margin: "12px auto 0"
        }}
      >
        Upgrade to unlock PDF reports,
        dashboards, AI remediation,
        audit documentation,
        and collaboration features.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 50
        }}
      >
        {/* DEMO */}
        <div style={planCard}>
          <h2>Demo</h2>

          <ul>
            <li>✔ Limited HIPAA assessment</li>
            <li>✔ Preview compliance dashboard</li>
            <li>✔ Sample AI recommendations</li>
            <li>✔ Limited findings visibility</li>
            <li>✖ No PDF reports</li>
            <li>✖ No team management</li>
          </ul>

          <h3>Demo Access</h3>

          <button
            onClick={startDemo}
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
            Start Demo
          </button>
        </div>

        {/* PRO */}
        <div
          style={{
            ...planCard,
            border: `2px solid ${COLORS.blue}`
          }}
        >
          <h2>Pro</h2>

          <ul>
            <li>✔ Unlimited HIPAA assessments</li>
            <li>✔ Full compliance dashboard</li>
            <li>✔ AI remediation guidance</li>
            <li>✔ PDF audit reports</li>
            <li>✔ Team management</li>
            <li>✔ Audit tracking</li>
            <li>✔ Compliance trend monitoring</li>
          </ul>

          <h3>$99/month</h3>

          <button
            onClick={upgradeToPro}
            disabled={loading}
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
            {loading
              ? "Redirecting..."
              : "Upgrade to Pro"}
          </button>

          <p
            style={{
              marginTop: 12,
              fontSize: 12,
              color: COLORS.yellow
            }}
          >
            Secure Stripe checkout enabled
          </p>
        </div>

        {/* ENTERPRISE */}
        <div style={planCard}>
          <h2>Enterprise</h2>

          <ul>
            <li>✔ Multi-site management</li>
            <li>✔ Enterprise reporting</li>
            <li>✔ Dedicated support</li>
            <li>✔ Compliance consulting</li>
            <li>✔ Custom integrations</li>
            <li>✔ Executive dashboards</li>
          </ul>

          <h3>Custom Pricing</h3>

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

      <div
        style={{
          textAlign: "center",
          marginTop: 30
        }}
      >
        <button
          onClick={() => navigate("/")}
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