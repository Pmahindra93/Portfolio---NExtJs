'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase/client'
import { renderMarkdownToHtml } from '@/lib/markdown'

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
  placeholder = ''
}: MarkdownEditorProps) {
  const [mounted, setMounted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [mode, setMode] = useState<'write' | 'preview'>('write')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const characterCount = useMemo(() => value.trim().length, [value])
  const previewContent = useMemo(() => renderMarkdownToHtml(value), [value])

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName

    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === 'post-images')

    if (!bucketExists) {
      await supabase.storage.createBucket('post-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      })
    }

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error details:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    return publicUrl
  }, [])

  const insertAtCursor = useCallback((snippet: string, cursorOffset = 0) => {
    const textarea = textareaRef.current
    if (!textarea) {
      onChange(value + snippet)
      return
    }

    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    const newValue = `${value.slice(0, start)}${snippet}${value.slice(end)}`
    onChange(newValue)

    requestAnimationFrame(() => {
      const cursorPosition = start + cursorOffset
      textarea.focus()
      textarea.setSelectionRange(cursorPosition, cursorPosition)
    })
  }, [onChange, value])

  const handleImageUpload = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return

    setIsUploading(true)
    try {
      const imageUrl = await uploadImage(file)
      const altText = file.name.split('.')[0]
      insertAtCursor(`![${altText}](${imageUrl})\n\n`)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [insertAtCursor, uploadImage])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleImageUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  })

  if (!mounted) {
    return (
      <div className={`min-h-[400px] bg-background ${className}`}>
        <div className="animate-pulse p-6 space-y-3">
          <div className="h-4 bg-gray-300/70 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300/70 rounded w-full"></div>
          <div className="h-4 bg-gray-300/70 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`writing-container ${className}`}>
      <div className="writing-toolbar">
        <div className="toolbar-tabs">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`toolbar-tab ${mode === 'write' ? 'toolbar-tab-active' : ''}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`toolbar-tab ${mode === 'preview' ? 'toolbar-tab-active' : ''}`}
          >
            Preview
          </button>
        </div>
        <span className="toolbar-meta">{characterCount.toLocaleString()} characters</span>
      </div>

      <div className="toolbar-actions">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            open()
          }}
          className="action"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading…' : 'Add image'}
        </button>
      </div>

      <div {...getRootProps()} className="writing-surface">
        <input {...getInputProps()} />

        {isDragActive && (
          <div className="writing-overlay">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-primary font-medium">Drop image here</p>
            </div>
          </div>
        )}

        {mode === 'write' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="writing-textarea"
            autoFocus
            spellCheck
          />
        ) : (
          <div
            className="writing-preview prose prose-neutral dark:prose-invert max-w-none"
            // Preview uses sanitized markdown output (raw HTML disabled)
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        )}
      </div>

      <style jsx global>{`
        .writing-container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          position: relative;
          background: hsl(var(--background));
          border-radius: 1rem;
          border: 1px solid hsl(var(--border));
        }

        .writing-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem 0.5rem;
          gap: 0.75rem;
        }

        .toolbar-tabs {
          display: inline-flex;
          background: hsl(var(--muted));
          padding: 0.2rem;
          border-radius: 9999px;
          border: 1px solid hsl(var(--border));
          gap: 0.2rem;
        }

        .toolbar-tab {
          padding: 0.35rem 0.9rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          color: hsl(var(--muted-foreground));
          transition: all 0.2s ease;
        }

        .toolbar-tab:hover {
          color: hsl(var(--foreground));
        }

        .toolbar-tab-active {
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          box-shadow: 0 1px 3px hsl(var(--foreground) / 0.08);
        }

        .toolbar-meta {
          font-size: 0.8rem;
          color: hsl(var(--muted-foreground));
        }

        .toolbar-actions {
          display: flex;
          justify-content: flex-end;
          padding: 0 1.5rem 1rem;
        }

        .action {
          padding: 0.45rem 0.95rem;
          border-radius: 0.65rem;
          border: 1px solid hsl(var(--primary));
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.15s ease;
        }

        .action:hover {
          filter: brightness(1.05);
        }

        .action:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .writing-surface {
          position: relative;
          border-top: 1px solid hsl(var(--border));
        }

        .writing-overlay {
          position: absolute;
          inset: 0;
          background: hsl(var(--primary) / 0.1);
          border: 2px dashed hsl(var(--primary));
          border-radius: 0.75rem;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .writing-textarea,
        .writing-preview {
          width: 100%;
          min-height: 60vh;
          padding: 3rem 2.5rem;
          background: transparent;
          color: hsl(var(--foreground));
          border: none;
          outline: none;
          border-radius: 1rem;
        }

        .writing-textarea {
          font-family: "Charter", "Georgia", "Times New Roman", serif;
          font-size: 18px;
          line-height: 1.7;
          letter-spacing: 0.01em;
          resize: none;
          overflow-y: auto;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          box-sizing: border-box;
        }

        .writing-preview {
          line-height: 1.7;
        }

        .writing-textarea::placeholder {
          color: hsl(var(--muted-foreground));
          opacity: 0.6;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .writing-textarea,
          .writing-preview {
            padding: 2rem 1.25rem;
            font-size: 16px;
            line-height: 1.6;
          }

          .toolbar-actions {
            padding: 0 1rem 1rem;
          }
        }

        .writing-textarea::selection,
        .writing-textarea::-moz-selection {
          background: hsl(var(--primary) / 0.2);
          color: hsl(var(--foreground));
        }

      `}</style>
    </div>
  )
}
