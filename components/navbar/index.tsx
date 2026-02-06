'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MobileMenu } from './mobile-menu'
import { mainNavLinks, siteConfig } from '@/lib/site-config'

export function NavBar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header className='fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-4'>
        <div className='mx-auto max-w-6xl'>
          <div
            className={cn(
              'flex items-center justify-between rounded-xl border px-4 py-2 transition-all duration-300 sm:px-5',
              isScrolled
                ? 'border-border/70 bg-card/92 shadow-[0_8px_30px_-12px_oklch(0.3_0.02_50_/_0.2)] backdrop-blur-lg'
                : 'border-border/40 bg-card/60 backdrop-blur-md'
            )}
          >
            <Link href='/' className='flex items-center gap-2.5'>
              <Image
                src='/icon.svg'
                alt={siteConfig.name}
                width={32}
                height={32}
                className='rounded-md'
                priority
              />
              <div className='leading-none'>
                <p className='font-mono text-[10px] tracking-widest uppercase text-muted-foreground'>
                  {siteConfig.creator.name}
                </p>
                <p className='text-base font-bold tracking-tight text-foreground'>
                  <span className='text-primary'>Hacky</span> Experiments
                </p>
              </div>
            </Link>

            <nav className='hidden items-center gap-0.5 md:flex'>
              {mainNavLinks.map((link) => {
                const isActive = pathname === link.path
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={cn(
                      'rounded-lg px-3 py-1.5 font-mono text-sm tracking-wide transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground/60 hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    {link.name}
                  </Link>
                )
              })}
              <a
                href={siteConfig.socials.github}
                target='_blank'
                rel='noopener noreferrer'
                className='ml-2 inline-flex items-center justify-center rounded-lg p-2 text-foreground/60 transition-colors hover:text-foreground hover:bg-accent/50'
                aria-label='View source on GitHub'
              >
                <Github className='size-4' />
              </a>
            </nav>

            <Button
              variant='ghost'
              size='icon'
              className='md:hidden'
              onClick={() => setMobileMenuOpen(true)}
              aria-label='Open navigation menu'
              aria-expanded={mobileMenuOpen}
              aria-controls='mobile-navigation'
              type='button'
            >
              <Menu className='size-5' />
            </Button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={mainNavLinks}
      />
    </>
  )
}
