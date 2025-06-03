'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/hooks/useTheme'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Moon, Sun } from 'lucide-react'

export function NavBar({ className }: { className?: string }) {
  const { isDarkMode, is90sStyle, toggleDarkMode, toggle90sStyle } = useTheme()
  const { isAdmin, isLoading } = useAdmin()
  const pathname = usePathname()

  const handleAdminAccess = () => {
    if (isAdmin && pathname !== '/blog/new') {
      window.location.href = '/blog/new'
    }
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b h-16 flex items-center w-screen',
        is90sStyle
          ? 'bg-[#000080] text-[#FFFF00] border-[#000000] border-4 border-x-0 border-t-0'
          : isDarkMode
          ? 'bg-slate-900 text-white border-slate-800'
          : 'bg-white text-slate-900 border-slate-200',
        className
      )}
    >
      <div className="w-full px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          {is90sStyle ? (
            <span className="text-[#FFFF00] font-['Comic_Sans_MS',_cursive] animate-pulse text-2xl font-bold">
              <span className="hidden md:inline">Welcome to Prateek&apos;s Cyber Space!</span>
              <span className="md:hidden">Prateek&apos;s Space</span>
            </span>
          ) : (
            <div className="flex items-center">
              {/* Show logo on desktop, text on mobile */}
              <Image
                src="/images/website-logo.jpg"
                alt="Prateek Mahindra Logo"
                width={32}
                height={32}
                className="rounded-lg hidden md:block"
              />
              <span className="font-bold md:hidden">Prateek M.</span>
            </div>
          )}
        </Link>

        <div className="flex items-center space-x-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={cn(
                "p-2 rounded-md",
                is90sStyle
                  ? "bg-[#008080] hover:bg-[#006666] text-[#FFFF00] border-2 border-[#000000]"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {isDarkMode ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* 90s Style Toggle */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="style-toggle" className="hidden md:inline-block text-sm font-medium">
              90s Style:
            </Label>
            <Switch
              id="style-toggle"
              checked={is90sStyle}
              onCheckedChange={toggle90sStyle}
              aria-label="Toggle 90s style"
            />
          </div>

          {/* Admin Button */}
          <Button
            onClick={handleAdminAccess}
            variant={is90sStyle ? "secondary" : "default"}
            className={cn(
              "hidden md:inline-flex text-sm font-medium transition-all",
              is90sStyle
                ? "border-2 border-[#FFFF00] bg-[#000080] text-[#FFFF00] hover:bg-[#000080]/90"
                : isDarkMode
                ? "bg-white text-black hover:bg-white/90"
                : "bg-black text-white hover:bg-black/90"
            )}
          >
            {isLoading ? "Loading..." : isAdmin ? "New Post" : "Admin"}
          </Button>
        </div>
      </div>
    </nav>
  )
}
