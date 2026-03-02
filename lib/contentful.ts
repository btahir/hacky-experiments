// Inspired by this awesome Contentful Starter Repo: https://github.com/whitep4nth3r/nextjs-contentful-blog-starter
const spaceId = process.env.CONTENTFUL_SPACE_ID
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN
const collection = process.env.HACKY_BLOG_COLLECTION as string

export interface ContentfulPostListItem {
  sys?: { id: string }
  title: string
  slug: string
  description?: string
  heroImage?: { title?: string; url: string; height?: number; width?: number }
  publishDate?: string
}

function isContentfulConfigured() {
  return Boolean(spaceId && accessToken && collection)
}

async function callContentful(query: string): Promise<{ data?: Record<string, { items?: unknown[]; total?: number }> }> {
  if (!isContentfulConfigured()) {
    console.warn('Contentful: missing CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN, or HACKY_BLOG_COLLECTION. Skipping CMS fetch.')
    return { data: {} }
  }

  const fetchUrl = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`

  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  }

  try {
    const data = await fetch(fetchUrl, fetchOptions).then((response) =>
      response.json()
    )
    return data
  } catch (error) {
    console.error('Error fetching from Contentful (build will continue with empty data):', error)
    return { data: {} }
  }
}

export async function fetchRecentPosts(limit: number): Promise<ContentfulPostListItem[]> {
  if (!isContentfulConfigured()) return []
  const query = `{
      ${collection}(limit: ${limit}, order: publishDate_DESC) {
        total
        items {
          sys {
            id
          }
          title
          slug
          description
          heroImage {
            title
            url
            height
            width
          }
          publishDate             
        }
      }
    }`
  const response = await callContentful(query)
  const data = response.data?.[collection]
  return (data?.items ?? []) as ContentfulPostListItem[]
}

export async function getPaginatedBlogPosts(page: number) {
  const queryLimit = 10
  const skipMultiplier = page === 1 ? 0 : page - 1
  const skip = skipMultiplier > 0 ? queryLimit * skipMultiplier : 0

  const query = `{
      ${collection}(limit: ${queryLimit}, skip: ${skip}, order: publishDate_DESC) {
        total
        items {
          sys {
            id
          }
          title
          slug
          description
          heroImage {
            title
            url
            height
            width
          }
          publishDate             
        }
      }
    }`
  const response = await callContentful(query)
  const data = response.data?.[collection]
  const total = data?.total ?? 0
  const posts = (data?.items ?? []) as ContentfulPostListItem[]
  return { posts, total }
}

export async function fetchAllPosts(): Promise<ContentfulPostListItem[]> {
  let page = 1
  let shouldQueryMorePosts = true
  const returnPosts: ContentfulPostListItem[] = []

  while (shouldQueryMorePosts) {
    const response = await getPaginatedBlogPosts(page)

    if (response.posts.length > 0) {
      returnPosts.push(...response.posts)
    }

    shouldQueryMorePosts = returnPosts.length < response.total
    page++
  }

  return returnPosts
}

async function getPaginatedSlugs(page: number) {
  const queryLimit = 100
  const skipMultiplier = page === 1 ? 0 : page - 1
  const skip = skipMultiplier > 0 ? queryLimit * skipMultiplier : 0

  const query = `{
      ${collection}(limit: ${queryLimit}, skip: ${skip}, order: publishDate_DESC) {
        total
        items {
          slug
        }
      }
    }`
  const response = await callContentful(query)
  const data = response.data?.[collection]
  const total = data?.total ?? 0
  const slugs = Array.isArray(data?.items)
    ? (data.items as { slug: string }[]).map((item) => item.slug)
    : []
  return { slugs, total }
}

export async function fetchPostSlugs() {
  let page = 1
  let shouldQueryMoreSlugs = true
  const returnSlugs = []

  while (shouldQueryMoreSlugs) {
    const response = await getPaginatedSlugs(page)

    if (response.slugs.length > 0) {
      returnSlugs.push(...response.slugs)
    }

    shouldQueryMoreSlugs = returnSlugs.length < response.total
    page++
  }

  return returnSlugs
}

export async function fetchPost(slug: string) {
  const query = `{
      ${collection}(limit: 1, where: {slug: "${slug}"}) {
        items {
          title
          slug
          description
          heroImage {
            title
            url
            description
            height
            width
          }
          body {
            json
            links {              
              assets {
                block {
                  sys {
                    id
                  }
                  title
                  url
                  description
                  height
                  width
                }
              }
              entries {
                block {
                  sys {
                    id
                  }
                  __typename
                  ... on CodeBlock {
                    title
                    language
                    code
                  }
                }
              }
            }
          }
          publishDate
        }
      }
    }`
  const response = await callContentful(query)
  const items = response.data?.[collection]?.items ?? []
  return items.pop()
}
