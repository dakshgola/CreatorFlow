import { useState, useEffect, useCallback, useRef } from 'react';

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
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({ name: 'John Doe' }),
 * });
 * 
 * @example
 * // Lazy fetch - don't fetch on mount
 * const { data, loading, error, refetch } = useFetch('/api/clients', {}, false);
 * 
 * // Later, trigger fetch manually
 * <button onClick={refetch}>Load Clients</button>
 * 
 * @example
 * // Conditional rendering based on state
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <div>{data && data.map(item => <div key={item.id}>{item.name}</div>)}</div>;
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

  /**
   * Fetches data from the provided URL
   * This function is memoized with useCallback to prevent unnecessary re-renders
   */
  const fetchData = useCallback(async () => {
    // Don't fetch if URL is empty or null
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...optionsRef.current,
        headers: {
          'Content-Type': 'application/json',
          ...optionsRef.current.headers,
        },
      });

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse JSON response
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      // Handle fetch errors
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [url]); // Only depend on URL, options are accessed via ref

  /**
   * Effect hook that runs when component mounts or dependencies change
   * Only fetches if immediate is true
   */
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  /**
   * Manual refetch function
   * Can be called to trigger a new fetch, useful for:
   * - Refresh buttons
   * - Retry after error
   * - Lazy loading scenarios
   */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useFetch;
