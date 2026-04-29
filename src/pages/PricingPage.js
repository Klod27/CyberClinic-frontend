import React from "react";
import API from "../api";

const COLORS = {
  bg: "#0f172a",
  text: "#e2e8f0",
  sub: "#94a3b8",
  blue: "#3b82f6",
  green: "#22c55e"
};

function PricingPage() {

  const subscribe = async () => {
    const res = await API.post(
      "/billing/create-checkout-session?mode=subscription"
    );
    window.location.href = res.data.url;
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

      <div style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 50
      }}>

        {/* FREE */}
        <div style={{ margin: 20 }}>
          <h2>Free</h2>
          <p style={{ color: COLORS.sub }}>Basic access</p>

          <ul>
            <li>✔ Limited scans</li>
            <li>✔ Basic dashboard</li>
          </ul>

          <p>$0 / month</p>
        </div>

        {/* PRO */}
        <div style={{
          margin: 20,
          padding: 30,
          border: "2px solid #3b82f6",
          borderRadius: 12
        }}>
          <h2>Pro</h2>

          <p style={{ color: COLORS.sub }}>
            Designed for clinics and healthcare teams
          </p>

          <ul style={{ marginTop: 10 }}>
            <li>✔ Compliance scoring dashboard</li>
            <li>✔ AI recommendations</li>
            <li>✔ PDF audit reports</li>
            <li>✔ Team collaboration</li>
          </ul>

          <h3>$99/month</h3>

          <button
            onClick={subscribe}
            style={{
              marginTop: 20,
              padding: "10px 16px",
              background: COLORS.blue,
              border: "none",
              color: "white",
              borderRadius: 6
            }}
          >
            Upgrade
          </button>
        </div>

        {/* ENTERPRISE */}
        <div style={{ margin: 20 }}>
          <h2>Enterprise</h2>
          <p style={{ color: COLORS.sub }}>
            Multi-clinic, hospital networks, custom deployments
          </p>

          <ul>
            <li>✔ Dedicated support</li>
            <li>✔ Custom integrations</li>
            <li>✔ Compliance consulting</li>
          </ul>

          <p>Contact Sales</p>
        </div>

      </div>

    </div>
  );
}

export default PricingPage;