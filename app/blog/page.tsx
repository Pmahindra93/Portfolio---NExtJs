'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Post } from '@/types/post'
import { useTheme } from '@/lib/hooks/useTheme'
import { RecentPosts } from '@/components/RecentPosts'

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { is90sStyle } = useTheme()

  const fetchPosts = async () => {
    try {
      setLoading(true)
      console.log('Fetching posts...')
      
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, published, created_at, updated_at, author_id, cover_image')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        return
      }

      console.log('Posts fetched:', data)
      setPosts(data || [])
    } catch (error) {
      console.error('Exception while fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <main className={`flex-1 p-8 ${
        is90sStyle
          ? 'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]'
          : 'bg-background text-foreground'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`flex-1 p-8 ${
      is90sStyle
        ? 'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]'
        : 'bg-background text-foreground'
    }`}>
      <div className="max-w-4xl mx-auto">
        <RecentPosts posts={posts} onPostDeleted={fetchPosts} />
      </div>
    </main>
  )
}
