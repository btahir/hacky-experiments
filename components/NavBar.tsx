'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MobileMenu } from './MobileMenu'

export function NavBar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Experiments', path: '/experiments' },
    { name: 'Snippets', path: '/snippets' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
  ]

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-4',
          isScrolled
            ? 'bg-background/80 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className='container mx-auto px-4 flex items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='font-bold text-xl flex items-center text-yellow-950'>
            <img src='/icon.svg' alt='Hacky Experiments' className='w-8 h-8 mr-2' />
            <span className='text-red-500 mr-1'>Hacky</span>Experiments
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-1'>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === link.path
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-foreground/70 hover:text-foreground hover:bg-yellow-50'
                )}
              >
                {link.name}
              </Link>
            ))}
            <a
              href='https://github.com/btahir/hacky-experiments'
              target='_blank'
              rel='noopener noreferrer'
              className='ml-2 p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted transition-colors'
              aria-label='GitHub Repository'
            >
              <Github size={20} />
            </a>
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className='md:hidden flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              className='text-foreground'
              onClick={() => setMobileMenuOpen(true)}
              aria-label='Open Menu'
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  )
}
