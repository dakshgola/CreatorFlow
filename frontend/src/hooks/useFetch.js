import { useState, useEffect, useCallback, useRef } from 'react';

// ✅ FIXED: Use env variable consistently across all hooks
//    Local .env:           VITE_API_URL=http://localhost:5000/api
//    Vercel env vars:      VITE_API_URL=https://creatorflow-i5ev.onrender.com/api
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom hook for fetching data from APIs
 *
 * This hook handles loading states, error handling, and data management
 * for API calls. It can be reused across different components that need
 * to fetch data from backend APIs.
 *
 * @param {string} url - The API endpoint URL to fetch data from
 * @param {RequestInit} options - Optional fetch options (method, headers, body, etc.)
 * @param {boolean} immediate - Whether to fetch immediately on mount (default: true)
 *
 * @returns {Object} An object containing:
 *   - data: The fetched data (null initially)
 *   - loading: Boolean indicating if request is in progress
 *   - error: Error object if request failed (null if successful)
 *   - refetch: Function to manually trigger the fetch again
 *
 * @example
 * // Basic usage - fetch on mount
 * const { data, loading, error } = useFetch('/api/clients');
 *
 * @example
 * // With options - POST request
 * const { data, loading, error, refetch } = useFetch('/api/clients', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ name: 'John Doe' }),
 * });
 *
 * @example
 * // Lazy fetch - don't fetch on mount
 * const { data, loading, error, refetch } = useFetch('/api/clients', {}, false);
 * <button onClick={refetch}>Load Clients</button>
 */
const useFetch = (url, options = {}, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Store options in ref to avoid dependency issues
  const optionsRef = useRef(options);

  // Update ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /** ✅ Build full URL — handles both absolute URLs and relative endpoints */
  const buildUrl = (rawUrl) => {
    if (!rawUrl) return null;

    // Already a full URL — use as-is
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }

    // Strip leading /api from endpoint if API_BASE_URL already ends with /api
    // Prevents double /api/api/... URLs
    let cleanUrl = rawUrl;
    if (API_BASE_URL.endsWith('/api') && rawUrl.startsWith('/api')) {
      cleanUrl = rawUrl.replace(/^\/api/, '');
    }

    return `${API_BASE_URL}${cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`}`;
  };

  /**
   * ✅ FIXED: Fetches data with auth token attached automatically
   */
  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Auto-attach Bearer token if present in localStorage
      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      const fullUrl = buildUrl(url);

      const response = await fetch(fullUrl, {
        ...optionsRef.current,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,               // ✅ Token injected here
          ...optionsRef.current.headers,
        },
      });

      if (!response.ok) {
        // ✅ Try to parse error message from backend response
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useFetch;