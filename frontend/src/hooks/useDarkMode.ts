import { useState, useEffect } from 'react';

export interface UseDarkModeResult {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * Custom hook for managing dark mode state (TypeScript version)
 */
const useDarkMode = (): UseDarkModeResult => {
  // State to track whether dark mode is enabled
  const [darkMode, setDarkMode] = useState<boolean>(() => {
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
   */
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (darkMode) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  /**
   * Function to toggle dark mode on/off
   */
  const toggleDarkMode = (): void => {
    setDarkMode((prevMode) => !prevMode);
  };

  return { darkMode, toggleDarkMode };
};

export default useDarkMode;
