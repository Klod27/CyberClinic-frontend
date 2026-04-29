import React, { useState, useEffect } from "react";
import API from "../api";

const COLORS = {
  bg: "#0f172a",
  card: "#111827",
  border: "#334155",
  text: "#e2e8f0",
  sub: "#94a3b8",
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444"
};

function TeamManagement() {

  const [team, setTeam] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // LOAD TEAM
  // -------------------------------
  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await API.get("/team");
      setTeam(res.data);
    } catch (err) {
      console.log("Error loading team", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  // -------------------------------
  // INVITE USER
  // -------------------------------
  const invite = async () => {
    if (!email) return;

    try {
      await API.post("/team/invite", null, {
        params: { email, role: "staff" }
      });
      setEmail("");
      loadTeam();
    } catch {
      alert("Invite failed (admin only)");
    }
  };

  // -------------------------------
  // PROMOTE USER
  // -------------------------------
  const promote = async (id) => {
    try {
      await API.post("/team/role", null, {
        params: { user_id: id, role: "admin" }
      });
      loadTeam();
    } catch {
      alert("Permission denied");
    }
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: COLORS.text }}>
          Team Management
        </h3>
        <p style={{ color: COLORS.sub }}>
          Manage users, roles, and access control
        </p>
      </div>

      {/* INVITE PANEL */}
      <div style={{
        background: COLORS.card,
        padding: 16,
        borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
        marginBottom: 20,
        display: "flex",
        alignItems: "center"
      }}>

        <input
          placeholder="Invite team member by email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: `1px solid ${COLORS.border}`,
            background: "#020617",
            color: COLORS.text,
            marginRight: 10
          }}
        />

        <button
          onClick={invite}
          style={{
            padding: "10px 16px",
            background: COLORS.blue,
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Invite
        </button>

      </div>

      {/* TEAM GRID */}
      {loading ? (
        <p style={{ color: COLORS.sub }}>Loading team...</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 15
        }}>

          {team.map(member => (

            <div key={member.id} style={{
              background: COLORS.card,
              padding: 16,
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              transition: "0.2s"
            }}>

              {/* EMAIL */}
              <div style={{
                color: COLORS.text,
                fontWeight: "bold",
                marginBottom: 6
              }}>
                {member.email}
              </div>

              {/* ROLE BADGE */}
              <div style={{
                display: "inline-block",
                padding: "4px 8px",
                borderRadius: 6,
                fontSize: 12,
                marginBottom: 10,
                background:
                  member.role === "admin"
                    ? COLORS.green
                    : "#475569",
                color: "white"
              }}>
                {member.role.toUpperCase()}
              </div>

              {/* ACTION */}
              {member.role !== "admin" && (
                <button
                  onClick={() => promote(member.id)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: COLORS.green,
                    border: "none",
                    color: "white",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  Promote to Admin
                </button>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default TeamManagement;