// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Post, CreatePostInput } from '@/types/post'

export async function GET(): Promise<NextResponse<Post[] | { error: string }>> {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .returns<Post[]>()

    if (error) throw error

    return NextResponse.json(posts)
  } catch (error: unknown) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<Post | { error: string }>> {
  try {
    const body = await request.json() as CreatePostInput
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert([
        {
          title: body.title,
          content: body.content,
          published: body.published ?? false
        }
      ])
      .select()
      .single()
      .returns<Post>()

    if (error) throw error

    return NextResponse.json(post, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 })
  }
}
