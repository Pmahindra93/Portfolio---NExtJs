'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Post } from '@/types/post'
import { Card } from '@/components/ui/card'
import { useTheme } from '@/lib/hooks/useTheme'
import { notFound } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { formatLastModified } from '@/lib/utils/date'

// Dynamic import for markdown preview to avoid SSR issues
const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
)

export default function BlogPost(props: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState<{ id: string } | null>(null)
  const { isDarkMode, is90sStyle, isMounted } = useTheme()
  const [themeVersion, setThemeVersion] = useState(0)
  const [clientMounted, setClientMounted] = useState(false)
  const prevThemeRef = useRef({ is90sStyle, isDarkMode })

  // Handle theme changes
  const handleThemeChange = useCallback((event: Event) => {
    if (!clientMounted) return;

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
  }, [clientMounted]);

  // Set up initial state and event listeners
  useEffect(() => {
    setClientMounted(true);

    // Listen for theme changes
    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, [handleThemeChange]);

  // Update theme version when theme changes directly
  useEffect(() => {
    if (clientMounted && (
      prevThemeRef.current.is90sStyle !== is90sStyle ||
      prevThemeRef.current.isDarkMode !== isDarkMode
    )) {
      prevThemeRef.current = { is90sStyle, isDarkMode };
      setThemeVersion(prev => prev + 1);
    }
  }, [is90sStyle, isDarkMode, clientMounted]);

  // Add 90s animation styles to the document if needed
  useEffect(() => {
    if (is90sStyle && clientMounted) {
      // Create a style element for the blinking animation
      const styleEl = document.createElement('style');
      styleEl.id = 'ninetiesAnimations';
      styleEl.textContent = `
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `;
      document.head.appendChild(styleEl);

      return () => {
        // Clean up the style element when component unmounts or theme changes
        const existingStyle = document.getElementById('ninetiesAnimations');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [is90sStyle, clientMounted]);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await props.params
      setParams(resolvedParams)
    }
    loadParams()
  }, [props.params])

  useEffect(() => {
    if (!params?.id) return;

    async function fetchPost() {
      if (!params?.id) return;
      try {
        setLoading(true)
        console.log('Fetching post:', params.id)

        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .eq('published', true)
          .single()

        if (error) {
          console.error('Error fetching post:', error)
          notFound()
          return
        }

        if (!data) {
          console.error('Post not found or not published')
          notFound()
          return
        }

        console.log('Post fetched:', data)
        setPost(data)
      } catch (error) {
        console.error('Exception while fetching post:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params?.id])

  // Define 90s styles for the content
  const ninetiesStyles = is90sStyle ? {
    heading: {
      textShadow: '2px 2px 0 #000000',
    },
    blockquote: {
      borderLeft: '4px solid #FF00FF',
      backgroundColor: '#FFFF99',
      padding: '1rem',
    },
    pre: {
      backgroundColor: '#000080',
      color: '#00FF00',
      border: '2px dashed #FF00FF',
    },
    code: {
      backgroundColor: '#000080',
      color: '#00FF00',
      padding: '2px 4px',
      borderRadius: '4px',
    },
    img: {
      border: '3px solid #000000',
      padding: '4px',
      backgroundColor: '#FFFFFF',
    },
    table: {
      borderCollapse: 'separate',
      borderSpacing: '2px',
      border: '3px solid #000000',
    },
    th: {
      backgroundColor: '#000080',
      color: '#FFFFFF',
      border: '2px solid #000000',
      padding: '8px',
    },
    td: {
      border: '2px solid #000000',
      padding: '8px',
    },
    hr: {
      border: 'none',
      height: '3px',
      background: 'repeating-linear-gradient(90deg, #FF00FF, #FF00FF 10px, #00FFFF 10px, #00FFFF 20px)',
      margin: '2rem 0',
    },
  } : {};

  if (loading || !params?.id || !clientMounted || !isMounted) {
    return (
      <main className={cn("flex-1 p-8", {
        'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]': is90sStyle,
        'bg-background text-foreground': !is90sStyle
      })}>
        <div className="max-w-4xl mx-auto">
          <p>Loading post...</p>
        </div>
      </main>
    )
  }

  if (!post) {
    return notFound()
  }



  return (
    <main
      key={`theme-${themeVersion}-${is90sStyle ? '90s' : 'modern'}`}
      className={cn("flex-1 p-8", {
        'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]': is90sStyle,
        'bg-background text-foreground': !is90sStyle
      })}
    >
      <article className="max-w-4xl mx-auto">
        <Card className={cn("p-8", {
          'bg-[#FFFFFF] border-4 border-[#000000] shadow-[5px_5px_0_#000000]': is90sStyle,
          'bg-card text-card-foreground shadow-sm': !is90sStyle
        })}>
          <h1
            className={cn("text-3xl font-bold mb-4", {
              'text-[#FF00FF]': is90sStyle
            })}
            style={is90sStyle ? { textShadow: '2px 2px 0 #000000' } : undefined}
          >
            {post.title}
          </h1>

          <div className={cn("mb-8", {
            'text-[#000080]': is90sStyle,
            'text-muted-foreground': !is90sStyle
          })}>
            <p className="text-sm">
              {formatLastModified(post.created_at, post.updated_at)}
            </p>
          </div>

          {post.cover_image && (
            <div className="mb-6">
              <Image
                src={post.cover_image}
                alt={post.title}
                width={800}
                height={400}
                className={cn("w-full h-auto rounded-lg", {
                  'border-4 border-[#000000] p-2 bg-[#FFFFFF]': is90sStyle,
                  'rounded-lg': !is90sStyle
                })}
                priority
              />
            </div>
          )}

          <div className="markdown-content">
            <MarkdownPreview 
              source={post.content}
              style={{
                whiteSpace: 'pre-wrap',
                backgroundColor: 'transparent',
                color: 'inherit',
                fontFamily: 'inherit'
              }}
              className={cn(
                // Base prose styles for better typography
                "prose prose-lg max-w-none",
                // Theme-specific styles
                {
                  'text-[#000080]': is90sStyle,
                  'prose-neutral dark:prose-invert': !is90sStyle
                },
                // Enhanced typography
                "prose-headings:font-bold prose-headings:tracking-tight",
                "prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12",
                "prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10",
                "prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8",
                "prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6",
                
                // Paragraph and text styles
                "prose-p:text-base prose-p:leading-relaxed prose-p:mb-6",
                "prose-p:text-gray-700 dark:prose-p:text-gray-300",
                
                // List styles
                "prose-ul:mb-6 prose-ul:list-disc prose-ul:ml-6",
                "prose-ol:mb-6 prose-ol:list-decimal prose-ol:ml-6", 
                "prose-li:mb-2 prose-li:leading-relaxed",
                
                // Link styles
                "prose-a:text-blue-600 prose-a:underline prose-a:decoration-2",
                "hover:prose-a:text-blue-800 dark:prose-a:text-blue-400",
                
                // Blockquote styles
                "prose-blockquote:border-l-4 prose-blockquote:border-blue-500",
                "prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20",
                "prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:my-8",
                "prose-blockquote:italic prose-blockquote:text-gray-800",
                "dark:prose-blockquote:text-gray-200",
                
                // Code styles
                "prose-code:bg-gray-100 dark:prose-code:bg-gray-800",
                "prose-code:text-red-600 dark:prose-code:text-red-400",
                "prose-code:px-2 prose-code:py-1 prose-code:rounded",
                "prose-code:text-sm prose-code:font-mono",
                
                // Pre/code block styles
                "prose-pre:bg-gray-900 prose-pre:text-gray-100",
                "prose-pre:p-6 prose-pre:rounded-lg prose-pre:my-8",
                "prose-pre:overflow-x-auto prose-pre:text-sm",
                
                // Image styles
                "prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8",
                "prose-img:mx-auto prose-img:max-w-full",
                
                // Table styles
                "prose-table:my-8 prose-table:border-collapse",
                "prose-th:bg-gray-100 dark:prose-th:bg-gray-800",
                "prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600",
                "prose-th:px-4 prose-th:py-2 prose-th:font-semibold",
                "prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600",
                "prose-td:px-4 prose-td:py-2",
                
                // HR styles
                "prose-hr:border-gray-300 dark:prose-hr:border-gray-600",
                "prose-hr:my-12 prose-hr:border-t-2",
                
                // Strong/em styles
                "prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-gray-100",
                "prose-em:italic prose-em:text-gray-700 dark:prose-em:text-gray-300"
              )}
            />
          </div>

          {is90sStyle && (
            <div className="mt-8 text-center">
              <div style={{
                animation: 'blink 1s infinite',
                border: '2px dashed #FF00FF',
                padding: '10px',
                backgroundColor: '#FFFF00',
                color: '#FF0000',
                fontWeight: 'bold',
                textShadow: '1px 1px 0 #000000'
              }}>
                Thanks for visiting my awesome webpage! Don&apos;t forget to sign my guestbook!
              </div>
              <div className="mt-4">
                <Image
                  src="/construction.gif"
                  alt="Under Construction"
                  width={50}
                  height={50}
                  className="inline-block"
                  unoptimized
                />
              </div>
            </div>
          )}
        </Card>
      </article>
    </main>
  )
}
