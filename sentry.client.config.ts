import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Set to 1.0 for testing
    tracesSampleRate: 1.0,

    // Enable debug mode temporarily
    debug: true,

    environment: process.env.NODE_ENV || 'development',

    beforeSend(event, hint) {
        console.log('Sentry client event captured:', event);
        return event;
    },

    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
});

console.log('✅ Sentry client initialized');
