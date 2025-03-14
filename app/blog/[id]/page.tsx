'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Post } from '@/types/post'
import { Card } from '@/components/ui/card'
import { useTheme } from '@/lib/hooks/useTheme'
import { notFound } from 'next/navigation'

export default function BlogPost(props: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState<{ id: string } | null>(null)
  const { is90sStyle } = useTheme()

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await props.params
      setParams(resolvedParams)
    }
    loadParams()
  }, [props.params])

  useEffect(() => {
    if (!params?.id) return;

    async function fetchPost() {
      if (!params?.id) return;
      try {
        setLoading(true)
        console.log('Fetching post:', params.id)

        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .eq('published', true)
          .single()

        if (error) {
          console.error('Error fetching post:', error)
          notFound()
          return
        }

        if (!data) {
          console.error('Post not found or not published')
          notFound()
          return
        }

        console.log('Post fetched:', data)
        setPost(data)
      } catch (error) {
        console.error('Exception while fetching post:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params?.id])

  if (loading || !params?.id) {
    return (
      <main className={`flex-1 p-8 ${
        is90sStyle
          ? 'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]'
          : 'bg-background text-foreground'
      }`}>
        <div className="max-w-4xl mx-auto">
          <p>Loading post...</p>
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
      <article className="max-w-4xl mx-auto">
        <Card className={`p-8 ${
          is90sStyle
            ? 'bg-[#FFFFFF] border-[#808080] border-2'
            : ''
        }`}>
          <h1 className={`text-3xl font-bold mb-4 ${
            is90sStyle
              ? 'text-[#000080]'
              : ''
          }`}>{post.title}</h1>
          <div className={`mb-8 ${
            is90sStyle
              ? 'text-[#000080]'
              : 'text-muted-foreground'
          }`}>
            <p className="text-sm">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className={`prose max-w-none ${
            is90sStyle
              ? 'text-[#000080]'
              : 'prose-neutral dark:prose-invert'
          }`} dangerouslySetInnerHTML={{ __html: post.content }} />
        </Card>
      </article>
    </main>
  )
}
