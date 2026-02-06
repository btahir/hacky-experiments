import MicroExperimentsPage from './micro-client'
import { Metadata } from 'next'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Micro Experiments | Hacky Experiments',
  description: 'Some micro experiments, I made.',
  alternates: {
    canonical: '/micro',
  },
  openGraph: {
    title: `Micro Experiments | ${siteConfig.name}`,
    description: 'Some micro experiments, I made.',
    url: '/micro',
  },
}

export default function Micro() {
  return <MicroExperimentsPage />
}
