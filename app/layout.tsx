// app/layout.tsx
import { Inter } from "next/font/google"
import { Caveat } from "next/font/google"
import { Metadata } from "next"
import { Providers } from '@/components/providers'
import { Sidebar } from '@/components/sidebar'
import { NavBar } from '@/components/nav-bar'
import { cn } from "@/lib/utils"
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
})

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
})

export const metadata: Metadata = {
  title: "Prateek Mahindra | AI, LLM Apps & Startup Growth",
  description: "Exploring AI, product engineering, and startup strategies. Read Prateek Mahindra\’s latest insights on building and scaling tech products.",
  icons: {
    icon: "/favicon.ico",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen antialiased transition-colors",
        "bg-background text-foreground",
        inter.className,
        caveat.variable
      )}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <NavBar className="z-40" />
            <div className="flex-1 flex">
              <Sidebar className="hidden md:block z-30" />
              <main className="flex-1 md:pl-[200px] px-4 pt-16">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
