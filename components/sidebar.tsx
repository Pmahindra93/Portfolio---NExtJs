"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/lib/hooks/useTheme"
import { useAdmin } from "@/lib/hooks/useAdmin"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  FolderKanban
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { is90sStyle, isDarkMode, toggleDarkMode } = useTheme()
  const { isAdmin } = useAdmin()

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
      title: "Profile",
      href: "/profile",
      icon: User2,
    },
  ]

  const retro90sMenuItems = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Projects",
      href: "#projects",
      icon: FolderKanban,
    },
    {
      title: "Blog",
      href: "/blog",
      icon: BookOpen,
    },
    {
      title: "Guestbook",
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
      <div className="fixed top-0 left-0 h-screen w-64 md:block pt-16 border-[#000000] border-4 bg-[#C0C0C0] z-30">
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
        <div className="flex-1 space-y-4 py-4">
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
                    {item.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 p-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-8 h-8',
                !isDarkMode && 'bg-slate-100 dark:bg-slate-800'
              )}
              onClick={toggleDarkMode}
              aria-label="Light mode"
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-8 h-8',
                isDarkMode && 'bg-slate-100 dark:bg-slate-800'
              )}
              onClick={toggleDarkMode}
              aria-label="Dark mode"
            >
              <Moon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
