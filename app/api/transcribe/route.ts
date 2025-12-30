import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const runtime = 'edge'

// Validate environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const KV_REST_API_URL = process.env.KV_REST_API_URL
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN

if (!OPENAI_API_KEY) {
  throw new Error('Missing required environment variable: OPENAI_API_KEY')
}

if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
  throw new Error(
    'Missing required Vercel KV environment variables: KV_REST_API_URL and KV_REST_API_TOKEN'
  )
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

// Initialize rate limiter (same as chat route - shared limit)
const ratelimit = new Ratelimit({
  redis: new Redis({
    url: KV_REST_API_URL,
    token: KV_REST_API_TOKEN,
  }),
  limiter: Ratelimit.slidingWindow(10, '24 h'),
  analytics: true,
  prefix: 'chatbot',
})

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : req.headers.get('x-real-ip') ?? 'anonymous'

    // Check rate limit
    const { success, limit, remaining, reset } = await ratelimit.limit(ip)

    if (!success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          limit,
          remaining,
          reset,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }

    // Parse multipart form data
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    // Validate audio file
    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check file size (25MB max)
    if (audioFile.size > 25 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Audio file too large (max 25MB)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'json',
      language: 'en',
    })

    // Return transcribed text
    return new Response(
      JSON.stringify({ text: transcription.text }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    )
  } catch (error: any) {
    console.error('Transcription API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Transcription failed',
        message: error?.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
