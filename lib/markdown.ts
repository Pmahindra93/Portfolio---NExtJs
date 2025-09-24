import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})

export function renderMarkdownToHtml(content: string): string {
  if (!content) {
    return ''
  }

  return markdown.render(content)
}
