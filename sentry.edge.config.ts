import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://91a13cb4875d11f08eaeb65aedfd09e2@o4508684533522432.ingest.us.sentry.io/4508684595814400",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for testing.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});