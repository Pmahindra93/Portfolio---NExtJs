import Link from 'next/link'
import { Post } from '@/types/post'

interface RecentPostsProps {
  posts: Post[]
}

export function RecentPosts({ posts }: RecentPostsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
      <div className="space-y-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.id}`}
            className="block p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <h3 className="text-lg font-medium">{post.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
