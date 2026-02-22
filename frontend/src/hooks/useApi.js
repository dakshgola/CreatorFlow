import { useState, useCallback, useEffect } from "react";

// ✅ FIXED: Use env variable — NOT hardcoded URL
//    Local .env:           VITE_API_URL=http://localhost:5000/api
//    Vercel env vars:      VITE_API_URL=https://creatorflow-i5ev.onrender.com/api
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Custom API hook
 * - Handles authentication token attach (Bearer)
 * - Handles JSON + text responses
 * - Handles errors properly
 */
const useApi = (endpoint, options = {}) => {
  const {
    method = "GET",
    body = null,
    authRequired = true,
    headers = {},
    immediate = false,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  /** ✅ Get token safely */
  const getToken = () => localStorage.getItem("token");

  /** ✅ Build full URL — avoids double /api prefix */
  const buildUrl = (ep) => {
    if (!ep) return API_BASE_URL;

    // If endpoint is already a full URL, return as-is
    if (ep.startsWith("http://") || ep.startsWith("https://")) return ep;

    // Strip leading /api from endpoint if API_BASE_URL already ends with /api
    // This prevents double /api/api/... URLs
    let cleanEndpoint = ep;
    if (API_BASE_URL.endsWith("/api") && ep.startsWith("/api")) {
      cleanEndpoint = ep.replace(/^\/api/, "");
    }

    return `${API_BASE_URL}${cleanEndpoint.startsWith("/") ? cleanEndpoint : `/${cleanEndpoint}`}`;
  };

  /** ✅ Make request */
  const callApi = useCallback(
    async (override = {}) => {
      const finalEndpoint = override.endpoint || endpoint;
      const finalMethod = (override.method || method).toUpperCase();
      const finalBody = override.body !== undefined ? override.body : body;
      const finalAuth =
        override.authRequired !== undefined ? override.authRequired : authRequired;

      setLoading(true);
      setError(null);

      try {
        const requestHeaders = {
          "Content-Type": "application/json",
          ...headers,
          ...(override.headers || {}),
        };

        // ✅ Auto-add token for protected routes
        if (finalAuth) {
          const token = getToken();
          if (token) requestHeaders.Authorization = `Bearer ${token}`;
        }

        const url = buildUrl(finalEndpoint);
        console.log("🔗 Calling API:", url);

        const res = await fetch(url, {
          method: finalMethod,
          headers: requestHeaders,
          body:
            ["POST", "PUT", "PATCH", "DELETE"].includes(finalMethod) && finalBody
              ? JSON.stringify(finalBody)
              : undefined,
        });

        const contentType = res.headers.get("content-type");
        const responseData = contentType?.includes("application/json")
          ? await res.json()
          : await res.text();

        if (!res.ok) {
          throw new Error(
            responseData?.message ||
              responseData?.error ||
              `HTTP ${res.status}: ${res.statusText}`
          );
        }

        setData(responseData);
        return { success: true, data: responseData };
      } catch (err) {
        const msg = err?.message || "Unknown error";
        setError(msg);
        console.error("❌ API Error:", msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, body, authRequired, headers]
  );

  useEffect(() => {
    if (immediate) callApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { data, error, loading, callApi, reset };
};

export default useApi;