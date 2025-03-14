'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// List of micro experiments
const microExperiments: any = [
  {
    id: 'gemini-story',
    title: 'Gemini Story Generator',
    description:
      "Generate visual stories using Google's Gemini AI model based on your prompts",
    icon: '🤖',
    tags: ['AI', 'Gemini', 'Visual Stories'],
    path: '/gemini-story',
  },
]

export default function MicroExperimentsPage() {
  return (
    <main className='min-h-screen bg-yellow-50 py-12 px-4'>
      <section className='max-w-6xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-16'
        >
          <h1 className='font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground mb-6'>
            Explore My{' '}
            <span className='text-red-500 font-bold'>Micro Experiments</span>
          </h1>
          <p className='text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto'>
            A collection of micro experiments built to showcase specific
            technologies and techniques. The code is part of the codebase here.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {microExperiments.map((experiment: any, index: any) => (
            <motion.div
              key={experiment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/micro${experiment.path}`} className='block h-full'>
                <Card className='h-full hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-yellow-200 overflow-hidden group'>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div className='w-12 h-12 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center text-2xl mb-3'>
                        {experiment.icon}
                      </div>
                      <div className='flex gap-2'>
                        {experiment.tags.map((tag: any, i: any) => (
                          <Badge key={i} variant='outline' className='text-xs'>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <CardTitle className='text-2xl'>
                      {experiment.title}
                    </CardTitle>
                    <CardDescription>{experiment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className='text-muted-foreground'>
                      Click to open this micro experiment and explore its
                      functionality.
                    </p>
                  </CardContent>
                  <CardFooter className='flex justify-end items-center pt-2'>
                    <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-yellow-600 transition-colors duration-300 group-hover:translate-x-1' />
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
