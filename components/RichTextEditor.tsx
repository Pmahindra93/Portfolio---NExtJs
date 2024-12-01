'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const QuillEditor = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
})

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean'],
    ['code-block']
  ],
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = useCallback(
    (content: string) => {
      onChange(content)
    },
    [onChange]
  )

  if (!mounted) {
    return null
  }

  return (
    <div className="bg-background">
      <QuillEditor
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        className="min-h-[200px]"
      />
    </div>
  )
}
