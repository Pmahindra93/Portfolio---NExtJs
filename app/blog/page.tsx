'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Post } from '@/types/post'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useTheme } from '@/lib/hooks/useTheme'
import { Button } from '@/components/ui/button'

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { is90sStyle } = useTheme()

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        console.log('Fetching posts...')
        
        const { data, error } = await supabase
          .from('posts')
          .select('*')
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
          <p>Loading posts...</p>
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
        <h1 className={`text-3xl font-bold mb-8 ${
          is90sStyle
            ? 'text-[#000080]'
            : ''
        }`}>Blog Posts</h1>
        {posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <Card className={`p-6 hover:shadow-lg transition-shadow ${
                  is90sStyle
                    ? 'bg-[#FFFFFF] border-[#808080] border-2'
                    : ''
                }`}>
                  <h2 className={`text-xl font-semibold mb-2 ${
                    is90sStyle
                      ? 'text-[#000080]'
                      : ''
                  }`}>{post.title}</h2>
                  <p className={`text-sm ${
                    is90sStyle
                      ? 'text-[#000080]'
                      : 'text-muted-foreground'
                  }`}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
