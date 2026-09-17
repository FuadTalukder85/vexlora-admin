import axios from "axios";

const envApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const API_BASE_URL = envApiUrl.endsWith("/v1")
  ? envApiUrl
  : `${envApiUrl.replace(/\/+$/, "")}/v1`;

export const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:5000/api/auth";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vexlora_admin_token");
    if (token) {
      if (typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        localStorage.removeItem("vexlora_admin_token");
        localStorage.removeItem("vexlora_admin_user");
        if (typeof document !== "undefined") {
          document.cookie = "vexlora_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        }
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
