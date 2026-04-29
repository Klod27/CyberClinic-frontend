import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function Signup() {

  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [agree, setAgree] = useState(false);

  const signup = async () => {
    if (!agree) {
      return alert("You must accept terms");
    }

    try {
      // 1. Create Organization
      const orgRes = await API.post(`/org/create?name=${orgName}`);
      const org_id = orgRes.data.org_id;

      // 2. Create Admin User
      await API.post("/auth/signup", {
        email,
        password,
        organization_id: org_id
      });

      alert("Account created. Please login.");
      nav("/login");

    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div style={{ padding: 40 }}>

      <h2>Create Your CyberClinic Account</h2>

      <input placeholder="Organization Name"
        onChange={e => setOrgName(e.target.value)} />

      <br /><br />

      <input placeholder="Email"
        onChange={e => setEmail(e.target.value)} />

      <br /><br />

      <input type="password" placeholder="Password"
        onChange={e => setPassword(e.target.value)} />

      <br /><br />

      <label>
        <input type="checkbox"
          onChange={e => setAgree(e.target.checked)} />
        I agree to Terms & HIPAA Compliance Use
      </label>

      <br /><br />

      <button onClick={signup}>
        Create Account
      </button>

    </div>
  );
}

export default Signup;