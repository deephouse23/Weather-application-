import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.SENTRY_DSN || "https://91a13cb4875d11f08eaeb65aedfd09e2@o4508684533522432.ingest.us.sentry.io/4509945618038784",

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
