import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Search: Configurable requests per minute
export const geminiStoryRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'),
})

export const geminiPhotoRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '15 m'),
})

export const gifFaceSwapRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '24 h'), // 5 swaps per 24 hours globally
})
