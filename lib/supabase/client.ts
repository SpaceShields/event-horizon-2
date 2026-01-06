import { createBrowserClient } from '@supabase/ssr'
import { validateEnv } from '@/lib/env'

// Validate client-side environment variables on module load
validateEnv({ skipServerVars: true })

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
