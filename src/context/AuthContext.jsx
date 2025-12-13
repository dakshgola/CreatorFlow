import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Base API URL - uses environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * AuthProvider component that wraps the app and provides authentication context
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token is still valid by fetching current user
        verifyToken(storedToken);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Verify token by fetching current user info
   */
  const verifyToken = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setToken(authToken);
        } else {
          // Token invalid, clear auth
          clearAuth();
        }
      } else {
        // Token invalid, clear auth
        clearAuth();
      }
    } catch (error) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear authentication state
   */
  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   * @returns {Promise<Object>} Response data
   */
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to parse error message
        try {
          const errorData = await response.json();
          return { success: false, message: errorData.message || `Registration failed (${response.status})` };
        } catch {
          return { success: false, message: `Registration failed (${response.status}). Please check if the server is running.` };
        }
      }

      const data = await response.json();

      if (data.success && data.token && data.user) {
        // Store token and user
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      // More specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { success: false, message: 'Cannot connect to server. Please check if the backend is running and the API URL is correct.' };
      }
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  };

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} Response data
   */
  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to parse error message
        try {
          const errorData = await response.json();
          return { success: false, message: errorData.message || `Login failed (${response.status})` };
        } catch {
          return { success: false, message: `Login failed (${response.status}). Please check if the server is running.` };
        }
      }

      const data = await response.json();

      if (data.success && data.token && data.user) {
        // Store token and user
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      // More specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { success: false, message: 'Cannot connect to server. Please check if the backend is running and the API URL is correct.' };
      }
      return { success: false, message: error.message || 'Network error. Please try again.' };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    clearAuth();
  };

  /**
   * Fetch with automatic Authorization header
   * @param {string} url - API endpoint (relative or absolute)
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  const fetchWithAuth = async (url, options = {}) => {
    const authToken = token || localStorage.getItem('token');

    // If URL is relative, prepend API base URL
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return fetch(fullUrl, {
      ...options,
      headers,
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    register,
    login,
    logout,
    fetchWithAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;


