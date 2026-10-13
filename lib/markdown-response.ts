/**
 * Shared helpers for serving markdown as HTML (plain white page for agents).
 */
import { absoluteUrl } from '@/lib/site-config'

export const CACHE_HEADERS = {
  // Some CDNs do not key caches by arbitrary Vary values. Do not cache an
  // alternate representation under the same URL as a statically cached article.
  'Cache-Control': 'private, no-store',
  Vary: 'Accept',
}

export function representationHeaders(canonicalPath: string) {
  return { ...CACHE_HEADERS, Link: `<${absoluteUrl(canonicalPath)}>; rel="canonical"` }
}

export function acceptsMarkdown(accept: string | null): boolean {
  const quality = (mediaType: string) => {
    const range = (accept || '').split(',').find((part) => part.split(';')[0].trim().toLowerCase() === mediaType)
    if (!range) return 0
    const parameter = range.split(';').slice(1).find((part) => part.trim().startsWith('q='))
    const value = parameter ? Number(parameter.trim().slice(2)) : 1
    return Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0
  }
  const markdownQuality = quality('text/markdown')
  return markdownQuality > 0 && markdownQuality >= quality('text/html')
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function minimalHtmlPage(markdownBody: string, canonicalPath?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Markdown</title>${canonicalPath ? `<link rel="canonical" href="${escapeHtml(absoluteUrl(canonicalPath))}">` : ''}</head>
<body style="margin:0;background:#fff;color:#171717;font-family:ui-monospace,monospace;font-size:14px;line-height:1.5;padding:24px;white-space:pre-wrap;word-break:break-word;">
${escapeHtml(markdownBody)}
</body>
</html>`
}
