'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ImageIcon, Loader2 } from 'lucide-react'
import { useTheme } from '@/lib/hooks/useTheme'
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
  const [isUploading, setIsUploading] = useState(false)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `blog-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    return publicUrl
  }, [])

  const handleImageUpload = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return

    setIsUploading(true)
    try {
      const imageUrl = await uploadImage(file)
      const altText = file.name.split('.')[0]
      const markdownImage = `![${altText}](${imageUrl})\n\n`
      
      // Insert the image markdown at the current cursor position or at the end
      const newContent = value + markdownImage
      onChange(newContent)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [value, onChange, uploadImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleImageUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    noClick: true, // We'll handle clicks manually
  })

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
    <div 
      {...getRootProps()} 
      className={`markdown-editor-container relative ${className} ${
        isDragActive ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      <input {...getInputProps()} />
      
      {/* Custom toolbar with image upload */}
      <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/50">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = (event) => {
              const files = (event.target as HTMLInputElement).files
              if (files) {
                handleImageUpload(Array.from(files))
              }
            }
            input.click()
          }}
          disabled={isUploading}
          className="flex items-center gap-1"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          Upload Image
        </Button>
        <span className="text-xs text-muted-foreground">
          {isDragActive ? 'Drop image here...' : 'Drag & drop images or click to upload'}
        </span>
      </div>

      <MDEditor
        value={value || ''}
        onChange={(val) => onChange(val || '')}
        preview="edit"
        hideToolbar={false}
        visibleDragbar={false}
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
        data-color-mode={isDarkMode ? "dark" : "light"}
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