import { createClient } from '@/lib/supabase/server'
import { Post } from '@/types/post'
import { notFound } from 'next/navigation'
import BlogPostClient from './BlogPostClient'

// Use ISR - regenerate every 5 minutes
export const revalidate = 300

async function getPost(id: string): Promise<Post | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single()

    if (error || !data) {
      return null
    }

    return data as Post
  } catch (error) {
    return null
  }
}

export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  return <BlogPostClient post={post} />
}
