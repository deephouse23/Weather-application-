# Sentry Error Monitoring Setup Guide

## Overview

This guide documents the complete Sentry setup implemented in PR #110 to enable error monitoring across all Next.js runtimes (server, client/browser, and edge).

## Problem Solved

Sentry was configured but errors were not appearing in the dashboard because:
1. ❌ Instrumentation hook was NOT enabled in Next.js config
2. ❌ Client-side Sentry configuration file was missing
3. ❌ Instrumentation files were never loaded by Next.js
4. ❌ Debug mode was disabled, making it hard to verify setup

## Solution Implemented

### 1. Enabled Instrumentation Hook

**File**: `next.config.mjs`

Added `instrumentationHook: true` to experimental features. Without this flag, Next.js doesn't load `instrumentation.ts`, so Sentry never initializes.

```typescript
experimental: {
  optimizeCss: false,
  scrollRestoration: true,
  instrumentationHook: true,  // ✅ ADDED
},
```

### 2. Created Client-Side Configuration

**File**: `sentry.client.config.ts` (NEW)

Created dedicated client-side Sentry initialization for browser error tracking with:
- Debug mode enabled (for verification)
- 100% trace sample rate (for testing)
- Session replay integration
- Console logging in `beforeSend` hook

### 3. Updated Instrumentation

**File**: `instrumentation.ts`

Updated to explicitly load client config when running in browser context:

```typescript
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
```

### 4. Enhanced Server Configuration

**File**: `sentry.server.config.ts`

- Enabled debug mode
- Increased trace sample rate to 100% for testing
- Added `beforeSend` hook with console logging
- Added initialization confirmation log

### 5. Enhanced Edge Configuration

**File**: `sentry.edge.config.ts`

- Enabled debug mode
- Increased trace sample rate to 100% for testing
- Added `beforeSend` hook with console logging
- Added initialization confirmation log

### 6. Added Public Environment Variable

**File**: `.env.local`

Added `NEXT_PUBLIC_SENTRY_DSN` so client-side code can access the DSN (server-only env vars aren't available in browser).

### 7. Created Test Infrastructure

**Files Created**:
- `app/test-sentry/page.tsx` - Test page with buttons to trigger different error types
- `app/api/test-sentry-error/route.ts` - Test API route for server error testing

## Testing the Setup

### Quick Test

1. Build and start the application:
```bash
npm run build
npm run start
```

2. Visit: `http://localhost:3000/test-sentry`

3. Click each error button:
   - **Throw Client Error** - Tests browser error capture
   - **Throw Server Error** - Tests API route error capture
   - **Capture Manual Error** - Tests manual error capture

4. Check browser console for "Sentry event captured:" logs

5. Visit [Sentry Dashboard](https://16bitweather.sentry.io/) → Issues

6. Verify errors appear within 1-2 minutes

### Expected Console Output

**Server startup**:
```
🔧 Loading Sentry server config...
✅ Sentry server initialized
```

**When error occurs (browser console)**:
```
Sentry event captured: {event_object}
```

**When error occurs (server console)**:
```
Sentry server event captured: {event_object}
```

## Production Deployment

### Environment Variables in Vercel

Ensure these are set in Vercel Dashboard → Project Settings → Environment Variables:

```
SENTRY_DSN=https://91a13cb4875d11f08eaeb65aedfd09e2@o4508684533522432.ingest.us.sentry.io/4509945618038784
SENTRY_AUTH_TOKEN=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
SENTRY_ORG=16bitweather
SENTRY_PROJECT=javascript-nextjs
NEXT_PUBLIC_SENTRY_DSN=https://91a13cb4875d11f08eaeb65aedfd09e2@o4508684533522432.ingest.us.sentry.io/4509945618038784
```

### Post-Deployment Testing

1. Visit production URL: `https://your-domain.com/test-sentry`
2. Test all three error buttons
3. Check Sentry dashboard for errors
4. Verify source maps work (readable file names in stack traces)

## Production Optimization (Follow-Up)

After confirming Sentry works in production (within 24-48 hours), create a follow-up PR to optimize:

### 1. Disable Debug Mode

**Files**: All Sentry config files

```typescript
debug: false,  // Disable in production
```

### 2. Lower Sample Rates

**Server/Edge configs** (`sentry.server.config.ts`, `sentry.edge.config.ts`):
```typescript
tracesSampleRate: 0.1,  // Capture 10% of transactions
```

**Client config** (`sentry.client.config.ts`):
```typescript
tracesSampleRate: 0.1,  // 10% of transactions
replaysSessionSampleRate: 0.01,  // 1% of sessions
replaysOnErrorSampleRate: 1.0,  // 100% of error sessions
```

### 3. Remove Console Logs

Remove or comment out `beforeSend` console logs in all config files:

```typescript
beforeSend(event, hint) {
  // console.log('Sentry event captured:', event);  // Remove this
  return event;
},
```

### 4. Optional: Remove Test Files

After confirming production works:
- Delete `app/test-sentry/page.tsx`
- Delete `app/api/test-sentry-error/route.ts`

Or keep them but add authentication/admin-only access.

## Architecture

### Error Capture Flow

```
Application Error Occurs
        ↓
Runtime Detection (nodejs/edge/browser)
        ↓
Load Appropriate Sentry Config
        ↓
beforeSend Hook (with console log)
        ↓
Send to Sentry API
        ↓
Source Maps Applied
        ↓
Error Appears in Dashboard
```

### Runtime Coverage

- ✅ **Server (nodejs)** - `sentry.server.config.ts`
  - API routes
  - Server components
  - Server-side rendering

- ✅ **Client (browser)** - `sentry.client.config.ts`
  - Client components
  - Browser interactions
  - React errors
  - Session replay

- ✅ **Edge** - `sentry.edge.config.ts`
  - Edge runtime API routes
  - Middleware (if used)
  - Edge functions

## Troubleshooting

### Errors Not Appearing in Dashboard

1. **Check browser console** - Should see "Sentry event captured" logs
2. **Check server console** - Should see "✅ Sentry server initialized"
3. **Verify environment variables** - Check Vercel dashboard
4. **Check network requests** - DevTools Network tab should show requests to `sentry.io`
5. **Verify Sentry project** - Ensure DSN matches project in dashboard
6. **Check quota limits** - Free tier has limits

### Source Maps Not Working

1. **Verify SENTRY_AUTH_TOKEN** - Must be set in Vercel
2. **Check build logs** - Should show "Uploading source maps to Sentry"
3. **Verify organization/project** - Must match in `next.config.mjs`

### Debug Mode Not Logging

1. **Check instrumentation hook** - Must be `true` in `next.config.mjs`
2. **Rebuild application** - Changes require rebuild
3. **Check runtime** - Logs appear in different places per runtime

## Files Modified/Created

### Created (3 files)
- `sentry.client.config.ts`
- `app/test-sentry/page.tsx`
- `app/api/test-sentry-error/route.ts`

### Modified (5 files)
- `next.config.mjs`
- `instrumentation.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `.env.local`

## References

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [16-Bit Weather Sentry Dashboard](https://16bitweather.sentry.io/)
- [Sentry Auth Tokens](https://16bitweather.sentry.io/settings/auth-tokens/)

## Related PRs

- **PR #110** - Initial Sentry setup with radar and location fixes
- Future PR - Production optimization (disable debug, lower sample rates)

---

**Last Updated**: October 12, 2025
**Status**: ✅ Implemented and Ready for Testing
**Next Step**: Deploy to production and monitor for 24-48 hours before optimization

