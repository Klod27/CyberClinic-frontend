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

  const [plan, setPlan] = useState("demo");
  const [isPro, setIsPro] = useState(false);

  // ======================================
  // TOKEN HELPER
  // ======================================

  const getToken = () => {

    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("access_token") ||
      sessionStorage.getItem("token");

    console.log(
      "TOKEN FROM STORAGE:",
      token
    );

    if (
      token &&
      typeof token === "string"
    ) {
      return token
        .replace(/"/g, "")
        .trim();
    }

    return null;
  };

  // ======================================
  // ORG HELPER
  // ======================================

  const getOrgId = () => {

    return (
      localStorage.getItem(
        "organization_id"
      ) ||
      localStorage.getItem(
        "org_id"
      ) ||
      sessionStorage.getItem(
        "organization_id"
      ) ||
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

        console.log(
          "TOKEN:",
          token
        );

        // ======================================
        // AUTH VALIDATION
        // ======================================

        if (!token) {

          console.error(
            "AUTH FAILURE: Missing token"
          );

          setError(
            "Authentication failed. Please login again."
          );

          setLoading(false);

          return;
        }

        // ======================================
        // REQUESTS
        // ======================================

        const [questionRes, subRes] =
          await Promise.all([

            axios.get(
              `${API}/hipaa/questions`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                  "Content-Type":
                    "application/json"
                }
              }
            ),

            axios.get(
              `${API}/subscription/status`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                  "Content-Type":
                    "application/json"
                }
              }
            )

          ]);

        // ======================================
        // DEBUGGING
        // ======================================

        console.log(
          "HIPAA QUESTIONS RESPONSE:",
          questionRes.data
        );

        console.log(
          "RAW SUBSCRIPTION RESPONSE:",
          JSON.stringify(
            subRes.data,
            null,
            2
          )
        );

        // ======================================
        // PLAN
        // ======================================

        const currentPlan =
        subRes?.data?.plan || "demo";

        console.log(
          "FINAL PLAN:",
          currentPlan
        );

        setPlan(currentPlan);

        // ======================================
        // FORCE PRO MODE
        // ======================================

        if (
          currentPlan === "pro" ||
          currentPlan === "enterprise"
        ) {

          console.log(
            "PRO ACCESS ENABLED"
          );

          setIsPro(true);

        } else {

          console.log(
             "DEMO ACCESS ENABLED"
          );

          setIsPro(false);
        }

        // ======================================
        // QUESTIONS
        // ======================================

        const data =
          questionRes.data;

        let q =
          data.questions || [];

        if (!Array.isArray(q)) {

          throw new Error(
            "Invalid questions format"
          );
        }

        q = q.map(item => ({
          id: item.id,
          question:
            item.question,
          category:
            item.category ||
            "General",
          weight:
            item.weight || 5,
          severity:
            item.severity ||
            "Medium",
          hipaa_reference:
            item.hipaa_reference ||
            ""
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

        // ======================================
        // FALLBACK QUESTIONS
        // ======================================

        setQuestions([
          {
            id: "fallback1",
            question:
              "Do you enforce MFA?",
            category:
              "Technical",
            weight: 10
          },
          {
            id: "fallback2",
            question:
              "Do you encrypt PHI?",
            category:
              "Technical",
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

  const visibleQuestions =
    questions;

  const categories = [
    ...new Set(
      visibleQuestions.map(
        q =>
          q.category ||
          "General"
      )
    )
  ];

  const currentCategory =
    categories[step] || "";

  const currentQuestions =
    visibleQuestions.filter(
      q =>
        (q.category ||
          "General") ===
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
          q.category ||
          "General"
      }
    }));
  };

  const answeredCount =
    Object.keys(answers)
      .length;

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
        !Object.keys(answers)
          .length
      ) {

        alert(
          "Please answer at least one question."
        );

        return;
      }

      try {

        setSubmitting(true);

        const token =
          getToken();

        const orgId =
          getOrgId();

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
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json"
              }
            }
          );

        console.log(
          "SUBMIT RESPONSE:",
          submitRes.data
        );

        const reportData =
          submitRes.data
            ?.data ||
          submitRes.data;

        localStorage.setItem(
          "latest_report",
          JSON.stringify(
            reportData
          )
        );

        setResult(
          reportData
        );

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
        Object.values(
          answers
        );

      const noCount =
        values.filter(
          a =>
            a.answer ===
            "No"
        ).length;

      const partialCount =
        values.filter(
          a =>
            a.answer ===
            "Partial"
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

  const getColor = (
    v = 0
  ) => {

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
      <div
        style={{
          padding: 40
        }}
      >
        Loading HIPAA Assessment...
      </div>
    );
  }

  // ======================================
  // MAIN VIEW
  // ======================================

  return (

    <div
      style={{
        padding: 40
      }}
    >

      <h1>
        HIPAA Assessment
      </h1>

      {plan === "demo" && (

        <p
          style={{
            color:
              "#f59e0b"
          }}
        >
          Demo access:
          limited assessment access
        </p>
      )}

      {isPro && (

        <p
          style={{
            color:
              "#22c55e"
          }}
        >
          Pro plan active:
          full assessment unlocked
        </p>
      )}

      {error && (

        <p
          style={{
            color: "red"
          }}
        >
          {error}
        </p>
      )}

      <p>
        Step {step + 1} of{" "}
        {categories.length || 1}
        {" • "}
        {answeredCount} answered
      </p>

      <div
        style={{
          background:
            "#ddd",
          height: 10
        }}
      >

        <div
          style={{
            width:
              `${progress}%`,
            background:
              "#2563eb",
            height: 10
          }}
        />

      </div>

      <h2>
        {currentCategory}
      </h2>

      {currentQuestions.map(
        q => (

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
                  ?.answer ||
                ""
              }
              onChange={e =>
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
        )
      )}

      <div
        style={{
          marginTop: 20
        }}
      >

        {step > 0 && (

          <button
            onClick={() =>
              setStep(
                step - 1
              )
            }
          >
            Previous
          </button>
        )}

        {step <
          categories.length -
            1 && (

          <button
            onClick={() =>
              setStep(
                step + 1
              )
            }
          >
            Next
          </button>
        )}

        {step ===
          categories.length -
            1 && (

          <button
            onClick={
              submitAssessment
            }
            disabled={
              submitting
            }
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