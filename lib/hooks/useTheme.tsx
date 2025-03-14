'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  is90sStyle: boolean
  toggleDarkMode: () => void
  toggle90sStyle: () => void
  isMounted: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  is90sStyle: false,
  toggleDarkMode: () => {},
  toggle90sStyle: () => {},
  isMounted: false
})

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [is90sStyle, setIs90sStyle] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const initializedRef = useRef(false)
  const isInitialRenderRef = useRef(true)

  // Function to update the DOM based on theme state
  const updateTheme = useCallback(() => {
    if (!isMounted) return;

    // Apply dark mode
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply 90s style
    if (is90sStyle) {
      document.documentElement.classList.add("theme-90s");
      document.documentElement.setAttribute("data-theme", "90s");
    } else {
      document.documentElement.classList.remove("theme-90s");
      document.documentElement.removeAttribute("data-theme");
    }

    // Dispatch event for other components to react
    const event = new CustomEvent("themeChanged", {
      detail: { isDarkMode, is90sStyle }
    });
    window.dispatchEvent(event);

    // Force a repaint to ensure styles are applied immediately
    document.body.style.display = 'none';
    // This triggers a reflow
    void document.body.offsetHeight;
    document.body.style.display = '';
  }, [isDarkMode, is90sStyle, isMounted]);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const darkModePreference = localStorage.getItem("darkMode") === "true";
    const style90sPreference = localStorage.getItem("90sStyle") === "true";

    setIsDarkMode(darkModePreference);
    setIs90sStyle(style90sPreference);
    setIsMounted(true);
  }, []);

  // Update theme whenever state changes after initial mount
  useEffect(() => {
    if (isMounted) {
      updateTheme();
    }
  }, [isDarkMode, is90sStyle, isMounted, updateTheme]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem("darkMode", String(newValue));
      return newValue;
    });
  }, []);

  // Toggle 90s style
  const toggle90sStyle = useCallback(() => {
    setIs90sStyle(prev => {
      const newValue = !prev;
      localStorage.setItem("90sStyle", String(newValue));
      return newValue;
    });
  }, []);

  // Prevent flash of wrong theme while loading
  if (!isMounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        is90sStyle,
        toggleDarkMode,
        toggle90sStyle,
        isMounted
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
