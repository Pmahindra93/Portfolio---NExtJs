import { NextRequest } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'edge'

// Validate environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  throw new Error('Missing required environment variable: OPENAI_API_KEY')
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    // Parse request
    let body: any
    try {
      body = await req.json()
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { text } = body

    // Validate text
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid text parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (text.length > 4096) {
      return new Response(
        JSON.stringify({ error: 'Text too long (max 4096 characters)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenAI TTS API
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'onyx',
      input: text,
      response_format: 'mp3',
      speed: 1.0,
    })

    // Stream audio response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error: any) {
    console.error('TTS API error:', error)
    return new Response(
      JSON.stringify({
        error: 'TTS generation failed',
        message: error?.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
