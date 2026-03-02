#!/usr/bin/env bun
import fs from 'fs'
import path from 'path'
import { getAllPosts } from '../lib/mdx'
import { fetchAllPosts } from '../lib/contentful'

// Base URL of the website
const BASE_URL = 'https://hackyexperiments.com' // Replace with your actual domain

// Directory to save the sitemap
const OUTPUT_DIR = path.join(process.cwd(), 'public')

// Directory where micro-experiments are stored
const MICRO_EXPERIMENTS_DIR = path.join(process.cwd(), 'app', '(micro)', 'micro')

// Main pages (hardcoded)
const MAIN_PAGES = [
  '', // Homepage
  'about',
  'blog',
  'experiments',
  'micro',
]

// Function to get all micro-experiments from the filesystem
function getMicroExperiments(): string[] {
  try {
    if (!fs.existsSync(MICRO_EXPERIMENTS_DIR)) {
      console.warn(`⚠️ Micro experiments directory not found: ${MICRO_EXPERIMENTS_DIR}`)
      return []
    }

    // Read all directories inside the micro-experiments directory
    return fs
      .readdirSync(MICRO_EXPERIMENTS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
  } catch (error) {
    console.error('❌ Error reading micro-experiments directory:', error)
    return []
  }
}

// Generate the sitemap XML
async function generateSitemap() {
  try {
    // Ensure public directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    // Start XML content
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    // Add main pages to sitemap
    for (const page of MAIN_PAGES) {
      const url = page ? `${BASE_URL}/${page}` : BASE_URL
      sitemap += `  <url>
    <loc>${url}</loc>
  </url>
`
    }

    // Add blog posts to sitemap from MDX
    console.log('Fetching MDX blog posts...')
    const mdxBlogPosts = await getAllPosts()
    for (const post of mdxBlogPosts) {
      sitemap += `  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.date).toISOString().split('T')[0]}</lastmod>
  </url>
`
    }

    // Add experiments to sitemap from Contentful
    console.log('Fetching experiments from Contentful...')
    const experiments = await fetchAllPosts()
    for (const experiment of experiments) {
      sitemap += `  <url>
    <loc>${BASE_URL}/experiments/${experiment.slug}</loc>
    <lastmod>${new Date(experiment.publishDate).toISOString().split('T')[0]}</lastmod>
  </url>
`
    }

    // Get micro-experiments dynamically from filesystem
    console.log('Searching for micro-experiments in filesystem...')
    const microExperiments = getMicroExperiments()
    console.log(`Found ${microExperiments.length} micro-experiments.`)

    // Add micro-experiments to sitemap
    for (const experiment of microExperiments) {
      sitemap += `  <url>
    <loc>${BASE_URL}/micro/${experiment}</loc>
  </url>
`
    }

    // End XML content
    sitemap += `</urlset>`

    // Write sitemap to file
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap)

    console.log('✅ Sitemap generated successfully!')
  } catch (error) {
    console.error('❌ Error generating sitemap:', error)
  }
}

// Run the sitemap generator
generateSitemap()
