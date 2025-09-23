export function deriveTitleFromContent(content: string, fallback = 'Untitled'): string {
  if (!content) {
    return fallback
  }

  const lines = content
    .split(/\r?\n/)
    .map(line => line.trim())

  const firstMeaningfulLine = lines.find(line => line.length > 0)

  if (!firstMeaningfulLine) {
    return fallback
  }

  const cleaned = firstMeaningfulLine
    .replace(/^#{1,6}\s*/, '')
    .replace(/^>\s*/, '')
    .replace(/^[-*+]\s*/, '')
    .replace(/^`{3}/, '')
    .replace(/[*_`~]/g, '')
    .trim()

  return cleaned.length > 0 ? cleaned : fallback
}
