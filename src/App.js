function Dashboard() {
  const nav = useNavigate();

  const [currentOrg, setCurrentOrg] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const [report, setReport] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState(null);

  const plan = subscription?.plan || localStorage.getItem("plan") || "free";

  useEffect(() => {
    const load = async () => {
      try {
        const orgRes = await API.get("/org/list").catch(() => ({ data: [] }));
        const subRes = await API.get("/subscription/status").catch(() => ({ data: null }));

        setCurrentOrg(orgRes.data?.[0] || null);
        setSubscription(subRes.data || null);

        const saved = localStorage.getItem("latest_report");
        if (saved) {
          try {
            setReport(JSON.parse(saved));
          } catch {
            localStorage.removeItem("latest_report");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const refreshLatestReport = () => {
    setScanLoading(true);
    setError(null);

    try {
      const saved = localStorage.getItem("latest_report");

      if (!saved) {
        setReport(null);
        setError("No completed assessment found. Please start the HIPAA assessment first.");
        return;
      }

      setReport(JSON.parse(saved));
    } catch (err) {
      console.error(err);
      setError("Could not load latest report.");
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) return <div style={{ color: "white" }}>Loading dashboard...</div>;

  return (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: 30, color: COLORS.text }}>
        <div style={{ marginBottom: 20 }}>
          <h1>Compliance Dashboard</h1>
          <p style={{ color: COLORS.sub }}>
            Monitor HIPAA compliance, risk exposure, and audit readiness.
          </p>
        </div>

        <OrganizationSelector
          currentOrg={currentOrg}
          setCurrentOrg={setCurrentOrg}
        />

        <div style={{
          ...card,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h3>Start HIPAA Assessment</h3>
            <p style={{ color: COLORS.sub }}>
              Complete the guided HIPAA assessment to generate compliance insights.
            </p>
          </div>

          <button
            onClick={() => nav("/hipaa")}
            style={{
              background: COLORS.blue,
              color: "white",
              padding: "12px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Start Assessment
          </button>
        </div>

        <div style={{
          ...card,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h3>Latest Assessment Report</h3>
            <p style={{ color: COLORS.sub }}>
              Refresh the dashboard using the most recent completed assessment.
            </p>
          </div>

          <button
            onClick={refreshLatestReport}
            disabled={scanLoading}
            style={{
              background: COLORS.blue,
              color: "white",
              padding: "12px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {scanLoading ? "Loading..." : "Refresh Report"}
          </button>
        </div>

        {error && <p style={{ color: COLORS.red }}>{error}</p>}

        {!report && !scanLoading && (
          <div style={card}>
            <h3>No Reports Yet</h3>
            <p style={{ color: COLORS.sub }}>
              Start your first HIPAA assessment to generate insights.
            </p>
          </div>
        )}

        {report && (
          <>
            <KPIDashboard orgId={currentOrg?.id} data={report} />
            <ExecutivePanel data={report} />

            <div style={card}>
              <h3>Report Access</h3>

              {plan === "pro" && report.pdf_url ? (
                <button onClick={() => window.open(report.pdf_url, "_blank")}>
                  Download PDF
                </button>
              ) : (
                <p style={{ color: COLORS.sub }}>
                  PDF reports are available for Pro subscribers.
                </p>
              )}
            </div>
          </>
        )}

        <div style={card}>
          <h3>Subscription</h3>
          <p>{subscription?.plan || "Free Plan"}</p>
        </div>

        <div style={card}>
          <button onClick={() => nav("/hipaa")}>
            Start Manual Assessment
          </button>
        </div>

        <div style={card}>
          <TeamManagement />
        </div>
      </div>
    </div>
  );
}