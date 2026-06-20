import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from './types';

export const TOKEN_KEY = 'spms_token';

/**
 * Axios instance for all SPMS API calls.
 * baseURL points to the Spring Boot context path.
 * Request interceptor attaches the JWT from localStorage when present.
 */
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ── Request interceptor — attach Bearer token ─────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — normalise error shape ──────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Re-throw with a user-friendly message extracted from the backend envelope
    const backendMessage = error.response?.data?.message;
    const httpStatus     = error.response?.status;

    // Build a richer error so consumers can check status codes directly
    return Promise.reject({
      status:  httpStatus,
      message: backendMessage ?? error.message ?? 'An unexpected error occurred',
      raw:     error,
    });
  }
);

export default api;
