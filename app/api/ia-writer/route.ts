import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { deriveTitleFromContent } from '@/lib/posts'

export const dynamic = 'force-dynamic'

interface IAWriterPayload {
  content?: string
  published?: boolean
  cover_image?: string
}

function getBearerToken(headerValue: string | null): string | null {
  if (!headerValue) return null
  const match = headerValue.match(/Bearer\s+(.*)/i)
  return match ? match[1].trim() : null
}

export async function POST(request: NextRequest) {
  const expectedToken = process.env.IA_WRITER_TOKEN
  const authorId = process.env.IA_WRITER_AUTHOR_ID

  const supabaseAdmin = getSupabaseAdmin()

  if (!expectedToken) {
    console.error('IA_WRITER_TOKEN is not configured')
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
  }

  if (!authorId) {
    console.error('IA_WRITER_AUTHOR_ID is not configured')
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
  }

  if (!supabaseAdmin) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not configured')
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
  }

  const incomingToken = getBearerToken(request.headers.get('authorization'))

  if (!incomingToken || incomingToken !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: IAWriterPayload
  try {
    payload = await request.json()
  } catch (error) {
    console.error('Invalid JSON payload from iA Writer:', error)
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const rawContent = typeof payload.content === 'string' ? payload.content : ''
  const content = rawContent.trim()

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const title = deriveTitleFromContent(content)
  const published = typeof payload.published === 'boolean' ? payload.published : true
  const coverImage = typeof payload.cover_image === 'string' ? payload.cover_image : undefined

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert({
      title,
      content,
      published,
      cover_image: coverImage,
      author_id: authorId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating post via iA Writer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Post created',
    post: data,
  })
}
