// useApi.js
import { useState, useCallback, useEffect } from "react";

/**
 * ✅ API Base URL - Production Ready
 */
const API_BASE_URL = "https://creatorflow-i5ev.onrender.com";

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

  /** ✅ Build full URL */
  const buildUrl = (ep) => {
    if (!ep) return API_BASE_URL;

    // If endpoint already full URL, return as-is
    if (ep.startsWith("http://") || ep.startsWith("https://")) return ep;

    // Normal endpoint (/api/auth/login etc.)
    return `${API_BASE_URL}${ep.startsWith("/") ? ep : `/${ep}`}`;
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
          credentials: 'include',
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