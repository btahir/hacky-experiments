import TimeTravelerApp from './time-traveler-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Time Traveler | Hacky Experiments',
  description: "Create aged versions of photos with AI-powered age progression in 10-year increments.",
  openGraph: {
    images: [{ url: '/micro-experiments/time-traveler.png' }],
  },
}

export const maxDuration = 60

export default function TimeTravelerPage() {
  return <TimeTravelerApp />
}