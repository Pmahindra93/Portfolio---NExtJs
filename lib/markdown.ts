import * as MarkdownIt from 'markdown-it'
import * as DOMPurify from 'isomorphic-dompurify'

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})

export function renderMarkdownToHtml(content: string): string {
  if (!content) {
    return ''
  }

  const htmlContent = markdown.render(content)
  return DOMPurify.sanitize(htmlContent)
}
