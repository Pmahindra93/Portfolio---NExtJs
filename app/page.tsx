'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTheme } from '@/lib/hooks/useTheme'
import { Timeline } from '@/components/Timeline'
import { RecentPosts } from '@/components/RecentPosts'
import { Post } from '@/types/post'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Linkedin } from 'lucide-react'
import { FeaturedProjects } from '@/components/FeaturedProjects'

async function getPosts() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching posts:', error)
      return []
    }

    return posts || []
  } catch (error) {
    console.error('Error in getPosts:', error)
    return []
  }
}

function PostsSkeleton({ is90sStyle }: { is90sStyle: boolean }) {
  if (is90sStyle) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-[#FFFFFF] border-4 border-[#000000] animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-[#C0C0C0] border-2 border-[#000000] flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-5 w-3/4 bg-[#C0C0C0] mb-3 border border-[#808080]"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-[#C0C0C0] border border-[#808080]"></div>
                  <div className="h-4 w-5/6 bg-[#C0C0C0] border border-[#808080]"></div>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="h-4 w-24 bg-[#C0C0C0] border border-[#808080]"></div>
                  <div className="h-4 w-16 bg-[#C0C0C0] border border-[#808080]"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-md flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
              </div>
              <div className="mt-3 flex items-center space-x-2">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  const { is90sStyle } = useTheme()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  // Load posts
  useEffect(() => {
    async function loadPosts() {
      const fetchedPosts = await getPosts()
      setPosts(fetchedPosts)
      setLoading(false)
    }

    loadPosts()
  }, [])

  if (is90sStyle) {
    return (
      <div className="min-h-screen bg-[#C0C0C0] text-[#000080] font-['Comic_Sans_MS',_cursive] md:pr-20">
        <main className="md:ml-64 pt-16 bg-[#C0C0C0]">
          <div className="p-4 md:pl-4">
            <div className="p-4 mb-8 bg-[#FFFFFF] border-4 border-[#000000]">
              <h2 className="text-3xl font-bold mb-4 text-center text-[#FF00FF]">
                Who am I?
              </h2>
              <div className="flex flex-col md:flex-row items-center">
                <div className="mb-4 md:mb-0 md:mr-4 border-4 border-[#000000]">
                  <p>Image placeholder</p>
                </div>
                <p>
                  Greetings, cyber traveler! I&apos;m Prateek Mahindra, a webmaster extraordinaire and code wizard. Join me on this digital journey as we explore the vast realms of the World Wide Web together!
                </p>
              </div>
            </div>

            <div className="p-4 mb-8 bg-[#FFFF00] border-4 border-[#FF0000]">
              <h2 className="text-3xl font-bold mb-4 text-center text-[#FF0000]">
                My Awesome Projects
              </h2>
              <p>
                Here are some of the projects I&apos;ve worked on. Each one represents a unique challenge and learning experience.
              </p>
            </div>

            <div className="p-4 mb-8 bg-[#FFA500] border-4 border-[#0000FF]">
              <h2 className="text-3xl font-bold mb-4 text-center text-[#0000FF]">
                Latest Posts
              </h2>
              {loading ? (
                <PostsSkeleton is90sStyle={true} />
              ) : (
                <RecentPosts posts={posts} />
              )}
            </div>

            <div className="p-4 mb-8 bg-[#ADD8E6] border-4 border-[#008000]">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-3xl font-bold text-center text-[#008000]">
                  My Journey
                </h2>
                <a
                  href="https://www.linkedin.com/in/pmahindra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Linkedin className="w-6 h-6 text-[#0077B5] hover:text-[#00669C]" />
                </a>
              </div>
              <Timeline />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <main className="container mx-auto px-4 py-8">
        <section className="mb-16">
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Work, Ideas, and Perspectives</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Welcome to my corner of the internet, where I showcase my CV, projects, and latest experiments in AI and full-stack development (some of which may or may not involve breaking things before fixing them). From building smarter applications to pondering the future of tech, this is where I share my work, ideas, and occasional epiphanies—usually accompanied by a cup of matcha 🍵 and a questionable number of browser tabs.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">Recent Posts</h2>
          {loading ? (
            <PostsSkeleton is90sStyle={false} />
          ) : (
            <RecentPosts posts={posts} />
          )}
        </section>

        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
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
          <Timeline />
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">Featured Projects</h2>
          <FeaturedProjects />
        </section>
      </main>
    </div>
  )
}
