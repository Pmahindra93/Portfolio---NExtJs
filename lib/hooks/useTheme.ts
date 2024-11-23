// lib/hooks/useTheme.ts
"use client"

import { useContext } from 'react'
import { ThemeContext } from '@/lib/contexts/ThemeContext'

interface ThemeContextType {
  is90sStyle: boolean
  toggleStyle: () => void
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
