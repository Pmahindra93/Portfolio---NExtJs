'use client'

import { Providers } from '@/components/providers'
import { Sidebar } from '@/components/sidebar'
import { NavBar } from '@/components/nav-bar'
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
          {/* Add Footer Here */}
          <footer className="py-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-center text-sm text-muted-foreground">
              Made with ❤️ in North London with 🤖 and 🍵
            </p>
          </footer>
        </div>
      </Providers>
    </body>
  )
}
