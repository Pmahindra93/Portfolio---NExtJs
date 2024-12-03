"use client"

import Link from "next/link"
import { useTheme } from "@/lib/hooks/useTheme"
import { useAdmin } from "@/lib/hooks/useAdmin"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  LayoutDashboard,
  User,
  FolderKanban,
  MessageSquare,
  Settings,
  BookOpen,
  PenSquare,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { is90sStyle } = useTheme()
  const { isAdmin } = useAdmin()

  const menuItems = [
    {
      title: "Home",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      title: "Projects",
      icon: FolderKanban,
      href: "#projects",
    },
    {
      title: "Blog",
      icon: BookOpen,
      href: "/blog",
    },
    {
      title: is90sStyle ? "Guestbook" : "Contact",
      icon: MessageSquare,
      href: "mailto:prateekmahindra9@gmail.com",
    },
  ]

  return (
    <div
      className={cn(
        "relative hidden h-screen border-r md:block",
        is90sStyle
          ? "w-64 border-[#000000] border-4 bg-[#C0C0C0]"
          : "w-72 border-border bg-background",
        className
      )}
    >
      <div className="space-y-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
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
                Welcome to my cyber realm! 🌐✨
              </p>
            </div>
          </div>
        )}
        
        {isAdmin && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Link href="/admin/posts/new">
              <Button
                variant={is90sStyle ? "outline" : "default"}
                className={cn(
                  "w-full",
                  is90sStyle
                    ? "bg-[#00FF00] text-[#000000] border-2 border-[#000000] hover:bg-[#00CC00] font-['Comic_Sans_MS',_cursive]"
                    : ""
                )}
              >
                <PenSquare className={cn("mr-2 h-4 w-4", is90sStyle ? "text-[#000000]" : "")} />
                {is90sStyle ? "✍️ New Post ✍️" : "Create Post"}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
