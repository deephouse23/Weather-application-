/**
 * Supabase Admin Client — Server-Only Module (Singleton)
 *
 * ⚠️  SECURITY: This module uses SUPABASE_SERVICE_ROLE_KEY, which bypasses
 *     all Row-Level Security (RLS) policies. It must ONLY be imported from
 *     server-side code (API routes, Server Actions, Server Components).
 *
 *     NEVER add the NEXT_PUBLIC_ prefix to SUPABASE_SERVICE_ROLE_KEY.
 *     Doing so would expose the key to the browser, allowing unauthenticated
 *     users to bypass every RLS policy — a catastrophic security breach.
 *
 *     If you see a runtime error about a missing SUPABASE_SERVICE_ROLE_KEY,
 *     add it to your server environment (.env.local, not committed to git).
 *     Do NOT move it to NEXT_PUBLIC_*.
 *
 * PERF: The client is cached as a module-level singleton so every request
 *       in the same process reuses one HTTP connection pool instead of
 *       creating a fresh SupabaseClient (and fresh PostgREST connections)
 *       on every call. This prevents connection-pool exhaustion under load.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PLACEHOLDER_URL, PLACEHOLDER_SERVICE_KEY, throwIfPlaceholderProduction } from './constants';

/** Cached singleton — lazily initialised on first call. */
let _adminClient: SupabaseClient | null = null;

/**
 * Return the singleton Supabase admin client (service-role, bypasses RLS).
 *
 * Throws specific, debuggable errors identifying exactly which environment
 * variable is missing. This prevents the footgun of "which key is wrong?"
 * and avoids tempting developers to expose the service role key to the browser.
 */
export function getSupabaseAdmin(): SupabaseClient {
    if (_adminClient) {
        return _adminClient;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || PLACEHOLDER_SERVICE_KEY;

    // In production, throw if placeholder credentials are detected to prevent
    // silent auth bypass with a service-role key that bypasses RLS.
    throwIfPlaceholderProduction(supabaseUrl, supabaseServiceKey, 'getSupabaseAdmin');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error(
            'NEXT_PUBLIC_SUPABASE_URL is required for admin operations. ' +
            'Set it in .env.local (server-side). Do NOT use NEXT_PUBLIC_ prefix on the service role key.'
        );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error(
            'SUPABASE_SERVICE_ROLE_KEY is required for admin operations. ' +
            'Set it in .env.local (server-side only). ' +
            'Do NOT add the NEXT_PUBLIC_ prefix — it must never reach the browser.'
        );
    }

    _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return _adminClient;
}