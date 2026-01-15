import { useState, useCallback, useEffect } from 'react';

// Detect backend URL automatically
const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'http://localhost:5000/api';

/**
 * Custom API hook
 * Handles authentication, error parsing, auto-token attach
 */
const useApi = (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    authRequired = true,
    headers = {},
    immediate = false,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  /** Get stored token safely */
  const getToken = () => localStorage.getItem('token');

  /** Build full URL */
  const buildUrl = (ep) => {
    if (ep.startsWith('http://') || ep.startsWith('https://')) return ep;
    return `${API_BASE_URL}${ep.startsWith('/') ? ep : `/${ep}`}`;
  };

  /** Make request */
  const callApi = useCallback(
    async (override = {}) => {
      const finalEndpoint = override.endpoint || endpoint;
      const finalMethod = override.method || method;
      const finalBody =
        override.body !== undefined ? override.body : body;
      const finalAuth =
        override.authRequired !== undefined
          ? override.authRequired
          : authRequired;

      setLoading(true);
      setError(null);

      try {
        const requestHeaders = {
          'Content-Type': 'application/json',
          ...headers,
          ...override.headers,
        };

        // 👉 Auto-add token for protected routes
        if (finalAuth) {
          const token = getToken();
          if (token) requestHeaders.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(buildUrl(finalEndpoint), {
          method: finalMethod,
          headers: requestHeaders,
          body:
            ['POST', 'PUT', 'PATCH'].includes(
              finalMethod.toUpperCase()
            ) && finalBody
              ? JSON.stringify(finalBody)
              : undefined,
        });

        const contentType = res.headers.get('content-type');
        const responseData =
          contentType?.includes('application/json')
            ? await res.json()
            : await res.text();

        if (!res.ok) {
          throw new Error(
            responseData?.message ||
              responseData?.error ||
              `HTTP error ${res.status}: ${res.statusText}`
          );
        }

        setData(responseData);
        return { success: true, data: responseData };
      } catch (err) {
        setError(err.message || 'Unknown error');
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, body, authRequired, headers]
  );

  useEffect(() => {
    if (immediate) callApi();
  }, []);

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { data, error, loading, callApi, reset };
};

export default useApi;
