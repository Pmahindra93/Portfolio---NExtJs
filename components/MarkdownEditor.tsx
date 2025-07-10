'use client'

import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase/client'
import { useTheme } from '@/lib/hooks/useTheme'

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
    console.log('Starting image upload for file:', file.name, 'Size:', file.size, 'Type:', file.type)
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size must be less than 10MB')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    console.log('Generated filename:', fileName)

    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      if (listError) {
        console.error('Error listing buckets:', listError)
        throw new Error(`Bucket check failed: ${listError.message}`)
      }
      
      console.log('Available buckets:', buckets?.map(b => b.name))
      const bucketExists = buckets?.some(bucket => bucket.name === 'post-images')
      
      if (!bucketExists) {
        console.log('Creating post-images bucket...')
        const { error: createError } = await supabase.storage.createBucket('post-images', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
        })
        
        if (createError) {
          console.error('Error creating bucket:', createError)
          throw new Error(`Bucket creation failed: ${createError.message}`)
        }
        console.log('Bucket created successfully')
      }

      console.log('Uploading file to bucket...')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log('Upload successful:', uploadData)

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName)

      console.log('Generated public URL:', publicUrl)
      return publicUrl
      
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to upload image: ${errorMessage}`)
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
    noClick: true,
    noKeyboard: true,
  })

  if (!mounted) {
    return (
      <div className={`min-h-[400px] bg-background ${className}`}>
        <div className="animate-pulse p-6">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`writing-container ${className}`}>
      <div {...getRootProps()} className="relative">
        <input {...getInputProps()} />
        
        {/* Drag overlay */}
        {isDragActive && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-primary font-medium">Drop image here</p>
            </div>
          </div>
        )}

        {/* Upload indicator */}
        {isUploading && (
          <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm z-40">
            Uploading...
          </div>
        )}

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="writing-textarea"
          autoFocus
          spellCheck="true"
        />
      </div>

      <style jsx global>{`
        /* iA Writer inspired clean writing interface */
        .writing-container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          position: relative;
          background: hsl(var(--background));
        }

        .writing-textarea {
          width: 100%;
          min-height: 60vh;
          padding: 4rem 2rem;
          border: none;
          outline: none;
          background: transparent;
          color: hsl(var(--foreground));
          font-family: "Charter", "Georgia", "Times New Roman", serif;
          font-size: 18px;
          line-height: 1.6;
          font-weight: 400;
          letter-spacing: 0;
          word-spacing: 0;
          resize: none;
          overflow-y: auto;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          font-variant-ligatures: common-ligatures;
          font-feature-settings: "liga" 1, "calt" 1;
          tab-size: 2;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          box-sizing: border-box;
        }

        .writing-textarea::placeholder {
          color: hsl(var(--muted-foreground));
          opacity: 0.6;
          font-style: italic;
        }

        .writing-textarea:focus {
          outline: none;
          box-shadow: none;
        }

        /* Responsive typography */
        @media (max-width: 768px) {
          .writing-textarea {
            padding: 2rem 1rem;
            font-size: 16px;
            line-height: 1.5;
          }
        }

        @media (min-width: 1024px) {
          .writing-container {
            max-width: 700px;
          }
          
          .writing-textarea {
            padding: 4rem 0;
            font-size: 19px;
            line-height: 1.65;
          }
        }

        /* Dark mode adjustments */
        [data-theme="dark"] .writing-textarea {
          color: hsl(var(--foreground));
          background: hsl(var(--background));
        }

        [data-theme="dark"] .writing-textarea::placeholder {
          color: hsl(var(--muted-foreground));
          opacity: 0.5;
        }

        /* Focus mode - subtle */
        .writing-textarea:focus {
          background: hsl(var(--background));
        }

        /* Smooth scrolling */
        .writing-textarea {
          scroll-behavior: smooth;
        }

        /* Remove default browser styling */
        .writing-textarea {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          border-radius: 0;
          box-shadow: none;
        }

        /* Selection styling */
        .writing-textarea::selection {
          background: hsl(var(--primary) / 0.2);
          color: hsl(var(--foreground));
        }

        .writing-textarea::-moz-selection {
          background: hsl(var(--primary) / 0.2);
          color: hsl(var(--foreground));
        }
      `}</style>
    </div>
  )
}