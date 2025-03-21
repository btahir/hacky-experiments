'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Github, Twitter, Linkedin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

export default function AboutPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <main className='min-h-screen bg-yellow-50 py-20'>
      <div className='container mx-auto px-4 sm:px-6 max-w-5xl'>
        {/* Hero Section */}
        <div className='flex flex-col items-center mb-16'>
          <motion.div
            className='mb-6'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className='relative'>
              <div className='absolute -inset-1 rounded-full bg-gradient-to-tl from-red-500 to-yellow-400 opacity-70 blur'></div>
              <Image
                src='/me.png'
                alt="Bilal's profile photo"
                width={800}
                height={800}
                className='relative w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-full border-4 border-white'
              />
            </div>
          </motion.div>

          <motion.h1
            className='text-4xl sm:text-5xl font-bold mb-4 text-center'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className='text-red-500'>Hello,</span> I&apos;m Bilal
          </motion.h1>

          <motion.div
            className='flex gap-2 flex-wrap justify-center mb-6'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge className='bg-red-100 text-red-700 hover:bg-red-200'>
              Builder
            </Badge>
            <Badge className='bg-yellow-100 text-yellow-700 hover:bg-yellow-200'>
              Creator
            </Badge>
            <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-200'>
              Developer
            </Badge>
            <Badge className='bg-green-100 text-green-700 hover:bg-green-200'>
              (Over) Thinker
            </Badge>
          </motion.div>

          <motion.div
            className='flex gap-4 mt-4'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a
              href='https://twitter.com/deepwhitman'
              target='_blank'
              rel='noreferrer'
              className='p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-300'
              aria-label='Twitter'
            >
              <Twitter size={20} className='text-blue-400' />
            </a>
            <a
              href='https://github.com/btahir'
              target='_blank'
              rel='noreferrer'
              className='p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-300'
              aria-label='GitHub'
            >
              <Github size={20} className='text-gray-800' />
            </a>
            <a
              href='https://www.linkedin.com/in/biltahir/'
              target='_blank'
              rel='noreferrer'
              className='p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-300'
              aria-label='Linkedin'
            >
              <Linkedin size={20} className='text-blue-500' />
            </a>
          </motion.div>
        </div>

        {/* Quote Section */}
        <motion.div
          className='rounded-xl bg-white p-8 mb-12 shadow-md'
          initial='hidden'
          animate='visible'
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <blockquote className='text-2xl sm:text-3xl italic text-gray-700 text-center'>
            &quot;All life is an experiment. The more experiments you make the
            better.&quot;
          </blockquote>
          <p className='text-lg text-gray-500 mt-4 text-center'>
            — Ralph Waldo Emerson
          </p>
        </motion.div>

        {/* About Me Section */}
        <motion.div
          className='mb-16'
          initial='hidden'
          animate='visible'
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className='text-lg text-gray-700 space-y-6'>
            <p>
              Hello! I&apos;m Bilal. I like to build things and try out some
              weird hacky experiments. I&apos;m at my happiest in the thick of
              the creation process, going from ideation to execution.
            </p>
            <p>
              Things don&apos;t always work out, but I love the process and hope
              to share some of it here. Would love to have you along for the
              ride. Let&apos;s have an adventure together!
            </p>
            <p>
              You can find some of my experiments{' '}
              <Link
                href='/experiments'
                className='text-red-500 hover:text-red-700 font-medium underline underline-offset-2'
              >
                here
              </Link>
              . If you&apos;re curious about how I build stuff, you can read
              about my process{' '}
              <Link
                href='/process'
                className='text-red-500 hover:text-red-700 font-medium underline underline-offset-2'
              >
                here
              </Link>
              .
            </p>
            <p>Happy travels! 😀</p>
            <p className='font-medium'>— Bilal</p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className='text-center'
          initial='hidden'
          animate='visible'
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className='bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg'>
            <CardContent className='p-8'>
              <h3 className='text-2xl font-bold mb-4'>Let&apos;s Connect!</h3>
              <p className='mb-6'>
                Follow me on Twitter to catch the latest shenanigans I&apos;m
                getting myself into.
              </p>
              <a
                href='https://twitter.com/deepwhitman'
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center bg-white text-blue-500 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors duration-300'
              >
                <Twitter size={18} className='mr-2' />
                Follow @deepwhitman
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
