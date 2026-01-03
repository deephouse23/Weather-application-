// Placeholder values for development without Supabase configuration
// Centralized to avoid duplication across client, server, middleware, and database modules
// Using localhost:54321 (Supabase local dev port) makes misconfiguration obvious
// Using sb_publishable_ prefix to match Supabase's expected format (avoids validation errors)
export const PLACEHOLDER_URL = 'http://localhost:54321'
export const PLACEHOLDER_ANON_KEY = 'sb_publishable_placeholder_development_key_not_real'
export const PLACEHOLDER_SERVICE_KEY = 'sb_service_placeholder_development_key_not_real'

/**
 * Logs a warning when placeholder credentials are being used.
 * Call this after deriving credentials to alert developers of missing configuration.
 */
export function warnIfPlaceholder(url: string, key: string, context: string): void {
  if (url === PLACEHOLDER_URL || key === PLACEHOLDER_ANON_KEY || key === PLACEHOLDER_SERVICE_KEY) {
    console.warn(
      `[${context}] Using placeholder Supabase credentials. ` +
      `Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables for production use.`
    )
  }
}
