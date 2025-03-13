// Inspired by this awesome Contentful Starter Repo: https://github.com/whitep4nth3r/nextjs-contentful-blog-starter
const spaceId = process.env.CONTENTFUL_SPACE_ID
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN
const collection = process.env.HACKY_BLOG_COLLECTION as string

async function callContentful(query: string) {
  const fetchUrl = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`

  const fetchOptions: any = {
    spaceID: spaceId,
    accessToken: accessToken,
    endpoint: fetchUrl,
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({ query }),
  }

  try {
    const data = await fetch(fetchUrl, fetchOptions).then((response) =>
      response.json()
    )
    return data
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    throw new Error('Could not fetch blog posts!')
  }
}

export async function fetchRecentPosts(limit: number) {
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
  const response: any = await callContentful(query)

  const recentPosts = response.data[collection].items
    ? response.data[collection].items
    : []

  return recentPosts
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

  const { total } = response.data[collection]
  const posts = response.data[collection].items
    ? response.data[collection].items
    : []

  return { posts, total }
}

export async function fetchAllPosts() {
  let page = 1
  let shouldQueryMorePosts = true
  const returnPosts = []

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

  const { total } = response.data[collection]
  const slugs = response.data[collection].items
    ? response.data[collection].items.map((item: any) => item.slug)
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
  const pageContent = response.data[collection].items
    ? response.data[collection].items
    : []
  return pageContent.pop()
}
