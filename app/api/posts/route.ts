// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(posts)
  } catch (error: unknown) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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

    if (error) throw error

    return NextResponse.json(post, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 })
  }
}
