'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Linkedin, Github } from 'lucide-react'
import { FeaturedProjectsWrapper, TimelineWrapper, RecentPostsWrapper } from './client-wrappers/DynamicComponents'
import { PostsSkeleton } from './skeletons/PostsSkeleton'
import { NinetiesLayout } from './layouts/NinetiesLayout'
import { useTheme } from '@/lib/hooks/useTheme'
import { Suspense } from 'react'
import { Post } from '@/types/post'

// Define a NinetiesPost interface for the 90s layout
interface NinetiesPost {
  id: string;
  title: string;
  created_at: string;
  slug: string;
}

interface ClientPageProps {
  posts: Post[];
}

export default function ClientPage({ posts }: ClientPageProps) {
  const { isDarkMode, is90sStyle, isMounted } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [themeVersion, setThemeVersion] = useState(0)
  const prevThemeRef = useRef({ is90sStyle, isDarkMode })

  // Convert posts to the format needed by NinetiesLayout
  const getNinetiesPosts = (posts: Post[]): NinetiesPost[] => {
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      created_at: post.created_at,
      slug: post.id // Use id as slug since the Post type doesn't have slug
    }));
  };

  // Handle theme changes
  const handleThemeChange = useCallback((event: Event) => {
    if (!mounted) return;

    const customEvent = event as CustomEvent;
    const newTheme = customEvent.detail;

    // Check if theme actually changed
    if (
      prevThemeRef.current.is90sStyle !== newTheme.is90sStyle ||
      prevThemeRef.current.isDarkMode !== newTheme.isDarkMode
    ) {
      prevThemeRef.current = newTheme;
      // Force re-render by updating theme version
      setThemeVersion(prev => prev + 1);
    }
  }, [mounted]);

  // Set up initial state and event listeners
  useEffect(() => {
    setMounted(true);

    // Listen for theme changes
    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, [handleThemeChange]);

  // Update theme version when theme changes directly
  useEffect(() => {
    if (mounted && (
      prevThemeRef.current.is90sStyle !== is90sStyle ||
      prevThemeRef.current.isDarkMode !== isDarkMode
    )) {
      prevThemeRef.current = { is90sStyle, isDarkMode };
      setThemeVersion(prev => prev + 1);
    }
  }, [is90sStyle, isDarkMode, mounted]);

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted || !isMounted) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>;
  }

  return (
    <div key={`theme-${themeVersion}`}>
      {/* Modern Theme Content */}
      {!is90sStyle && (
        <div id="modern-theme" className="modern-theme">
          {/* Structure copied from ThemeContent.tsx */}
          <main className="container mx-auto px-4 mt-6">
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
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Projects</h2>
                  <a
                    href="https://github.com/Pmahindra93"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-7 h-7 rounded-md border-2 border-slate-600 dark:border-slate-400 hover:border-slate-700 dark:hover:border-slate-300 transition-colors"
                    aria-label="GitHub Profile"
                  >
                    <Github className="w-4 h-4 text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300" />
                  </a>
                </div>
                <Suspense fallback={<div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />}>
                  <FeaturedProjectsWrapper />
                </Suspense>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Recent Posts</h2>
                <Suspense fallback={<PostsSkeleton />}>
                  <RecentPostsWrapper posts={posts} />
                </Suspense>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Journey</h2>
                  <a
                    href="https://linkedin.com/in/pmahindra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-7 h-7 rounded-md border-2 border-blue-600 dark:border-blue-500 hover:border-blue-700 dark:hover:border-blue-400 transition-colors"
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400" />
                  </a>
                </div>
                <Suspense fallback={<div className="h-96 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />}>
                  <TimelineWrapper />
                </Suspense>
              </div>
              {/* Add Footer Here */}
                <footer className="border-t border-slate-200 pt-4 pb-2 dark:border-slate-800">
                  <p className="text-center text-lg text-muted-foreground">
                  Made with ❤️ in North London with 🤖 and 🍵
                </p>
              </footer>
            </div>
          </main>
        </div>
      )}

      {/* 90s Theme Content */}
      {is90sStyle && (
        <div className="theme-90s-element">
          <NinetiesLayout
            posts={getNinetiesPosts(posts)}
            journeyContent={<TimelineWrapper />}
            projectsContent={<FeaturedProjectsWrapper />}
          />
        </div>
      )}
    </div>
  );
}
