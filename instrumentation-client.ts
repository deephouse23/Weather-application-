// Instrumentation client configuration
import * as Sentry from '@sentry/nextjs';

// Export router transition tracking for Sentry navigation instrumentation
// See: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#router-instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;