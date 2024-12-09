'use client'

import { ThemeProvider } from '@/lib/hooks/useTheme'
import { Toaster } from '@/components/ui/toaster'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
