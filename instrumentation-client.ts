// Instrumentation client configuration
// This file replaces sentry.client.config.ts (deprecated in Next.js with Turbopack)
import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry if DSN is configured and valid
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (sentryDsn && sentryDsn.includes('sentry.io')) {
  try {
    Sentry.init({
      dsn: sentryDsn,

      // Enable Sentry Logs
      enableLogs: true,

      // PERFORMANCE: Disable tracing entirely for now to reduce bundle size
      // Re-enable with lower sample rate if needed: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
      tracesSampleRate: 0,

      // PERFORMANCE: Disable session replay entirely (replay removed)
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,

      // Only enable debug in development
      debug: false, // Disable even in development for performance

      environment: process.env.NODE_ENV || 'development',

      // Configure the scope for better error context
      beforeSend(event, hint) {
        return event;
      },

      // PERFORMANCE: Disable replayIntegration entirely for maximum performance
      // Replay adds significant bundle size (~80KB) even with lazy loading
      // Re-enable if error replay is needed for debugging
      integrations: [],
    });
  } catch (error) {
    // Silent fail in production
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Sentry client: Failed to initialize:', error);
    }
  }
}

// Export router transition tracking for Sentry navigation instrumentation
// See: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#router-instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;