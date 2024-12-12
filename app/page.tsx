'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTheme } from '@/lib/hooks/useTheme'
import { Timeline } from '@/components/Timeline'
import { RecentPosts } from '@/components/RecentPosts'
import { Post } from '@/types/post'
import { ThemeToggle } from '@/components/ThemeToggle'

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
      <div className="min-h-screen bg-[#C0C0C0] text-[#000080] font-['Comic_Sans_MS',_cursive]">
        <main className="md:pl-[9rem] pt-16 bg-[#C0C0C0]">
          <div className="p-4">
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
                Latest Updates
              </h2>
              {loading ? (
                <p>Loading posts...</p>
              ) : (
                <RecentPosts posts={posts} />
              )}
            </div>

            <div className="p-4 mb-8 bg-[#ADD8E6] border-4 border-[#008000]">
              <h2 className="text-3xl font-bold mb-4 text-center text-[#008000]">
                My Journey
              </h2>
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
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white"></h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            A showcase of my journey, projects, and thoughts.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">My Journey</h2>
          <Timeline />
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative h-48 rounded-lg overflow-hidden">
              <div className="h-full w-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden">
              <div className="h-full w-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden">
              <div className="h-full w-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          {loading ? (
            <p>Loading posts...</p>
          ) : (
            <RecentPosts posts={posts} />
          )}
        </section>
      </main>
    </div>
  )
}
