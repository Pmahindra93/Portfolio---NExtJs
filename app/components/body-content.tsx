'use client'

import { Providers } from '@/components/providers'
import { Sidebar } from '@/components/sidebar'
import { NavBar } from '@/components/nav-bar'
import { VoiceModeButton } from '@/app/components/voice/voice-mode-button'
import { useTheme } from '@/lib/hooks/useTheme'

interface BodyContentProps {
  children: React.ReactNode
  className: string
}

export function BodyContent({
  children,
  className
}: BodyContentProps) {
  return (
    <body
      className={className}
      suppressHydrationWarning
    >
      <Providers>
        <div className="relative flex min-h-screen flex-col">
          <NavBar className="z-40" />
          <div className="flex-1 flex">
            <Sidebar className="hidden md:block z-30" />
            <main className="flex-1 md:pl-[200px] px-4 pt-16 pb-16 theme-90s:bg-[#C0C0C0]">
              {children}
            </main>
          </div>
        </div>
        <VoiceModeButton />
      </Providers>
    </body>
  )
}
