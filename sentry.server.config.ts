import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://91a13cb4875d11f08eaeb65aedfd09e2@o4508684533522432.ingest.us.sentry.io/4509945618038784",

  // Adjust trace sample rate for production
  // 0.1 means 10% of transactions will be captured
  tracesSampleRate: 0.1,
  
  // Disable debug mode in production
  debug: false,

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});