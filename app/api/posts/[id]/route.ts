// app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id }
    })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching post' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: body.title,
        content: body.content,
        published: body.published
      }
    })
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Error updating post' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.post.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 })
  }
}
