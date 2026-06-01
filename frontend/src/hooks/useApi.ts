import { useState, useCallback, useEffect } from "react";

// ✅ FIXED: Use env variable — NOT hardcoded URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export interface UseApiOptions {
  method?: string;
  body?: any;
  authRequired?: boolean;
  headers?: Record<string, string>;
  immediate?: boolean;
}

export interface UseApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  callApi: (override?: {
    endpoint?: string;
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }) => Promise<{ success: boolean; data?: T; error?: string }>;
  reset: () => void;
}

/**
 * Custom API hook (TypeScript version)
 * - Handles authentication cookie attach (credentials: include)
 * - Handles JSON + text responses
 * - Handles errors properly
 */
const useApi = <T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiResponse<T> => {
  const {
    method = "GET",
    body = null,
    headers = {},
    immediate = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  /** ✅ Build full URL — handles stripping API/API_v1 prefixes to prevent double paths */
  const buildUrl = (ep: string): string => {
    if (!ep) return API_BASE_URL;

    // If endpoint is already a full URL, return as-is
    if (ep.startsWith("http://") || ep.startsWith("https://")) return ep;

    // Strip leading /api/v1 or /api from endpoint so it appends nicely to API_BASE_URL
    let cleanEndpoint = ep;
    if (ep.startsWith("/api/v1")) {
      cleanEndpoint = ep.replace(/^\/api\/v1/, "");
    } else if (ep.startsWith("/api")) {
      cleanEndpoint = ep.replace(/^\/api/, "");
    }

    return `${API_BASE_URL}${cleanEndpoint.startsWith("/") ? cleanEndpoint : `/${cleanEndpoint}`}`;
  };

  /** ✅ Make request */
  const callApi = useCallback(
    async (
      override: {
        endpoint?: string;
        method?: string;
        body?: any;
        headers?: Record<string, string>;
      } = {}
    ): Promise<{ success: boolean; data?: T; error?: string }> => {
      const finalEndpoint = override.endpoint || endpoint;
      const finalMethod = (override.method || method).toUpperCase();
      const finalBody = override.body !== undefined ? override.body : body;

      setLoading(true);
      setError(null);

      try {
        const requestHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          ...headers,
          ...(override.headers || {}),
        };

        const url = buildUrl(finalEndpoint);
        console.log("🔗 Calling API:", url);

        // credentials: "include" sends httpOnly cookies automatically for request validation
        const res = await fetch(url, {
          method: finalMethod,
          headers: requestHeaders,
          credentials: "include",
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

        setData(responseData as T);
        return { success: true, data: responseData as T };
      } catch (err: any) {
        const msg = err?.message || "Unknown error";
        setError(msg);
        console.error("❌ API Error:", msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, body, headers]
  );

  useEffect(() => {
    if (immediate) callApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = (): void => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { data, error, loading, callApi, reset };
};

export default useApi;
