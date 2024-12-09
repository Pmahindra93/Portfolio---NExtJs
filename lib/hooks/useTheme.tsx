'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  is90sStyle: boolean
  toggleDarkMode: () => void
  toggle90sStyle: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  is90sStyle: false,
  toggleDarkMode: () => {},
  toggle90sStyle: () => {},
})

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [is90sStyle, setIs90sStyle] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Update the theme
  const updateTheme = (darkMode: boolean, style90s: boolean) => {
    // Handle dark mode
    if (darkMode) {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }

    // Handle 90s style
    if (style90s) {
      document.documentElement.setAttribute('data-theme', '90s')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  // Initialize theme
  useEffect(() => {
    // Check system preference for dark mode
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // Get saved preferences or use system preference for dark mode
    const savedDarkMode = localStorage.getItem('darkMode')
    const saved90sStyle = localStorage.getItem('90sStyle')
    
    const initialDarkMode = savedDarkMode !== null ? savedDarkMode === 'true' : systemPrefersDark
    const initial90sStyle = saved90sStyle === 'true'
    
    setIsDarkMode(initialDarkMode)
    setIs90sStyle(initial90sStyle)
    updateTheme(initialDarkMode, initial90sStyle)
    
    setMounted(true)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev
      localStorage.setItem('darkMode', String(newValue))
      updateTheme(newValue, is90sStyle)
      return newValue
    })
  }

  const toggle90sStyle = () => {
    setIs90sStyle((prev) => {
      const newValue = !prev
      localStorage.setItem('90sStyle', String(newValue))
      updateTheme(isDarkMode, newValue)
      return newValue
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      is90sStyle,
      toggleDarkMode,
      toggle90sStyle,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
