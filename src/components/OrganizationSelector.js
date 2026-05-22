import React, { useEffect, useState } from "react";
import API from "../api";

function OrganizationSelector({ currentOrg, setCurrentOrg }) {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==================================
  // LOAD ORGANIZATIONS
  // ==================================
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setLoading(true);

        const res = await API.get("/org/list");

        const data = Array.isArray(res.data)
          ? res.data
          : [];

        setOrgs(data);

        // ==============================
        // LOAD SAVED ORG
        // ==============================
        const savedOrgId =
          localStorage.getItem("org_id");

        if (savedOrgId) {
          const found = data.find(
            (o) =>
              String(o.id) ===
              String(savedOrgId)
          );

          if (found) {
            setCurrentOrg(found);
            return;
          }
        }

        // ==============================
        // DEFAULT FIRST ORG
        // ==============================
        if (
          data.length > 0 &&
          !currentOrg
        ) {
          setCurrentOrg(data[0]);

          localStorage.setItem(
            "org_id",
            data[0].id
          );
        }
      } catch (err) {
        console.error(
          "Error loading organizations:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();

    // ==================================
    // ESLINT FIX FOR VERCEL BUILD
    // ==================================

  }, [currentOrg, setCurrentOrg]);

  // ==================================
  // SWITCH ORGANIZATION
  // ==================================
  const handleSwitch = async (orgId) => {
    try {
      // SAVE LOCALLY
      localStorage.setItem(
        "org_id",
        orgId
      );

      // OPTIONAL BACKEND SWITCH
      await API.post(
        `/org/switch?org_id=${orgId}`
      );

      const selected = orgs.find(
        (o) =>
          String(o.id) ===
          String(orgId)
      );

      setCurrentOrg(selected);

      // CLEAR OLD REPORTS
      localStorage.removeItem(
        "latest_report"
      );

    } catch (err) {
      console.error(
        "Error switching organization:",
        err
      );

      alert(
        "Failed to switch organization"
      );
    }
  };

  // ==================================
  // LOADING
  // ==================================
  if (loading) {
    return (
      <div
        style={{
          color: "#94a3b8",
          fontSize: 12
        }}
      >
        Loading clinics...
      </div>
    );
  }

  // ==================================
  // UI
  // ==================================
  return (
    <div
      style={{
        background: "#1e293b",
        padding: "10px 15px",
        borderRadius: 10,
        border: "1px solid #334155",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.3)"
      }}
    >
      <label
        style={{
          color: "#94a3b8",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1
        }}
      >
        Organization
      </label>

      <select
        value={currentOrg?.id || ""}
        onChange={(e) =>
          handleSwitch(e.target.value)
        }
        style={{
          marginTop: 6,
          width: "100%",
          padding: "10px",
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#0f172a",
          color: "#e2e8f0",
          fontSize: 14,
          cursor: "pointer",
          outline: "none"
        }}
      >
        {orgs.map((org) => (
          <option
            key={org.id}
            value={org.id}
          >
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default OrganizationSelector;