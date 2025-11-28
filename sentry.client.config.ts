import * as Sentry from "@sentry/nextjs";

const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (sentryDsn && sentryDsn.includes('sentry.io')) {
  Sentry.init({
    dsn: sentryDsn,

    // Set to 1.0 for testing, lower in production (e.g., 0.1)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Only enable debug in development
    debug: process.env.NODE_ENV === 'development',

    environment: process.env.NODE_ENV || 'development',

    beforeSend(event, hint) {
      // Only log in development to avoid console spam
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry client event captured:', event);
      }
      return event;
    },

    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });

  console.log('✅ Sentry client initialized');
} else {
  console.warn('⚠️ Sentry client: DSN not configured, skipping initialization');
}
