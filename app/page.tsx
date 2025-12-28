import { createClient } from '@/lib/supabase/server'
import ClientPage from '@/app/components/ClientPage'
import { Post } from '@/types/post'

// Use ISR (Incremental Static Regeneration) - regenerate every 5 minutes
export const revalidate = 300

// Fetch posts from Supabase
async function getPosts() {
  try {
    const supabase = await createClient()

    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content, published, created_at, updated_at, author_id, cover_image')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      return []
    }

    return posts as Post[]
  } catch (error) {
    return []
  }
}

export default async function LandingPage() {
  const posts = await getPosts()

  return <ClientPage posts={posts} />
}
