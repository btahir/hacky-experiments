import JFKClient from './jfk-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JFK Files | Hacky Experiments',
  description: 'A collection of JFK files.',
  openGraph: {
    images: [{ url: '/micro-experiments/jfk.png' }],
  },
}

function JFKPage() {
  return <JFKClient />
}

export default JFKPage
