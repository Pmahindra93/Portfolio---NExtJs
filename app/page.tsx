"use client"
// app/page.tsx
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PostCarousel } from '@/components/PostCarousel'
import { supabase } from '@/lib/supabase/client'
import { useTheme } from '@/lib/hooks/useTheme'

async function getPosts() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        cover_image,
        created_at,
        published,
        author_id,
        profiles (
          id,
          email
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })

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
  const [currentSlide, setCurrentSlide] = useState(0)
  const images = [
    'https://placehold.co/600x400',
    'https://placehold.co/600x400',
    'https://placehold.co/600x400'
  ]
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true)
        const posts = await getPosts()
        setPosts(posts)
      } catch (error) {
        console.error('Error loading posts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <div className={`min-h-screen flex flex-col ${is90sStyle ? 'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]' : 'bg-background text-foreground font-sans'}`}>
      <main className={`flex-1 w-full pt-16 ${is90sStyle ? 'bg-[#C0C0C0]' : ''}`}>
        <div className="container mx-auto p-4">
          <div className={`p-4 mb-8 ${is90sStyle ? 'bg-[#FFFFFF] border-4 border-[#000000]' : 'bg-card text-card-foreground rounded-lg shadow-md'}`}>
            <h2 className={`text-3xl font-bold mb-4 text-center ${is90sStyle ? 'text-[#FF00FF]' : 'text-primary'}`}>
              Who am I?
            </h2>
            <div className="flex flex-col md:flex-row items-center">
              <Image
                src="https://placehold.co/150x150"
                alt="Prateek Mahindra"
                width={150}
                height={150}
                className={`mb-4 md:mb-0 md:mr-4 ${is90sStyle ? 'border-4 border-[#000000]' : 'rounded-full'}`}
              />
              <p className={`text-lg ${is90sStyle ? '' : 'text-muted-foreground'}`}>
                {is90sStyle
                  ? "Greetings, cyber traveler! I'm Prateek Mahindra, a webmaster extraordinaire and code wizard. Join me on this digital journey as we explore the vast realms of the World Wide Web together!"
                  : "Hi, I'm Prateek Mahindra, a passionate developer and designer creating innovative solutions for web and mobile platforms. With a keen eye for detail and a love for clean, efficient code, I bring ideas to life."}
              </p>
            </div>
          </div>
          <div className={`p-4 mb-8 ${is90sStyle ? 'bg-[#FFFF00] border-4 border-[#FF0000]' : 'bg-accent rounded-lg'}`}>
            <h2 className={`text-3xl font-bold mb-4 text-center ${is90sStyle ? 'text-[#FF0000]' : 'text-accent-foreground'}`}>
              {is90sStyle ? 'My Awesome Projects' : 'Featured Projects'}
            </h2>
            <div className="relative h-[200px] w-full max-w-[300px] mx-auto">
              {images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Project slide ${index + 1}`}
                  fill
                  className={`object-cover transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  } ${is90sStyle ? 'border-4 border-[#000000]' : 'rounded-lg'}`}
                />
              ))}
            </div>
          </div>

          <div className={`p-4 mb-8 ${is90sStyle ? 'bg-[#FFA500] border-4 border-[#0000FF]' : 'bg-muted rounded-lg'}`}>
            <h2 className={`text-3xl font-bold mb-4 text-center ${is90sStyle ? 'text-[#0000FF]' : 'text-primary'}`}>
              {is90sStyle ? 'Latest Updates' : 'Recent Posts'}
            </h2>
            <PostCarousel posts={posts} />
          </div>
        </div>
      </main>
    </div>
  )
}
