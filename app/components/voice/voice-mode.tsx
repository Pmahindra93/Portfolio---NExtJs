'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Phone, PhoneOff, Mic, Volume2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Conversation, type ConnectionType } from '@elevenlabs/client'

interface VoiceModeProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

type VoiceState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'

export function VoiceMode({ isOpen, setIsOpen }: VoiceModeProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const conversationRef = useRef<Conversation | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  const startConversation = useCallback(async () => {
    try {
      setVoiceState('connecting')
      setError(null)

      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

      if (!agentId) {
        throw new Error('ElevenLabs Agent ID not configured')
      }

      // Initialize conversation
      const conversation = await Conversation.startSession({
        agentId,
        connectionType: 'websocket' as ConnectionType,
        onConnect: () => {
          console.log('Connected to voice agent')
          setVoiceState('listening')
        },
        onDisconnect: () => {
          console.log('Disconnected from voice agent')
          setVoiceState('idle')
        },
        onMessage: (message) => {
          console.log('Agent message:', message)
          setTranscript((prev) => [...prev, `AI: ${message.message}`])
        },
        onError: (error) => {
          console.error('Voice agent error:', error)
          setError(typeof error === 'string' ? error : 'Connection error')
          setVoiceState('idle')
        },
        onModeChange: (mode) => {
          console.log('Mode changed:', mode)
          if (mode.mode === 'listening') {
            setVoiceState('listening')
          } else if (mode.mode === 'speaking') {
            setVoiceState('speaking')
          } else if (mode.mode === 'thinking') {
            setVoiceState('thinking')
          }
        },
      })

      conversationRef.current = conversation

    } catch (err: any) {
      console.error('Failed to start conversation:', err)
      setError(err.message || 'Failed to connect to voice agent')
      setVoiceState('idle')
    }
  }, [])

  const endConversation = useCallback(async () => {
    try {
      if (conversationRef.current) {
        await conversationRef.current.endSession()
        conversationRef.current = null
      }
      setVoiceState('idle')
      setTranscript([])
    } catch (err: any) {
      console.error('Failed to end conversation:', err)
      setError('Failed to end conversation')
    }
  }, [])

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen && conversationRef.current) {
      endConversation()
    }
  }, [isOpen, endConversation])

  const handleToggleConversation = () => {
    if (voiceState === 'idle') {
      startConversation()
    } else {
      endConversation()
    }
  }

  const getStateDisplay = () => {
    switch (voiceState) {
      case 'connecting':
        return { text: 'Connecting...', icon: Mic, color: 'text-blue-400' }
      case 'listening':
        return { text: 'Listening', icon: Mic, color: 'text-green-400' }
      case 'thinking':
        return { text: 'Thinking...', icon: Mic, color: 'text-yellow-400' }
      case 'speaking':
        return { text: 'Speaking', icon: Volume2, color: 'text-purple-400' }
      default:
        return { text: 'Ready to start', icon: Phone, color: 'text-gray-400' }
    }
  }

  const stateDisplay = getStateDisplay()
  const StateIcon = stateDisplay.icon
  const isActive = voiceState !== 'idle'

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="voice-mode-modal sm:max-w-[500px] md:max-w-[600px] p-0 gap-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700 overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
          aria-label="Close voice mode"
        >
          <X className="h-4 w-4 text-white" />
        </button>

        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="voice-mode-bg" />
        </div>

        <div className="relative z-10 flex flex-col h-[600px]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
              Voice Mode
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Powered by ElevenLabs
            </p>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            {/* Visual indicator */}
            <div className="relative">
              {/* Outer pulse rings */}
              {isActive && (
                <>
                  <div className="absolute inset-0 rounded-full">
                    <div className="voice-pulse-ring" />
                  </div>
                  <div className="absolute inset-0 rounded-full">
                    <div className="voice-pulse-ring animation-delay-500" />
                  </div>
                </>
              )}

              {/* Center orb */}
              <div
                className={cn(
                  'relative h-40 w-40 rounded-full transition-all duration-500',
                  voiceState === 'listening' && 'voice-orb-listening',
                  voiceState === 'thinking' && 'voice-orb-thinking',
                  voiceState === 'speaking' && 'voice-orb-speaking',
                  voiceState === 'connecting' && 'voice-orb-connecting',
                  voiceState === 'idle' && 'bg-gradient-to-br from-slate-700 to-slate-600'
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <StateIcon className={cn('h-16 w-16 transition-colors', stateDisplay.color)} />
                </div>
              </div>
            </div>

            {/* State text */}
            <div className="text-center space-y-2">
              <p className={cn('text-xl font-mono font-bold transition-colors', stateDisplay.color)}>
                {stateDisplay.text}
              </p>
              {voiceState === 'listening' && (
                <p className="text-sm text-slate-400 font-mono">
                  Speak naturally, I&apos;m listening...
                </p>
              )}
            </div>

            {/* Error display */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 max-w-md">
                <p className="text-sm text-red-400 font-mono">{error}</p>
              </div>
            )}

            {/* Control button */}
            <Button
              onClick={handleToggleConversation}
              disabled={voiceState === 'connecting'}
              className={cn(
                'h-14 px-8 rounded-full font-mono font-bold text-base transition-all',
                isActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              )}
            >
              {isActive ? (
                <>
                  <PhoneOff className="mr-2 h-5 w-5" />
                  End Conversation
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-5 w-5" />
                  Start Conversation
                </>
              )}
            </Button>
          </div>

          {/* Transcript area */}
          {transcript.length > 0 && (
            <div className="border-t border-slate-700/50 bg-black/20 p-4 max-h-48 overflow-y-auto">
              <p className="text-xs font-mono text-slate-400 mb-2">Transcript:</p>
              <div className="space-y-1">
                {transcript.map((line, index) => (
                  <p key={index} className="text-xs font-mono text-slate-300">
                    {line}
                  </p>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
