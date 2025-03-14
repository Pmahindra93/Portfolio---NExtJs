'use client'

import { useState, useEffect } from 'react'
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
}

export function NinetiesLayout({ posts }: NinetiesLayoutProps) {
  const [showWelcome, setShowWelcome] = useState(true)
  const [showGuestbook, setShowGuestbook] = useState(false)
  const [guestbookEntries, setGuestbookEntries] = useState<string[]>([
    'CoolDude98: This site is rad!',
    'WebSurfer2000: Love the design!',
    'JavaScriptFan: <marquee>Hello World!</marquee>',
  ])
  const [newEntry, setNewEntry] = useState('')
  const [visitorName, setVisitorName] = useState('')

  // Add visitor counter
  const [visitorCount, setVisitorCount] = useState(0)

  useEffect(() => {
    // Simulate loading visitor count from "server"
    const savedCount = localStorage.getItem('visitorCount') || '0'
    const count = parseInt(savedCount, 10)
    setVisitorCount(count + 1)
    localStorage.setItem('visitorCount', (count + 1).toString())

    // Auto-hide welcome message after 5 seconds
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

      {/* Header */}
      <header className="bg-[#000080] text-[#FFFFFF] p-4 border-4 border-[#000000] shadow-[5px_5px_0_#000000] mb-4">
        <h1
          className="text-4xl font-bold text-center text-[#FFFF00]"
          style={{ textShadow: '2px 2px 0 #FF00FF' }}
        >
          Prateek&apos;s Awesome Homepage
        </h1>
        <div
          className="mt-2 overflow-hidden whitespace-nowrap"
          style={{ animation: 'marquee 15s linear infinite' }}
        >
          <span className="text-[#00FFFF]">
            ★★★ Welcome to my personal website! Under construction! ★★★
          </span>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar */}
        <aside className="md:w-1/4 bg-[#FFFFFF] border-4 border-[#000000] shadow-[5px_5px_0_#000000] p-4">
          <div className="text-center mb-4">
            <div
              className="inline-block border-4 border-[#000000] bg-[#FFFFFF] p-2 shadow-[3px_3px_0_#000000]"
            >
              <img
                src="/avatar.png"
                alt="Webmaster"
                className="w-32 h-32 mx-auto"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/128?text=Me'
                }}
              />
            </div>
            <p className="mt-2 font-bold">Webmaster Prateek</p>
          </div>

          <nav className="mb-4">
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
              <li className="mb-2">
                <a
                  href="#"
                  className="flex items-center text-[#0000FF] hover:text-[#FF00FF]"
                >
                  <span className="mr-1">→</span> My Projects
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="flex items-center text-[#0000FF] hover:text-[#FF00FF]"
                >
                  <span className="mr-1">→</span> Links
                </a>
              </li>
            </ul>
          </nav>

          <div className="bg-[#000080] text-[#FFFFFF] p-1 mb-2 text-center">
            Visitor Count
          </div>
          <div
            className="text-center font-bold text-2xl"
            style={{ animation: 'blink 1s infinite' }}
          >
            {visitorCount.toString().padStart(6, '0')}
          </div>

          <div className="mt-4 text-center">
            <div className="mb-2">This site is best viewed with:</div>
            <div className="flex justify-center gap-2">
              <div className="border-2 border-[#000000] p-1 bg-[#FFFFFF]">
                <img
                  src="/netscape.gif"
                  alt="Netscape Now!"
                  className="h-8"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div className="border-2 border-[#000000] p-1 bg-[#FFFFFF]">
                <img
                  src="/ie.gif"
                  alt="Internet Explorer"
                  className="h-8"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="md:w-3/4">
          {/* Blog posts section */}
          <section className="bg-[#FFFFFF] border-4 border-[#000000] shadow-[5px_5px_0_#000000] p-4 mb-4">
            <div className="bg-[#000080] text-[#FFFFFF] p-1 mb-4 text-center">
              <span className="text-xl">Latest Updates</span>
            </div>

            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border-2 border-[#000000] p-3 bg-[#FFFFCC]"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-bold text-[#FF00FF]">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <span className="text-xs bg-[#000080] text-[#FFFFFF] px-2 py-1">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p>
                      Check out my latest thoughts! Click the title to read more...
                    </p>
                    <div className="mt-2 text-right">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-block bg-[#008080] text-[#FFFFFF] px-2 py-1 border-2 border-[#000000] shadow-[2px_2px_0_#000000]"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center">No updates yet. Check back soon!</p>
            )}
          </section>

          {/* Guestbook section */}
          {showGuestbook && (
            <section className="bg-[#FFFFFF] border-4 border-[#000000] shadow-[5px_5px_0_#000000] p-4 mb-4">
              <div className="bg-[#000080] text-[#FFFFFF] p-1 mb-4 text-center">
                <span className="text-xl">Sign My Guestbook</span>
              </div>

              <div className="mb-4 border-2 border-[#000000] p-3 bg-[#FFFFCC]">
                <p className="mb-2">
                  Please sign my guestbook! Let me know you&apos;ve visited!
                </p>
                <form onSubmit={handleGuestbookSubmit} className="space-y-2">
                  <div>
                    <label className="block mb-1">Your Name:</label>
                    <input
                      type="text"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full border-2 border-[#000000] p-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Your Message:</label>
                    <textarea
                      value={newEntry}
                      onChange={(e) => setNewEntry(e.target.value)}
                      className="w-full border-2 border-[#000000] p-1"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      className="bg-[#008080] text-[#FFFFFF] px-4 py-1 border-2 border-[#000000] shadow-[2px_2px_0_#000000]"
                    >
                      Sign Guestbook
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-[#000080] text-[#FFFFFF] p-1 mb-2 text-center">
                <span>Previous Visitors</span>
              </div>
              <div className="border-2 border-[#000000] p-2 bg-[#FFFFCC] max-h-60 overflow-y-auto">
                {guestbookEntries.map((entry, index) => (
                  <div
                    key={index}
                    className={cn("p-2 border-b border-dashed border-[#000080]", {
                      "bg-[#FFFFFF]": index % 2 === 0,
                    })}
                    dangerouslySetInnerHTML={{ __html: entry }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Under construction */}
          <div className="bg-[#FFFFFF] border-4 border-[#000000] shadow-[5px_5px_0_#000000] p-4 text-center">
            <div
              style={{
                animation: 'blink 1s infinite',
                color: '#FF0000',
                fontWeight: 'bold',
              }}
            >
              UNDER CONSTRUCTION
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <img
                src="/construction.gif"
                alt="Under Construction"
                className="h-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <img
                src="/construction.gif"
                alt="Under Construction"
                className="h-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <img
                src="/construction.gif"
                alt="Under Construction"
                className="h-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-4 bg-[#000080] text-[#FFFFFF] p-2 border-4 border-[#000000] shadow-[5px_5px_0_#000000] text-center">
        <div>© 2024 Prateek&apos;s Awesome Homepage. All rights reserved.</div>
        <div className="text-xs mt-1">
          Made with GeoCities and a lot of &lt;TABLE&gt; tags
        </div>
      </footer>
    </div>
  )
}
