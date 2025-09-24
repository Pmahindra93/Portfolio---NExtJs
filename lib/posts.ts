function stripFormatting(text: string): string {
  let cleaned = text
    .replace(/`{1,3}([^`]+?)`{1,3}/g, '$1')
    .replace(/(~{2})([^~]+?)\1/g, '$2')
    .replace(/(\*\*|__)([^*_]+?)\1/g, '$2')
    .replace(/(\*|_)([^*_]+?)\1/g, '$2')

  return cleaned.trim()
}

export function deriveTitleFromContent(content: string, fallback = 'Untitled'): string {
  if (!content) {
    return fallback
  }

  const lines = content.split(/\r?\n/)

  let inFence = false

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      continue
    }

    if (line.startsWith('```')) {
      inFence = !inFence
      continue
    }

    if (inFence) {
      continue
    }

    const stripped = line
      .replace(/^#{1,6}\s*/, '')
      .replace(/^>+\s*/, '')
      .replace(/^[-*+]\s+/, '')

    const cleaned = stripFormatting(stripped)

    if (cleaned.length > 0) {
      return cleaned
    }
  }

  return fallback
}
