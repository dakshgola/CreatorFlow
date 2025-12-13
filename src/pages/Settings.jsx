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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Settings</h1>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Profile</h2>
        {userApi.loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <p className="text-gray-900 dark:text-white mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <p className="text-gray-900 dark:text-white mt-1">{user.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Failed to load user information</p>
        )}
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Appearance</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose your preferred theme. Your preference will be saved and synced across devices.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            disabled={themeApi.loading}
            className={`px-6 py-3 rounded font-medium transition-colors ${
              currentTheme === 'light' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {themeApi.loading && currentTheme === 'light' ? 'Saving...' : 'Light Mode'}
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            disabled={themeApi.loading}
            className={`px-6 py-3 rounded font-medium transition-colors ${
              currentTheme === 'dark' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {themeApi.loading && currentTheme === 'dark' ? 'Saving...' : 'Dark Mode'}
          </button>
        </div>
        
        {currentTheme && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Current theme: <span className="font-medium capitalize">{currentTheme}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Settings;
