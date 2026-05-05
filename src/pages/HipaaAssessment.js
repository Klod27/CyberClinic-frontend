import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const API =
  process.env.REACT_APP_API_URL ||
  "https://cyberclinic-backend.onrender.com";

function HipaaAssessment() {

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
     PLAN (FREE VS PRO)
  ========================= */
  const plan = localStorage.getItem("plan") || "free";
  const isPro = plan === "pro";

  const FREE_LIMIT = 10;

  /* =========================
     LOAD QUESTIONS
  ========================= */
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await axios.get(`${API}/hipaa/questions`);

        let q = res.data?.questions || res.data;

        if (!Array.isArray(q)) throw new Error();

        q = q.map(item => ({
          id: item.id,
          question: item.question,
          category: item.category || "General",
          weight: item.weight || 5
        }));

        setQuestions(q);

      } catch {
        setQuestions([
          { id: "1", question: "Do you enforce MFA?", category: "Technical", weight: 10 },
          { id: "2", question: "Encrypt PHI?", category: "Technical", weight: 10 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  /* =========================
     APPLY FREE LIMIT
  ========================= */
  const visibleQuestions = isPro
    ? questions
    : questions.slice(0, FREE_LIMIT);

  const categories = [...new Set(visibleQuestions.map(q => q.category))];

  const currentCategory = categories[step] || "";
  const currentQuestions = visibleQuestions.filter(
    q => q.category === currentCategory
  );

  /* =========================
     ANSWERS
  ========================= */
  const handleAnswer = (id, value, q) => {
    setAnswers(prev => ({
      ...prev,
      [id]: {
        answer: value,
        weight: q.weight,
        category: q.category
      }
    }));
  };

  const progress = categories.length
    ? Math.round(((step + 1) / categories.length) * 100)
    : 0;

  /* =========================
     STRIPE UPGRADE
  ========================= */
  const upgradeToPro = async () => {
    try {
      const res = await axios.post(
        `${API}/billing/create-checkout-session?mode=subscription`
      );

      window.location.href = res.data.url;

    } catch {
      alert("Upgrade failed.");
    }
  };

  /* =========================
     SUBMIT
  ========================= */
  const submitAssessment = async () => {

    if (!Object.keys(answers).length) {
      alert("Please answer questions.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orgId = localStorage.getItem("org_id") || "default";

      const submitRes = await axios.post(`${API}/hipaa/submit`, {
        org_id: orgId,
        answers
      });

      const scanId = submitRes.data.scan_id;

      const reportRes = await axios.post(`${API}/reports/generate`, {
        scan_id: scanId
      });

      const reportData = reportRes.data;

      localStorage.setItem("latest_report", JSON.stringify(reportData));

      setResult(reportData);

    } catch (err) {
      console.error(err);
      setError("Submission failed.");
    }

    setSubmitting(false);
  };

  /* =========================
     AI INSIGHTS
  ========================= */
  const generateInsights = () => {
    const noCount = Object.values(answers)
      .filter(a => a.answer === "No").length;

    if (noCount > 10)
      return "Critical compliance gaps detected.";

    if (noCount > 5)
      return "Moderate compliance risk.";

    return "Strong compliance posture.";
  };

  const getColor = (v = 0) => {
    if (v >= 85) return "#16a34a";
    if (v >= 60) return "#f59e0b";
    return "#dc2626";
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  /* =========================
     RESULTS VIEW
  ========================= */
  if (result?.category_scores) {

    const chartData = Object.entries(result.category_scores)
      .map(([k, v]) => ({ name: k, score: v }));

    return (
      <div style={{ padding: 40 }}>

        <h1>HIPAA Compliance Report</h1>
        <h2>Score: {result.score}%</h2>

        {/* AI INSIGHTS */}
        <div style={{
          marginTop: 20,
          padding: 15,
          background: "#111827",
          color: "white",
          borderRadius: 10
        }}>
          <h3>AI Insights</h3>
          <p>{generateInsights()}</p>
        </div>

        {/* UPGRADE WALL */}
        {!isPro && (
          <div style={{
            marginTop: 20,
            padding: 20,
            border: "2px dashed #f59e0b",
            borderRadius: 10,
            background: "#1e293b"
          }}>
            <h3>Upgrade Required</h3>
            <p>
              Unlock full HIPAA analysis, detailed findings, and PDF reports.
            </p>

            <button onClick={upgradeToPro}>
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* FULL DATA (PRO ONLY) */}
        {isPro && (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score">
                  {chartData.map((e, i) => (
                    <Cell key={i} fill={getColor(e.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <button onClick={() => window.open(result.pdf_url, "_blank")}>
              Download Report
            </button>
          </>
        )}

        <button onClick={() => window.location.href = "/dashboard"}>
          Go to Dashboard
        </button>

      </div>
    );
  }

  /* =========================
     QUESTIONS VIEW
  ========================= */
  return (
    <div style={{ padding: 40 }}>

      <h1>HIPAA Assessment</h1>

      {!isPro && (
        <p style={{ color: "#f59e0b" }}>
          Free plan: limited to {FREE_LIMIT} questions
        </p>
      )}

      <p>Step {step + 1} of {categories.length}</p>

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
            value={answers[q.id]?.answer || ""}
            onChange={(e) => handleAnswer(q.id, e.target.value, q)}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="Partial">Partial</option>
            <option value="No">No</option>
          </select>
        </div>
      ))}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 20 }}>
        {step > 0 && <button onClick={() => setStep(step - 1)}>Previous</button>}
        {step < categories.length - 1 && <button onClick={() => setStep(step + 1)}>Next</button>}
        {step === categories.length - 1 && (
          <button onClick={submitAssessment} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Assessment"}
          </button>
        )}
      </div>

    </div>
  );
}

export default HipaaAssessment;