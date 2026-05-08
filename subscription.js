import React from "react";
import axios from "axios";

/*
==================================================
PRODUCTION BACKEND URL
==================================================
*/
const API = "https://cyberclinic-backend.onrender.com";

function Subscription({ token }) {

  const subscribe = async (plan) => {

    try {

      /*
      ==========================================
      CREATE CHECKOUT SESSION
      ==========================================
      */
      const res = await axios.post(
        `${API}/billing/create-checkout-session`,
        {
          mode: "subscription",
          plan: plan
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      /*
      ==========================================
      REDIRECT TO STRIPE
      ==========================================
      */
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert("Stripe checkout URL missing");
      }

    } catch (err) {

      console.error("SUBSCRIPTION ERROR:", err);

      if (err.response) {
        console.error(err.response.data);
      }

      alert("Stripe checkout failed");
    }
  };

  return (

    <div style={{ padding: 30 }}>

      <h2>Upgrade Your Plan</h2>

      <div style={{ display: "flex", gap: 20 }}>

        {/* FREE */}
        <div style={card}>
          <h3>Free</h3>
          <p>$0/month</p>
          <p>Basic HIPAA Assessment</p>
        </div>

        {/* PRO */}
        <div style={card}>
          <h3>Pro</h3>
          <p>$49/month</p>

          <ul>
            <li>Unlimited Assessments</li>
            <li>Download Reports</li>
            <li>AI Remediation</li>
            <li>Compliance Dashboard</li>
          </ul>

          <button onClick={() => subscribe("pro")}>
            Upgrade
          </button>
        </div>

        {/* ENTERPRISE */}
        <div style={card}>
          <h3>Enterprise</h3>
          <p>$99/month</p>

          <ul>
            <li>Multi-user Teams</li>
            <li>Advanced Analytics</li>
            <li>Priority Support</li>
            <li>Unlimited Reports</li>
          </ul>

          <button onClick={() => subscribe("enterprise")}>
            Upgrade
          </button>
        </div>

      </div>

    </div>
  );
}

/*
==================================================
CARD STYLE
==================================================
*/
const card = {
  padding: 20,
  borderRadius: 12,
  background: "#1e293b",
  color: "#fff",
  width: 260
};

export default Subscription;