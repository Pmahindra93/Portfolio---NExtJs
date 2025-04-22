'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NinetiesPost {
  id: string
  title: string
  created_at: string
  slug: string
}

interface NinetiesLayoutProps {
  posts: NinetiesPost[]
  journeyContent: React.ReactNode // Prop for Journey section
  projectsContent: React.ReactNode // Prop for Projects section
}

// Helper to format date like 'MM/DD/YYYY'
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (e) {
    return 'Invalid Date';
  }
}

export function NinetiesLayout({ posts, journeyContent, projectsContent }: NinetiesLayoutProps) {
  const [showWelcome, setShowWelcome] = useState(true)
  const [showGuestbook, setShowGuestbook] = useState(false)
  const [guestbookEntries, setGuestbookEntries] = useState<string[]>([
    'CoolDude98: This site is rad!',
    'WebSurfer2000: Love the design!',
    'JavaScriptFan: <marquee>Hello World!</marquee>',
  ])
  const [newEntry, setNewEntry] = useState('')
  const [visitorName, setVisitorName] = useState('')
  const [visitorCount, setVisitorCount] = useState(0)

  useEffect(() => {
    const savedCount = localStorage.getItem('visitorCount') || '0'
    const count = parseInt(savedCount, 10)
    setVisitorCount(count + 1)
    localStorage.setItem('visitorCount', (count + 1).toString())

    const timer = setTimeout(() => {
      setShowWelcome(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleGuestbookSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (visitorName && newEntry) {
      setGuestbookEntries([
        ...guestbookEntries,
        `${visitorName}: ${newEntry}`,
      ])
      setNewEntry('')
      setVisitorName('')
    }
  }

  return (
    <div className="bg-[#C0C0C0] min-h-screen p-4 font-['Comic_Sans_MS',_cursive] text-[#000080]">
      {/* Welcome popup */}
      {showWelcome && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    bg-[#FFFFFF] border-4 border-[#000080] p-4 shadow-[5px_5px_0_#000000]
                    w-80 z-50"
        >
          <div className="bg-[#000080] text-[#FFFFFF] p-1 mb-2 flex justify-between items-center">
            <span>Welcome!</span>
            <button
              onClick={() => setShowWelcome(false)}
              className="bg-[#C0C0C0] text-[#000000] px-2 border-2 border-[#000000]"
            >
              X
            </button>
          </div>
          <p className="mb-2">
            Welcome to my awesome website! This site is best viewed with Netscape
            Navigator at 800x600 resolution!
          </p>
          <div className="text-center">
            <button
              onClick={() => setShowWelcome(false)}
              className="bg-[#008080] text-[#FFFFFF] px-4 py-1 border-2 border-[#000000] shadow-[2px_2px_0_#000000]"
            >
              Enter Site
            </button>
          </div>
        </div>
      )}


      <div className="flex flex-col">
        {/* Main Content */}
        <main className="flex-1 space-y-4 max-w-6xl mx-auto">
          {/* Moved Sidebar Content */}
          <section className="bg-[#FFFFFF] border-4 border-[#000000] shadow-[5px_5px_0_#000000] p-4 space-y-4">
            {/* Webmaster Profile */}
            <div className="text-center">
              <div
                className="inline-block border-4 border-[#000000] bg-[#FFFFFF] p-2 shadow-[3px_3px_0_#000000]"
              >
                <img
                  src="https://res.cloudinary.com/dvscdtpyl/image/upload/v1745332094/46C8C8BC-AB4F-4DA9-9CFA-97B8C2F8EDCD_lnawly.png"
                  alt="Webmaster"
                  className="w-32 h-32 mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/128?text=Me'
                  }}
                />
              </div>
              <p className="mt-2 font-bold">Webmaster Prateek</p>
            </div>

            {/* Navigation */}
            <nav>
              <div className="bg-[#000080] text-[#FFFFFF] p-1 mb-2 text-center">
                Navigation
              </div>
              <ul>
                <li className="mb-2">
                  <a
                    href="#"
                    className="flex items-center text-[#0000FF] hover:text-[#FF00FF]"
                  >
                    <span className="mr-1">→</span> Home
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#"
                    className="flex items-center text-[#0000FF] hover:text-[#FF00FF]"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowGuestbook(!showGuestbook)
                    }}
                  >
                    <span className="mr-1">→</span> Guestbook
                  </a>
                </li>
                 {/* Add links to content sections if desired */}
              </ul>
            </nav>

            {/* Visitor Count */}
            <div>
              <div className="bg-[#000080] text-[#FFFFFF] p-1 mb-2 text-center">
                Visitor Count
              </div>
              <div
                className="text-center font-bold text-2xl"
                style={{ animation: 'blink 1s infinite' }}
              >
                {visitorCount.toString().padStart(6, '0')}
              </div>
            </div>

            {/* Browser Badges */}
            <div className="text-center">
              <div className="mb-2">This site is best viewed with:</div>
              <div className="flex justify-center gap-2">
                <div className="border-2 border-[#000000] p-1 bg-[#FFFFFF]">
                  <img
                    src="/images/netscape.png"
                    alt="Netscape Now!"
                    className="h-8"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
                <div className="border-2 border-[#000000] p-1 bg-[#FFFFFF]">
                  <img
                    src="/images/IE.png"
                    alt="Internet Explorer"
                    className="h-8"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section: Recent Posts */}
          <section className="bg-[#FFFFFF] border-4 border-[#000000] shadow-[5px_5px_0_#000000] p-4">
            <div className="bg-[#000080] text-[#FFFFFF] p-1 mb-2 text-center">
              Recent Posts
            </div>
            <ul className="list-disc list-inside">
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <li key={post.id} className="mb-1">
                    <Link href={`/blog/${post.slug}`} className="text-[#0000FF] hover:text-[#FF00FF]">
                       {post.title}
                    </Link> - {formatDate(post.created_at)}
                  </li>
                ))
              ) : (
                <li>No posts yet! Check back soon!</li>
              )}
            </ul>
          </section>

          {/* Section: My Journey */}
          <section className="bg-[#FFFFFF] border-4 border-[#000000] shadow-[5px_5px_0_#000000] p-4">
            <div className="bg-[#000080] text-[#FFFFFF] p-1 mb-2 text-center">
              My Awesome Journey!
            </div>
            {journeyContent}
          </section>

           {/* Section: Featured Projects */}
          <section className="bg-[#FFFFFF] border-4 border-[#000000] shadow-[5px_5px_0_#000000] p-4">
            <div className="bg-[#000080] text-[#FFFFFF] p-1 mb-2 text-center">
              Super Cool Projects!
            </div>
             {projectsContent}
             <p className="mt-2 text-center">More projects coming soon!</p>
          </section>

          {/* Guestbook */}
          {showGuestbook && (
            <section
              className="fixed top-1/4 left-1/4 bg-[#FFFFFF] border-4 border-[#000080]
                          p-4 shadow-[5px_5px_0_#000000] w-1/2 z-40"
            >
              <div className="bg-[#000080] text-[#FFFFFF] p-1 mb-2 flex justify-between items-center">
                <span>Guestbook</span>
                <button
                  onClick={() => setShowGuestbook(false)}
                  className="bg-[#C0C0C0] text-[#000000] px-2 border-2 border-[#000000]"
                >
                  X
                </button>
              </div>
              <div className="h-40 overflow-y-scroll border-2 border-inset border-[#000080] bg-[#FFFFFF] p-2 mb-2">
                {guestbookEntries.map((entry, index) => (
                  <p key={index} className="mb-1">
                    {entry}
                  </p>
                ))}
              </div>
              <form onSubmit={handleGuestbookSubmit} className="space-y-2">
                <input
                  type="text"
                  placeholder="Your Cool Name"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full p-1 border-2 border-inset border-[#000080]"
                />
                <textarea
                  placeholder="Leave a message!"
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  className="w-full p-1 border-2 border-inset border-[#000080]"
                  rows={3}
                ></textarea>
                <button
                  type="submit"
                  className="bg-[#008080] text-[#FFFFFF] px-4 py-1 border-2 border-[#000000] shadow-[2px_2px_0_#000000]"
                >
                  Sign Guestbook
                </button>
              </form>
            </section>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-4 text-center text-sm pt-5 text-[#000080]">
        <p>
          1999-{new Date().getFullYear()} Prateek Mahindra. All rights reserved.
        </p>
        <p>This website is powered by 🍵 & 👨🏽‍💻 !</p>
        <div className="flex justify-center gap-2 mt-2">
          <img
            src="/geocities.gif"
            alt="GeoCities"
            className="h-6"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <img
            src="/html.gif"
            alt="Made with HTML"
            className="h-6"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      </footer>
    </div>
  )
}