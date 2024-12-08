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
  const { is90sStyle } = useTheme()

  useEffect(() => {
    async function fetchPosts() {
      try {
        console.log('Fetching posts...');
        // First fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (postsError) {
          console.error('Error fetching posts:', postsError);
          return;
        }

        if (!postsData) {
          console.log('No posts found');
          setPosts([]);
          return;
        }

        // Then fetch authors for these posts
        const authorIds = [...new Set(postsData.map(post => post.author_id))];
        const { data: authorsData, error: authorsError } = await supabase
          .from('users')
          .select('id, email')
          .in('id', authorIds);

        if (authorsError) {
          console.error('Error fetching authors:', authorsError);
          return;
        }

        // Create an author lookup map
        const authorMap = new Map(authorsData?.map(author => [author.id, author]) || []);

        // Combine posts with author data
        const postsWithAuthors = postsData.map(post => ({
          ...post,
          author: authorMap.get(post.author_id)
        }));

        console.log('Posts fetched:', postsWithAuthors);
        setPosts(postsWithAuthors);
      } catch (error) {
        console.error('Exception while fetching posts:', error);
      }
    }

    fetchPosts()
  }, [])

  return (
    <main className={`flex-1 p-8 ${
      is90sStyle
        ? 'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]'
        : 'bg-background text-foreground'
    }`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${
          is90sStyle
            ? 'text-[#FF00FF] animate-pulse text-center'
            : 'text-primary'
        }`}>
          {is90sStyle ? '📝 Cyber Chronicles 📝' : 'Blog Posts'}
        </h1>

        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post.id} className={`p-6 ${
              is90sStyle
                ? 'bg-[#FFFFFF] border-4 border-[#000000]'
                : 'bg-card'
            }`}>
              <h2 className={`text-2xl font-bold mb-2 ${
                is90sStyle ? 'text-[#0000FF]' : 'text-primary'
              }`}>
                {post.title}
              </h2>
              <p className={`mb-4 ${
                is90sStyle ? '' : 'text-muted-foreground'
              }`}>
                {post.content.substring(0, 200)}...
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <Link href={`/blog/${post.id}`}>
                  <Button variant={is90sStyle ? 'outline' : 'default'} className={
                    is90sStyle
                      ? 'bg-[#00FF00] text-[#000000] border-2 border-[#000000] hover:bg-[#00CC00]'
                      : ''
                  }>
                    {is90sStyle ? '🚀 Read More 🚀' : 'Read More'}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
