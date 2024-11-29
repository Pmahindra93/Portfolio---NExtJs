'use client'

import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { cn } from '@/lib/utils'

export function NavBar() {
  const { is90sStyle } = useTheme()

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b h-16 flex items-center px-4',
        is90sStyle
          ? 'bg-[#C0C0C0] border-[#000000] border-4'
          : 'bg-background border-border'
      )}
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link
          href="/"
          className={cn(
            'text-xl font-bold',
            is90sStyle && "font-['Comic_Sans_MS',_cursive] text-[#FF00FF]"
          )}
        >
          Prateek Mahindra
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/profile" className="text-sm">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  )
}
