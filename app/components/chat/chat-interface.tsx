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
import { Send, Terminal, Mic, MicOff, Loader2, Volume2, AlertCircle } from 'lucide-react'
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

  // Voice-related state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)

  // Voice-related refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const recordingDurationRef = useRef<number>(0)

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

  const processVoiceRecording = useCallback(async (blob: Blob) => {
    // Use ref for synchronous check
    if (recordingDurationRef.current < 1) {
      setVoiceError('Recording too short. Please speak for at least 1 second.')
      setRecordingDuration(0)
      recordingDurationRef.current = 0
      return
    }

    try {
      // Step 3: Transcribe audio
      setIsTranscribing(true)
      setVoiceError(null)

      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!transcribeResponse.ok) {
        if (transcribeResponse.status === 429) {
          const data = await transcribeResponse.json()
          throw new Error(
            `Rate limit exceeded. You have ${data.limit} requests per 24 hours.`
          )
        }
        const errorData = await transcribeResponse.json()
        throw new Error(errorData.error || 'Transcription failed')
      }

      const { text } = await transcribeResponse.json()
      setIsTranscribing(false)

      if (!text || !text.trim()) {
        setVoiceError('No speech detected. Please try again.')
        setRecordingDuration(0)
        recordingDurationRef.current = 0
        return
      }

      // Step 4: Send to chat
      const userMessage: ChatMessage = {
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])
      setRecordingDuration(0)
      recordingDurationRef.current = 0
      setIsLoading(true)

      // Step 5: Get AI response (reuse existing logic)
      abortControllerRef.current = new AbortController()

      const chatResponse = await fetch('/api/chat', {
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

      if (!chatResponse.ok) {
        throw new Error(`Error: ${chatResponse.statusText}`)
      }

      // Handle streaming response
      const reader = chatResponse.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let buffer = ''

      if (!reader) throw new Error('No response stream')

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

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                assistantMessage += content
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

      setIsLoading(false)

      // Step 6: Generate TTS audio
      if (assistantMessage.trim()) {
        setIsGeneratingAudio(true)

        const ttsResponse = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: assistantMessage }),
        })

        setIsGeneratingAudio(false)

        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.blob()
          const audioUrl = URL.createObjectURL(audioBlob)

          // Step 7: Auto-play audio
          const audio = new Audio(audioUrl)
          audioPlayerRef.current = audio

          audio.onplay = () => setIsPlayingAudio(true)
          audio.onended = () => {
            setIsPlayingAudio(false)
            URL.revokeObjectURL(audioUrl)
          }
          audio.onerror = () => {
            setIsPlayingAudio(false)
            URL.revokeObjectURL(audioUrl)
          }

          audio.play().catch((err) => {
            // Silent fail for autoplay restrictions (iOS)
            console.warn('Autoplay blocked:', err)
            setIsPlayingAudio(false)
          })
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return

      setVoiceError(err.message || 'Voice processing failed')
      setIsTranscribing(false)
      setIsLoading(false)
      setIsGeneratingAudio(false)
      setRecordingDuration(0)
      recordingDurationRef.current = 0

      // Remove empty assistant message on error
      setMessages((prev) => {
        if (
          prev.length &&
          prev[prev.length - 1].role === 'assistant' &&
          prev[prev.length - 1].content === ''
        ) {
          return prev.slice(0, -1)
        }
        return prev
      })
    }
  }, [messages])

  const handleVoiceSubmit = useCallback(async () => {
    // Step 1: Toggle recording
    if (!isRecording) {
      try {
        // Check browser support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setVoiceError('Your browser does not support audio recording')
          return
        }

        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          },
        })

        // Determine MIME type
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'

        const mediaRecorder = new MediaRecorder(stream, { mimeType })
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: mimeType })
          stream.getTracks().forEach((track) => track.stop())
          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)

          // Process the recording
          await processVoiceRecording(blob)
        }

        mediaRecorder.start(100)
        setIsRecording(true)
        setRecordingDuration(0)
        recordingDurationRef.current = 0
        setVoiceError(null)

        recordingTimerRef.current = setInterval(() => {
          recordingDurationRef.current += 1
          setRecordingDuration(recordingDurationRef.current)

          if (recordingDurationRef.current >= 60) {
            mediaRecorderRef.current?.stop()
          }
        }, 1000)
      } catch (err: any) {
        console.error('Recording error:', err)
        if (err.name === 'NotAllowedError') {
          setVoiceError('Microphone access denied. Please enable in settings.')
        } else if (err.name === 'NotFoundError') {
          setVoiceError('No microphone found.')
        } else {
          setVoiceError(err.message || 'Failed to start recording')
        }
      }
      return
    }

    // Step 2: Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording, processVoiceRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause()
      }
    }
  }, [])

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

        {/* Recording Indicator */}
        {isRecording && (
          <div className="border-t border-[#00ff00] bg-black/80 px-3 sm:px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="recording-pulse h-2 w-2 rounded-full bg-red-500" />
              <span className="text-[#00ff00]">
                <span className="hidden sm:inline">RECORDING... Click mic to stop</span>
                <span className="sm:hidden">REC {recordingDuration}s</span>
              </span>
              <span className="text-[#00d9ff] hidden sm:inline">{recordingDuration}s</span>
            </div>
          </div>
        )}

        {/* Playback Indicator */}
        {isPlayingAudio && (
          <div className="border-t border-[#00ff00] bg-black/80 px-3 sm:px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Volume2 className="h-3 w-3 text-[#00ff00] animate-pulse" />
              <span className="text-[#00ff00]">PLAYING AUDIO RESPONSE...</span>
              <div className="audio-visualizer ml-2">
                <div className="audio-wave" style={{ animationDelay: '0s' }} />
                <div className="audio-wave" style={{ animationDelay: '0.1s' }} />
                <div className="audio-wave" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        {/* Voice Error Display */}
        {voiceError && (
          <div className="border-t border-red-500 bg-red-900/20 px-3 sm:px-4 py-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <AlertCircle className="h-3 w-3 text-red-400" />
              <span className="text-red-400">{voiceError}</span>
            </div>
          </div>
        )}

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
              disabled={isLoading || isRecording || isTranscribing}
              autoComplete="off"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleVoiceSubmit}
              disabled={isLoading || isTranscribing || isGeneratingAudio}
              className={cn(
                'h-8 w-8 sm:h-10 sm:w-10 voice-button transition-all',
                isRecording && 'voice-button--recording bg-red-500 text-white',
                isTranscribing && 'voice-button--processing bg-[#00d9ff] text-black',
                isPlayingAudio && 'voice-button--playing bg-[#00ff00] text-black',
                !isRecording && !isTranscribing && !isPlayingAudio &&
                  'voice-button--idle bg-[#00ff00] text-black hover:bg-[#00dd00]'
              )}
              aria-label={
                isRecording ? 'Stop recording'
                : isTranscribing ? 'Processing audio'
                : 'Start voice recording'
              }
            >
              {isTranscribing || isGeneratingAudio ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : isPlayingAudio ? (
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
              ) : (
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim() || isRecording}
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
