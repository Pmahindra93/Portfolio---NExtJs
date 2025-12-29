'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types/chat'

interface ChatInterfaceProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function ChatInterface({ isOpen, setIsOpen }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
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

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json()
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
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

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
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setError(err.message || 'An error occurred')
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((m) => m.content !== ''))
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn(
          'terminal-dialog w-full h-[100dvh] sm:h-[500px] md:h-[600px] sm:max-w-lg md:max-w-2xl flex flex-col p-0 gap-0'
        )}
      >
        {/* Terminal Header */}
        <div className="terminal-header flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b border-[#00ff00]">
          <Terminal className="h-3 w-3 sm:h-4 sm:w-4" />
          <DialogTitle className="text-xs sm:text-sm font-mono uppercase tracking-widest">
            PRATEEK.AI TERMINAL
          </DialogTitle>
        </div>

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
            10 messages per 24h · Press Enter to send
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
