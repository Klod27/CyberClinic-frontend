import axios from "axios";

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

console.log("🌐 ENV URL:", ENV_URL);
console.log("🌐 FINAL API BASE URL:", BASE_URL);

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

API.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ← ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    console.error("❌ API Error:", error?.response || error);

    if (status === 401) {
      console.warn("🔒 Unauthorized:", url);

      const isBillingCall = url.includes("/billing/create-checkout-session");

      if (isBillingCall) {
        alert("Please log in again before upgrading.");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      localStorage.removeItem("token");

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup" &&
        window.location.pathname !== "/pricing" &&
        window.location.pathname !== "/hipaa"
      ) {
        window.location.href = "/login";
      }
    }

    if (error.code === "ECONNABORTED") {
      console.warn("⏳ Backend request timed out.");
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const runComplianceScan = () => {
  console.warn("runComplianceScan is deprecated. Use HIPAA assessment flow instead.");
  return Promise.resolve({
    data: {
      status: "deprecated",
      message: "Use /hipaa assessment instead.",
    },
  });
};

export const getSubscriptionStatus = () => {
  return API.get("/subscription/status");
};

export const createCheckoutSession = (mode = "subscription", reportId = null) => {
  let url = `/billing/create-checkout-session?mode=${mode}`;

  if (reportId) {
    url += `&report_id=${reportId}`;
  }

  return API.post(url);
};

export default API;