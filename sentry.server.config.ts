import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Higher sample rate for testing
  tracesSampleRate: 1.0,  // Changed from 0.1 to 1.0
  
  // Enable debug mode temporarily
  debug: true,  // Changed from false to true

  environment: process.env.NODE_ENV || 'development',
  
  beforeSend(event, hint) {
    console.log('Sentry server event captured:', event);
    return event;
  },

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});

console.log('✅ Sentry server initialized');