/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window (token bucket per IP).
 * Not distributed — resets on server restart.
 * For production, replace with Redis-backed solution.
 */

interface Bucket {
  count:     number
  resetAt:   number
}

const store = new Map<string, Bucket>()

export interface RateLimitOptions {
  /** Maximum requests allowed per window */
  limit: number
  /** Window size in seconds */
  windowSec: number
}

const DEFAULTS: RateLimitOptions = { limit: 60, windowSec: 60 }

/**
 * Returns null if the request is allowed, or an error Response if rate limited.
 */
export function rateLimit(
  request: Request,
  options: Partial<RateLimitOptions> = {}
): Response | null {
  const { limit, windowSec } = { ...DEFAULTS, ...options }
  const now = Date.now()

  // Derive key from IP (cf-connecting-ip → x-forwarded-for → x-real-ip → 'local')
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'local'

  const key = ip

  let bucket = store.get(key)

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 1, resetAt: now + windowSec * 1000 }
    store.set(key, bucket)
    return null // allowed
  }

  bucket.count++

  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    return new Response(
      JSON.stringify({
        success: false,
        error:   'Too many requests',
        code:    'RATE_LIMITED',
        retryAfter,
      }),
      {
        status:  429,
        headers: {
          'Content-Type':  'application/json',
          'Retry-After':   String(retryAfter),
          'X-RateLimit-Limit':     String(limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  return null // allowed
}

// Cleanup stale buckets every 5 minutes
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of store) {
      if (now > bucket.resetAt) store.delete(key)
    }
  }, 5 * 60 * 1000)
  // Allow process to exit even if timer is pending (important for tests)
  if (timer && typeof timer === 'object' && 'unref' in timer) {
    (timer as NodeJS.Timeout).unref()
  }
}
