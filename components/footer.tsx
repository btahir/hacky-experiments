import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'
import { mainNavLinks, siteConfig } from '@/lib/site-config'

export function Footer() {
  return (
    <footer className='border-t border-border/60 bg-card/40 backdrop-blur-sm'>
      <div className='mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Brand */}
          <div className='sm:col-span-2 lg:col-span-1'>
            <p className='text-base font-bold tracking-tight text-foreground'>
              <span className='text-primary'>Hacky</span> Experiments
            </p>
            <p className='mt-2 text-sm text-muted-foreground max-w-xs'>
              {siteConfig.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className='font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3'>
              Navigation
            </p>
            <ul className='space-y-2'>
              {mainNavLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className='text-sm text-foreground/70 transition-colors hover:text-primary'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className='font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3'>
              Connect
            </p>
            <ul className='space-y-2'>
              <li>
                <a
                  href={siteConfig.socials.github}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-primary'
                >
                  <Github className='size-3.5' />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.socials.x}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-primary'
                >
                  <Twitter className='size-3.5' />
                  X / Twitter
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.socials.linkedin}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-primary'
                >
                  <Linkedin className='size-3.5' />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Stack */}
          <div>
            <p className='font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3'>
              Stack
            </p>
            <div className='font-mono text-xs text-muted-foreground space-y-1'>
              <p>$ next.js + react</p>
              <p>$ tailwind + framer</p>
              <p>$ contentful cms</p>
              <p className='text-primary'>$ built with {'<3'}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='mt-10 border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3'>
          <p className='font-mono text-xs text-muted-foreground'>
            &copy; {new Date().getFullYear()} {siteConfig.creator.name}
          </p>
          <p className='font-mono text-xs text-muted-foreground/60'>
            v0.1.0 // hacky experiments
          </p>
        </div>
      </div>
    </footer>
  )
}
