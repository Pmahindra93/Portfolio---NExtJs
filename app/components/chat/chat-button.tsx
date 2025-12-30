'use client'

import { useState } from 'react'
import { MessageSquare, Sparkles } from 'lucide-react'
import { ChatInterface } from './chat-interface'

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="prateek-ai-button group relative inline-flex h-12 sm:h-14 items-center justify-center gap-2 overflow-hidden rounded-sm border-2 border-slate-900 dark:border-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 px-6 sm:px-8 font-mono font-bold text-white dark:text-slate-900 transition-all hover:scale-105 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:scale-95 text-sm sm:text-base"
        aria-label="Open PrateekGPT terminal chat"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Sparkle effect on hover */}
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 absolute left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-pulse" />

        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
        <span className="relative z-10 uppercase tracking-wider hidden sm:inline">
          Ask PrateekGPT
        </span>
        <span className="relative z-10 uppercase tracking-wider sm:hidden">
          Ask AI
        </span>

        {/* Pulse indicator */}
        <span className="relative flex h-2 w-2 z-10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </button>

      <ChatInterface isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  )
}
