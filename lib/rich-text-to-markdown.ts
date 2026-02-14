import {
  Document,
  MARKS,
  BLOCKS,
  INLINES,
} from '@contentful/rich-text-types'

interface ContentfulAsset {
  sys: { id: string }
  url: string
  title?: string
  description?: string
}

interface ContentfulEntry {
  sys: { id: string }
  __typename: string
  language?: string
  code?: string
  title?: string
}

interface RichTextLinks {
  assets?: {
    block?: ContentfulAsset[]
  }
  entries?: {
    block?: ContentfulEntry[]
    inline?: ContentfulEntry[]
  }
}

type RichTextNode = {
  nodeType: string
  value?: string
  marks?: Array<{ type: string }>
  content?: RichTextNode[]
  data?: {
    uri?: string
    target?: {
      sys?: {
        id?: string
      }
    }
  }
}

function processNode(node: RichTextNode, links?: RichTextLinks, listType?: 'ordered' | 'unordered'): string {
  // Process text nodes
  if (node.nodeType === 'text') {
    const text = node.value || ''
    const marks = node.marks || []

    let result = text
    // Apply marks in order - code first, then bold/italic
    if (marks.some((m) => m.type === MARKS.CODE)) {
      result = `\`${result}\``
    }
    if (marks.some((m) => m.type === MARKS.BOLD)) {
      result = `**${result}**`
    }
    if (marks.some((m) => m.type === MARKS.ITALIC)) {
      result = `*${result}*`
    }
    if (marks.some((m) => m.type === MARKS.UNDERLINE)) {
      result = `<u>${result}</u>`
    }
    if (marks.some((m) => m.type === MARKS.STRIKETHROUGH)) {
      result = `~~${result}~~`
    }
    return result
  }

  // Process content array
  const children = node.content
    ? node.content.map((child) => processNode(child, links, listType)).join('')
    : ''

  // Build asset map for embedded assets
  const assetMap = new Map<string, ContentfulAsset>()
  if (links?.assets?.block) {
    for (const asset of links.assets.block) {
      assetMap.set(asset.sys.id, asset)
    }
  }

  // Build entry map for embedded entries
  const entryMap = new Map<string, ContentfulEntry>()
  if (links?.entries?.block) {
    for (const entry of links.entries.block) {
      entryMap.set(entry.sys.id, entry)
    }
  }
  if (links?.entries?.inline) {
    for (const entry of links.entries.inline) {
      entryMap.set(entry.sys.id, entry)
    }
  }

  // Process block types
  switch (node.nodeType) {
    case BLOCKS.PARAGRAPH:
      return `${children}\n\n`

    case BLOCKS.HEADING_1:
      return `# ${children}\n\n`

    case BLOCKS.HEADING_2:
      return `## ${children}\n\n`

    case BLOCKS.HEADING_3:
      return `### ${children}\n\n`

    case BLOCKS.HEADING_4:
      return `#### ${children}\n\n`

    case BLOCKS.HEADING_5:
      return `##### ${children}\n\n`

    case BLOCKS.HEADING_6:
      return `###### ${children}\n\n`

    case BLOCKS.UL_LIST:
      return node.content?.map((child) => processNode(child, links, 'unordered')).join('') || ''

    case BLOCKS.OL_LIST: {
      // Process with index to get correct numbering
      const items = node.content?.map((child, index) => {
        const itemText = processNode(child, links, 'ordered')
        // Replace placeholder "1." with correct index
        return itemText.replace(/^1\./, `${index + 1}.`)
      }) || []
      return items.join('')
    }

    case BLOCKS.LIST_ITEM: {
      const prefix = listType === 'ordered' ? '1.' : '-'
      return `${prefix} ${children}\n`
    }

    case BLOCKS.QUOTE:
      return `> ${children.replace(/\n\n/g, '\n> ')}\n\n`

    case BLOCKS.HR:
      return `---\n\n`

    case BLOCKS.EMBEDDED_ASSET: {
      const asset = assetMap.get(node.data?.target?.sys?.id || '')
      if (asset) {
        const alt = asset.description || asset.title || ''
        return `![${alt}](${asset.url})\n\n`
      }
      return ''
    }

    case BLOCKS.EMBEDDED_ENTRY: {
      const entry = entryMap.get(node.data?.target?.sys?.id || '')
      if (!entry) return ''

      if (entry.__typename === 'CodeBlock') {
        const lang = entry.language || ''
        const code = entry.code || ''
        return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`
      }

      return children
    }

    case INLINES.HYPERLINK: {
      const uri = node.data?.uri || ''
      // If the link text is the same as the URL, use autolink style
      if (children === uri) {
        return `<${children}>`
      }
      return `[${children}](${uri})`
    }

    case INLINES.EMBEDDED_ENTRY: {
      const entry = entryMap.get(node.data?.target?.sys?.id || '')
      if (!entry) return ''

      if (entry.__typename === 'CodeBlock') {
        const lang = entry.language || ''
        const code = entry.code || ''
        return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`
      }

      return children
    }

    default:
      return children
  }
}

/**
 * Converts Contentful rich text JSON to markdown format
 */
export function richTextToMarkdown(
  richTextJson: Document,
  links?: RichTextLinks
): string {
  if (!richTextJson || !richTextJson.content) {
    return ''
  }

  return richTextJson.content
    .map((node) => processNode(node as unknown as RichTextNode, links))
    .join('')
    .trim()
}

/**
 * Generates a full markdown document with frontmatter
 */
export function generateMarkdownDocument(
  title: string,
  date: string,
  description: string,
  slug: string,
  content: string,
  tags?: string[]
): string {
  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: ${date}`,
    `description: "${description.replace(/"/g, '\\"')}"`,
    `slug: ${slug}`,
  ]

  if (tags && tags.length > 0) {
    frontmatter.push(`tags: [${tags.map((t) => `"${t}"`).join(', ')}]`)
  }

  frontmatter.push('---')

  return `${frontmatter.join('\n')}\n\n${content}`
}
