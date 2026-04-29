import React, { useEffect, useState } from "react";
import API from "../api";

function OrganizationSelector() {

  const [orgs, setOrgs] = useState([]);
  const [newOrg, setNewOrg] = useState("");

  const loadOrgs = async () => {
    const res = await API.get("/org/list");
    setOrgs(res.data);
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const createOrg = async () => {
    await API.post(`/org/create?name=${newOrg}`);
    setNewOrg("");
    loadOrgs();
  };

  const switchOrg = async (id) => {
    await API.post(`/org/switch?org_id=${id}`);
    window.location.reload();
  };

  return (
    <div style={{ marginBottom: 20 }}>

      <h3>🏥 Clinics</h3>

      {orgs.map(o => (
        <div key={o.id} style={{ marginBottom: 5 }}>
          {o.name}
          <button onClick={() => switchOrg(o.id)} style={{ marginLeft: 10 }}>
            Switch
          </button>
        </div>
      ))}

      <hr />

      <input
        placeholder="New clinic name"
        value={newOrg}
        onChange={e => setNewOrg(e.target.value)}
      />

      <button onClick={createOrg} style={{ marginLeft: 10 }}>
        Create Clinic
      </button>

    </div>
  );
}

export default OrganizationSelector;