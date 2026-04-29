import React, { useEffect, useState } from "react";
import API from "../api";

function OrganizationSelector({ currentOrg, setCurrentOrg }) {

  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------
  // LOAD ORGANIZATIONS
  // ----------------------------------
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await API.get("/org/list");
        setOrgs(res.data);

        // Set default org if none selected
        if (res.data.length > 0 && !currentOrg) {
          setCurrentOrg(res.data[0]);
        }

      } catch (err) {
        console.error("Error loading organizations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, []);

  // ----------------------------------
  // SWITCH ORGANIZATION
  // ----------------------------------
  const handleSwitch = async (orgId) => {
    try {
      await API.post(`/org/switch?org_id=${orgId}`);

      const selected = orgs.find(o => o.id === orgId);
      setCurrentOrg(selected);

      // Refresh app state (simple approach)
      window.location.reload();

    } catch (err) {
      console.error("Error switching organization:", err);
      alert("Failed to switch organization");
    }
  };

  // ----------------------------------
  // UI
  // ----------------------------------
  if (loading) {
    return (
      <div style={{
        color: "#94a3b8",
        fontSize: 12
      }}>
        Loading clinics...
      </div>
    );
  }

  return (
    <div style={{
      background: "#1e293b",
      padding: "10px 15px",
      borderRadius: 10,
      border: "1px solid #334155",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
    }}>

      <label style={{
        color: "#94a3b8",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 1
      }}>
        Organization
      </label>

      <select
        value={currentOrg?.id || ""}
        onChange={(e) => handleSwitch(parseInt(e.target.value))}
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
        {orgs.map(org => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>

    </div>
  );
}

export default OrganizationSelector;