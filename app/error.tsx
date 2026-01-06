'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

/**
 * Application-level error boundary for Next.js App Router.
 * Catches errors in route segments and displays a user-friendly error UI.
 *
 * This component is automatically used by Next.js when an error occurs
 * in any child component tree.
 *
 * Note: This does NOT catch errors in the root layout - use global-error.tsx for that.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error)

    // TODO: Integrate with error reporting service (e.g., Sentry)
    // Example Sentry integration:
    // if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, {
    //     extra: {
    //       digest: error.digest,
    //     },
    //   })
    // }
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      {/* Background with subtle stars effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="text-gray-400">
            We encountered an unexpected error. Our team has been notified and is working on a fix.
          </p>
        </div>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-left">
            <p className="text-sm font-mono text-red-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/20"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>

        {/* Support Link */}
        <p className="text-sm text-gray-500">
          If this problem persists, please{' '}
          <a
            href="mailto:support@eventhorizon.space"
            className="text-blue-400 hover:underline"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}
