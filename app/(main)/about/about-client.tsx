'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Github, Twitter, Linkedin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { siteConfig } from '@/lib/site-config'

export default function AboutPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <main className='min-h-screen py-20'>
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
              <div className='absolute -inset-1 rounded-full bg-gradient-to-tl from-primary/70 to-primary/30 opacity-70 blur'></div>
              <Image
                src='/me.png'
                alt="Bilal's profile photo"
                width={800}
                height={800}
                className='relative w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-full border-4 border-card'
              />
            </div>
          </motion.div>

          <motion.h1
            className='text-4xl sm:text-5xl font-bold mb-4 text-center'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className='text-primary'>Hello,</span> I&apos;m Bilal
          </motion.h1>

          <motion.div
            className='flex gap-2 flex-wrap justify-center mb-6'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {['Builder', 'Creator', 'Developer', '(Over) Thinker'].map((label) => (
              <Badge
                key={label}
                className='bg-primary/8 text-primary font-mono text-xs tracking-wider'
              >
                {label}
              </Badge>
            ))}
          </motion.div>

          <motion.div
            className='flex gap-4 mt-4'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a
              href={siteConfig.socials.x}
              target='_blank'
              rel='noreferrer'
              className='p-2 bg-card rounded-full shadow-md hover:shadow-lg transition-shadow duration-300'
              aria-label='Twitter'
            >
              <Twitter size={20} className='text-primary' />
            </a>
            <a
              href={siteConfig.socials.github}
              target='_blank'
              rel='noreferrer'
              className='p-2 bg-card rounded-full shadow-md hover:shadow-lg transition-shadow duration-300'
              aria-label='GitHub'
            >
              <Github size={20} className='text-foreground' />
            </a>
            <a
              href={siteConfig.socials.linkedin}
              target='_blank'
              rel='noreferrer'
              className='p-2 bg-card rounded-full shadow-md hover:shadow-lg transition-shadow duration-300'
              aria-label='Linkedin'
            >
              <Linkedin size={20} className='text-primary' />
            </a>
          </motion.div>
        </div>

        {/* Quote Section */}
        <motion.div
          className='rounded-xl border border-border/60 bg-card/80 p-8 mb-12'
          initial='hidden'
          animate='visible'
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <blockquote className='text-2xl sm:text-3xl italic text-foreground/70 text-center'>
            &quot;All life is an experiment. The more experiments you make the
            better.&quot;
          </blockquote>
          <p className='font-mono text-sm text-muted-foreground mt-4 text-center'>
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
          <div className='text-lg text-foreground/80 space-y-6'>
            <p>
              Hello! I&apos;m Bilal — a product engineer who lives at the intersection of AI, front-end development, and shipping fast. I&apos;ve launched close to 100 projects with Next.js, and I&apos;m at my happiest in the thick of the creation process, going from ideation to execution.
            </p>
            <p>
              By day, I build products. By night (and also by day), I tinker with AI video generation, spec-driven development workflows, and whatever new model just dropped. I co-host the{' '}
              <a
                href='https://creativefluxpodcast.com/'
                target='_blank'
                rel='noreferrer'
                className='text-primary hover:text-primary/80 font-medium underline underline-offset-2'
              >
                Creative Flux podcast
              </a>
              {' '}with Pierson Marks, where we talk about generative AI and go off the rails into all sorts of rabbit holes.
            </p>
            <p>
              I&apos;m also building{' '}
              <span className='font-medium text-foreground'>Jellypod</span>
              {' '}— an AI podcast platform — and writing about everything I learn along the way. I believe the best way to understand new technology is to build with it, break it, and share the results.
            </p>
            <p>
              Things don&apos;t always work out, but that&apos;s the point. You can find my{' '}
              <Link
                href='/experiments'
                className='text-primary hover:text-primary/80 font-medium underline underline-offset-2'
              >
                experiments
              </Link>
              , read the{' '}
              <Link
                href='/blog'
                className='text-primary hover:text-primary/80 font-medium underline underline-offset-2'
              >
                blog
              </Link>
              , or check out{' '}
              <Link
                href='/uses'
                className='text-primary hover:text-primary/80 font-medium underline underline-offset-2'
              >
                what I use
              </Link>
              {' '}to build all of this. Would love to have you along for the ride.
            </p>
            <p>Happy travels!</p>
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
          <Card className='bg-primary text-primary-foreground shadow-lg'>
            <CardContent className='p-8'>
              <h3 className='text-2xl font-bold mb-4'>Let&apos;s Connect!</h3>
              <p className='mb-6 text-primary-foreground/80'>
                Follow me on Twitter to catch the latest shenanigans I&apos;m
                getting myself into.
              </p>
              <a
                href={siteConfig.socials.x}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center bg-primary-foreground text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary-foreground/90 transition-colors duration-300'
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
