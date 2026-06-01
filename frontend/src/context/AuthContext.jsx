import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// ✅ FIXED: Base API URL — VITE_API_URL should be set to full base like:
//    Local:      http://localhost:5000/api/v1
//    Production: https://creatorflow-i5ev.onrender.com/api/v1
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // // Explain: Removed 'token' state since the JWT is securely hidden in an httpOnly cookie.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // // Explain: On app load, we verify auth by directly hitting /me. The browser will auto-send the cookie if it exists.
    verifyUser();
  }, []);

  const verifyUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // // Explain: 'credentials: include' forces fetch to automatically send the httpOnly cookies.
        credentials: 'include', 
      });

      if (!response.ok) throw new Error('Not authenticated');

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
    // // Explain: Removed localStorage.removeItem('token') & ('user') since we no longer rely on them.
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // // Explain: Necessary so the backend's Set-Cookie header is accepted by the browser.
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Registration failed' };
      }

      // // Explain: We simply set the user state. The backend securely handled storing the JWT in the cookie.
      setUser(data.user);

      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // // Explain: Allows the browser to receive and store the httpOnly cookie from the backend response.
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Login failed' };
      }

      // // Explain: We only need to store the user profile in React state. No more localStorage!
      setUser(data.user);

      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      // // Explain: Explicitly hit the backend to clear the httpOnly cookies (using DELETE as requested).
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'DELETE', 
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API failed', error);
    } finally {
      // // Explain: Clear React state regardless of API success to immediately lock the UI.
      clearAuth();
    }
  };

  // ✅ fetchWithAuth helper — used by other components needing authenticated requests
  const fetchWithAuth = async (url, options = {}) => {
    const fullUrl = url.startsWith('http')
      ? url
      : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;

    return fetch(fullUrl, {
      ...options,
      // // Explain: 'credentials: include' replaces the manual Authorization Bearer header. The browser handles the rest.
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        // // Explain: Authentication status is now determined purely by whether the user object exists in state.
        isAuthenticated: !!user,
        register,
        login,
        logout,
        fetchWithAuth,
      }}
    >
      {loading ? (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-5 text-gray-100">
          <div className="w-full max-w-md text-center space-y-6 animate-pop-in">
            {/* Logo Container */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center font-extrabold text-white text-2xl shadow-lg shadow-indigo-500/30 animate-pulse">
              CF
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">Initializing CreatorFlow</h2>
              <p className="text-sm text-gray-400">Waking up the server & verifying session...</p>
            </div>

            {/* Spinner and Status Indicator */}
            <div className="flex justify-center py-2">
              <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            
            {/* Render Free Tier Info Box */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <p className="text-xs text-indigo-300 font-medium">
                ⏳ Note: CreatorFlow is hosted on Render's free tier. 
              </p>
              <p className="text-xs text-gray-400 leading-normal">
                If the server is sleeping, waking it up can take 15 to 30 seconds. Thank you for your patience!
              </p>
            </div>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;