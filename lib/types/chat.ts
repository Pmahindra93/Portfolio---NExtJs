export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
}

export interface ChatRequest {
  messages: ChatMessage[]
}

export interface ChatResponse {
  message: string
  error?: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

export interface TranscribeResponse {
  text: string
  error?: string
}

export interface TTSRequest {
  text: string
}
