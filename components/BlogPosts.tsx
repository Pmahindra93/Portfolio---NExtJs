"use client"

// components/BlogPosts.tsx
import { useState, useEffect } from 'react'
// import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import MarkdownEditor from './MarkdownEditor'
import { cn } from "@/lib/utils"
import { renderMarkdownToHtml } from '@/lib/markdown'
import { deriveTitleFromContent } from '@/lib/posts'

interface Post {
  id: string
  title: string
  content: string
  published: boolean
  createdAt: string
}

interface BlogPostsProps {
  is90sStyle: boolean
}

export default function BlogPosts({ is90sStyle }: BlogPostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const response = await fetch('/api/posts')
    const data = await response.json()
    setPosts(data)
  }

  const handleCreate = async () => {
    const trimmedContent = newPostContent.trim()

    if (!trimmedContent) {
      alert('Content is required')
      return
    }

    const title = deriveTitleFromContent(trimmedContent, '')

    if (!title) {
      alert('Add a first line to use as the title')
      return
    }

    const createResponse = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content: trimmedContent,
        published: true,
      })
    })

    if (!createResponse.ok) {
      const error = await createResponse.json().catch(() => ({}))
      alert(error.error || 'Failed to create post')
      return
    }
    setNewPostContent('')
    fetchPosts()
  }

  const handleUpdate = async (id: string) => {
    const trimmedContent = editContent.trim()

    if (!trimmedContent) {
      alert('Content is required')
      return
    }

    const title = deriveTitleFromContent(trimmedContent, '')

    if (!title) {
      alert('Add a first line to use as the title')
      return
    }

    const updateResponse = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content: trimmedContent,
      })
    })

    if (!updateResponse.ok) {
      const error = await updateResponse.json().catch(() => ({}))
      alert(error.error || 'Failed to update post')
      return
    }
    setIsEditing(null)
    fetchPosts()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    fetchPosts()
  }

  return (
    <div className="-mx-4 sm:mx-0 sm:px-4">
      <div className="px-4 sm:px-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button className={is90sStyle ? 'bg-[#00FF00] text-black border-2 border-black' : ''}>
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The first non-empty line becomes the post title.
              </p>
              <MarkdownEditor
                value={newPostContent}
                onChange={setNewPostContent}
              />
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 space-y-8 sm:space-y-6 divide-y divide-gray-100 dark:divide-gray-800 sm:divide-y-0">
        {posts.map((post) => (
          <div
            key={post.id}
            className={cn(
              "px-5 py-8 sm:p-6",
              is90sStyle
                ? 'border-2 border-black bg-white'
                : [
                    'bg-white dark:bg-gray-900',
                    'sm:bg-card sm:rounded-lg sm:shadow-sm sm:border dark:sm:border-gray-800'
                  ]
            )}
          >
            {isEditing === post.id ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Update the first non-empty line to change the title.
                </p>
                <MarkdownEditor
                  value={editContent}
                  onChange={setEditContent}
                />
                <Button onClick={() => handleUpdate(post.id)}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">{post.title}</h3>
                <div
                  className={cn(
                    "mt-4 prose dark:prose-invert max-w-none",
                    "prose-headings:font-semibold prose-h2:text-xl prose-h3:text-lg",
                    "prose-p:text-base prose-p:leading-7 prose-p:text-gray-600 dark:prose-p:text-gray-300",
                    "prose-strong:font-semibold prose-strong:text-gray-900 dark:prose-strong:text-gray-50",
                    "prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline",
                    "prose-blockquote:border-l-2 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700",
                    "prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-300",
                    "prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4",
                    "prose-li:text-gray-600 dark:prose-li:text-gray-300",
                    "prose-code:text-sm prose-code:text-gray-800 dark:prose-code:text-gray-200",
                    "prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-md",
                    "sm:prose-p:text-lg sm:prose-p:leading-8"
                  )}
                  dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(post.content) }}
                />
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 space-x-2">
                  <Button
                    variant="outline"
                  onClick={() => {
                    setIsEditing(post.id)
                    setEditContent(post.content)
                  }}
                >
                  Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
