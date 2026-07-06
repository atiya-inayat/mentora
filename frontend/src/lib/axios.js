/**
 * Production-Ready Axios Instance
 *
 * Uses ONLY httpOnly cookie authentication:
 * - No token storage in localStorage/sessionStorage
 * - No Authorization header injection
 * - Uses withCredentials: true for automatic cookie transmission
 *
 * Features:
 * - Automatic token refresh on 401
 * - Request retry after refresh
 * - Logout on refresh failure
 * - Clean error handling
 */

import axios from "axios";

/**
 * Create axios instance with cookie-only auth
 *
 * withCredentials: true - automatically sends cookies with requests
 * This is the ONLY way we transmit authentication
 */
const api = axios.create({
  baseURL: "",
  withCredentials: true, // CRITICAL: Sends httpOnly cookies with requests
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;

// Queue of failed requests waiting for token refresh
let failedQueue = [];

/**
 * Process the queue of failed requests
 * @param {string|null} error - Error from refresh, or null if success
 */
const processQueue = (error = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

/**
 * Request interceptor
 * - No token manipulation - cookies are sent automatically
 * - Could add CSRF token here if needed
 */
api.interceptors.request.use(
  (config) => {
    // No token handling here - cookies are automatic
    // This is by design - we rely entirely on httpOnly cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor
 * Handles:
 * - 401 errors (token expired)
 * - Token refresh flow
 * - Failed refresh -> logout
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/api/auth/login") ||
      originalRequest?.url?.includes("/api/auth/register");

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Check if this is a 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark that we've tried refreshing
      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      // Start refresh process
      isRefreshing = true;

      try {
        // Call refresh endpoint - uses refreshToken cookie automatically
        await api.post("/api/auth/refresh");

        // Refresh successful - process queued requests
        processQueue(null);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear queue and logout
        processQueue(refreshError);

        // Redirect to login if in browser
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Not a 401 or already retried - return error
    return Promise.reject(error);
  },
);

export default api;
