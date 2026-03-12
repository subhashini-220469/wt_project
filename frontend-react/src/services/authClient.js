/**
 * authClient.js
 *
 * Axios instance that automatically:
 *  1. Attaches the Bearer accessToken from localStorage to every request
 *  2. On 401 response → calls POST /api/auth/refresh-token to get a new token
 *  3. Retries the original request once with the new token
 *  4. If refresh also fails → clears storage and redirects to /auth
 */
import axios from "axios";

const AUTH_BASE = "http://localhost:5000";

const authClient = axios.create({
  baseURL: AUTH_BASE,
  withCredentials: true, // send httpOnly refresh-token cookie automatically
});

// ── Request interceptor: attach access token ──────────────────────────────
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Flag to prevent infinite refresh loops ────────────────────────────────
let isRefreshing = false;
let failedQueue = []; // pending requests waiting for a new token

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Response interceptor: handle 401 → refresh → retry ───────────────────
authClient.interceptors.response.use(
  (response) => response, // pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 and never retry the refresh call itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/api/auth/refresh-token")
    ) {
      if (isRefreshing) {
        // Queue up requests that came in while a refresh is already in flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${AUTH_BASE}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        localStorage.setItem("accessToken", newToken);
        authClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return authClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — force logout
        localStorage.removeItem("accessToken");
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default authClient;
