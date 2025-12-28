"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Post } from "@/types/post";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/lib/hooks/useTheme";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { renderMarkdownToHtml } from "@/lib/markdown";
import DOMPurify from "isomorphic-dompurify";

interface BlogPostClientProps {
  post: Post;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const { isDarkMode, is90sStyle, isMounted } = useTheme();
  const [themeVersion, setThemeVersion] = useState(0);
  const [clientMounted, setClientMounted] = useState(false);
  const prevThemeRef = useRef({ is90sStyle, isDarkMode });

  // Handle theme changes
  const handleThemeChange = useCallback(
    (event: Event) => {
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
        setThemeVersion((prev) => prev + 1);
      }
    },
    [clientMounted]
  );

  // Set up initial state and event listeners
  useEffect(() => {
    setClientMounted(true);

    // Listen for theme changes
    window.addEventListener("themeChanged", handleThemeChange);

    return () => {
      window.removeEventListener("themeChanged", handleThemeChange);
    };
  }, [handleThemeChange]);

  // Update theme version when theme changes directly
  useEffect(() => {
    if (
      clientMounted &&
      (prevThemeRef.current.is90sStyle !== is90sStyle ||
        prevThemeRef.current.isDarkMode !== isDarkMode)
    ) {
      prevThemeRef.current = { is90sStyle, isDarkMode };
      setThemeVersion((prev) => prev + 1);
    }
  }, [is90sStyle, isDarkMode, clientMounted]);

  if (!clientMounted || !isMounted) {
    return (
      <main
        className={cn("flex-1 p-8", {
          'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]':
            is90sStyle,
          "bg-background text-foreground": !is90sStyle,
        })}
      >
        <div className="max-w-4xl mx-auto">
          <p>Loading post...</p>
        </div>
      </main>
    );
  }

  // Check if content is already HTML (starts with HTML tags)
  const isHtml = post.content.trim().startsWith("<");

  // Convert to HTML (don't sanitize yet - we'll do that after all transformations)
  let processedContent = isHtml
    ? post.content
    : renderMarkdownToHtml(post.content);

  if (is90sStyle) {
    // Add inline styles to headings
    processedContent = processedContent
      .replace(
        /<h1/g,
        `<h1 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`
      )
      .replace(
        /<h2/g,
        `<h2 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`
      )
      .replace(
        /<h3/g,
        `<h3 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`
      )
      .replace(
        /<h4/g,
        `<h4 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`
      )
      .replace(
        /<h5/g,
        `<h5 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`
      )
      .replace(
        /<h6/g,
        `<h6 style="color: #FF00FF; text-shadow: 2px 2px 0 #000000;"`
      )
      .replace(
        /<blockquote/g,
        `<blockquote style="border-left: 4px solid #FF00FF; background-color: #FFFF99; padding: 1rem;"`
      )
      .replace(
        /<pre/g,
        `<pre style="background-color: #000080; color: #00FF00; border: 2px dashed #FF00FF;"`
      )
      .replace(
        /<code/g,
        `<code style="background-color: #000080; color: #00FF00; padding: 2px 4px; border-radius: 4px;"`
      )
      .replace(
        /<img/g,
        `<img style="border: 3px solid #000000; padding: 4px; background-color: #FFFFFF;"`
      )
      .replace(
        /<a /g,
        `<a style="color: #0000FF; text-decoration: underline;" `
      )
      .replace(
        /<hr/g,
        `<hr style="border: none; height: 3px; background: repeating-linear-gradient(90deg, #FF00FF, #FF00FF 10px, #00FFFF 10px, #00FFFF 20px); margin: 2rem 0;"`
      )
      .replace(
        /<table/g,
        `<table style="border-collapse: separate; border-spacing: 2px; border: 3px solid #000000;"`
      )
      .replace(
        /<th/g,
        `<th style="background-color: #000080; color: #FFFFFF; border: 2px solid #000000; padding: 8px;"`
      )
      .replace(/<td/g, `<td style="border: 2px solid #000000; padding: 8px;"`);
  }

  // Clean up empty paragraphs
  processedContent = processedContent
    .replace(/<p><br><\/p>/g, "")
    .replace(/<p>&nbsp;<\/p>/g, "")
    .replace(/<p>\s*<\/p>/g, "");

  // Sanitize AFTER all transformations to prevent XSS from string replacements
  // This ensures any potential vulnerabilities from inline styles or HTML manipulation are removed
  processedContent = DOMPurify.sanitize(processedContent);

  return (
    <main
      key={`theme-${themeVersion}-${is90sStyle ? "90s" : "modern"}`}
      className={cn("flex-1 p-8", {
        'bg-[#C0C0C0] text-[#000080] font-["Comic_Sans_MS",_cursive]':
          is90sStyle,
        "bg-background text-foreground": !is90sStyle,
      })}
    >
      <article className="max-w-4xl mx-auto">
        <Card
          className={cn("p-8", {
            "bg-[#FFFFFF] border-4 border-[#000000] shadow-[5px_5px_0_#000000]":
              is90sStyle,
            "bg-card text-card-foreground shadow-sm": !is90sStyle,
          })}
        >
          <h1
            className={cn("text-3xl font-bold mb-4", {
              "text-[#FF00FF]": is90sStyle,
            })}
            style={is90sStyle ? { textShadow: "2px 2px 0 #000000" } : undefined}
          >
            {post.title}
          </h1>

          <div
            className={cn("mb-8", {
              "text-[#000080]": is90sStyle,
              "text-muted-foreground": !is90sStyle,
            })}
          >
            <p className="text-sm">
              {post.created_at &&
                new Date(post.created_at).toLocaleDateString()}
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
                  "border-4 border-[#000000] p-2 bg-[#FFFFFF]": is90sStyle,
                  "rounded-lg": !is90sStyle,
                })}
                priority
              />
            </div>
          )}

          <div
            className={cn(
              // Base prose styles
              "prose max-w-none",
              // Theme-specific styles
              {
                "text-[#000080]": is90sStyle,
                "prose-neutral dark:prose-invert": !is90sStyle,
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
              __html: processedContent,
            }}
          />

          {is90sStyle && (
            <div className="mt-8 text-center">
              <div
                style={{
                  animation: "blink 1s infinite",
                  border: "2px dashed #FF00FF",
                  padding: "10px",
                  backgroundColor: "#FFFF00",
                  color: "#FF0000",
                  fontWeight: "bold",
                  textShadow: "1px 1px 0 #000000",
                }}
              >
                Thanks for visiting my awesome webpage! Don&apos;t forget to
                sign my guestbook!
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
  );
}
