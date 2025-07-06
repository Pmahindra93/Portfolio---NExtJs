'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

// Dynamic import to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export default function MarkdownEditor({ 
  value, 
  onChange, 
  className = '', 
  placeholder = 'Start writing...' 
}: MarkdownEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`border rounded-lg p-4 min-h-[400px] bg-background ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`markdown-editor-container ${className}`}>
      <MDEditor
        value={value || ''}
        onChange={(val) => onChange(val || '')}
        preview="edit"
        hideToolbar={false}
        visibleDragBar={false}
        textareaProps={{
          placeholder,
          style: {
            fontSize: '16px',
            lineHeight: '1.6',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '16px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            minHeight: '400px',
            background: 'transparent',
          },
        }}
        data-color-mode="auto"
        height={400}
      />
      <style jsx global>{`
        .markdown-editor-container .w-md-editor {
          background: transparent !important;
        }
        .markdown-editor-container .w-md-editor.w-md-editor-focus {
          border-color: hsl(var(--ring)) !important;
          box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2) !important;
        }
        .markdown-editor-container .w-md-editor-text-pre,
        .markdown-editor-container .w-md-editor-text-input,
        .markdown-editor-container .w-md-editor-text {
          background: transparent !important;
          color: hsl(var(--foreground)) !important;
          font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
          font-size: 16px !important;
          line-height: 1.6 !important;
        }
        .markdown-editor-container .w-md-editor-bar {
          background: hsl(var(--muted)) !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        .markdown-editor-container .w-md-editor-bar svg {
          color: hsl(var(--foreground)) !important;
        }
        .markdown-editor-container .w-md-editor-bar button:hover {
          background: hsl(var(--accent)) !important;
        }
        .markdown-editor-container ul {
          list-style-type: disc !important;
          margin-left: 1.5rem !important;
        }
        .markdown-editor-container ol {
          list-style-type: decimal !important;
          margin-left: 1.5rem !important;
        }
        .markdown-editor-container li {
          margin-bottom: 0.25rem !important;
        }
        .markdown-editor-container .w-md-editor-text-pre .token.list {
          color: hsl(var(--foreground)) !important;
        }
        .markdown-editor-container .w-md-editor-text-pre .token.title {
          color: hsl(var(--foreground)) !important;
          font-weight: 600 !important;
        }
        .markdown-editor-container .w-md-editor-text-pre .token.code {
          background: hsl(var(--muted)) !important;
          color: hsl(var(--muted-foreground)) !important;
          padding: 0.125rem 0.25rem !important;
          border-radius: 0.25rem !important;
        }
      `}</style>
    </div>
  )
}