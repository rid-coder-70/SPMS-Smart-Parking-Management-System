import axios from "axios";
export const TOKEN_KEY = "spms_token";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 1e4
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage = error.response?.data?.message;
    const httpStatus = error.response?.status;
    return Promise.reject({
      status: httpStatus,
      message: backendMessage ?? error.message ?? "An unexpected error occurred",
      raw: error
    });
  }
);
export default api;
