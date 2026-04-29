import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const API = "http://127.0.0.1:8000";

function HipaaAssessment() {

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardStyle = {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    flex: 1,
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
  };

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API}/hipaa/questions`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setQuestions(res.data);

      } catch {
        alert("Error loading assessment. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const categories = [...new Set(questions.map(q => q.category))];
  const currentCategory = categories[step];
  const currentQuestions = questions.filter(q => q.category === currentCategory);

  const handleAnswer = (id, value) => {
    setAnswers({
      ...answers,
      [id]: value
    });
  };

  const nextStep = () => {
    if (step < categories.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const progress = categories.length
    ? Math.round(((step + 1) / categories.length) * 100)
    : 0;

  const getColor = (value) => {
    if (value >= 80) return "#16a34a";
    if (value >= 50) return "#f59e0b";
    return "#dc2626";
  };

  const submitAssessment = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API}/hipaa/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(res.data);

    } catch {
      alert("Submission failed");
    }
  };

  // 💳 STRIPE BUTTON
  const payForReport = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API}/billing/create-checkout-session?mode=report`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      window.location.href = res.data.url;

    } catch (err) {
      alert("Payment failed. Make sure you are logged in.");
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading assessment...</div>;

  // ----------------------------------
  // RESULTS DASHBOARD
  // ----------------------------------
  if (result && result.category_scores) {

    const chartData = Object.keys(result.category_scores).map(key => ({
      name: key,
      score: result.category_scores[key] || 0
    }));

    const riskLevel =
      result.score >= 80 ? "LOW RISK" :
      result.score >= 50 ? "MODERATE RISK" :
      "HIGH RISK";

    const riskColor =
      result.score >= 80 ? "#16a34a" :
      result.score >= 50 ? "#f59e0b" :
      "#dc2626";

    return (
      <div style={{ padding: 40, background: "#f5f7fa" }}>

        <h1>HIPAA Compliance Report</h1>

        {/* EXECUTIVE SUMMARY */}
        <div style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          marginBottom: 30
        }}>
          <h2>Executive Summary</h2>

          <p>
            Your organization achieved a compliance score of 
            <strong> {result.score}%</strong>.
          </p>

          <p>
            Risk Level: 
            <strong style={{ color: riskColor }}> {riskLevel}</strong>
          </p>
        </div>

        {/* CATEGORY */}
        <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
          {Object.keys(result.category_scores).map(cat => (
            <div key={cat} style={cardStyle}>
              <h3>{cat}</h3>
              <p style={{ color: getColor(result.category_scores[cat]) }}>
                {result.category_scores[cat]}%
              </p>
            </div>
          ))}
        </div>

        {/* CHART */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score">
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* 🔒 LIMIT FINDINGS */}
        <div style={{ marginTop: 40 }}>
          <h2>Key Findings (Preview)</h2>

          {result.findings?.slice(0, 3).map((f, i) => (
            <div key={i}>
              <strong>{f.issue}</strong> — {f.severity}
            </div>
          ))}

          <p style={{ marginTop: 10, color: "red" }}>
            🔒 Full report locked
          </p>
        </div>

        {/* 💳 PAYMENT BUTTON */}
        <button
          onClick={payForReport}
          style={{
            marginTop: 20,
            background: "#2563eb",
            color: "white",
            padding: "10px 20px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer"
          }}
        >
          Unlock Full Report ($49)
        </button>

        <br />

        <button onClick={() => setResult(null)} style={{ marginTop: 20 }}>
          Start New Assessment
        </button>

      </div>
    );
  }

  // ----------------------------------
  // QUESTIONS
  // ----------------------------------
  return (
    <div style={{ padding: 40 }}>
      <h1>HIPAA Security Risk Assessment</h1>

      <p>Section {step + 1} of {categories.length}</p>

      <div style={{ background: "#ddd", height: 10 }}>
        <div style={{
          width: `${progress}%`,
          background: "#2563eb",
          height: 10
        }} />
      </div>

      <h2>{currentCategory}</h2>

      {currentQuestions.map(q => (
        <div key={q.id}>
          <strong>{q.question}</strong>
          <br />
          <select
            value={answers[q.id] || ""}
            onChange={(e) => handleAnswer(q.id, e.target.value)}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      ))}

      <div style={{ marginTop: 20 }}>
        {step > 0 && <button onClick={prevStep}>Previous</button>}
        {step < categories.length - 1 && <button onClick={nextStep}>Next</button>}
        {step === categories.length - 1 && (
          <button onClick={submitAssessment}>Submit</button>
        )}
      </div>
    </div>
  );
}

export default HipaaAssessment;