import { useState, useCallback, useEffect } from 'react';

// Base API URL - adjust if your backend is on a different port
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Custom hook for making API calls
 * 
 * @param {string} endpoint - API endpoint (e.g., '/clients' or '/auth/login')
 * @param {Object} options - Configuration options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, etc.) - default: 'GET'
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {boolean} options.authRequired - Whether to include Authorization header - default: true
 * @param {Object} options.headers - Additional headers to include
 * @param {boolean} options.immediate - Whether to call API immediately on mount - default: false
 * 
 * @returns {Object} { data, loading, error, callApi, reset }
 *   - data: Response data from API
 *   - loading: Boolean indicating if request is in progress
 *   - error: Error message if request failed
 *   - callApi: Function to trigger the API call (can be called with new options)
 *   - reset: Function to reset data, loading, and error states
 * 
 * @example
 * // Basic usage - manual trigger
 * const { data, loading, error, callApi } = useApi('/clients');
 * 
 * useEffect(() => {
 *   callApi();
 * }, []);
 * 
 * @example
 * // Immediate call on mount
 * const { data, loading, error } = useApi('/clients', { immediate: true });
 * 
 * @example
 * // POST request with body
 * const { data, loading, error, callApi } = useApi('/clients', {
 *   method: 'POST',
 *   body: { name: 'New Client', niche: 'Tech' }
 * });
 * 
 * const handleSubmit = () => {
 *   callApi();
 * };
 * 
 * @example
 * // Public endpoint (no auth)
 * const { data, loading, error, callApi } = useApi('/auth/login', {
 *   method: 'POST',
 *   authRequired: false
 * });
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

  /**
   * Get authorization token from localStorage
   */
  const getToken = () => {
    return localStorage.getItem('token');
  };

  /**
   * Build full URL from endpoint
   */
  const buildUrl = (url) => {
    // If endpoint is already a full URL, use it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Otherwise, prepend API base URL
    const cleanEndpoint = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${cleanEndpoint}`;
  };

  /**
   * Make API call
   * @param {Object} overrideOptions - Options to override default ones
   */
  const callApi = useCallback(async (overrideOptions = {}) => {
    // Merge default options with override options
    const finalMethod = overrideOptions.method || method;
    const finalBody = overrideOptions.body !== undefined ? overrideOptions.body : body;
    const finalAuthRequired = overrideOptions.authRequired !== undefined 
      ? overrideOptions.authRequired 
      : authRequired;
    const finalHeaders = { ...headers, ...overrideOptions.headers };
    const finalEndpoint = overrideOptions.endpoint || endpoint;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Build request headers
      const requestHeaders = {
        'Content-Type': 'application/json',
        ...finalHeaders,
      };

      // Add Authorization header if auth is required and token exists
      if (finalAuthRequired) {
        const token = getToken();
        if (token) {
          requestHeaders['Authorization'] = `Bearer ${token}`;
        }
      }

      // Build request options
      const requestOptions = {
        method: finalMethod,
        headers: requestHeaders,
      };

      // Add body for methods that support it
      if (finalBody && ['POST', 'PUT', 'PATCH'].includes(finalMethod.toUpperCase())) {
        requestOptions.body = JSON.stringify(finalBody);
      }

      // Make the API call
      const url = buildUrl(finalEndpoint);
      const response = await fetch(url, requestOptions);

      // Parse response
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        // If not JSON, get as text
        responseData = await response.text();
      }

      // Check if response is ok
      if (!response.ok) {
        // Handle error response
        const errorMessage = responseData?.message || 
                            responseData?.error || 
                            `HTTP error! status: ${response.status}`;
        
        throw new Error(errorMessage);
      }

      // Success - set data
      setData(responseData);
      return { success: true, data: responseData };
    } catch (err) {
      // Handle errors
      const errorMessage = err.message || 'An error occurred while making the API call';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [endpoint, method, body, authRequired, headers]);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  // Call API immediately if immediate is true
  useEffect(() => {
    if (immediate) {
      callApi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return {
    data,
    loading,
    error,
    callApi,
    reset,
  };
};

export default useApi;

