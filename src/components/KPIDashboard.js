import React, { useEffect, useState } from "react";
import API from "../api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

/* =========================
   COLORS
========================= */

const COLORS = {
  card: "#111827",
  border: "#334155",
  text: "#e2e8f0",
  sub: "#94a3b8",
  green: "#22c55e",
  yellow: "#facc15",
  red: "#ef4444",
  blue: "#3b82f6"
};

/* =========================
   HELPERS
========================= */

const getRiskColor = (risk) => {
  if (!risk) return COLORS.sub;
  if (risk.toLowerCase() === "low") return COLORS.green;
  if (risk.toLowerCase() === "medium") return COLORS.yellow;
  return COLORS.red;
};

/* =========================
   COMPONENT
========================= */

function KPIDashboard({ orgId }) {

  const [trend, setTrend] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    if (!orgId) return;

    API.get(`/analytics/trend/${orgId}`)
      .then(res => {
        setTrend(res.data);

        if (res.data.length > 0) {
          setLatest(res.data[res.data.length - 1]);
        }
      })
      .catch(() => {
        console.log("No analytics yet");
      });

  }, [orgId]);

  /* =========================
     KPI CARDS
  ========================= */

  const KPI = ({ title, value, color }) => (
    <div style={{
      flex: 1,
      background: COLORS.card,
      padding: 20,
      borderRadius: 12,
      border: `1px solid ${COLORS.border}`,
      marginRight: 15
    }}>
      <p style={{ color: COLORS.sub }}>{title}</p>
      <h2 style={{ color }}>{value}</h2>
    </div>
  );

  return (
    <div style={{ marginBottom: 30 }}>

      {/* KPI ROW */}
      <div style={{ display: "flex", marginBottom: 25 }}>

        <KPI
          title="Compliance Score"
          value={latest ? `${latest.score}%` : "--"}
          color={COLORS.green}
        />

        <KPI
          title="Risk Level"
          value={latest ? latest.risk : "--"}
          color={getRiskColor(latest?.risk)}
        />

        <KPI
          title="Assessments"
          value={trend.length}
          color={COLORS.blue}
        />

      </div>

      {/* TREND CHART */}
      <div style={{
        background: COLORS.card,
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        marginBottom: 25
      }}>

        <h3>Compliance Trend</h3>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trend}>
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke={COLORS.blue}
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* CATEGORY BREAKDOWN (SIMULATED FOR NOW) */}
      <div style={{
        background: COLORS.card,
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`
      }}>

        <h3>Risk Breakdown</h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={[
            { name: "Admin", value: 70 },
            { name: "Technical", value: 60 },
            { name: "Physical", value: 80 },
            { name: "Network", value: 65 }
          ]}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="value" fill={COLORS.blue} />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default KPIDashboard;