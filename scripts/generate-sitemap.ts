#!/usr/bin/env bun
import fs from 'fs'
import path from 'path'
import { getAllPosts } from '../lib/mdx'
import { fetchAllPosts } from '../lib/contentful'

// Base URL of the website
const BASE_URL = 'https://hackyexperiments.com' // Replace with your actual domain

// Directory to save the sitemap
const APP_DIR = path.join(process.cwd(), 'app')

// Main pages (hardcoded)
const MAIN_PAGES = [
  '', // Homepage
  'about',
  'blog',
  'experiments',
  'micro-experiments',
]

// Micro experiments (hardcoded)
const MICRO_EXPERIMENTS = [
  'test-app',
  // Add more micro-experiments here
]

// Generate the sitemap XML
async function generateSitemap() {
  try {
    // Ensure public directory exists
    if (!fs.existsSync(APP_DIR)) {
      fs.mkdirSync(APP_DIR, { recursive: true })
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
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
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
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`
    }

    // Add experiments to sitemap from Contentful
    console.log('Fetching experiments from Contentful...')
    const experiments = await fetchAllPosts()
    for (const experiment of experiments) {
      sitemap += `  <url>
    <loc>${BASE_URL}/experiments/${experiment.slug}</loc>
    <lastmod>${
      new Date(experiment.publishDate).toISOString().split('T')[0]
    }</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`
    }

    // Add micro-experiments to sitemap
    for (const experiment of MICRO_EXPERIMENTS) {
      sitemap += `  <url>
    <loc>${BASE_URL}/micro-experiments/${experiment}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`
    }

    // End XML content
    sitemap += `</urlset>`

    // Write sitemap to file
    fs.writeFileSync(path.join(APP_DIR, 'sitemap.xml'), sitemap)

    console.log('✅ Sitemap generated successfully!')
  } catch (error) {
    console.error('❌ Error generating sitemap:', error)
  }
}

// Run the sitemap generator
generateSitemap()
