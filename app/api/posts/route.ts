// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Post, CreatePostInput } from '@/types/post'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
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
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isAdmin = await checkIsAdmin(supabase, session.user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can create posts' },
        { status: 403 }
      )
    }

    const input: CreatePostInput = await request.json()

    const { data: post, error } = await supabase
      .from('posts')
      .insert([
        {
          ...input,
          author_id: session.user.id,
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
