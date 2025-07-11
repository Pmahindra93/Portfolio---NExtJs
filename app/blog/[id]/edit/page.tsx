'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MarkdownEditor from '@/components/MarkdownEditor'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { Post } from '@/types/post'
import { supabase } from '@/lib/supabase/client'

export default function EditPost(props: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [params, setParams] = useState<{ id: string } | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { isAdmin, isLoading: isAdminLoading } = useAdmin()

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await props.params
      setParams(resolvedParams)
    }
    loadParams()
  }, [props.params])

  useEffect(() => {
    if (!params?.id || isAdminLoading) return;

    if (!isAdmin) {
      toast({
        title: 'Unauthorized',
        description: 'You must be an admin to edit posts',
        variant: 'destructive',
      })
      router.push('/blog')
      return
    }

    async function fetchPost() {
      if (!params?.id) return;

      try {
        const response = await fetch(`/api/posts/${params.id}`, {
          cache: 'no-store',
          next: { revalidate: 0 }
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to fetch post')
        }
        const data = await response.json()
        if (!data) {
          throw new Error('Post not found')
        }
        setPost(data)
        setTitle(data.title || '')
        setContent(data.content || '')
      } catch (error) {
        console.error('Error fetching post:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch post',
          variant: 'destructive',
        })
        router.push('/blog')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params, router, toast, isAdmin, isAdminLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!params?.id) return;
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update post')
      }

      toast({
        title: 'Success',
        description: 'Post updated successfully',
      })

      router.push('/blog')
      router.refresh()
    } catch (error) {
      console.error('Error updating post:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update post',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isAdminLoading || isLoading || !params?.id) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Content
          </label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Write your blog post in markdown..."
          />
        </div>
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/blog/${params.id}`)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
