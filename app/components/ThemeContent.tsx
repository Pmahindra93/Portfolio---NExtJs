'use client'

import { useEffect, useState } from 'react'
import { Linkedin } from 'lucide-react'
import { FeaturedProjectsWrapper, TimelineWrapper, RecentPostsWrapper } from './client-wrappers/DynamicComponents'
import { PostsSkeleton } from './skeletons/PostsSkeleton'
import { NinetiesLayout } from './layouts/NinetiesLayout'
import { useTheme } from '@/lib/hooks/useTheme'
import { Suspense } from 'react'
import { Post as PostType } from '@/types/post'

// Define the Post interface for NinetiesLayout
interface NinetiesPost {
  id: string
  title: string
  created_at: string
  slug: string
}

interface ThemeContentProps {
  posts: any[] // Use any[] to accept posts from server
}

export function ThemeContent({ posts }: ThemeContentProps) {
  const { is90sStyle } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only show content after mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  // Convert posts to the format needed by NinetiesLayout
  const getNinetiesPosts = (): NinetiesPost[] => {
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      created_at: post.created_at,
      slug: post.id // Use id as slug if slug is not available
    }));
  };

  if (!mounted) {
    // Return a minimal loading state that won't cause hydration issues
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      {/* Modern Design - Only render when 90s style is not active */}
      {!is90sStyle && (
        <div id="modern-theme" className="modern-theme">
          <main className="container mx-auto px-4 mt-16">
            <div className="space-y-12">
              <div>
                <h1 className="text-4xl font-bold mb-3 text-slate-900 dark:text-white">
                  Work, Ideas, and Perspectives
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Welcome to my corner of the internet, where I showcase my CV, projects, and latest experiments in AI and full-stack development (some of which may or may not involve breaking things before fixing them). From building smarter applications to pondering the future of tech, this is where I share my work, ideas, and occasional epiphanies—usually accompanied by a cup of matcha 🍵 and a questionable number of browser tabs.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Recent Posts</h2>
                <Suspense fallback={<PostsSkeleton />}>
                  <RecentPostsWrapper posts={posts as PostType[]} />
                </Suspense>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Journey</h2>
                  <a
                    href="https://www.linkedin.com/in/pmahindra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-7 h-7 rounded-md border-2 border-blue-600 dark:border-blue-500 hover:border-blue-700 dark:hover:border-blue-400 transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400" />
                  </a>
                </div>
                <Suspense fallback={<div className="h-96 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />}>
                  <TimelineWrapper />
                </Suspense>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Projects</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Coming Soon
                  </span>
                </div>
                <Suspense fallback={<div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />}>
                  <FeaturedProjectsWrapper />
                </Suspense>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* 90s Design - Only render when 90s style is active */}
      {is90sStyle && <NinetiesLayout posts={getNinetiesPosts()} />}
    </>
  )
}
