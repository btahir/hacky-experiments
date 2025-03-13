'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'

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

  // Only close menu when navigating to a different page
  useEffect(() => {
    if (isOpen && pathname !== window.location.pathname) {
      onClose()
    }
  }, [pathname, isOpen, onClose])

  // Add body overflow control to prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden md:hidden pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed inset-0 bg-background overflow-hidden pointer-events-auto'
            initial={{ opacity: 0, translateX: '100%' }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div 
              className='flex flex-col h-full p-6 overflow-y-auto overflow-x-hidden max-w-full pointer-events-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex justify-between items-center mb-8'>
                <Link
                  href='/'
                  className='font-bold text-xl flex items-center text-yellow-950 pointer-events-auto'
                  onClick={handleLinkClick}
                >
                  <img
                    src='/icon.svg'
                    alt='Hacky Experiments'
                    className='w-8 h-8 mr-2'
                  />
                  <span className='text-red-500 mr-1'>Hacky</span>Experiments
                </Link>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                  }}
                  aria-label='Close Menu'
                  type="button"
                  className="pointer-events-auto"
                >
                  <X size={24} />
                </Button>
              </div>

              <nav className='flex flex-col space-y-4 w-full'>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={cn(
                      'px-4 py-3 rounded-md text-lg font-medium transition-colors w-full pointer-events-auto',
                      pathname === link.path
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'text-foreground/70 hover:text-foreground hover:bg-yellow-50'
                    )}
                    onClick={handleLinkClick}
                  >
                    {link.name}
                  </Link>
                ))}
                <a
                  href='https://github.com/btahir/hacky-experiments'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='px-4 py-3 rounded-md text-lg font-medium flex items-center space-x-2 text-foreground/70 hover:text-foreground hover:bg-muted transition-colors pointer-events-auto'
                  onClick={handleLinkClick}
                >
                  <Github size={20} />
                  <span>GitHub</span>
                </a>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
