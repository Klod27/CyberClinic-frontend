import React, { useEffect, useState } from "react";
import API from "../api";
import KPIDashboard from "../components/KPIDashboard";
import ExecutivePanel from "../components/ExecutivePanel";

/* =========================
   STYLES
========================= */

const layout = {
  display: "flex",
  minHeight: "100vh",
  background: "#0f172a",
  color: "#e2e8f0"
};

const sidebar = {
  width: 240,
  background: "#1e293b",
  padding: 20
};

const main = {
  flex: 1,
  padding: 30
};

const card = {
  background: "#111827",
  padding: 20,
  borderRadius: 12,
  marginTop: 20,
  border: "1px solid #334155"
};

function Dashboard() {

  const [org, setOrg] = useState(null);
  const [history, setHistory] = useState([]);
  const [subscription, setSubscription] = useState(null);

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    const load = async () => {
      try {

        const orgRes = await API.get("/org/list");
        const subRes = await API.get("/subscription/status");

        const currentOrg = orgRes.data?.[0];

        setOrg(currentOrg);
        setSubscription(subRes.data);

        if (currentOrg) {
          const hist = await API.get(`/reports/history?org_id=${currentOrg.id}`);
          setHistory(hist.data.history || []);
        }

      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  /* =========================
     PDF DOWNLOAD
  ========================= */

  const downloadPDF = async (item) => {
    try {
      const pdf = await API.post("/reports/generate", {
        data: item
      });

      window.open(
        `${API.defaults.baseURL}${pdf.data.download_url}`,
        "_blank"
      );

    } catch {
      alert("PDF generation failed");
    }
  };

  return (
    <div style={layout}>

      {/* SIDEBAR */}
      <div style={sidebar}>
        <h2>CyberClinic</h2>

        <p onClick={() => window.location.href="/dashboard"}>Dashboard</p>
        <p onClick={() => window.location.href="/hipaa"}>Assessment</p>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={main}>

        <h1>Compliance Dashboard</h1>

        {/* KPI + EXECUTIVE */}
        {org && <KPIDashboard orgId={org.id} />}
        {org && <ExecutivePanel orgId={org.id} />}

        {/* SUBSCRIPTION */}
        <div style={card}>
          <h3>Subscription</h3>
          <p>{subscription?.plan || "Free Plan"}</p>

          <button onClick={() => window.location.href="/pricing"}>
            Upgrade Plan
          </button>
        </div>

        {/* NEW ASSESSMENT */}
        <div style={card}>
          <h3>New Assessment</h3>

          <button onClick={() => window.location.href="/hipaa"}>
            Start Assessment
          </button>
        </div>

        {/* HISTORY */}
        <div style={card}>
          <h3>Assessment History</h3>

          {history.length === 0 && <p>No reports yet.</p>}

          {history.map((h, i) => (
            <div key={i} style={{ marginTop: 10 }}>
              <strong>{h.score}%</strong> — {h.risk}
              <br />
              <small>{new Date(h.date).toLocaleString()}</small>

              <br />

              <button onClick={() => downloadPDF(h)}>
                Download PDF
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;