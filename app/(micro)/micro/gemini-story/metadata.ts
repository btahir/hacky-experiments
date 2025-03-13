import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gemini Story | Hacky Experiments',
  description: 'Generate a story with text and images using Gemini.',
  openGraph: {
    images: [
      { url: '/public/micro-experiments/gemini-story.png' },
    ],
  },
}
