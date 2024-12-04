'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Post } from '@/types/post'
import { Card } from '@/components/ui/card'
import { useTheme } from '@/lib/hooks/useTheme'
import { notFound } from 'next/navigation'

export default function BlogPost({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const { is90sStyle } = useTheme()

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, author:auth.users(email)')
          .eq('id', params.id)
          .single()

        if (error) {
          console.error('Error fetching post:', error)
          notFound()
          return
        }

        setPost(data)
      } catch (error) {
        console.error('Exception while fetching post:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  if (loading) {
    return (
      <main className={`flex-1 p-8 ${
        is90sStyle
          ? 'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]'
          : 'bg-background text-foreground'
      }`}>
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  if (!post) {
    return notFound()
  }

  return (
    <main className={`flex-1 p-8 ${
      is90sStyle
        ? 'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]'
        : 'bg-background text-foreground'
    }`}>
      <div className="max-w-4xl mx-auto">
        <Card className={`p-6 ${
          is90sStyle ? 'border-4 border-[#FF00FF]' : ''
        }`}>
          <h1 className={`text-3xl font-bold mb-2 ${
            is90sStyle ? 'text-[#FF0000]' : ''
          }`}>
            {post.title}
          </h1>
          <div className={`flex items-center gap-2 mb-8 text-sm ${
            is90sStyle ? 'text-[#0000FF]' : 'text-muted-foreground'
          }`}>
            <span>
              {new Date(post.created_at).toLocaleDateString()}
            </span>
            {post.author && (
              <>
                <span>•</span>
                <span>By {(post.author as any).email}</span>
              </>
            )}
          </div>
          <div className={`prose max-w-none ${
            is90sStyle ? 'text-[#000080]' : ''
          }`}>
            {post.content}
          </div>
        </Card>
      </div>
    </main>
  )
}
