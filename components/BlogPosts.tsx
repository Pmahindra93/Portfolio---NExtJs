"use client"

// components/BlogPosts.tsx
import { useState, useEffect } from 'react'
// import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className={is90sStyle ? 'bg-[#00FF00] text-black border-2 border-black' : ''}>
            New Post
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <Textarea
              placeholder="Content"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            />
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-4 space-y-4">
        {posts.map((post) => (
          <div key={post.id} className={`p-4 ${is90sStyle ? 'border-2 border-black bg-white' : 'bg-card'}`}>
            {isEditing === post.id ? (
              <div className="space-y-2">
                <Input
                  value={editPost.title}
                  onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                />
                <Textarea
                  value={editPost.content}
                  onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                />
                <Button onClick={() => handleUpdate(post.id)}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold">{post.title}</h3>
                <p className="mt-2">{post.content}</p>
                <div className="mt-2 space-x-2">
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
