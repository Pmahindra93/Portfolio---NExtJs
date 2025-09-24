'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Post } from '@/lib/types'
import { renderMarkdownToHtml } from '@/lib/markdown'

interface PostCarouselProps {
  posts: Post[]
  loading?: boolean
}

export function PostCarousel({ posts, loading = false }: PostCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    if (posts.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % posts.length)
  }, [posts.length])

  useEffect(() => {
    if (posts.length === 0) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide, posts.length])

  if (loading) {
    return (
      <div className="relative w-full h-[500px] bg-muted animate-pulse rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    )
  }

  if (!posts.length) {
    return (
      <div className="relative w-full h-[500px] bg-muted rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">No posts available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-lg">
      <div
        className="absolute w-full h-full transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: `translateX(${index * 100}%)` }}
          >
            <div className="relative w-full h-full">
              {post.cover_image ? (
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority={index === currentSlide}
                />
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No cover image</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                <div
                  className="line-clamp-2 text-sm text-gray-200"
                  dangerouslySetInnerHTML={{
                    // renderMarkdownToHtml sanitizes markdown (raw HTML disabled)
                    __html: renderMarkdownToHtml(post.content),
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + posts.length) % posts.length)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {posts.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
