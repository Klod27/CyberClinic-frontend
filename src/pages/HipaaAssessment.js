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

  const plan = localStorage.getItem("plan") || "free";
  const isPro = plan === "pro";
  const FREE_LIMIT = 10;

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await axios.get(`${API}/hipaa/questions`);
        let q = res.data?.questions || res.data;

        if (!Array.isArray(q)) throw new Error("Invalid question format");

        q = q.map(item => ({
          id: item.id,
          question: item.question,
          category: item.category || "General",
          weight: item.weight || 5,
          severity: item.severity || "Medium",
          hipaa_reference: item.hipaa_reference || ""
        }));

        setQuestions(q);
      } catch (err) {
        console.error("Question load failed:", err);
        setError("Could not load full assessment questions. Showing fallback questions.");

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

  const visibleQuestions = isPro
    ? questions
    : questions.slice(0, FREE_LIMIT);

  const categories = [...new Set(visibleQuestions.map(q => q.category || "General"))];

  const currentCategory = categories[step] || "";
  const currentQuestions = visibleQuestions.filter(
    q => (q.category || "General") === currentCategory
  );

  const handleAnswer = (id, value, q) => {
    setAnswers(prev => ({
      ...prev,
      [id]: {
        answer: value,
        weight: q.weight,
        category: q.category || "General"
      }
    }));
  };

  const answeredCount = Object.keys(answers).length;

  const progress = categories.length
    ? Math.round(((step + 1) / categories.length) * 100)
    : 0;

  const upgradeToPro = async () => {
    try {
      setError(null);

      const res = await axios.post(
        `${API}/billing/create-checkout-session?mode=subscription`
      );

      if (!res.data?.url) throw new Error("Missing Stripe checkout URL");

      window.location.href = res.data.url;
    } catch (err) {
      console.error("Upgrade failed:", err);
      setError("Upgrade failed. Please try again.");
    }
  };

  const submitAssessment = async () => {
    if (!Object.keys(answers).length) {
      alert("Please answer at least one question.");
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

      const reportData = submitRes.data?.data || submitRes.data;

      localStorage.setItem("latest_report", JSON.stringify(reportData));
      setResult(reportData);
    } catch (err) {
      console.error("Submission failed:", err);
      setError("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const generateInsights = () => {
    const values = Object.values(answers);
    const noCount = values.filter(a => a.answer === "No").length;
    const partialCount = values.filter(a => a.answer === "Partial").length;

    if (!values.length) {
      return "Complete the assessment to generate AI insights.";
    }

    if (noCount >= 5) {
      return "Significant compliance gaps detected. Prioritize administrative safeguards, access controls, and documented remediation.";
    }

    if (noCount >= 2 || partialCount >= 3) {
      return "Moderate compliance risk detected. Focus on incomplete safeguards and document corrective action.";
    }

    return "Strong initial compliance posture. Continue monitoring and periodic reassessment.";
  };

  const getColor = (v = 0) => {
    if (v >= 85) return "#16a34a";
    if (v >= 60) return "#f59e0b";
    return "#dc2626";
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  if (result?.category_scores) {
    const chartData = Object.entries(result.category_scores)
      .map(([k, v]) => ({ name: k, score: v }));

    return (
      <div style={{ padding: 40 }}>
        <h1>HIPAA Compliance Report</h1>
        <h2>Score: {result.score}%</h2>
        <p><strong>Risk Level:</strong> {result.risk || result.risk_level}</p>

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

        {!isPro && (
          <div style={{
            marginTop: 20,
            padding: 20,
            border: "2px dashed #f59e0b",
            borderRadius: 10,
            background: "#1e293b",
            color: "white"
          }}>
            <h3>Upgrade Required</h3>
            <p>
              Unlock the full HIPAA assessment, detailed remediation guidance,
              PDF reports, and audit-ready documentation.
            </p>

            <button onClick={upgradeToPro}>
              Upgrade to Pro
            </button>
          </div>
        )}

        {isPro && result.pdf_url && (
          <button onClick={() => window.open(result.pdf_url, "_blank")}>
            Download Report
          </button>
        )}

        <div style={{ marginTop: 20 }}>
          <button onClick={() => window.location.href = "/dashboard"}>
            Go to Dashboard
          </button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => {
              setResult(null);
              setAnswers({});
              setStep(0);
            }}
          >
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>HIPAA Assessment</h1>

      {!isPro && (
        <p style={{ color: "#f59e0b" }}>
          Free plan: limited to {FREE_LIMIT} questions
        </p>
      )}

      <p>
        Step {step + 1} of {categories.length || 1} • {answeredCount} answered
      </p>

      <div style={{ background: "#ddd", height: 10 }}>
        <div style={{
          width: `${progress}%`,
          background: "#2563eb",
          height: 10
        }} />
      </div>

      <h2>{currentCategory}</h2>

      {currentQuestions.map(q => (
        <div key={q.id} style={{ marginBottom: 12 }}>
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
        {step > 0 && (
          <button onClick={() => setStep(step - 1)}>
            Previous
          </button>
        )}

        {step < categories.length - 1 && (
          <button onClick={() => setStep(step + 1)}>
            Next
          </button>
        )}

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