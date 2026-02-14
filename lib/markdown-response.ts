/**
 * Shared helpers for serving markdown as HTML (plain white page for agents).
 */

export const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function minimalHtmlPage(markdownBody: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Markdown</title></head>
<body style="margin:0;background:#fff;color:#171717;font-family:ui-monospace,monospace;font-size:14px;line-height:1.5;padding:24px;white-space:pre-wrap;word-break:break-word;">
${escapeHtml(markdownBody)}
</body>
</html>`
}
