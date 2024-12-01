// contexts/ThemeContext.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'modern' | '90s'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  is90sStyle: boolean
  toggleStyle: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('modern')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && (savedTheme === 'modern' || savedTheme === '90s')) {
      setTheme(savedTheme)
    }
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'modern' ? '90s' : 'modern'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        is90sStyle: theme === '90s',
        toggleStyle: toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
