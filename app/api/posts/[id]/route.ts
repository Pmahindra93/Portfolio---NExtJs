// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Post, UpdatePostInput } from '@/types/post'

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse<Post | { error: string }>> {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', context.params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(post)
  } catch (error: unknown) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Error fetching post' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
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
      .eq('id', context.params.id)
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
  _request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', context.params.id)

    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error: unknown) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 })
  }
}
