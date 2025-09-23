// app/api/posts/route.ts
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

export async function GET(): Promise<NextResponse<Post[] | { error: string }>> {
  try {
    const supabase = await createClient()
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false }) as { data: Post[] | null; error: any }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!posts) {
      return NextResponse.json({ error: 'No posts found' }, { status: 404 })
    }

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<Post | { error: string }>> {
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
        { error: 'Only admins can create posts' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const rawContent = typeof body.content === 'string' ? body.content : ''
    const content = rawContent.trim()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const titleFromRequest = typeof body.title === 'string' ? body.title.trim() : ''
    const title = titleFromRequest || deriveTitleFromContent(content)
    const published = typeof body.published === 'boolean' ? body.published : true
    const coverImage = typeof body.cover_image === 'string' ? body.cover_image : undefined

    const { data: post, error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          content,
          published,
          cover_image: coverImage,
          author_id: user.id,
        },
      ])
      .select()
      .single() as { data: Post | null; error: any }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!post) {
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
