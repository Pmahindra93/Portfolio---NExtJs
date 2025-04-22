'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Linkedin } from 'lucide-react'
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
        <div className="modern-theme">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-12">
              <h1 className="text-5xl font-bold mb-6 tracking-tight">Work, Ideas, and Perspectives</h1>
              <div className="prose prose-lg max-w-3xl">
                <p className="text-muted-foreground">
                  Welcome to my corner of the internet, where I showcase my projects, and latest experiments in AI and full-stack development (some of which may or may not involve breaking things before fixing them). From building smarter applications to pondering the future of tech, this is where I share my work, ideas, and occasional epiphanies—usually accompanied by a cup of matcha 🍵 and a questionable number of browser tabs.
                </p>
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-3xl font-semibold mb-8 tracking-tight">Recent Posts</h2>
              <Suspense fallback={<PostsSkeleton />}>
                <RecentPostsWrapper posts={posts} />
              </Suspense>
            </div>

            <div className="mt-16">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-3xl font-semibold tracking-tight">My Journey</h2>
                <a
                  href="https://linkedin.com/in/pmahindra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-1.5 rounded-md border-2 border-blue-200 hover:border-blue-300 transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="h-5 w-5 text-blue-600" />
                </a>
              </div>
              <Suspense fallback={<div>Loading timeline...</div>}>
                <TimelineWrapper />
              </Suspense>
            </div>

            <div className="mt-16 mb-16">
              <h2 className="text-3xl font-semibold mb-8 tracking-tight">Featured Projects</h2>
              <Suspense fallback={<div>Loading projects...</div>}>
                <FeaturedProjectsWrapper />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* 90s Theme Content */}
      {is90sStyle && (
        <div className="theme-90s-element">
          <NinetiesLayout posts={getNinetiesPosts(posts)} />
        </div>
      )}
    </div>
  );
}
