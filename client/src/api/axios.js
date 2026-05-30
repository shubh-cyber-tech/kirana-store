import axios from "axios";

/* =========================
   API INSTANCE
========================= */

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  withCredentials: true,
});

/* =========================
   REQUEST INTERCEPTOR
========================= */

api.interceptors.request.use(
  (config) => {
    const savedAuth = JSON.parse(
      localStorage.getItem("kiranaAuth") ||
        "null"
    );

    const token =
      savedAuth?.token ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);
