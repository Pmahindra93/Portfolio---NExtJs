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
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/lib/hooks/useAdmin'

interface RecentPostsProps {
  posts: Post[]
  onPostDeleted?: () => void
}

export function RecentPosts({ posts, onPostDeleted }: RecentPostsProps) {
  const router = useRouter()
  const { isAdmin, isLoading } = useAdmin()

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
          <div key={post.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Link
              href={`/blog/${post.id}`}
              className="flex-1"
            >
              <h3 className="text-lg font-medium">{post.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {new Date(post.created_at).toLocaleDateString()}
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
