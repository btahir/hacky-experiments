'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { siteConfig } from '@/lib/site-config'

interface NavLink {
  name: string
  path: string
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navLinks: NavLink[]
}

export function MobileMenu({ isOpen, onClose, navLinks }: MobileMenuProps) {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current !== pathname && isOpen) {
      onClose()
    }
    previousPathname.current = pathname
  }, [pathname, isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className='fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] md:hidden'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            id='mobile-navigation'
            className='ml-auto flex h-full w-[min(84vw,360px)] flex-col border-l border-border/80 bg-background/98 p-6 shadow-2xl'
            initial={{ x: 80, opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0.8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className='mb-8 flex items-center justify-between'>
              <p className='font-mono text-sm tracking-widest uppercase text-muted-foreground'>Menu</p>
              <Button
                variant='ghost'
                size='icon'
                onClick={onClose}
                aria-label='Close navigation menu'
                type='button'
              >
                <X className='size-5' />
              </Button>
            </div>

            <nav className='space-y-1'>
              {navLinks.map((link) => {
                const isActive = pathname === link.path
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={cn(
                      'block rounded-lg px-4 py-3 font-mono text-sm tracking-wide transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </nav>

            <div className='mt-auto space-y-3'>
              <div className='rounded-xl border border-border/60 bg-card/60 p-4'>
                <p className='font-mono text-xs text-muted-foreground mb-2'>$ open --source</p>
                <a
                  href={siteConfig.socials.github}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90'
                >
                  <Github className='size-4' />
                  View on GitHub
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
