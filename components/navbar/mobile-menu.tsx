'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()

  // Close menu when navigating to a different page
  useEffect(() => {
    if (isOpen) onClose()
  }, [pathname, isOpen, onClose])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Experiments', path: '/experiments' },
    { name: 'Snippets', path: '/snippets' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 bg-background md:hidden'
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className='flex flex-col h-full p-6'>
            <div className='flex justify-between items-center mb-8'>
              <Link
                href='/'
                className='font-bold text-xl flex items-center'
                onClick={onClose}
              >
                <span className='text-yellow-600 mr-1'>Hacky</span>Experiments
              </Link>
              <Button
                variant='ghost'
                size='icon'
                onClick={onClose}
                aria-label='Close Menu'
              >
                <X size={24} />
              </Button>
            </div>

            <nav className='flex flex-col space-y-4'>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    'px-4 py-3 rounded-md text-lg font-medium transition-colors',
                    pathname === link.path
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'text-foreground/70 hover:text-foreground hover:bg-yellow-50'
                  )}
                  onClick={onClose}
                >
                  {link.name}
                </Link>
              ))}
              <a
                href='https://github.com/btahir/hacky-experiments'
                target='_blank'
                rel='noopener noreferrer'
                className='px-4 py-3 rounded-md text-lg font-medium flex items-center space-x-2 text-foreground/70 hover:text-foreground hover:bg-muted transition-colors'
              >
                <Github size={20} />
                <span>GitHub</span>
              </a>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
