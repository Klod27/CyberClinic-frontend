import axios from "axios";

/*
=====================================
API BASE URL (ENV-BASED)
=====================================
- Local: http://127.0.0.1:8000
- Production: uses Vercel env variable
*/

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: BASE_URL,
});

/*
=====================================
ATTACH AUTH TOKEN AUTOMATICALLY
=====================================
*/

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
=====================================
GLOBAL ERROR HANDLING (OPTIONAL BUT POWERFUL)
=====================================
*/

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("🔒 Unauthorized — logging out");

      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default API;