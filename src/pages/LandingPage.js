import React from "react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  bg: "#0f172a",
  text: "#e2e8f0",
  sub: "#94a3b8",
  blue: "#3b82f6",
  green: "#22c55e",
  border: "#334155"
};

function LandingPage() {

  const nav = useNavigate();

  return (
    <div style={{
      background: COLORS.bg,
      color: COLORS.text,
      minHeight: "100vh",
      padding: 40,
      fontFamily: "Arial, sans-serif"
    }}>

      {/* NAVBAR */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 40
      }}>
        <h2>CyberClinic</h2>

        <div>
          <button onClick={() => nav("/pricing")}
            style={{ marginRight: 10 }}>
            Pricing
          </button>

          <button onClick={() => nav("/login")}>
            Login
          </button>
        </div>
      </div>

      {/* HERO */}
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h1 style={{ fontSize: 48, fontWeight: "bold" }}>
          AI-Powered Healthcare Compliance
        </h1>

        <p style={{
          color: COLORS.sub,
          fontSize: 20,
          marginTop: 15
        }}>
          HIPAA compliance automation for hospitals, clinics,
          and multi-site healthcare organizations
        </p>

        <p style={{
          color: COLORS.sub,
          marginTop: 10
        }}>
          Detect risk. Prove compliance. Generate audit-ready reports in minutes.
        </p>

        <div style={{ marginTop: 30 }}>
          <button
            onClick={() => nav("/signup")}
            style={{
              padding: "14px 24px",
              background: COLORS.blue,
              border: "none",
              color: "white",
              borderRadius: 8,
              marginRight: 10,
              fontSize: 16
            }}
          >
            Start Free Trial
          </button>

          <button
            onClick={() => nav("/pricing")}
            style={{
              padding: "14px 24px",
              background: "transparent",
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              borderRadius: 8
            }}
          >
            View Pricing
          </button>
        </div>

        <p style={{
          marginTop: 10,
          color: COLORS.sub,
          fontSize: 14
        }}>
          HIPAA-ready • Secure • Audit-compliant
        </p>
      </div>

      {/* FEATURES */}
      <div style={{
        marginTop: 100,
        textAlign: "center"
      }}>
        <h2>Platform Capabilities</h2>

        <div style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 40,
          flexWrap: "wrap"
        }}>

          <div style={{ margin: 20, width: 260 }}>
            <h4>Compliance Scoring</h4>
            <p style={{ color: COLORS.sub }}>
              Real-time HIPAA risk analysis with executive-level scoring dashboards
            </p>
          </div>

          <div style={{ margin: 20, width: 260 }}>
            <h4>AI Recommendations</h4>
            <p style={{ color: COLORS.sub }}>
              Intelligent compliance insights powered by advanced AI models
            </p>
          </div>

          <div style={{ margin: 20, width: 260 }}>
            <h4>Audit Reports</h4>
            <p style={{ color: COLORS.sub }}>
              Downloadable, audit-ready reports for regulators and stakeholders
            </p>
          </div>

        </div>
      </div>

      {/* VALUE PROPOSITION */}
      <div style={{
        marginTop: 100,
        textAlign: "center"
      }}>
        <h2>Why CyberClinic</h2>

        <div style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 40,
          flexWrap: "wrap"
        }}>

          <div style={{ margin: 20, width: 260 }}>
            <h4>Reduce Risk</h4>
            <p style={{ color: COLORS.sub }}>
              Identify vulnerabilities before they become compliance violations
            </p>
          </div>

          <div style={{ margin: 20, width: 260 }}>
            <h4>Save Time</h4>
            <p style={{ color: COLORS.sub }}>
              Automate compliance workflows that normally take weeks
            </p>
          </div>

          <div style={{ margin: 20, width: 260 }}>
            <h4>Stay Audit-Ready</h4>
            <p style={{ color: COLORS.sub }}>
              Always prepared with real-time compliance documentation
            </p>
          </div>

        </div>
      </div>

      {/* TRUST SECTION */}
      <div style={{
        marginTop: 100,
        textAlign: "center"
      }}>
        <h2>Built for Healthcare Compliance Leaders</h2>

        <p style={{ color: COLORS.sub }}>
          Designed for CIOs, compliance officers, healthcare administrators, and security teams
        </p>

        <div style={{ marginTop: 20 }}>
          <span style={{ margin: 10 }}>HIPAA Ready</span>
          <span style={{ margin: 10 }}>Enterprise Secure</span>
          <span style={{ margin: 10 }}>Audit Friendly</span>
          <span style={{ margin: 10 }}>Scalable</span>
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{
        marginTop: 120,
        textAlign: "center"
      }}>
        <h2>Start Your Compliance Transformation Today</h2>

        <button
          onClick={() => nav("/signup")}
          style={{
            marginTop: 20,
            padding: "16px 28px",
            background: COLORS.green,
            border: "none",
            color: "white",
            borderRadius: 8,
            fontSize: 18
          }}
        >
          Create Your Account
        </button>
      </div>

    </div>
  );
}

export default LandingPage;