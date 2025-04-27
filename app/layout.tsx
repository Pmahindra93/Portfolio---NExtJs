// app/layout.tsx
import { Inter } from "next/font/google"
import { Caveat } from "next/font/google"
import { Metadata } from "next"
import { BodyContent } from '@/app/components/body-content'
import { cn } from "@/lib/utils"
import { Analytics } from '@vercel/analytics/next';
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
})

export const metadata: Metadata = {
  title: "Prateek Mahindra | AI, LLM Apps & Startup Growth",
  description: "Exploring AI, product engineering, and startup strategies. Read Prateek Mahindra's latest insights on building and scaling tech products.",
  icons: {
    icon: "/favicon.ico"
  }
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(
      "min-h-screen antialiased transition-colors",
      "bg-background text-foreground",
      "font-sans",
      inter.variable,
      caveat.variable
    )}>
      <BodyContent className="min-h-screen">{children}<Analytics /></BodyContent>
    </html>
  )
}
