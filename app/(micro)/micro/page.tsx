import MicroExperimentsPage from './micro-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Micro Experiments | Hacky Experiments',
  description: 'Some micro experiments, I made.',
}

export default function Micro() {
  return <MicroExperimentsPage />
}
