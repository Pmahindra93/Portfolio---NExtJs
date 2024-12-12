'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

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
  const [theme, setTheme] = useState<Theme>('light')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [is90sStyle, setIs90sStyle] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Update the theme
  const updateTheme = (darkMode: boolean, style90s: boolean) => {
    const root = document.documentElement
    const theme = darkMode ? 'dark' : 'light'
    
    // Remove both classes first
    root.classList.remove('light', 'dark')
    // Add the appropriate class
    root.classList.add(theme)
    setTheme(theme)

    // Handle 90s style
    if (style90s) {
      root.setAttribute('data-theme', '90s')
    } else {
      root.removeAttribute('data-theme')
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

  // Prevent flash of wrong theme while loading
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider 
      value={{
        isDarkMode,
        is90sStyle,
        toggleDarkMode,
        toggle90sStyle,
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
