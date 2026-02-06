'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function HeroTextAnimation({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      className='max-w-md space-y-6 w-full mx-auto lg:mx-0 text-center lg:text-left'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

export function HeroImageAnimation() {
  return (
    <motion.div
      className='w-full lg:w-1/2'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <div className='relative h-[500px] sm:h-[550px] md:h-[600px]'>
        {/* Decorative elements */}
        <div className='hidden lg:block absolute -top-6 -left-6 w-20 h-20 bg-primary/15 rounded-full blur-xl'></div>
        <div className='hidden lg:block absolute -bottom-8 -right-8 w-28 h-28 bg-primary/15 rounded-full blur-xl'></div>
        <div className='hidden lg:block absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-24 bg-primary/15 rounded-full blur-lg'></div>

        {/* Nail */}
        <div className='absolute top-0 left-1/2 -translate-x-1/2 z-10'>
          <div className='w-6 h-6 rounded-full bg-neutral-700 shadow-md'></div>
          <div className='w-2 h-4 bg-neutral-800 mx-auto -mt-1 rounded-b-sm shadow-sm'></div>
        </div>

        {/* Single thread */}
        <div className='absolute top-6 left-1/2 -translate-x-1/2 h-10 w-[1px] bg-neutral-400'></div>

        {/* Hanging frame with shadow */}
        <motion.div
          className='absolute top-16 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px]'
          animate={{
            rotate: ['-1deg', '1deg', '-1deg'],
          }}
          transition={{
            duration: 6,
            ease: 'easeInOut',
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          {/* Frame border */}
          <div className='bg-foreground/85 p-3 rounded-xl shadow-lg transform rotate-1'>
            {/* White mat border */}
            <div className='bg-neutral-100 p-3 rounded-lg'>
              {/* Hero image */}
              <Image
                alt='Hacky experiments illustration'
                src='/hero.png'
                className='w-full h-[350px] sm:h-[400px] md:h-[450px] object-cover rounded-lg border border-neutral-600'
                width={1000}
                height={1000}
              />
            </div>
          </div>

          {/* Shadow beneath the frame */}
          <div className='absolute -bottom-4 left-1/2 -translate-x-1/2 w-[95%] h-4 bg-black/20 blur-md rounded-full'></div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function SectionAnimation({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

export function CardAnimation({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}
