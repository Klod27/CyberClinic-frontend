import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import API from "../api";

const COLORS = ["#22c55e", "#facc15", "#f97316", "#dc2626"];

function ComplianceDashboard({ assessmentId }) {

  const [data, setData] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [paid, setPaid] = useState(false);

  // ----------------------------------
  // LOAD DATA
  // ----------------------------------
  const loadData = () => {
    API.get(`/hipaa/results/${assessmentId}`)
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        alert("Session expired");
        localStorage.removeItem("token");
        window.location.reload();
      });
  };

  useEffect(() => {
    loadData();
  }, [assessmentId]);

  if (!data) return <p>Loading...</p>;

  const categoryData = Object.entries(data.assessment.category_scores || {}).map(
    ([key, value]) => ({
      name: key,
      value
    })
  );

  const visibleFindings = paid
    ? data.findings
    : data.findings.slice(0, 3);

  // ----------------------------------
  // GENERATE REPORT
  // ----------------------------------
  const generateReport = async () => {
    const res = await API.post(`/reports/generate?org_id=1`);
    setReportId(res.data.report_id);
    alert("Report generated");
  };

  // ----------------------------------
  // PAY
  // ----------------------------------
  const handlePayment = async () => {
    const res = await API.post(`/billing/create-checkout-session?mode=report&report_id=${reportId}`);
    window.location.href = res.data.url;
  };

  // ----------------------------------
  // DOWNLOAD
  // ----------------------------------
  const downloadReport = async () => {
    try {
      const res = await API.get(`/reports/download/${reportId}`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(res.data);
      window.open(url);

    } catch (err) {
      alert("Please complete payment first.");
    }
  };

  return (
    <div style={{ padding: 40, background: "#0b0f19", color: "white" }}>

      <h1>CyberClinic Compliance Dashboard</h1>

      <h2>Score: {data.assessment.score}%</h2>
      <h3 style={{ color: "#facc15" }}>
        Risk Level: {data.assessment.risk_level}
      </h3>

      {/* CHART */}
      <div style={{ width: 400, height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={categoryData} dataKey="value">
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <hr style={{ margin: "30px 0" }} />

      {/* FINDINGS */}
      <h2>Top Risk Findings</h2>

      {visibleFindings.map((f, i) => (
        <div key={i} style={{
          background: "#111827",
          padding: 20,
          marginBottom: 15,
          borderRadius: 10
        }}>
          <h3>{f.title || f.issue}</h3>
          <p><strong>Risk:</strong> {f.risk_level}</p>
          <p><strong>Impact:</strong> {f.impact}</p>
          <p style={{ color: "#f87171" }}>
            <strong>Why this matters:</strong>{" "}
            {f.business_impact ||
              "Failure to address this issue could result in regulatory fines, legal liability, and loss of patient trust."}
          </p>
        </div>
      ))}

      {/* LOCK MESSAGE */}
      {!paid && (
        <div style={{
          marginTop: 20,
          padding: 20,
          background: "#020617",
          borderRadius: 10,
          textAlign: "center"
        }}>
          <h2>🔒 Full Report Locked</h2>
          <p>Unlock full findings, recommendations, and PDF report.</p>
        </div>
      )}

      {/* BUTTONS */}
      <div style={{ marginTop: 30 }}>

        <button onClick={generateReport}>
          Generate Report
        </button>

        {reportId && !paid && (
          <button onClick={handlePayment} style={{ marginLeft: 10 }}>
            Pay & Unlock
          </button>
        )}

        {reportId && (
          <button onClick={downloadReport} style={{ marginLeft: 10 }}>
            Download PDF
          </button>
        )}

      </div>

    </div>
  );
}

export default ComplianceDashboard;