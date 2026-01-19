'use client'

/**
 * Lazy Sentry Initialization
 *
 * PERFORMANCE: Sentry adds ~200KB to the initial bundle and blocks rendering.
 * This module defers Sentry initialization until:
 * 1. The page has fully loaded (load event)
 * 2. A 2-second delay has passed (to prioritize user interaction)
 *
 * Error capturing still works - it just won't be active during the first 2-3 seconds.
 * For critical errors that happen during hydration, they will be captured once
 * Sentry initializes.
 */

let sentryInitialized = false
let initPromise: Promise<void> | null = null

export async function initSentryLazy(): Promise<void> {
  // Skip on server or if already initialized
  if (typeof window === 'undefined' || sentryInitialized) {
    return
  }

  // Return existing promise if already initializing
  if (initPromise) {
    return initPromise
  }

  initPromise = (async () => {
    // Wait for page to be fully loaded
    if (document.readyState !== 'complete') {
      await new Promise<void>(resolve => {
        window.addEventListener('load', () => resolve(), { once: true })
      })
    }

    // Additional delay to prioritize user interaction
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Check DSN exists
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) {
      console.warn('[sentry-lazy] No SENTRY_DSN configured')
      return
    }

    try {
      // Dynamic import - only loads Sentry when needed
      const Sentry = await import('@sentry/nextjs')

      Sentry.init({
        dsn,
        // Minimal sampling for performance
        tracesSampleRate: 0,
        // No session replay by default
        replaysSessionSampleRate: 0,
        // Only capture errors in replay
        replaysOnErrorSampleRate: 0.1,
        // Production environment
        environment: process.env.NODE_ENV,
        // Disable debug
        debug: false,
      })

      sentryInitialized = true
    } catch (error) {
      console.error('[sentry-lazy] Failed to initialize:', error)
    }
  })()

  return initPromise
}

/**
 * Capture an error with Sentry (will queue if not initialized)
 */
export async function captureException(error: Error, context?: Record<string, unknown>): Promise<void> {
  await initSentryLazy()

  if (sentryInitialized) {
    const Sentry = await import('@sentry/nextjs')
    Sentry.captureException(error, { extra: context })
  }
}

/**
 * Check if Sentry is initialized
 */
export function isSentryInitialized(): boolean {
  return sentryInitialized
}
