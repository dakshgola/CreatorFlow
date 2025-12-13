import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useApi from '../hooks/useApi';
import useDarkMode from '../hooks/useDarkMode';

const Settings = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [user, setUser] = useState(null);
  
  const userApi = useApi('/auth/me', { immediate: true });
  const themeApi = useApi('/auth/theme', { method: 'PUT', immediate: false });

  // Update user state when API data loads
  useEffect(() => {
    if (userApi.data?.success && userApi.data.user) {
      const userData = userApi.data.user;
      setUser(userData);
      // Sync dark mode with user preference (only on initial load)
      if (userData.themePreference) {
        const shouldBeDark = userData.themePreference === 'dark';
        if (shouldBeDark !== darkMode) {
          toggleDarkMode();
        }
      }
    } else if (userApi.error) {
      toast.error('Failed to load user settings');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userApi.data, userApi.error]);

  const handleThemeChange = async (newTheme) => {
    try {
      const result = await themeApi.callApi({ 
        body: { themePreference: newTheme } 
      });
      
      // Theme API returns user object directly (not wrapped in success/data)
      if (result.success && result.data) {
        const updatedUser = result.data;
        
        // Update local dark mode state
        if (newTheme === 'dark' && !darkMode) {
          toggleDarkMode();
        } else if (newTheme === 'light' && darkMode) {
          toggleDarkMode();
        }
        
        // Update user state
        setUser(updatedUser);
        
        toast.success('Theme preference saved!');
      } else if (result.error) {
        toast.error(result.error || 'Failed to update theme');
      }
    } catch (err) {
      toast.error('Error updating theme');
    }
  };

  const currentTheme = user?.themePreference || (darkMode ? 'dark' : 'light');

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto bg-slate-950 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Settings</h1>
        <p className="text-slate-400 text-sm">Manage your account preferences and appearance</p>
      </div>

      {/* Profile Section */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-xl mb-6">
        <h2 className="text-xl font-semibold mb-6 text-white">Profile</h2>
        {userApi.loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-800 border-t-indigo-600"></div>
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-300">Name</label>
              <p className="text-white mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Email</label>
              <p className="text-white mt-1">{user.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Failed to load user information</p>
        )}
      </div>

      {/* Appearance Section */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-xl">
        <h2 className="text-xl font-semibold mb-2 text-white">Appearance</h2>
        <p className="text-sm text-slate-400 mb-6">
          Choose your preferred theme. Your preference will be saved and synced across devices.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            disabled={themeApi.loading}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ease-out ${
              currentTheme === 'light' 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30' 
                : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {themeApi.loading && currentTheme === 'light' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Light Mode'
            )}
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            disabled={themeApi.loading}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ease-out ${
              currentTheme === 'dark' 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30' 
                : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {themeApi.loading && currentTheme === 'dark' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Dark Mode'
            )}
          </button>
        </div>
        
        {currentTheme && (
          <p className="text-sm text-slate-400 mt-6 pt-6 border-t border-slate-800">
            Current theme: <span className="font-semibold capitalize text-slate-300">{currentTheme}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Settings;
