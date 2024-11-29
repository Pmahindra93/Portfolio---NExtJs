'use client'

import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { cn } from '@/lib/utils'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function NavBar() {
  const { is90sStyle, toggleStyle } = useTheme()

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b h-16 flex items-center',
        is90sStyle
          ? 'bg-[#000080] text-[#FFFF00] border-[#000000] border-4'
          : 'bg-primary text-primary-foreground'
      )}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link
          href="/"
          className={cn(
            is90sStyle
              ? 'text-4xl font-bold animate-pulse text-[#FFFF00]'
              : 'text-2xl font-semibold text-primary-foreground'
          )}
        >
          {is90sStyle ? "Welcome to Prateek's Cyber Space!" : "Prateek Mahindra"}
        </Link>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="style-toggle" className="text-sm font-medium">
              Website Style:
            </Label>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${is90sStyle ? 'font-bold' : ''}`}>90s</span>
              <Switch
                id="style-toggle"
                checked={!is90sStyle}
                onCheckedChange={toggleStyle}
                aria-label="Toggle between 90s and modern style"
              />
              <span className={`text-sm ${!is90sStyle ? 'font-bold' : ''}`}>Modern</span>
            </div>
          </div>
          <Link href="/profile" className="text-sm hover:underline">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  )
}
