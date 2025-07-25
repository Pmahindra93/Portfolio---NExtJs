'use client'

import { useCallback, useEffect } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import TextStyle from '@tiptap/extension-text-style'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'

const fontFamilies = [
  { name: 'Default', value: 'Inter' },
  { name: 'Serif', value: 'ui-serif' },
  { name: 'Mono', value: 'ui-monospace' },
  { name: 'Comic Sans', value: 'Comic Sans MS' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Courier', value: 'Courier' },
]

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-border p-2 mb-4 flex flex-wrap gap-2">
      <select
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        value={editor.getAttributes('textStyle').fontFamily}
        className="p-2 rounded bg-background border border-input hover:bg-accent"
      >
        <option value="">Font</option>
        {fontFamilies.map((font) => (
          <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
            {font.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-secondary ${editor.isActive('bold') ? 'bg-secondary' : ''}`}
      >
        bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-secondary ${editor.isActive('italic') ? 'bg-secondary' : ''}`}
      >
        italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-secondary ${editor.isActive('underline') ? 'bg-secondary' : ''}`}
      >
        underline
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-secondary ${editor.isActive('heading', { level: 1 }) ? 'bg-secondary' : ''}`}
      >
        h1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-secondary ${editor.isActive('heading', { level: 2 }) ? 'bg-secondary' : ''}`}
      >
        h2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-secondary ${editor.isActive('bulletList') ? 'bg-secondary' : ''}`}
      >
        bullet list
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-secondary ${editor.isActive('orderedList') ? 'bg-secondary' : ''}`}
      >
        ordered list
      </button>
      <button
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
        disabled={!editor.can().sinkListItem('listItem')}
        className="p-2 rounded hover:bg-secondary disabled:opacity-50"
      >
        indent
      </button>
      <button
        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
        disabled={!editor.can().liftListItem('listItem')}
        className="p-2 rounded hover:bg-secondary disabled:opacity-50"
      >
        outdent
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-secondary ${editor.isActive('codeBlock') ? 'bg-secondary' : ''}`}
      >
        code block
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-secondary ${editor.isActive({ textAlign: 'left' }) ? 'bg-secondary' : ''}`}
      >
        left
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-secondary ${editor.isActive({ textAlign: 'center' }) ? 'bg-secondary' : ''}`}
      >
        center
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-secondary ${editor.isActive({ textAlign: 'right' }) ? 'bg-secondary' : ''}`}
      >
        right
      </button>
    </div>
  )
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      TextStyle,
      Link,
      Image,
      Underline,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'my-custom-bullet-list',
        },
        keepMarks: true,
        keepAttributes: false,
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'my-custom-ordered-list',
        },
        keepMarks: true,
        keepAttributes: false,
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'my-custom-list-item',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      handleKeyDown: (view, event): boolean => {
        if (event.key === 'Tab') {
          const { state } = view
          const { selection } = state
          const { $from } = selection
          
          if ($from.parent.type.name === 'listItem') {
            event.preventDefault()
            if (event.shiftKey) {
              return editor?.commands.liftListItem('listItem') || false
            } else {
              return editor?.commands.sinkListItem('listItem') || false
            }
          }
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <div className={`bg-background rounded-md border ${className}`}>
      <MenuBar editor={editor} />
      <div className="p-4">
        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-none min-h-[200px] [&_.tiptap]:min-h-[200px] [&_.tiptap]:outline-none [&_.tiptap]:whitespace-pre-wrap [&_.tiptap>p]:my-4 [&_.tiptap>p:first-child]:mt-0 [&_.tiptap>p:last-child]:mb-0 [&_.my-custom-bullet-list]:list-disc [&_.my-custom-bullet-list]:ml-6 [&_.my-custom-bullet-list]:my-2 [&_.my-custom-ordered-list]:list-decimal [&_.my-custom-ordered-list]:ml-6 [&_.my-custom-ordered-list]:my-2 [&_.my-custom-list-item]:mb-1"
        />
      </div>
    </div>
  )
}
