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

const API =
  process.env.REACT_APP_API_URL ||
  "https://cyberclinic-backend.onrender.com";

function HipaaAssessment() {

  // ======================================
  // STATE
  // ======================================

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);

  const [plan, setPlan] = useState(null);
  const [isPro, setIsPro] = useState(false);

  // ======================================
  // HELPERS
  // ======================================

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      ""
    );
  };

  const getOrgId = () => {
    return (
      localStorage.getItem("organization_id") ||
      localStorage.getItem("org_id") ||
      ""
    );
  };

  // ======================================
  // LOAD QUESTIONS + SUBSCRIPTION
  // ======================================

  useEffect(() => {

    const loadQuestions = async () => {

      try {

        setLoading(true);
        setError(null);

        const token = getToken();

        console.log("TOKEN:", token);

        if (!token) {
          throw new Error("Missing auth token");
        }

        // ======================================
        // LOAD QUESTIONS + SUBSCRIPTION
        // ======================================

        const [questionRes, subRes] = await Promise.all([

          axios.get(
            `${API}/hipaa/questions`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          ),

          axios.get(
            `${API}/subscription/status`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )

        ]);

        console.log(
          "HIPAA QUESTIONS RESPONSE:",
          questionRes.data
        );

        console.log(
          "SUBSCRIPTION STATUS:",
          subRes.data
        );

        // ======================================
        // FORCE SUBSCRIPTION FROM ENDPOINT
        // ======================================

        const currentPlan =
          subRes?.data?.plan || "free";

        console.log(
          "FINAL PLAN:",
          currentPlan
        );

        setPlan(currentPlan);

        const proAccess =
          currentPlan === "pro" ||
          currentPlan === "enterprise";

        setIsPro(proAccess);

        // ======================================
        // QUESTIONS
        // ======================================

        const data = questionRes.data;

        let q = data.questions || [];

        if (!Array.isArray(q)) {
          throw new Error(
            "Invalid questions format"
          );
        }

        q = q.map(item => ({
          id: item.id,
          question: item.question,
          category:
            item.category || "General",
          weight: item.weight || 5,
          severity:
            item.severity || "Medium",
          hipaa_reference:
            item.hipaa_reference || ""
        }));

        setQuestions(q);

      } catch (err) {

        console.error(
          "QUESTION LOAD FAILED:",
          err
        );

        if (err.response) {
          console.error(
            "SERVER RESPONSE:",
            err.response.data
          );
        }

        setError(
          "Authentication or subscription validation failed."
        );

        // FALLBACK QUESTIONS
        setQuestions([
          {
            id: "fallback1",
            question:
              "Do you enforce MFA?",
            category: "Technical",
            weight: 10
          },
          {
            id: "fallback2",
            question:
              "Do you encrypt PHI?",
            category: "Technical",
            weight: 10
          }
        ]);

      } finally {

        setLoading(false);

      }

    };

    loadQuestions();

  }, []);

  // ======================================
  // QUESTIONS
  // ======================================

  const visibleQuestions = questions;

  const categories = [
    ...new Set(
      visibleQuestions.map(
        q => q.category || "General"
      )
    )
  ];

  const currentCategory =
    categories[step] || "";

  const currentQuestions =
    visibleQuestions.filter(
      q =>
        (q.category || "General") ===
        currentCategory
    );

  // ======================================
  // ANSWERS
  // ======================================

  const handleAnswer = (
    id,
    value,
    q
  ) => {

    setAnswers(prev => ({
      ...prev,
      [id]: {
        answer: value,
        weight: q.weight,
        category:
          q.category || "General"
      }
    }));
  };

  const answeredCount =
    Object.keys(answers).length;

  const progress =
    categories.length > 0
      ? Math.round(
          ((step + 1) /
            categories.length) *
            100
        )
      : 0;

  // ======================================
  // SUBMIT
  // ======================================

  const submitAssessment =
    async () => {

      if (
        !Object.keys(answers).length
      ) {
        alert(
          "Please answer at least one question."
        );
        return;
      }

      try {

        setSubmitting(true);

        const token = getToken();

        const orgId = getOrgId();

        console.log(
          "Submitting with org:",
          orgId
        );

        const submitRes =
          await axios.post(
            `${API}/hipaa/submit`,
            {
              org_id: orgId,
              answers
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        console.log(
          "SUBMIT RESPONSE:",
          submitRes.data
        );

        const reportData =
          submitRes.data?.data ||
          submitRes.data;

        localStorage.setItem(
          "latest_report",
          JSON.stringify(reportData)
        );

        setResult(reportData);

      } catch (err) {

        console.error(
          "SUBMIT FAILED:",
          err
        );

        if (err.response) {
          console.error(
            err.response.data
          );
        }

        setError(
          "Assessment submission failed."
        );

      } finally {

        setSubmitting(false);

      }

    };

  // ======================================
  // AI INSIGHTS
  // ======================================

  const generateInsights =
    () => {

      const values =
        Object.values(answers);

      const noCount =
        values.filter(
          a => a.answer === "No"
        ).length;

      const partialCount =
        values.filter(
          a => a.answer === "Partial"
        ).length;

      if (!values.length) {
        return "Complete the assessment to generate AI insights.";
      }

      if (noCount >= 5) {
        return "Significant compliance gaps detected.";
      }

      if (
        noCount >= 2 ||
        partialCount >= 3
      ) {
        return "Moderate compliance risk detected.";
      }

      return "Strong compliance posture detected.";
    };

  const getColor = (v = 0) => {

    if (v >= 85) {
      return "#16a34a";
    }

    if (v >= 60) {
      return "#f59e0b";
    }

    return "#dc2626";
  };

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        Loading HIPAA Assessment...
      </div>
    );
  }

  // ======================================
  // RESULTS VIEW
  // ======================================

  if (result?.category_scores) {

    const chartData =
      Object.entries(
        result.category_scores
      ).map(([k, v]) => ({
        name: k,
        score: v
      }));

    return (

      <div style={{ padding: 40 }}>

        <h1>
          HIPAA Compliance Report
        </h1>

        <h2>
          Score: {result.score}%
        </h2>

        <p>
          <strong>
            Risk Level:
          </strong>{" "}
          {result.risk ||
            result.risk_level}
        </p>

        <div
          style={{
            marginTop: 20,
            padding: 20,
            background: "#111827",
            color: "white",
            borderRadius: 10
          }}
        >
          <h3>AI Insights</h3>

          <p>
            {generateInsights()}
          </p>
        </div>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <BarChart data={chartData}>

            <XAxis dataKey="name" />

            <YAxis
              domain={[0, 100]}
            />

            <Tooltip />

            <Bar dataKey="score">

              {chartData.map(
                (e, i) => (
                  <Cell
                    key={i}
                    fill={getColor(
                      e.score
                    )}
                  />
                )
              )}

            </Bar>

          </BarChart>
        </ResponsiveContainer>

        {!isPro && (

          <div
            style={{
              marginTop: 20,
              padding: 20,
              border:
                "2px dashed #f59e0b",
              borderRadius: 10,
              background: "#1e293b",
              color: "white"
            }}
          >

            <h3>
              Upgrade Required
            </h3>

            <p>
              Upgrade to unlock
              full reports and
              remediation guidance.
            </p>

            <button
              onClick={() =>
                window.location.href =
                  "/pricing"
              }
            >
              Upgrade to Pro
            </button>

          </div>
        )}

        {isPro &&
          result.pdf_url && (

            <button
              onClick={() =>
                window.open(
                  result.pdf_url,
                  "_blank"
                )
              }
            >
              Download Report
            </button>
          )}

      </div>
    );
  }

  // ======================================
  // MAIN VIEW
  // ======================================

  return (

    <div style={{ padding: 40 }}>

      <h1>
        HIPAA Assessment
      </h1>

      {/* PLAN STATUS */}

      {plan === "free" && (
        <p style={{
          color: "#f59e0b"
        }}>
          Free plan: limited assessment access
        </p>
      )}

      {isPro && (
        <p style={{
          color: "#22c55e"
        }}>
          Pro plan active:
          full assessment unlocked
        </p>
      )}

      <p>
        Step {step + 1} of{" "}
        {categories.length || 1}
        {" • "}
        {answeredCount} answered
      </p>

      {/* PROGRESS */}

      <div
        style={{
          background: "#ddd",
          height: 10
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            background: "#2563eb",
            height: 10
          }}
        />
      </div>

      <h2>
        {currentCategory}
      </h2>

      {/* QUESTIONS */}

      {currentQuestions.map(q => (

        <div
          key={q.id}
          style={{
            marginBottom: 12
          }}
        >

          <strong>
            {q.question}
          </strong>

          <br />

          <select
            value={
              answers[q.id]
                ?.answer || ""
            }
            onChange={(e) =>
              handleAnswer(
                q.id,
                e.target.value,
                q
              )
            }
          >

            <option value="">
              Select
            </option>

            <option value="Yes">
              Yes
            </option>

            <option value="Partial">
              Partial
            </option>

            <option value="No">
              No
            </option>

          </select>

        </div>
      ))}

      {/* ERROR */}

      {error && (
        <p style={{
          color: "red"
        }}>
          {error}
        </p>
      )}

      {/* NAVIGATION */}

      <div style={{
        marginTop: 20
      }}>

        {step > 0 && (
          <button
            onClick={() =>
              setStep(step - 1)
            }
          >
            Previous
          </button>
        )}

        {step <
          categories.length - 1 && (
          <button
            onClick={() =>
              setStep(step + 1)
            }
          >
            Next
          </button>
        )}

        {step ===
          categories.length - 1 && (
          <button
            onClick={
              submitAssessment
            }
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Assessment"}
          </button>
        )}

      </div>

    </div>
  );
}

export default HipaaAssessment;