'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'
import { VoiceMode } from './voice-mode'

export function VoiceModeButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="voice-mode-fab group fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/50 transition-all hover:scale-110 hover:shadow-xl hover:shadow-green-500/60 active:scale-95"
        aria-label="Open voice mode"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-300/40 to-emerald-500/40 opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-pulse" />

        <Phone className="h-7 w-7 text-white relative z-10 transition-transform group-hover:rotate-12" />

        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full">
          <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75" />
        </span>
      </button>

      <VoiceMode isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  )
}
