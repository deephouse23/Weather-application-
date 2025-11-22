import * as Sentry from '@sentry/nextjs';

export async function register() {
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