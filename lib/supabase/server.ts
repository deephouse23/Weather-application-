import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from './types'
import { PLACEHOLDER_URL, PLACEHOLDER_ANON_KEY, warnIfPlaceholder } from './constants'

/**
 * Cookie-free server-side Supabase client for public reads from static
 * pages. Use this in `generateStaticParams`, `generateMetadata`, and any
 * static-eligible page that only needs anon-key access.
 *
 * Why: createServerSupabaseClient (below) wires cookies() so it can carry
 * the user's session. Calling cookies() inside a page that declares
 * generateStaticParams forces Next.js to switch the page from static to
 * dynamic at runtime ("Page changed from static to dynamic at runtime,
 * reason: cookies"), which Sentry logs as an error. For routes that read
 * truly-public data (e.g. `/games/[slug]`), use this client instead.
 */
export const createPublicSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_ANON_KEY
  warnIfPlaceholder(supabaseUrl, supabaseKey, 'createPublicSupabaseClient')
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Create a server-side supabase client
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_ANON_KEY
  
  // Warn developers when using placeholder credentials
  warnIfPlaceholder(supabaseUrl, supabaseKey, 'createServerSupabaseClient')

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

// Helper function to get user on server
export const getServerUser = async () => {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting server user:', error)
    return null
  }

  return user
}

// Helper function to get session on server
const getServerSession = async () => {
  const supabase = await createServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting server session:', error)
    return null
  }

  return session
}