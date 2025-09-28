import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust trace sample rate for production
  // 0.1 means 10% of transactions will be captured
  tracesSampleRate: 0.1,

  // Capture Replay for 1% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
  
  // Disable debug mode in production
  debug: false,

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});

// Export required for Next.js navigation tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;