'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'
import { ImageUpload } from '@/components/ImageUpload'
import MarkdownEditor from '@/components/MarkdownEditor'
import { deriveTitleFromContent } from '@/lib/posts'

export default function NewPostPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const trimmedContent = content.trim()

      if (!trimmedContent) {
        throw new Error('Content is required')
      }

      const title = deriveTitleFromContent(trimmedContent, '')

      if (!title) {
        throw new Error('Add a first line to use as the title')
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: trimmedContent,
          cover_image: coverImage,
          published: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      toast({
        title: 'Success',
        description: 'Post created successfully',
      })

      router.push('/')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <ImageUpload
            value={coverImage}
            onChange={(url) => setCoverImage(url)}
            onRemove={() => setCoverImage(null)}
          />

          <p className="text-sm text-muted-foreground">
            The first non-empty line becomes the post title.
          </p>
          <MarkdownEditor
            value={content}
            onChange={(value) => setContent(value)}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
