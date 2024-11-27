'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Loader2, X } from 'lucide-react'

interface ImageUploadProps {
  value: string | null
  onChange: (value: string | null) => void
  onRemove: () => void
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setIsLoading(true)
        const file = acceptedFiles[0]
        if (!file) return

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, file)

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath)

        onChange(publicUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
  })

  if (value) {
    return (
      <div className="relative w-full h-64">
        <Image
          src={value}
          alt="Cover"
          className="object-cover rounded-lg"
          fill
        />
        <Button
          type="button"
          onClick={onRemove}
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-colors hover:border-gray-400
        ${isDragActive ? 'border-primary' : 'border-gray-300'}
      `}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div>
          {isDragActive ? (
            <p>Drop the image here</p>
          ) : (
            <p>Drag & drop an image here, or click to select</p>
          )}
        </div>
      )}
    </div>
  )
}
