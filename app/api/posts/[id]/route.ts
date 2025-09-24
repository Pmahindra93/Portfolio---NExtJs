// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Post } from '@/types/post'
import { deriveTitleFromContent } from '@/lib/posts'
import { SupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

async function checkIsAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  return roleData?.role === 'admin'
}

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params
  try {
    const supabase = await createClient()
    const { data: post, error } = await supabase
      .from('posts')
      .select('id, title, content, published, created_at, updated_at, author_id')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isAdmin = await checkIsAdmin(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can edit posts' },
        { status: 403 }
      )
    }

    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 }
      )
    }

    const rawContent = typeof (body as Record<string, unknown>).content === 'string'
      ? ((body as Record<string, unknown>).content as string).trim()
      : ''
    if (!rawContent) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const bodyRecord = body as Record<string, unknown>

    const titleFromRequest = typeof bodyRecord.title === 'string'
      ? (bodyRecord.title as string).trim()
      : ''
    const title = titleFromRequest || deriveTitleFromContent(rawContent)

    const updates: Record<string, unknown> = {
      title,
      content: rawContent,
      updated_at: new Date().toISOString(),
    }

    if (typeof bodyRecord.published === 'boolean') {
      updates.published = bodyRecord.published as boolean
    }

    if (typeof bodyRecord.cover_image === 'string') {
      const trimmedCover = (bodyRecord.cover_image as string).trim()
      updates.cover_image = trimmedCover.length ? trimmedCover : undefined
    }

    const { data: post, error: updateError } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isAdmin = await checkIsAdmin(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can delete posts' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Post deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
