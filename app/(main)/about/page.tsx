import AboutPage from './about-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Me | Hacky Experiments',
  description: 'Learn more about the creator of Hacky Experiments',
}

export default function About() {
  return <AboutPage />
}
