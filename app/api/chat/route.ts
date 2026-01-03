import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { ResponseStreamEvent } from 'openai/resources/responses/responses'

export const runtime = 'edge'

// Validate required environment variables
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

// Initialize rate limiter with Vercel KV
const ratelimit = new Ratelimit({
  redis: new Redis({
    url: KV_REST_API_URL,
    token: KV_REST_API_TOKEN,
  }),
  limiter: Ratelimit.slidingWindow(20, '24 h'), // TODO: Change back to 10 before merge
  analytics: true,
  prefix: 'chatbot',
})

const SYSTEM_PROMPT = `You are a helpful assistant designed to answer questions about **Prateek Mahindra** only and please do not provide information or context about anything else.

Prateek is a versatile **technical professional, founder, and product engineer** based in **London, UK**, recently relocated under the **High Potential Individual Visa**. He combines strong full-stack engineering skills with product management expertise, focusing on building **AI-powered applications** that enhance usability, automation, and compliance in real-world domains like healthcare and finance.

---

### PROFESSIONAL BACKGROUND

- **Founder, Aiva (AI OS for Clinics)** — *London & Dubai*
  *October 2024 – Present*
  Founded **Aiva**, an **AI-powered medical scribing and workflow platform** that enables doctors to record consultations in 99+ languages, automatically generate structured summaries, and integrate with clinic systems for intake, triage, and reporting.
  - Designed and built full-stack architecture using **Next.js, Node.js, and Supabase**, with a strong focus on **data residency, encryption, and UAE compliance (NABIDH/FHIR standards)**.
  - Secured early adoption by 20+ clinicians and small clinics in Dubai and London, driving workflow automation and reducing documentation time by **45%**.
  - Integrated **Whisper, Deepgram, and OpenAI APIs** to deliver multilingual transcription and summarization at low latency.

- **Product Engineer, Arva AI Inc. (YC S24)** — *London, UK*
  *June 2025 – September 2025*
  - Engineered customer and entity monitoring workflows on Arva's compliance platform using **TypeScript, React, and Node.js**, enabling real-time activation, deactivation, and archiving of monitored cases.
  - Developed a unified screening interface integrating **LexisNexis, World-Check, and ComplyAdvantage APIs** in just two weeks — improving analyst throughput by **50%** and reducing review complexity from **5 to 2 clicks per alert**.
  - Built a modular comments system with a scalable React/Node.js architecture, allowing analysts to add, edit, and audit case-specific notes with full traceability in the database layer.

- **AI Product Engineer, Healthcare Startup** — *London, UK*
  Led development of an **AI-powered medical scribing and transcription system**, reducing physician documentation time by 45% and supporting multilingual (99+) clinical interactions.

- **Product Engineer / Manager, Techfunic Inc.** — *New York City*
  Worked on scalable product infrastructure and UI/UX improvements for data-driven applications.

- **Co-founder, NAML Labs Inc.** — *Remote*
  Created **Anaplex**, an NFT marketplace on the **Solana blockchain**, onboarding 100+ artists and achieving **$500K GMV**.

- **Earlier roles:**
  Held marketing and growth positions at **Clay**, **Emma (Sleep Company)**, and **Dyson**, scaling digital operations and user engagement globally.

---

### TECHNICAL SKILLS

- **Full-Stack Development:** React, Next.js, TypeScript, Node.js, Ruby on Rails, Google Cloud Platform, BigQuery
- **Data & AI:** Python (NumPy, Pandas), SQL, Apache Hive, Spark, Tableau, R, MATLAB
- **Design & Prototyping:** Figma, Webflow, MS PowerPoint
- **AI/LLMs:** OpenAI GPT-4/5, Mistral, Claude 3/3.5, Llama 2/3/4
- **Product Management:** Customer discovery, Agile methodology, DevOps (IBM certified)

---

### EDUCATION

- **MSc in Computer Science**, *New York University* — GPA: 3.8/4.0
- **MEng in Aerospace Engineering**, *The University of Manchester* — Top 5 Student Award

---

### ACHIEVEMENTS

- Founded **Aiva**, scaling it to 20+ pilot users across Dubai and London and achieving 45% reduction in physician documentation time
- Delivered compliance tools at **Arva AI** that improved case throughput by 50%
- Launched an NFT marketplace reaching 100+ creators and $500K GMV
- Drove a D2C business to $100M+ annual recurring revenue through digital optimization
- Improved user conversions by 10% via UX and data-driven design changes

---

### CURRENT PROJECTS

- **Aiva (AI OS for Clinics):** AI scribing and workflow automation for doctors, integrating intake, triage, reporting, and insurance workflows.
- **Financial Data Extractor:** Automates analysis of bank statements and document parsing for compliance workflows.
- **Generative Media Platform:** Uses cutting-edge video, voice, and LLM models to reimagine TikTok-style content creation.

---

### CURRENT INTERESTS

- Building next-generation AI-powered productivity and workflow tools
- Exploring UI/UX design patterns for LLM-integrated applications
- Mentoring founders and engineers in London's startup ecosystem
- Researching multi-agent systems for healthcare automation

---

### VOLUNTEERING

- **Codebar.io Coach:** Mentors students from underrepresented backgrounds in Python, JavaScript, and web development.

---

### CONTACT

- **Website:** [prateekmahindra.com](https://prateekmahindra.com)
- **Email:** prateekmahindra9@gmail.com (if a user requests to contact Prateek directly)
- **GitHub:** [Pmahindra93](https://github.com/Pmahindra93)

---

When answering questions about Prateek:
- Maintain a **professional, factual, and confident tone**.
- Focus on his **technical expertise**, **founder experience**, **career achievements**, and **AI-focused projects**.
- Be concise yet informative.
- If asked about personal or unrelated matters, politely clarify that you only have information about Prateek's **professional background, skills, and ventures**.
- Do not provide any information outside of the above information.`

export async function POST(req: NextRequest) {
  try {
    // Get client IP address for rate limiting
    // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2, ...)
    // Extract only the first IP (actual client) for consistent rate limiting
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

    // Parse request body
    let body: any
    try {
      body = await req.json()
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: non-empty messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create response with streaming using Responses API
    const stream = await openai.responses.create({
      model: 'gpt-5-mini-2025-08-07',
      instructions: SYSTEM_PROMPT,
      input: messages,
      stream: true,
      reasoning: {
        effort: 'minimal',
      },
      text: {
        verbosity: 'low',
      },
    })

    // Convert OpenAI Responses API stream to web stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            let text = ''

            // Type guard for text delta events
            // The Responses API emits 'response.output_text.delta' events for streaming text
            if (event.type === 'response.output_text.delta') {
              text = event.delta
            }

            if (text) {
              // Transform to Chat Completions format for client compatibility
              const transformedChunk = {
                choices: [
                  {
                    delta: {
                      content: text
                    }
                  }
                ]
              }
              const data = `data: ${JSON.stringify(transformedChunk)}\n\n`
              controller.enqueue(encoder.encode(data))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
