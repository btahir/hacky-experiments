import GeminiStory from './gemini-story-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gemini Story | Hacky Experiments',
  description: 'Generate a story with text and images using Gemini.',
  openGraph: {
    images: [{ url: '/micro-experiments/gemini-story.png' }],
  },
}

export default function GeminiStoryPage() {
  return <GeminiStory />
}
