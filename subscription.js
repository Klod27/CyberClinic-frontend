import React from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function Subscription({ token }) {

  const subscribe = async (plan) => {
    try {
      const res = await axios.post(
        `${API}/billing/create-checkout-session`,
        { plan },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      window.location.href = res.data.url;

    } catch (err) {
      alert("Stripe failed");
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
          <p>Basic scan</p>
        </div>

        {/* PRO */}
        <div style={card}>
          <h3>Pro</h3>
          <p>$49/month</p>
          <button onClick={() => subscribe("pro")}>
            Upgrade
          </button>
        </div>

        {/* ENTERPRISE */}
        <div style={card}>
          <h3>Enterprise</h3>
          <p>$99/month</p>
          <button onClick={() => subscribe("enterprise")}>
            Upgrade
          </button>
        </div>

      </div>
    </div>
  );
}

const card = {
  padding: 20,
  borderRadius: 12,
  background: "#1e293b",
  color: "#fff",
  width: 200
};

export default Subscription;