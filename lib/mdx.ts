import fs from 'fs'
import path from 'path'

// Define the posts directory constant
export const POSTS_DIRECTORY = path.join(process.cwd(), 'content/blog')

// Define the Post type
export type Post = {
  slug: string
  title: string
  date: string
  excerpt: string
  tags?: string[]
}

// Ensure posts directory exists
export function ensurePostsDirectoryExists(): void {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    fs.mkdirSync(POSTS_DIRECTORY, { recursive: true })
  }
}

// Get all posts metadata (without content)
export async function getAllPosts(): Promise<Post[]> {
  try {
    // Ensure posts directory exists
    ensurePostsDirectoryExists()
    
    // Get all MDX files
    const fileNames = fs.readdirSync(POSTS_DIRECTORY)
    
    // Process each MDX file
    const posts = await Promise.all(
      fileNames
        .filter(fileName => fileName.endsWith('.mdx'))
        .map(async (fileName) => {
          // Get slug from filename
          const slug = fileName.replace(/\.mdx$/, '')
          
          try {
            // Dynamically import the metadata from the MDX file
            const { metadata } = await import(`@/content/blog/${slug}.mdx`)
            
            // Return post data with slug and metadata
            return {
              slug,
              title: metadata.title || 'Untitled',
              date: metadata.date || new Date().toISOString(),
              excerpt: metadata.excerpt || '',
              tags: metadata.tags || [],
            }
          } catch (error) {
            console.error(`Error importing metadata for ${slug}:`, error)
            
            // Return basic post data in case of error
            return {
              slug,
              title: 'Error Loading Post',
              date: new Date().toISOString(),
              excerpt: 'There was an error loading this post.',
              tags: [],
            }
          }
        })
    )
    
    // Sort posts by date (newest first)
    return posts.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  } catch (error) {
    console.error('Error getting all posts:', error)
    return []
  }
} 