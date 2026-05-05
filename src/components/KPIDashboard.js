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

function KPIDashboard({ orgId, data }) {

  const [trend, setTrend] = useState([]);
  const [latest, setLatest] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* =========================
     MOUNT FIX
  ========================= */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* =========================
     LOAD TREND (KEEP FEATURE)
  ========================= */
  useEffect(() => {
    if (!orgId) return;

    API.get(`/analytics/trend/${orgId}`)
      .then(res => {
        const dataArr = Array.isArray(res.data) ? res.data : [];

        setTrend(dataArr);

        if (dataArr.length > 0) {
          const last = dataArr[dataArr.length - 1];
          setLatest(last);

          if (last.category_scores) {
            const formatted = Object.entries(last.category_scores).map(
              ([key, value]) => ({
                name: key,
                value: value
              })
            );
            setCategoryData(formatted);
          }
        }

        setReady(true);
      })
      .catch(() => {
        setReady(true);
      });

  }, [orgId]);

  /* =========================
     🔥 FALLBACK TO REPORT (CRITICAL FIX)
  ========================= */
  useEffect(() => {
    if (!data) return;

    // If no trend yet, build minimal one
    if (!trend.length) {
      setTrend([
        {
          date: new Date().toLocaleDateString(),
          score: data.score
        }
      ]);
    }

    // Always sync latest with report
    setLatest({
      score: data.score,
      risk: data.risk
    });

    // Build category data from report
    if (data.category_scores) {
      const formatted = Object.entries(data.category_scores).map(
        ([key, value]) => ({
          name: key,
          value: value
        })
      );
      setCategoryData(formatted);
    }

  }, [data]);

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

  /* =========================
     LOADING
  ========================= */

  if (!ready || !mounted) {
    return (
      <div style={{ color: COLORS.sub, padding: 20 }}>
        Loading analytics...
      </div>
    );
  }

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

      {/* TREND */}
      <div style={{
        background: COLORS.card,
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        marginBottom: 25,
        minHeight: 260
      }}>

        <h3>Compliance Trend</h3>

        {trend.length > 0 ? (
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
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: COLORS.sub }}>No trend data yet</p>
        )}

      </div>

      {/* CATEGORY */}
      <div style={{
        background: COLORS.card,
        padding: 20,
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        minHeight: 260
      }}>

        <h3>Risk Breakdown</h3>

        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar
                dataKey="value"
                fill={COLORS.blue}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: COLORS.sub }}>No category data yet</p>
        )}

      </div>

    </div>
  );
}

export default KPIDashboard;