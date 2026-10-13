'use client'

import Script from 'next/script'
import { useSyncExternalStore } from 'react'
import { siteConfig } from '@/lib/site-config'

const UMAMI_SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
const hostname = new URL(siteConfig.url).hostname.replace(/^www\./, '')
const PUBLIC_HOSTS = new Set([hostname, `www.${hostname}`])
const subscribe = () => () => {}
const serverSnapshot = () => false
const browserSnapshot = () => PUBLIC_HOSTS.has(window.location.hostname)

export function Analytics() {
  const enabled = useSyncExternalStore(subscribe, browserSnapshot, serverSnapshot)
  if (!enabled || !UMAMI_SCRIPT_URL || !UMAMI_WEBSITE_ID) {
    return null
  }

  return (
    <Script
      src={UMAMI_SCRIPT_URL}
      data-website-id={UMAMI_WEBSITE_ID}
      data-domains={[...PUBLIC_HOSTS].join(',')}
      data-exclude-search='true'
      data-exclude-hash='true'
      strategy='afterInteractive'
    />
  )
}
