// contexts/ThemeContext.tsx
"use client"

import { createContext, useState, useEffect, ReactNode } from 'react'

export interface ThemeContextType {
  is90sStyle: boolean
  toggleStyle: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [is90sStyle, setIs90sStyle] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('is90sStyle')
    if (saved) {
      setIs90sStyle(JSON.parse(saved))
    }
  }, [])

  const toggleStyle = () => {
    setIs90sStyle(!is90sStyle)
    localStorage.setItem('is90sStyle', JSON.stringify(!is90sStyle))
  }

  return (
    <ThemeContext.Provider value={{ is90sStyle, toggleStyle }}>
      {children}
    </ThemeContext.Provider>
  )
}
