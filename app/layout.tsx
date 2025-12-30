// app/layout.tsx
import { Inter, Caveat, JetBrains_Mono } from "next/font/google"
import { Metadata } from "next"
import { BodyContent } from '@/app/components/body-content'
import { cn } from "@/lib/utils"
import { Analytics } from '@vercel/analytics/next';
import './globals.css'

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

const siteUrl = (() => {
  if (!rawSiteUrl) {
    return 'https://prateekmahindra.com'
  }

  try {
    const parsed = new URL(rawSiteUrl.startsWith('http') ? rawSiteUrl : `https://${rawSiteUrl}`)
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return 'https://prateekmahindra.com'
  }
})()

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prateek Mahindra | AI, LLM Apps & Startup Growth",
    template: "%s | Prateek Mahindra"
  },
  description: "Product engineer and AI builder sharing playbooks on shipping LLM-powered products, startup growth, and applied experimentation.",
  keywords: [
    'Prateek Mahindra',
    'AI product engineer',
    'LLM applications',
    'startup growth',
    'supabase',
    'typescript',
    'next.js blog'
  ],
  alternates: {
    canonical: '/'
  },
  authors: [{ name: 'Prateek Mahindra', url: siteUrl }],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Prateek Mahindra | AI, LLM Apps & Startup Growth',
    description: 'Product engineer and AI builder sharing playbooks on shipping LLM-powered products, startup growth, and applied experimentation.',
    siteName: 'Prateek Mahindra',
    images: [
      {
        url: '/images/website_logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Prateek Mahindra portfolio preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prateek Mahindra | AI, LLM Apps & Startup Growth',
    description: 'Insights and projects from an AI-focused product engineer building with LLMs, Supabase, and Next.js.',
    images: ['/images/website_logo.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
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
      "min-h-screen antialiased transition-colors overflow-x-hidden",
      "bg-background text-foreground",
      "font-sans",
      inter.variable,
      caveat.variable,
      jetbrainsMono.variable
    )}>
      <BodyContent className="min-h-screen overflow-x-hidden">{children}<Analytics /></BodyContent>
    </html>
  )
}
