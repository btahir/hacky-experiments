import { toMarkdown } from 'mdast-util-to-markdown'

function fail(location, message) {
  throw new Error(`Rich Text ${location}: ${message}`)
}

function children(node, location) {
  if (!Array.isArray(node.content)) fail(location, 'Expected a content array')
  return node.content
}

function textNode(node, location) {
  if (typeof node.value !== 'string' || !Array.isArray(node.marks)) fail(location, 'Malformed text node')
  const marks = node.marks.map((mark) => mark?.type)
  if (new Set(marks).size !== marks.length) fail(location, 'Duplicate marks')
  for (const mark of marks) {
    if (!['bold', 'italic', 'code'].includes(mark)) fail(location, `Unsupported text mark: ${mark}`)
  }
  if (!marks.length || !node.value.trim()) return [{ type: 'text', value: node.value }]
  // CommonMark emphasis delimiters cannot enclose leading/trailing whitespace.
  // Keep it outside the marked span while preserving every source character.
  const [, leading, value, trailing] = /^(\s*)([\s\S]*?)(\s*)$/.exec(node.value)
  if (marks.includes('code') && /[\r\n]/.test(value)) fail(location, 'Multiline inline code needs an explicit conversion rule')
  let result = marks.includes('code') ? { type: 'inlineCode', value } : { type: 'text', value }
  if (marks.includes('bold')) result = { type: 'strong', children: [result] }
  if (marks.includes('italic')) result = { type: 'emphasis', children: [result] }
  return [...(leading ? [{ type: 'text', value: leading }] : []), result, ...(trailing ? [{ type: 'text', value: trailing }] : [])]
}

function inline(node, location, onNormalization) {
  if (!node || typeof node.nodeType !== 'string') fail(location, 'Missing nodeType')
  if (node.nodeType === 'text') return textNode(node, location)
  if (node.nodeType === 'hyperlink') {
    const original = node.data?.uri
    if (typeof original !== 'string') fail(location, 'Malformed hyperlink')
    // Browsers trim surrounding ASCII whitespace in href; Markdown requires it
    // to be removed to preserve that same resolved destination.
    const uri = original.replace(/^[\x00-\x20]+|[\x00-\x20]+$/g, '')
    if (uri !== original) onNormalization({ kind: 'trim-hyperlink-whitespace', location, from: original, to: uri })
    if (!uri || /[\x00-\x20\x7f]/.test(uri)) fail(location, 'Malformed hyperlink')
    if (!/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(uri)) fail(location, 'Unsupported hyperlink protocol')
    if (/^https?:/i.test(uri)) {
      let url
      try { url = new URL(uri) } catch { fail(location, 'Malformed hyperlink URL') }
      if (url.username || url.password) fail(location, 'Hyperlinks must not contain credentials')
    }
    const content = children(node, location).flatMap((child, index) => {
      if (child.nodeType !== 'text') fail(`${location}.${index}`, 'Hyperlinks may contain text nodes only')
      return textNode(child, `${location}.${index}`)
    })
    return [{ type: 'link', url: uri, children: content }]
  }
  fail(location, `Unsupported inline node: ${node.nodeType}`)
}

function block(node, location, onNormalization) {
  if (!node || typeof node.nodeType !== 'string') fail(location, 'Missing nodeType')
  if (node.nodeType === 'paragraph') {
    const content = children(node, location)
    const only = content[0]
    if (content.length === 1 && only.nodeType === 'text' && typeof only.value === 'string'
      && /[\r\n]/.test(only.value) && only.marks?.length === 1 && only.marks[0].type === 'code') {
      onNormalization({ kind: 'code-paragraph-to-fenced-block', location })
      return { type: 'code', value: only.value }
    }
  }
  if (node.nodeType === 'paragraph' || /^heading-[1-6]$/.test(node.nodeType)) {
    const content = children(node, location).flatMap((child, index) => inline(child, `${location}.${index}`, onNormalization))
    return node.nodeType === 'paragraph'
      ? { type: 'paragraph', children: content }
      : { type: 'heading', depth: Number(node.nodeType.at(-1)), children: content }
  }
  if (node.nodeType === 'unordered-list' || node.nodeType === 'ordered-list') {
    const items = children(node, location).map((item, index) => {
      if (item.nodeType !== 'list-item') fail(`${location}.${index}`, 'Expected a list item')
      return { type: 'listItem', spread: false, children: children(item, `${location}.${index}`).map((child, childIndex) => block(child, `${location}.${index}.${childIndex}`, onNormalization)) }
    })
    return { type: 'list', ordered: node.nodeType === 'ordered-list', start: node.nodeType === 'ordered-list' ? 1 : undefined, spread: false, children: items }
  }
  if (node.nodeType === 'blockquote') return { type: 'blockquote', children: children(node, location).map((child, index) => block(child, `${location}.${index}`, onNormalization)) }
  if (node.nodeType === 'hr') {
    if (children(node, location).length) fail(location, 'Horizontal rule must not have children')
    return { type: 'thematicBreak' }
  }
  fail(location, `Unsupported block node: ${node.nodeType}`)
}

/** Convert only explicitly supported nodes; never silently discard embeds. */
export function richTextToMarkdown(document, { onNormalization = () => {} } = {}) {
  if (!document || document.nodeType !== 'document') fail('document', 'Expected a document root')
  const tree = { type: 'root', children: children(document, 'document').map((node, index) => block(node, `document.${index}`, onNormalization)) }
  return toMarkdown(tree, { bullet: '-', emphasis: '_', strong: '*', fences: true, listItemIndent: 'one' })
}
