// Instrumentation client configuration
// This file replaces sentry.client.config.ts (deprecated in Next.js with Turbopack)
import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry if DSN is configured and valid
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (sentryDsn && sentryDsn.includes('sentry.io')) {
  try {
    Sentry.init({
      dsn: sentryDsn,

      // Lower sample rate in production to reduce costs
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Only enable debug in development
      debug: process.env.NODE_ENV === 'development',

      environment: process.env.NODE_ENV || 'development',

      // Configure the scope for better error context
      beforeSend(event, hint) {
        // Only log in development to avoid console spam
        if (process.env.NODE_ENV === 'development') {
          console.log('Sentry client event captured:', event);
        }
        return event;
      },

      // Handle transport errors (like 403 Forbidden)
      transportOptions: {
        // Add custom headers if needed
      },
      
      // Error handler for transport failures
      beforeSendTransaction(event) {
        return event;
      },

      // Integrate with React error boundaries
      integrations: [
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
    });

    console.log('✅ Sentry client initialized');
  } catch (error) {
    console.warn('⚠️ Sentry client: Failed to initialize:', error);
  }
} else {
  console.warn('⚠️ Sentry client: DSN not configured, skipping initialization');
}

// Export router transition tracking for Sentry navigation instrumentation
// See: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#router-instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;