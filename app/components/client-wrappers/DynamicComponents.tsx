'use client'

import dynamic from 'next/dynamic'
import { Post } from '@/types/post'

const DynamicFeaturedProjects = dynamic(
  () => import('../FeaturedProjects').then(mod => mod.FeaturedProjects),
  {
    loading: () => <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />
  }
)

const DynamicTimeline = dynamic(
  () => import('../Timeline').then(mod => mod.Timeline),
  {
    loading: () => <div className="h-96 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />
  }
)

const DynamicRecentPosts = dynamic(
  () => import('../RecentPosts').then(mod => mod.RecentPosts),
  {
    loading: () => <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />
  }
)

export function FeaturedProjectsWrapper() {
  return <DynamicFeaturedProjects />
}

export function TimelineWrapper() {
  return <DynamicTimeline />
}

interface RecentPostsWrapperProps {
  posts: Post[]
}

export function RecentPostsWrapper({ posts }: RecentPostsWrapperProps) {
  return <DynamicRecentPosts posts={posts} />
}
