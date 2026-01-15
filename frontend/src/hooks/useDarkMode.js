import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dark mode state
 * 
 * This hook provides a simple way to toggle between light and dark themes
 * by managing the 'dark' class on the HTML element and persisting the
 * user's preference in localStorage.
 * 
 * @returns {Object} An object containing:
 *   - darkMode: boolean - Current dark mode state
 *   - toggleDarkMode: function - Function to toggle dark mode on/off
 * 
 * @example
 * const { darkMode, toggleDarkMode } = useDarkMode();
 * 
 * // Use in component
 * <button onClick={toggleDarkMode}>
 *   {darkMode ? 'Switch to Light' : 'Switch to Dark'}
 * </button>
 */
const useDarkMode = () => {
  // State to track whether dark mode is enabled
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize state by checking localStorage first
    const savedTheme = localStorage.getItem('theme');
    
    // If user has a saved preference, use it
    if (savedTheme === 'dark') {
      return true;
    }
    
    // If no saved preference, check system preference
    if (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    // Default to light mode
    return false;
  });

  /**
   * Effect hook that runs on mount and whenever darkMode changes
   * This ensures the 'dark' class is properly applied/removed from <html>
   */
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (darkMode) {
      // Add 'dark' class to enable dark mode styles (Tailwind CSS)
      htmlElement.classList.add('dark');
      // Save preference to localStorage
      localStorage.setItem('theme', 'dark');
    } else {
      // Remove 'dark' class to use light mode styles
      htmlElement.classList.remove('dark');
      // Save preference to localStorage
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]); // Re-run whenever darkMode state changes

  /**
   * Function to toggle dark mode on/off
   * Updates the state, which triggers the useEffect to update the DOM
   */
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Return both the current state and the toggle function
  return { darkMode, toggleDarkMode };
};

export default useDarkMode;
