'use client'

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Terminal, Phone, PhoneOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types/chat'
import { Conversation, type ConnectionType } from '@elevenlabs/client'
import { BarVisualizer, type AgentState } from '@/app/components/ui/bar-visualizer'

interface ChatInterfaceProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

type InterfaceMode = 'chat' | 'voice'
type VoiceState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'

export function ChatInterface({ isOpen, setIsOpen }: ChatInterfaceProps) {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Mode state
  const [mode, setMode] = useState<InterfaceMode>('chat')

  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [voiceTranscript, setVoiceTranscript] = useState<string[]>([])
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const conversationRef = useRef<Conversation | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup on unmount - abort any pending requests and end voice session
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      // End voice conversation on unmount if active
      if (conversationRef.current) {
        conversationRef.current.endSession().catch(console.error)
        conversationRef.current = null
      }
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      })

      // Update remaining messages from rate limit headers
      const remaining = response.headers.get('X-RateLimit-Remaining')
      if (remaining !== null) {
        setRemainingMessages(parseInt(remaining, 10))
      }

      if (!response.ok) {
        if (response.status === 429) {
          // Try to parse JSON response for detailed rate limit info
          let data
          try {
            data = await response.json()
          } catch (parseError) {
            // Fallback if response is not JSON (e.g., from proxy/CDN)
            throw new Error(
              'Rate limit exceeded. You have reached the maximum number of requests. Please try again later.'
            )
          }

          setRemainingMessages(0)
          // Successfully parsed JSON, throw specific error with limit details
          throw new Error(
            `Rate limit exceeded. You have ${data.limit} requests per 24 hours. Try again later.`
          )
        }
        throw new Error(`Error: ${response.statusText}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let streamFinished = false
      let buffer = '' // Buffer for incomplete lines across chunks

      if (!reader) throw new Error('No response stream')

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        },
      ])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // Split on newlines and keep incomplete line in buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep last potentially incomplete line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              streamFinished = true
              break
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                assistantMessage += content
                // Update last message (assistant)
                setMessages((prev) => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage,
                    timestamp: Date.now(),
                  }
                  return newMessages
                })
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }

        // Break outer loop when stream is finished
        if (streamFinished) break
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setError(err.message || 'An error occurred')
      // Remove the empty assistant message placeholder on error
      setMessages((prev) => {
        if (prev.length && prev[prev.length - 1].role === 'assistant' && prev[prev.length - 1].content === '') {
          return prev.slice(0, -1)
        }
        return prev
      })
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  // Voice conversation handlers
  const startConversation = useCallback(async () => {
    try {
      setVoiceState('connecting')
      setVoiceError(null)

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
          const prefix = message.source === 'user' ? 'prateek@ai:~$' : '[AI]'
          setVoiceTranscript((prev) => [...prev, `${prefix} ${message.message}`])
        },
        onError: (error: unknown) => {
          console.error('Voice agent error:', error)
          const errorMessage = error instanceof Error ? error.message : String(error)
          setVoiceError(errorMessage || 'Connection error')
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
      setVoiceError(err.message || 'Failed to connect to voice agent')
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
      setVoiceTranscript([])
    } catch (err: any) {
      console.error('Failed to end conversation:', err)
      setVoiceError('Failed to end conversation')
    }
  }, [])

  // Cleanup on unmount or mode change
  useEffect(() => {
    if (mode === 'chat' && conversationRef.current) {
      endConversation()
    }
  }, [mode, endConversation])

  // Auto-scroll voice transcript
  useEffect(() => {
    if (mode === 'voice') {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [voiceTranscript, mode])

  // Map voice state to agent state for visualizer
  const getAgentState = (): AgentState => {
    switch (voiceState) {
      case 'idle':
        return 'initializing'
      case 'connecting':
        return 'connecting'
      case 'listening':
        return 'listening'
      case 'thinking':
        return 'thinking'
      case 'speaking':
        return 'speaking'
      default:
        return 'initializing'
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        // End voice conversation when dialog closes
        if (!open && conversationRef.current) {
          endConversation()
        }
      }}>
        <DialogContent
          className={cn(
            'terminal-dialog w-full h-[100dvh] sm:h-[500px] md:h-[600px] sm:max-w-lg md:max-w-2xl flex flex-col p-0 gap-0'
          )}
        >
        {/* Terminal Header */}
        <div className="terminal-header flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-[#00ff00]">
          <div className="flex items-center gap-2">
            <Terminal className="h-3 w-3 sm:h-4 sm:w-4" />
            <DialogTitle className="text-xs sm:text-sm font-mono uppercase tracking-widest">
              PRATEEK.AI TERMINAL
            </DialogTitle>
          </div>
          <Button
            onClick={() => {
              if (mode === 'chat') {
                setMode('voice')
                startConversation()
              } else {
                endConversation()
                setMode('chat')
              }
            }}
            className="bg-[#00ff00] text-black hover:bg-[#00dd00] h-7 sm:h-9 px-2 sm:px-3 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider"
            aria-label={mode === 'chat' ? 'Activate voice mode' : 'Back to chat'}
          >
            {mode === 'chat' ? 'Voice Mode' : 'Exit Voice'}
          </Button>
        </div>

        {mode === 'chat' ? (
          <>
            {/* Messages Container with Scanlines */}
            <div className="relative flex-1 overflow-hidden">
              <div className="terminal-scanlines" />
              <div className="h-full overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3 relative z-10">
                {messages.length === 0 && (
                  <div className="terminal-message-assistant">
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-[#00ff00] flex-shrink-0 text-xs sm:text-sm">[AI]</span>
                      <p className="flex-1 text-xs sm:text-sm">
                        Welcome to Prateek.AI Terminal. Ask me anything about
                        Prateek&apos;s work, skills, or projects!
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div key={index}>
                    {message.role === 'user' ? (
                      <div className="terminal-message-user flex items-start gap-1.5 sm:gap-2">
                        <span className="terminal-prompt flex-shrink-0 text-xs sm:text-sm">
                          prateek@ai:~$
                        </span>
                        <p className="flex-1 text-xs sm:text-sm">{message.content}</p>
                      </div>
                    ) : (
                      <div className="terminal-message-assistant flex items-start gap-1.5 sm:gap-2">
                        <span className="text-[#00ff00] flex-shrink-0 text-xs sm:text-sm">[AI]</span>
                        <p className="flex-1 text-xs sm:text-sm">
                          {message.content}
                          {isLoading &&
                            index === messages.length - 1 &&
                            message.content === '' && (
                              <span className="terminal-cursor">_</span>
                            )}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mx-3 sm:mx-4 mb-2 p-2 sm:p-3 bg-red-900/20 border border-red-500 rounded-sm">
                <p className="text-xs sm:text-sm text-red-400 font-mono">{error}</p>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-3 sm:p-4 border-t border-[#00ff00] bg-black"
            >
          <div className="flex gap-1.5 sm:gap-2 items-center">
            <span className="terminal-prompt flex-shrink-0 text-xs sm:text-sm">
              prateek@ai:~$
            </span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="terminal-input flex-1 text-xs sm:text-sm"
              disabled={isLoading}
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="bg-[#00ff00] text-black hover:bg-[#00dd00] h-8 w-8 sm:h-10 sm:w-10"
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <p className="text-[10px] sm:text-xs text-[#00ff00]/60 mt-2 font-mono">
            {remainingMessages !== null 
              ? `${remainingMessages} message${remainingMessages !== 1 ? 's' : ''} remaining`
              : '10 messages per 24h'} · Press Enter to send
          </p>
        </form>
          </>
        ) : (
          /* Voice Mode UI */
          <div className="relative flex-1 overflow-hidden">
            <div className="terminal-scanlines" />
            <div className="h-full flex flex-col items-center justify-center p-6 space-y-6 relative z-10">
              {/* Audio Visualizer */}
              <div className="w-full max-w-2xl">
                <BarVisualizer
                  state={getAgentState()}
                  barCount={24}
                  minHeight={20}
                  maxHeight={120}
                  className="h-32 sm:h-40 md:h-48"
                />
              </div>

              {/* State text */}
              <div className="text-center space-y-2">
                <p className={cn(
                  'text-lg sm:text-xl font-mono font-bold uppercase tracking-wider transition-colors',
                  voiceState === 'idle' && 'text-[#00ff00]',
                  voiceState === 'connecting' && 'text-blue-400',
                  voiceState === 'listening' && 'text-green-400',
                  voiceState === 'thinking' && 'text-yellow-400',
                  voiceState === 'speaking' && 'text-[#00d9ff]'
                )}>
                  {voiceState === 'idle' && 'Ready'}
                  {voiceState === 'connecting' && 'Connecting...'}
                  {voiceState === 'listening' && 'Listening'}
                  {voiceState === 'thinking' && 'Thinking...'}
                  {voiceState === 'speaking' && 'Speaking'}
                </p>
                {voiceState === 'listening' && (
                  <p className="text-xs sm:text-sm text-[#00ff00]/60 font-mono">
                    Speak naturally, I&apos;m listening...
                  </p>
                )}
              </div>

              {/* Error display */}
              {voiceError && (
                <div className="bg-red-900/20 border border-red-500 rounded-sm p-3 max-w-md">
                  <p className="text-xs sm:text-sm text-red-400 font-mono">{voiceError}</p>
                </div>
              )}

              {/* Control button */}
              <Button
                onClick={endConversation}
                disabled={voiceState === 'connecting'}
                className="h-12 sm:h-14 px-6 sm:px-8 font-mono font-bold text-sm sm:text-base uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                <PhoneOff className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                End Conversation
              </Button>

              {/* Transcript */}
              {voiceTranscript.length > 0 && (
                <div className="w-full max-w-md border-t border-[#00ff00] pt-4 max-h-32 overflow-y-auto">
                  <p className="text-[10px] sm:text-xs font-mono text-[#00ff00]/60 mb-2 uppercase">Transcript:</p>
                  <div className="space-y-1">
                    {voiceTranscript.map((line, index) => (
                      <p key={index} className="text-[10px] sm:text-xs font-mono text-[#00ff00]/80">
                        {line}
                      </p>
                    ))}
                    <div ref={transcriptEndRef} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}
