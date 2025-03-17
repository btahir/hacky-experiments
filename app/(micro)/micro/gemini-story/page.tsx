import GeminiFlashApp from './gemini-flash-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gemini Flash Experiments | Hacky Experiments',
  description: 'Explore the capabilities of Google\'s Gemini AI with interactive demos for story creation and image enhancement.',
  openGraph: {
    images: [{ url: '/micro-experiments/gemini-story.png' }],
  },
}

export default function GeminiFlashPage() {
  return <GeminiFlashApp />
}
