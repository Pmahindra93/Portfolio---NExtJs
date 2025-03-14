"use client"

// components/BlogPosts.tsx
import { useState, useEffect } from 'react'
// import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import RichTextEditor from './RichTextEditor'
import { cn } from "@/lib/utils"

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
  const [newPost, setNewPost] = useState({ title: '', content: '', published: true })
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editPost, setEditPost] = useState({ title: '', content: '', published: true })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const response = await fetch('/api/posts')
    const data = await response.json()
    setPosts(data)
  }

  const handleCreate = async () => {
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    })
    setNewPost({ title: '', content: '', published: true })
    fetchPosts()
  }

  const handleUpdate = async (id: string) => {
    await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editPost)
    })
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
              <Input
                placeholder="Title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <RichTextEditor
                value={newPost.content}
                onChange={(content) => setNewPost({ ...newPost, content })}
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
                <Input
                  value={editPost.title}
                  onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                />
                <RichTextEditor
                  value={editPost.content}
                  onChange={(content) => setEditPost({ ...editPost, content })}
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
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(post.id)
                      setEditPost(post)
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
