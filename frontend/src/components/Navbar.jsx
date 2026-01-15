import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useDarkMode from '../hooks/useDarkMode';

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Get page title from location
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path === '/ai-tools') return 'AI Tools';
    if (path === '/clients') return 'Brand Clients';
    if (path === '/tasks') return 'Tasks';
    if (path === '/planner') return 'Content Planner';
    if (path === '/history') return 'History';
    if (path === '/analytics') return 'Analytics';
    if (path === '/settings') return 'Settings';
    return 'CreatorFlow';
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-slate-900/60 backdrop-blur-sm border-b border-slate-800 transition-colors duration-200 sticky top-0 z-30">
      <div className="px-6">
        <div className="flex justify-between items-center h-16">
          {/* Page Title */}
          <div>
            <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* User Avatar Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-800">
                    <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-400 mt-1">{user?.email || ''}</p>
                  </div>

                  <div className="p-2">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 mb-2">
                      <p className="text-xs text-slate-400">Made for</p>
                      <p className="text-sm font-semibold text-white">Indian Creators 🇮🇳</p>
                    </div>

                    <div className="border-t border-slate-800 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
