"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "@/lib/hooks/useTheme"
import { useAdmin } from "@/lib/hooks/useAdmin"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
  LayoutDashboard,
  Home,
  User2,
  Settings,
  BookOpen,
  PenSquare,
  Sun,
  Moon,
  MessageSquare,
  FolderKanban,
  LogOut
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { is90sStyle, isDarkMode, toggleDarkMode } = useTheme()
  const { isAdmin } = useAdmin()

  const handleSignOut = async () => {
    try {
      // Check session first
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // If no session, just clean up and redirect
        localStorage.clear()
        router.push('/')
        router.refresh()
        toast({
          title: "Already signed out",
          description: "No active session found",
        })
        return
      }

      // Sign out from Supabase
      await supabase.auth.signOut({
        scope: 'local'
      })

      // Clear local storage and cookies
      localStorage.clear()

      // Show success message
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      })

      // Navigate to home page and refresh
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
      // If we get an auth session missing error, just clean up and redirect
      if (error instanceof Error && error.message.includes('Auth session missing')) {
        localStorage.clear()
        router.push('/')
        router.refresh()
        toast({
          title: "Signed out",
          description: "You have been signed out of your account",
        })
        return
      }

      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      })
    }
  }

  const modernMenuItems = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Blog",
      href: "/blog",
      icon: BookOpen,
    },
    {
      title: "Get in touch",
      href: "mailto:prateekmahindra9@gmail.com",
      icon: MessageSquare,
    },
  ]

  const retro90sMenuItems = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Blog",
      href: "/blog",
      icon: BookOpen,
    },
    {
      title: "Get in touch",
      href: "mailto:prateekmahindra9@gmail.com",
      icon: MessageSquare,
    },
  ]

  const adminItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "New Post",
      href: "/admin/posts/new",
      icon: PenSquare,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  if (is90sStyle) {
    return (
      <div className={cn(
        "fixed top-0 left-0 h-screen w-64 pt-16 border-[#000000] border-4 bg-[#C0C0C0]",
        className
      )}>
        <div className="h-full flex flex-col">
          <div className="flex-1 space-y-4 p-3">
            <nav className="space-y-2">
              {retro90sMenuItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex w-full items-center"
                >
                  <div
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 font-bold",
                      "bg-[#008080] hover:bg-[#006666] text-[#FFFF00] border-2 border-[#000000] font-['Comic_Sans_MS',_cursive]",
                      "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                      "active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                    )}
                  >
                    <item.icon className="h-4 w-4 text-[#FFFF00] flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </div>
                </Link>
              ))}
            </nav>

            <div className="rounded border-2 border-[#000000] bg-[#FFFFFF] p-4">
              <p className="text-[#FF00FF] font-['Comic_Sans_MS',_cursive] text-center text-sm">
                Welcome to my cyber realm! 🌐✨
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="p-3 border-t-4 border-[#000000]">
              <div className="space-y-2">
                <Button
                  onClick={handleSignOut}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 font-bold",
                    "bg-[#FF0000] text-[#FFFFFF] border-2 border-[#000000] hover:bg-[#CC0000] font-['Comic_Sans_MS',_cursive]",
                    "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    "active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                  )}
                >
                  <LogOut className="h-4 w-4 text-[#FFFFFF] flex-shrink-0" />
                  <span className="truncate">Sign Out</span>
                </Button>
                <Link href="/admin/posts/new">
                  <div
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 font-bold",
                      "bg-[#00FF00] text-[#000000] border-2 border-[#000000] hover:bg-[#00CC00] font-['Comic_Sans_MS',_cursive]",
                      "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                      "active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                    )}
                  >
                    <PenSquare className="h-4 w-4 text-[#000000] flex-shrink-0" />
                    <span className="truncate">✍️ New Post ✍️</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen w-[200px] border-r pt-16",
        className,
        "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
      )}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 py-4">
          <div className="px-3">
            <div className="space-y-1">
              {modernMenuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      pathname === item.href
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="py-4 px-3 space-y-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              {isDarkMode ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span>{isDarkMode ? 'Dark' : 'Light'} Mode</span>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              aria-label="Toggle theme"
            />
          </div>

          {isAdmin && (
            <Button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}
