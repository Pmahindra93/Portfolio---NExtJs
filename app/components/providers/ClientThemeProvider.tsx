'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/lib/hooks/useTheme'

interface ClientThemeProviderProps {
  children: ReactNode
}

export function ClientThemeProvider({ children }: ClientThemeProviderProps) {
  return <ThemeProvider>{children}</ThemeProvider>
}
