import * as Sentry from '@sentry/nextjs';

import { validateEnv } from './lib/env-validation';

export async function register() {
  // Validate environment variables at startup
  try {
    validateEnv();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // Don't throw in development to allow for easier local setup
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🔧 Loading Sentry server config...');
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('🔧 Loading Sentry edge config...');
    await import('./sentry.edge.config');
  }

  // Load client config for browser
  if (process.env.NEXT_RUNTIME === 'browser') {
    console.log('🔧 Loading Sentry client config...');
    await import('./sentry.client.config');
  }
}

// Export onRequestError hook for Sentry to capture errors from nested React Server Components
// See: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#errors-from-nested-react-server-components
export const onRequestError = Sentry.captureRequestError;