"use client"

import Link from "next/link"
import { useTheme } from "@/lib/hooks/useTheme"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  User,
  FolderKanban,
  MessageSquare,
  Settings,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { is90sStyle } = useTheme()

  const menuItems = [
    {
      title: "Home",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      title: "About",
      icon: User,
      href: "#about",
    },
    {
      title: "Projects",
      icon: FolderKanban,
      href: "#projects",
    },
    {
      title: is90sStyle ? "Guestbook" : "Contact",
      icon: MessageSquare,
      href: "#contact",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "#settings",
    },
  ]

  return (
    <div
      className={cn(
        "relative hidden h-screen border-r pt-16 md:block",
        is90sStyle
          ? "w-64 border-[#000000] border-4 bg-[#C0C0C0]"
          : "w-72 border-border bg-background",
        className
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2
              className={cn(
                "mb-4 px-4",
                is90sStyle
                  ? "text-[#FF00FF] font-['Comic_Sans_MS',_cursive] text-2xl animate-pulse"
                  : "text-lg font-semibold tracking-tight"
              )}
            >
              {is90sStyle ? "Cyber Navigation" : "Navigation"}
            </h2>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex w-full items-center"
                >
                  <Button
                    variant={is90sStyle ? "outline" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      is90sStyle
                        ? "bg-[#008080] hover:bg-[#006666] text-[#FFFF00] border-2 border-[#000000] font-['Comic_Sans_MS',_cursive]"
                        : ""
                    )}
                  >
                    <item.icon className={cn("mr-2 h-4 w-4", is90sStyle ? "text-[#FFFF00]" : "")} />
                    {item.title}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </div>
        {is90sStyle && (
          <div className="px-7 py-4">
            <div className="rounded border-2 border-[#000000] bg-[#FFFFFF] p-4">
              <p className="text-[#FF00FF] font-['Comic_Sans_MS',_cursive] text-center text-sm">
                🌟 Welcome to my radical website! 🌟
              </p>
              <div className="mt-2 flex justify-center">
                <img
                  src="/construction.gif"
                  alt="Under Construction"
                  className="w-16 h-16"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}