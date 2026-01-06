/**
 * Environment Variable Validation
 *
 * This module validates that all required environment variables are set
 * at application startup. Import this module early in the application
 * lifecycle to ensure configuration errors are caught immediately.
 */

/**
 * Required environment variables for the application.
 * Each entry includes the variable name, whether it's public (client-side),
 * and a description of its purpose.
 */
const requiredEnvVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    isPublic: true,
    description: 'Supabase project URL (e.g., https://your-project.supabase.co)',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    isPublic: true,
    description: 'Supabase anonymous/public API key for client-side access',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    isPublic: false,
    description: 'Supabase service role key for server-side admin operations',
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    isPublic: true,
    description: 'The public URL of the site (e.g., https://yourdomain.com)',
  },
] as const

/**
 * Validates that all required environment variables are set.
 * Throws an error with details about missing variables if validation fails.
 *
 * @param options.skipServerVars - Skip validation of server-only variables (for client-side)
 * @throws Error if any required environment variables are missing
 */
export function validateEnv(options?: { skipServerVars?: boolean }): void {
  const missing: Array<{ name: string; description: string }> = []

  for (const envVar of requiredEnvVars) {
    // Skip server-side variables if running on client
    if (options?.skipServerVars && !envVar.isPublic) {
      continue
    }

    // Use direct access for client-side to work with Next.js static replacement
    let value: string | undefined
    if (typeof window !== 'undefined') {
      // Client-side: use direct access for NEXT_PUBLIC_ vars
      switch (envVar.name) {
        case 'NEXT_PUBLIC_SUPABASE_URL':
          value = process.env.NEXT_PUBLIC_SUPABASE_URL
          break
        case 'NEXT_PUBLIC_SUPABASE_ANON_KEY':
          value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          break
        case 'NEXT_PUBLIC_SITE_URL':
          value = process.env.NEXT_PUBLIC_SITE_URL
          break
      }
    } else {
      // Server-side: dynamic access works fine
      value = process.env[envVar.name]
    }

    if (!value || value.trim() === '') {
      missing.push({
        name: envVar.name,
        description: envVar.description,
      })
    }
  }

  if (missing.length > 0) {
    const errorMessage = [
      'Missing required environment variables:',
      '',
      ...missing.map((v) => `  - ${v.name}: ${v.description}`),
      '',
      'Please ensure these variables are set in your .env.local file (for development)',
      'or in your deployment environment (Vercel, etc.).',
      '',
      'See DEPLOYMENT.md for configuration instructions.',
    ].join('\n')

    throw new Error(errorMessage)
  }
}

/**
 * Type-safe environment variable getter.
 * Returns the value of an environment variable or throws if not set.
 *
 * @param name - The name of the environment variable
 * @returns The value of the environment variable
 * @throws Error if the variable is not set
 */
export function getEnvVar(name: string): string {
  let value: string | undefined

  // Use direct access for known public vars on client-side
  if (typeof window !== 'undefined') {
    switch (name) {
      case 'NEXT_PUBLIC_SUPABASE_URL':
        value = process.env.NEXT_PUBLIC_SUPABASE_URL
        break
      case 'NEXT_PUBLIC_SUPABASE_ANON_KEY':
        value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        break
      case 'NEXT_PUBLIC_SITE_URL':
        value = process.env.NEXT_PUBLIC_SITE_URL
        break
      default:
        throw new Error(
          `Cannot access server-side environment variable ${name} from client. ` +
            'Only NEXT_PUBLIC_* variables are available in the browser.'
        )
    }
  } else {
    // Server-side: dynamic access works
    value = process.env[name]
  }

  if (!value || value.trim() === '') {
    throw new Error(
      `Environment variable ${name} is not set. ` +
        'Please check your environment configuration.'
    )
  }

  return value
}

/**
 * Type-safe access to validated environment variables.
 * Use this object to access environment variables with TypeScript support.
 */
export const env = {
  get supabaseUrl(): string {
    return getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  },
  get supabaseAnonKey(): string {
    return getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  },
  get supabaseServiceRoleKey(): string {
    return getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
  },
  get siteUrl(): string {
    return getEnvVar('NEXT_PUBLIC_SITE_URL')
  },
  /**
   * Check if we're running in production mode
   */
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production'
  },
  /**
   * Check if we're running in development mode
   */
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
  },
} as const

// Validate environment variables on module load (server-side only)
// This ensures the app fails fast if configuration is missing
if (typeof window === 'undefined') {
  // We're on the server - validate all variables
  validateEnv()
}
