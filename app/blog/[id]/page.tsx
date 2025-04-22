'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Post } from '@/types/post'
import { Card } from '@/components/ui/card'
import { useTheme } from '@/lib/hooks/useTheme'
import { notFound } from 'next/navigation'
import { cn } from '@/lib/utils'

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

  // Add 90s styles to the content
  let processedContent = post.content;
  if (is90sStyle) {
    // Add inline styles to headings
    processedContent = processedContent
      .replace(/<h1/g, `<h1 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`)
      .replace(/<h2/g, `<h2 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`)
      .replace(/<h3/g, `<h3 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`)
      .replace(/<h4/g, `<h4 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`)
      .replace(/<h5/g, `<h5 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`)
      .replace(/<h6/g, `<h6 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`)
      .replace(/<blockquote/g, `<blockquote style="border-left: 4px solid #FF00FF; background-color: #FFFF99; padding: 1rem;"`)
      .replace(/<pre/g, `<pre style="background-color: #000080; color: #00FF00; border: 2px dashed #FF00FF;"`)
      .replace(/<code/g, `<code style="background-color: #000080; color: #00FF00; padding: 2px 4px; border-radius: 4px;"`)
      .replace(/<img/g, `<img style="border: 3px solid #000000; padding: 4px; background-color: #FFFFFF;"`)
      .replace(/<a /g, `<a style="color: #0000FF; text-decoration: underline;" `)
      .replace(/<hr/g, `<hr style="border: none; height: 3px; background: repeating-linear-gradient(90deg, #FF00FF, #FF00FF 10px, #00FFFF 10px, #00FFFF 20px); margin: 2rem 0;"`)
      .replace(/<table/g, `<table style="border-collapse: separate; border-spacing: 2px; border: 3px solid #000000;"`)
      .replace(/<th/g, `<th style="background-color: #000080; color: #FFFFFF; border: 2px solid #000000; padding: 8px;"`)
      .replace(/<td/g, `<td style="border: 2px solid #000000; padding: 8px;"`);
  }

  // Clean up empty paragraphs
  processedContent = processedContent
    .replace(/<p><br><\/p>/g, '')
    .replace(/<p>&nbsp;<\/p>/g, '')
    .replace(/<p>\s*<\/p>/g, '');

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
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>

          {post.cover_image && (
            <div className="mb-6">
              <img
                src={post.cover_image}
                alt={post.title}
                className={cn("w-full h-auto rounded-lg", {
                  'border-4 border-[#000000] p-2 bg-[#FFFFFF]': is90sStyle,
                  'rounded-lg': !is90sStyle
                })}
              />
            </div>
          )}

          <div
            className={cn(
              // Base prose styles
              "prose max-w-none",
              // Theme-specific styles
              {
                'text-[#000080]': is90sStyle,
                'prose-neutral dark:prose-invert': !is90sStyle
              },
              // Typography styles
              "prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
              // Paragraph styles with explicit spacing
              "prose-p:my-6 prose-p:leading-relaxed",
              // Link styles
              "prose-a:text-blue-600 hover:prose-a:underline",
              // List styles with explicit spacing
              "prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6",
              "prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6",
              "prose-li:my-2",
              // Blockquote styles
              "prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic",
              // Code styles
              "prose-pre:my-6 prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded",
              "prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded",
              // Remove margin from first and last elements
              "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
              // Additional spacing between block elements
              "[&>*+*]:mt-6"
            )}
            dangerouslySetInnerHTML={{
              __html: processedContent
            }}
          />

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
                <img
                  src="/construction.gif"
                  alt="Under Construction"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  style={{
                    display: 'inline-block',
                    height: '50px'
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      </article>
    </main>
  )
}
