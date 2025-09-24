'use client'

import Link from 'next/link'
import { Post } from '@/types/post'
import { MoreVertical, Edit, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { renderMarkdownToHtml } from '@/lib/markdown'

const createExcerpt = (content: string): string => {
  if (!content) return ''
  const html = renderMarkdownToHtml(content)
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return ''

  return text.length > 160 ? `${text.slice(0, 160).trim()}…` : text
}

interface RecentPostsProps {
  posts: Post[]
  onPostDeleted?: () => void
}

export function RecentPosts({ posts, onPostDeleted }: RecentPostsProps) {
  const router = useRouter()
  const { isAdmin, isLoading } = useAdmin()

  const excerpts = useMemo(() => {
    const map = new Map<string, string>()
    posts.forEach((post) => {
      map.set(post.id, createExcerpt(post.content))
    })
    return map
  }, [posts])

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete post')
      }

      onPostDeleted?.()
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleEdit = (postId: string) => {
    router.push(`/blog/${postId}/edit`)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {posts.map((post) => (
          <div key={post.id} className="flex items-start justify-between gap-4 p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Link
              href={`/blog/${post.id}`}
              className="flex-1 space-y-1"
            >
              <h3 className="text-lg font-medium">{post.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                {excerpts.get(post.id) ?? ''}
              </p>
            </Link>
            {!isLoading && isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(post.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
