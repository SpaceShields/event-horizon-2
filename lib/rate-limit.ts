/**
 * Rate Limiting Utilities for Event Horizon
 *
 * This module provides rate limiting functionality to protect API endpoints
 * from abuse. Two implementations are provided:
 *
 * 1. Simple in-memory rate limiter (development/testing)
 * 2. Upstash Redis rate limiter (production - requires setup)
 *
 * @see DEPLOYMENT.md for configuration instructions
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate limit configuration for different endpoint types
 */
export const RATE_LIMITS = {
  auth: {
    login: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per minute
    signup: { maxRequests: 3, windowMs: 5 * 60 * 1000 }, // 3 per 5 minutes
    resetPassword: { maxRequests: 3, windowMs: 15 * 60 * 1000 }, // 3 per 15 minutes
  },
  api: {
    createEvent: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
    readEvents: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
    register: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  },
} as const

/**
 * In-memory rate limit store
 *
 * WARNING: This is suitable for development only. In production with
 * serverless functions, each invocation has its own memory space,
 * so rate limits won't persist across function calls.
 *
 * For production, use the Upstash implementation below.
 */
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>()

/**
 * Simple in-memory rate limiter
 *
 * @param identifier - Unique identifier (usually IP address or user ID)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with success status and rate limit headers
 */
export function simpleRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k)
      }
    }
  }

  const record = rateLimitStore.get(key)

  // First request or window expired
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs
    rateLimitStore.set(key, { count: 1, resetTime })
    return { success: true, remaining: maxRequests - 1, reset: resetTime }
  }

  // Within window, check limit
  if (record.count >= maxRequests) {
    return { success: false, remaining: 0, reset: record.resetTime }
  }

  // Increment count
  record.count++
  return {
    success: true,
    remaining: maxRequests - record.count,
    reset: record.resetTime,
  }
}

/**
 * Get client IP address from request headers
 *
 * @param request - Next.js request object
 * @returns IP address string
 */
export function getClientIp(request: NextRequest): string {
  // Vercel provides the real IP in x-forwarded-for
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take the first IP if there are multiple
    return forwardedFor.split(',')[0].trim()
  }

  // Fallback headers
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Default fallback
  return 'unknown'
}

/**
 * Create rate limit response headers
 *
 * @param limit - Maximum requests allowed
 * @param remaining - Remaining requests in window
 * @param reset - Unix timestamp when window resets
 * @returns Headers object
 */
export function createRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number
): HeadersInit {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
    'X-RateLimit-Reset': Math.ceil(reset / 1000).toString(),
    'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
  }
}

/**
 * Rate limit configuration type
 */
type RateLimitConfig = { maxRequests: number; windowMs: number }

/**
 * Flat rate limit config map for type-safe access
 */
const RATE_LIMIT_CONFIG: Record<string, RateLimitConfig> = {
  'auth:login': RATE_LIMITS.auth.login,
  'auth:signup': RATE_LIMITS.auth.signup,
  'auth:resetPassword': RATE_LIMITS.auth.resetPassword,
  'api:createEvent': RATE_LIMITS.api.createEvent,
  'api:readEvents': RATE_LIMITS.api.readEvents,
  'api:register': RATE_LIMITS.api.register,
}

/**
 * Rate limit type keys
 */
export type RateLimitType = keyof typeof RATE_LIMIT_CONFIG

/**
 * Rate limit middleware wrapper for API routes
 *
 * Usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = withRateLimit(request, 'auth:login')
 *   if (rateLimitResult) return rateLimitResult // Return 429 response
 *
 *   // Continue with normal logic...
 * }
 * ```
 *
 * @param request - Next.js request object
 * @param limitType - Rate limit type key (e.g., 'auth:login')
 * @returns NextResponse if rate limited, null if allowed
 */
export function withRateLimit(
  request: NextRequest,
  limitType: RateLimitType
): NextResponse | null {
  const config = RATE_LIMIT_CONFIG[limitType]

  if (!config) {
    console.warn(`Unknown rate limit type: ${limitType}`)
    return null
  }

  const ip = getClientIp(request)
  const identifier = `${limitType}:${ip}`

  const { success, remaining, reset } = simpleRateLimit(
    identifier,
    config.maxRequests,
    config.windowMs
  )

  if (!success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Please wait before trying again.',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: createRateLimitHeaders(config.maxRequests, remaining, reset),
      }
    )
  }

  return null
}

/**
 * Upstash Redis Rate Limiter (Production)
 *
 * To enable production-grade rate limiting:
 *
 * 1. Create an Upstash account: https://upstash.com/
 * 2. Create a Redis database
 * 3. Add environment variables:
 *    - UPSTASH_REDIS_REST_URL
 *    - UPSTASH_REDIS_REST_TOKEN
 * 4. Install packages:
 *    npm install @upstash/ratelimit @upstash/redis
 * 5. Uncomment and use the code below:
 *
 * ```typescript
 * import { Ratelimit } from '@upstash/ratelimit'
 * import { Redis } from '@upstash/redis'
 *
 * const redis = Redis.fromEnv()
 *
 * const rateLimiters = {
 *   auth: new Ratelimit({
 *     redis,
 *     limiter: Ratelimit.slidingWindow(5, '60 s'),
 *     analytics: true,
 *     prefix: 'event-horizon:auth',
 *   }),
 *   signup: new Ratelimit({
 *     redis,
 *     limiter: Ratelimit.slidingWindow(3, '300 s'),
 *     analytics: true,
 *     prefix: 'event-horizon:signup',
 *   }),
 * }
 *
 * export async function checkRateLimit(
 *   identifier: string,
 *   type: keyof typeof rateLimiters
 * ) {
 *   const { success, limit, reset, remaining } = await rateLimiters[type].limit(identifier)
 *   return { success, limit, reset, remaining }
 * }
 * ```
 */
