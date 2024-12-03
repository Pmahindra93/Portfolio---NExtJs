// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { Post, UpdatePostInput } from '@/types/post'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<Post | { error: string }>> {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('*, author:users(email)')
      .eq('id', params.id)
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
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<Post | { error: string }>> {
  try {
    const body = await request.json() as UpdatePostInput

    // Validate that at least one field is being updated
    if (!body.title && !body.content && typeof body.published !== 'boolean') {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data: post, error } = await supabase
      .from('posts')
      .update({
        ...(body.title && { title: body.title }),
        ...(body.content && { content: body.content }),
        ...(typeof body.published === 'boolean' && { published: body.published })
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(post)
  } catch (error: unknown) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Error updating post' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
