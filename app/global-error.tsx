'use client'

import { useEffect } from 'react'

/**
 * Global error boundary for Next.js App Router.
 *
 * This component catches errors in the ROOT layout (app/layout.tsx).
 * Since the root layout is replaced, this component MUST include its own
 * <html> and <body> tags.
 *
 * Note: global-error.tsx only runs in production. In development, the
 * error overlay will show instead.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console
    console.error('Global error:', error)

    // TODO: Integrate with error reporting service (e.g., Sentry)
    // Example Sentry integration:
    // if (typeof window !== 'undefined') {
    //   Sentry.captureException(error, {
    //     level: 'fatal',
    //     extra: {
    //       digest: error.digest,
    //       isGlobalError: true,
    //     },
    //   })
    // }
  }, [error])

  return (
    <html lang="en" className="dark">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        {/* Inline styles used because global CSS may not be loaded */}
        <div style={{
          maxWidth: '28rem',
          width: '100%',
          textAlign: 'center',
        }}>
          {/* Error Icon */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Inline SVG for AlertTriangle since lucide-react may not load */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f87171"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}>
            Critical Error
          </h1>
          <p style={{
            color: '#9ca3af',
            marginBottom: '1.5rem',
          }}>
            A critical error has occurred. We apologize for the inconvenience.
          </p>

          {/* Error Details (shown only in development via env check at build time) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}>
              <p style={{
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: '#f87171',
                wordBreak: 'break-all',
                margin: 0,
              }}>
                {error.message}
              </p>
              {error.digest && (
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.5rem',
                  marginBottom: 0,
                }}>
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#fff',
              color: '#000',
              fontWeight: 500,
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              marginBottom: '1rem',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#fff'
            }}
          >
            {/* Inline SVG for RefreshCw */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '0.5rem' }}
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Try Again
          </button>

          {/* Support Link */}
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
          }}>
            If this problem persists, please{' '}
            <a
              href="mailto:support@eventhorizon.space"
              style={{ color: '#60a5fa', textDecoration: 'none' }}
              onMouseOver={(e) => {
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              contact support
            </a>
          </p>
        </div>
      </body>
    </html>
  )
}
