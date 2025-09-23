import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
})

const htmlTagPattern = /<\/?[a-z][\s\S]*>/i

export function renderMarkdownToHtml(content: string): string {
  if (!content) {
    return ''
  }

  if (htmlTagPattern.test(content.trim())) {
    return content
  }

  return markdown.render(content)
}

