import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is configured and valid
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (sentryDsn && sentryDsn.includes('sentry.io')) {
  try {
    Sentry.init({
      dsn: sentryDsn,

      // Set to 1.0 for testing (captures 100% of transactions)
      // Lower this in production (e.g., 0.1 for 10%)
      tracesSampleRate: 1.0,

      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Disable debug mode to avoid non-debug bundle warning
      debug: false,

      // Configure the scope for better error context
      beforeSend(event, hint) {
        // Add custom logic here if needed
        console.log('Sentry event captured:', event);
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

    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.warn('[Sentry] Failed to initialize:', error);
  }
} else {
  console.warn('[Sentry] Skipping initialization - DSN not configured');
}

