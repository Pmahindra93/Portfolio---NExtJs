"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Linkedin, Github } from "lucide-react";
import {
  FeaturedProjectsWrapper,
  TimelineWrapper,
  RecentPostsWrapper,
} from "./client-wrappers/DynamicComponents";
import { PostsSkeleton } from "./skeletons/PostsSkeleton";
import { NinetiesLayout } from "./layouts/NinetiesLayout";
import { useTheme } from "@/lib/hooks/useTheme";
import { Suspense } from "react";
import { Post } from "@/types/post";
import { Hero } from "./Hero";
import { TechStack } from "./TechStack";
import { Contact } from "./Contact";

// Define a NinetiesPost interface for the 90s layout
interface NinetiesPost {
  id: string;
  title: string;
  created_at: string | null;
  slug: string;
}

interface ClientPageProps {
  posts: Post[];
}

export default function ClientPage({ posts }: ClientPageProps) {
  const { isDarkMode, is90sStyle, isMounted } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [themeVersion, setThemeVersion] = useState(0);
  const prevThemeRef = useRef({ is90sStyle, isDarkMode });

  // Convert posts to the format needed by NinetiesLayout
  const getNinetiesPosts = (posts: Post[]): NinetiesPost[] => {
    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      created_at: post.created_at,
      slug: post.id, // Use id as slug since the Post type doesn't have slug
    }));
  };

  // Handle theme changes
  const handleThemeChange = useCallback(
    (event: Event) => {
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
        setThemeVersion((prev) => prev + 1);
      }
    },
    [mounted]
  );

  // Set up initial state and event listeners
  useEffect(() => {
    setMounted(true);

    // Listen for theme changes
    window.addEventListener("themeChanged", handleThemeChange);

    return () => {
      window.removeEventListener("themeChanged", handleThemeChange);
    };
  }, [handleThemeChange]);

  // Update theme version when theme changes directly
  useEffect(() => {
    if (
      mounted &&
      (prevThemeRef.current.is90sStyle !== is90sStyle ||
        prevThemeRef.current.isDarkMode !== isDarkMode)
    ) {
      prevThemeRef.current = { is90sStyle, isDarkMode };
      setThemeVersion((prev) => prev + 1);
    }
  }, [is90sStyle, isDarkMode, mounted]);

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted || !isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div key={`theme-${themeVersion}`}>
      {/* Modern Theme Content (Premium Retro) */}
      {!is90sStyle && (
        <div id="modern-theme" className="modern-theme">
          <Hero />

          {/* Hide TechStack on mobile */}
          <div className="hidden sm:block">
            <TechStack />
          </div>

          <main className="container mx-auto px-4 mt-12 sm:mt-16 md:mt-20 mb-12 sm:mb-16 md:mb-20">
            <div className="space-y-12 sm:space-y-16 md:space-y-24">
              <div id="projects" className="scroll-mt-24">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b-2 border-slate-900 dark:border-white border-dashed">
                   <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex-shrink-0">
                    <span className="font-mono font-bold text-lg sm:text-xl">01</span>
                   </div>
                   <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                    Featured Projects
                  </h2>
                </div>

                <Suspense
                  fallback={
                    <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800" />
                  }
                >
                  <FeaturedProjectsWrapper />
                </Suspense>
              </div>

              <div>
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b-2 border-slate-900 dark:border-white border-dashed">
                   <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex-shrink-0">
                    <span className="font-mono font-bold text-lg sm:text-xl">02</span>
                   </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                    Recent Logs
                  </h2>
                </div>
                <Suspense fallback={<PostsSkeleton />}>
                  <RecentPostsWrapper posts={posts} />
                </Suspense>
              </div>

              <div>
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b-2 border-slate-900 dark:border-white border-dashed">
                   <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex-shrink-0">
                    <span className="font-mono font-bold text-lg sm:text-xl">03</span>
                   </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                        My Journey
                    </h2>
                    <a
                        href="https://linkedin.com/in/pmahindra"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center w-8 h-8 border-2 border-slate-900 dark:border-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors"
                        aria-label="LinkedIn Profile"
                    >
                        <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <Suspense
                  fallback={
                    <div className="h-96 animate-pulse bg-slate-200 dark:bg-slate-800" />
                  }
                >
                  <TimelineWrapper />
                </Suspense>
              </div>
            </div>
          </main>

          <Contact />

          <footer className="border-t-2 border-slate-900 dark:border-white py-6 sm:py-8 bg-slate-50 dark:bg-slate-900">
            <div className="container mx-auto px-4 text-center">
                <p className="font-mono text-xs sm:text-sm text-slate-500 uppercase tracking-widest">
                  © {new Date().getFullYear()} Prateek Mahindra. System.Active(true)
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:gap-4 font-mono text-xs text-slate-400">
                    <span>LOCATION: LONDON_UK</span>
                    <span className="hidden sm:inline">::</span>
                    <span>STATUS: BUILDING</span>
                </div>
            </div>
          </footer>
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
