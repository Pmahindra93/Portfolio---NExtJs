"use client"
// app/page.tsx
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import BlogPosts from '@/components/BlogPosts'
import { useTheme } from '@/lib/hooks/useTheme'
import { Sidebar } from '@/components/sidebar'

export default function LandingPage() {
  const { is90sStyle, toggleStyle } = useTheme()
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    '/placeholder.svg?height=400&width=600',
    '/placeholder.svg?height=400&width=600',
    '/placeholder.svg?height=400&width=600'
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={`flex-1 ${is90sStyle ? 'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]' : 'bg-background text-foreground font-sans'}`}>
        <header className={`p-4 ${is90sStyle ? 'bg-[#000080] text-[#FFFF00]' : 'bg-primary text-primary-foreground'}`}>
          <div className="container mx-auto flex justify-between items-center">
            <h1 className={`${is90sStyle ? 'text-4xl font-bold animate-pulse' : 'text-2xl font-semibold'}`}>
              {is90sStyle ? "Welcome to Prateek's Cyber Space!" : "Prateek Mahindra"}
            </h1>
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
          </div>
        </header>

        <main className="container mx-auto p-4">
          <div className={`p-4 mb-8 ${is90sStyle ? 'bg-[#FFFFFF] border-4 border-[#000000]' : 'bg-card text-card-foreground rounded-lg shadow-md'}`}>
            <h2 className={`text-3xl font-bold mb-4 text-center ${is90sStyle ? 'text-[#FF00FF]' : 'text-primary'}`}>
              Who am I?
            </h2>
            <div className="flex flex-col md:flex-row items-center">
              <Image
                src="/placeholder.svg?height=150&width=150"
                alt="Prateek Mahindra"
                width={150}
                height={150}
                className={`mb-4 md:mb-0 md:mr-4 ${is90sStyle ? 'border-4 border-[#000000]' : 'rounded-full'}`}
              />
              <p className={`text-lg ${is90sStyle ? '' : 'text-muted-foreground'}`}>
                {is90sStyle
                  ? "Greetings, cyber traveler! I'm Prateek Mahindra, a webmaster extraordinaire and code wizard. Join me on this digital journey as we explore the vast realms of the World Wide Web together!"
                  : "Hi, I'm Prateek Mahindra, a passionate developer and designer creating innovative solutions for web and mobile platforms. With a keen eye for detail and a love for clean, efficient code, I bring ideas to life."}
              </p>
            </div>
          </div>
          <div className={`p-4 mb-8 ${is90sStyle ? 'bg-[#FFFF00] border-4 border-[#FF0000]' : 'bg-accent rounded-lg'}`}>
            <h2 className={`text-3xl font-bold mb-4 text-center ${is90sStyle ? 'text-[#FF0000]' : 'text-accent-foreground'}`}>
              {is90sStyle ? 'My Awesome Projects' : 'Featured Projects'}
            </h2>
            <div className="relative h-[200px] w-full max-w-[300px] mx-auto">
              {slides.map((slide, index) => (
                <Image
                  key={index}
                  src={slide}
                  alt={`Project slide ${index + 1}`}
                  fill
                  className={`object-cover transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  } ${is90sStyle ? 'border-4 border-[#000000]' : 'rounded-lg'}`}
                />
              ))}
            </div>
          </div>

          <div className={`p-4 mb-8 ${is90sStyle ? 'bg-[#FFA500] border-4 border-[#0000FF]' : 'bg-muted rounded-lg'}`}>
            <h2 className={`text-3xl font-bold mb-4 text-center ${is90sStyle ? 'text-[#0000FF]' : 'text-primary'}`}>
              {is90sStyle ? 'Latest Updates' : 'Recent Posts'}
            </h2>
            <BlogPosts is90sStyle={is90sStyle} />
          </div>

          <div className="text-center">
            <Link
              href="#"
              className={`inline-block px-6 py-2 font-bold transition-colors ${
                is90sStyle
                  ? 'bg-[#00FF00] text-[#000000] border-4 border-[#000000] hover:bg-[#00FF00]/80'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md'
              }`}
            >
              {is90sStyle ? 'Enter My Cyber Realm' : 'View My Portfolio'}
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
