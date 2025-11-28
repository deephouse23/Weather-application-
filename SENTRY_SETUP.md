# Sentry Setup Guide

## Current Status

✅ **Fixed Issues:**
- Added proper DSN validation (only initializes if DSN is present and valid)
- Conditional debug mode (only enabled in development)
- Proper error handling (won't crash if DSN is missing)
- Reduced sample rates in production (0.1 vs 1.0)

## Configuration Files

1. **`instrumentation-client.ts`** - Browser/client-side initialization (✅ Recommended by Next.js)
2. **`sentry.server.config.ts`** - Server-side initialization  
3. **`sentry.edge.config.ts`** - Edge runtime initialization

**Note:** `sentry.client.config.ts` has been removed (deprecated). All client-side initialization is now handled by `instrumentation-client.ts`.

## Setup Instructions

### 1. Get Your Sentry DSN

1. Go to https://sentry.io/
2. Sign in or create an account
3. Create a new project (or use existing "javascript-nextjs")
4. Select "Next.js" as the framework
5. Copy your DSN from project settings

### 2. Configure Environment Variables

Add to your `.env.local` file:

```env
# Sentry Configuration
SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Optional: For source map uploads
SENTRY_AUTH_TOKEN=your-auth-token-here
SENTRY_ORG=16bitweather
SENTRY_PROJECT=javascript-nextjs
```

### 3. Verify Setup

1. Start your dev server: `npm run dev`
2. Check console for: `✅ Sentry client initialized` or `✅ Sentry server initialized`
3. If DSN is missing, you'll see: `⚠️ Sentry client: DSN not configured, skipping initialization`

### 4. Test Error Capture

Visit `/test-sentry` page and click the test buttons to verify errors are being captured.

## Troubleshooting

### Issue: 403 Forbidden Errors

**Symptoms:**
- Console shows 403 errors when trying to send events to Sentry
- Events not appearing in Sentry dashboard

**Possible Causes:**
1. **Invalid DSN** - Check that your DSN is correct and includes the full URL
2. **Project Access** - Verify you have access to the Sentry project
3. **Account Verification** - Ensure your Sentry account email is verified
4. **Rate Limiting** - Free tier may have rate limits

**Solutions:**
1. Get a fresh DSN from Sentry project settings
2. Verify project exists and you have access
3. Check Sentry account email verification status
4. Try creating a new Sentry project

### Issue: Debug Mode Warnings

**Symptoms:**
- Console warning: `Cannot initialize SDK with 'debug' option using a non-debug bundle`

**Solution:**
✅ **Fixed** - Debug mode is now only enabled in development. This warning should no longer appear in production builds.

### Issue: Multiple Initializations

**Symptoms:**
- Multiple Sentry initialization logs
- Duplicate events in Sentry

**Solution:**
✅ **Fixed** - Each config file now checks for DSN before initializing. Only one initialization per runtime should occur.

## Production Settings

Current production configuration:
- **Sample Rate:** 0.1 (10% of transactions)
- **Debug Mode:** Disabled
- **Environment:** `production`

To adjust sample rate, modify `tracesSampleRate` in each config file.

## Next Steps

1. ✅ Get Sentry DSN from your Sentry project
2. ✅ Add DSN to `.env.local`
3. ✅ Test error capture using `/test-sentry` page
4. ✅ Verify events appear in Sentry dashboard
5. ✅ Configure alerts/notifications in Sentry dashboard

## Alternative: If Sentry Still Doesn't Work

If you continue to experience 403 errors after following the above steps, consider:

1. **PostHog** - Combined analytics + error tracking
2. **Rollbar** - Easier setup, better free tier
3. **Custom Error Logging** - Log to your own backend
4. **Vercel Logs** - Use Vercel's built-in logging

The application works fine without error monitoring - it's optional.

