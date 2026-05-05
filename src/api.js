import axios from "axios";

/*
=====================================
🔥 BULLETPROOF BASE URL RESOLUTION
=====================================
*/

const ENV_URL = process.env.REACT_APP_API_URL?.trim();

const isProduction =
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";

const BASE_URL =
  ENV_URL && ENV_URL.startsWith("http")
    ? ENV_URL
    : isProduction
    ? "https://cyberclinic-backend.onrender.com"
    : "http://127.0.0.1:8000";

/*
=====================================
DEBUG
=====================================
*/
console.log("🌐 ENV URL:", ENV_URL);
console.log("🌐 FINAL API BASE URL:", BASE_URL);

/*
=====================================
AXIOS INSTANCE
=====================================
*/

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
=====================================
REQUEST INTERCEPTOR
=====================================
*/

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `📡 ${config.method?.toUpperCase()} → ${config.baseURL}${config.url}`
    );

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

/*
=====================================
RESPONSE INTERCEPTOR
=====================================
*/

API.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ← ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("🔒 Unauthorized — logging out");

      localStorage.removeItem("token");

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    if (error.code === "ECONNABORTED") {
      alert("⏳ Server is waking up. Try again in a few seconds.");
    }

    if (!error.response) {
      alert("🌐 Network error. Backend unreachable.");
    }

    console.error("❌ API Error:", error?.response || error);

    return Promise.reject(error);
  }
);

/*
=====================================
HELPERS
=====================================
*/

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

/*
=====================================
API FUNCTIONS
=====================================
*/

// ✅ FIXED (this was broken)
export const runComplianceScan = () => {
  return API.post("/automation/run");
};

// ✅ CLEAN + SAFE
export const getSubscriptionStatus = () => {
  return API.get("/subscription/status");
};

// ✅ CLEAN + SAFE
export const createCheckoutSession = (mode = "subscription", reportId = null) => {
  let url = `/billing/create-checkout-session?mode=${mode}`;

  if (reportId) {
    url += `&report_id=${reportId}`;
  }

  return API.post(url);
};

export default API;