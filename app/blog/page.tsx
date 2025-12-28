import { createClient } from '@/lib/supabase/server'
import { Post } from '@/types/post'
import BlogPageClient from './BlogPageClient'

// Use ISR - regenerate every 5 minutes
export const revalidate = 300

async function getPosts(): Promise<Post[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, content, published, created_at, updated_at, author_id, cover_image')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      return []
    }

    return (data || []) as Post[]
  } catch (error) {
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()

  return <BlogPageClient posts={posts} />
}
