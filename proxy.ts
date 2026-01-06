import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js 16 Proxy Function
 *
 * This file replaces the deprecated middleware.ts convention.
 * The proxy runs on every request matching the configured paths and handles:
 * - Supabase session refresh and cookie management
 * - Route protection for authenticated routes
 * - Redirecting authenticated users away from auth pages
 *
 * Key differences from middleware.ts:
 * - Uses Node.js runtime (not Edge runtime)
 * - Function is named 'proxy' instead of 'middleware'
 * - Same configuration and matching behavior
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 * @see https://supabase.com/docs/guides/auth/server-side/creating-a-client
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (svg, png, jpg, jpeg, gif, webp)
     *
     * This ensures the proxy runs for all pages and API routes
     * while skipping static assets for performance.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
