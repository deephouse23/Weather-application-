# 16-Bit Weather Platform - Troubleshooting Guide

**Version:** 0.6.0
**Last Updated:** January 2025

---

## Common Issues

### 1. "API Key not configured" Error

**Symptoms:**
- Error message when searching for weather
- API requests failing
- Console shows missing API key warnings

**Solutions:**

1. **Check `.env.local` file exists:**
   ```bash
   ls -la .env.local
   ```

2. **Verify API key is set:**
   ```bash
   cat .env.local | grep OPENWEATHER_API_KEY
   ```

3. **Ensure correct format:**
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```
   - No quotes around the value
   - No spaces before/after `=`

4. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

5. **Verify API key is valid:**
   - Go to [openweathermap.org](https://openweathermap.org)
   - Check API key status in dashboard
   - API key may take a few hours to activate

---

### 2. Authentication Not Working

**Symptoms:**
- Can't log in or sign up
- Session not persisting
- Redirected to login repeatedly

**Solutions:**

1. **Check Supabase environment variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Verify Supabase project is active:**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Check project status
   - Verify database is running

3. **Check browser console for CORS errors:**
   - Open DevTools → Console
   - Look for CORS-related errors
   - Verify Supabase URL is correct

4. **Clear cookies and try again:**
   - DevTools → Application → Cookies
   - Delete all cookies for localhost
   - Refresh page and try again

5. **Check RLS policies:**
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify RLS policies are enabled
   - Check policy syntax is correct

6. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   rm -rf .next
   npm run dev
   ```

---

### 3. Location Detection Fails

**Symptoms:**
- Auto-location not working
- "Location unavailable" error
- Wrong city detected

**Understanding Location Detection:**

The app uses a multi-step process:
1. **Browser Geolocation** (WiFi/IP triangulation)
2. **IP Fallback** (if geolocation denied/fails)
3. **Reverse Geocoding** (converts coordinates to city name)

**Common Issues & Solutions:**

#### Issue: Permission Denied

**Cause:** User blocked geolocation in browser

**Solution:**
1. Check browser permissions:
   - Chrome: Settings → Privacy → Site Settings → Location
   - Firefox: Preferences → Privacy → Permissions → Location
2. Allow location for your site
3. Refresh page

#### Issue: Wrong City Detected

**Cause:** Browser geolocation uses WiFi/IP, which may be inaccurate

**Example:**
- User in San Ramon, CA
- Browser returns San Jose coordinates
- This is expected behavior (WiFi access points registered to wrong city)

**Solutions:**
1. **Manual Search:** Type city name in search box
2. **GPS Mode (Mobile):** Allow high-accuracy location permission
3. **IP Fallback:** Provides approximate city-level accuracy

**Not a Bug:** The reverse geocoding is working correctly. The inaccuracy comes from the browser's geolocation API itself.

#### Issue: "Location services unavailable"

**Causes:**
- Browser doesn't support geolocation
- Location services disabled in OS
- Running in non-secure context (not HTTPS)

**Solutions:**
1. Ensure using HTTPS (required for geolocation)
2. Enable location services in OS settings
3. Try different browser
4. Use manual search instead

#### Issue: IP fallback not working

**Symptoms:**
- Both geolocation and IP detection fail
- No location detected

**Solutions:**
1. Check console for errors
2. Verify IP fallback services are accessible:
   - ipapi.co
   - ipinfo.io
   - ipgeolocation.io
3. Check network firewall isn't blocking these services
4. Use manual search as fallback

---

### 4. Radar Map Not Loading

**Symptoms:**
- Map shows blank or loading indefinitely
- Radar tiles not appearing
- Console errors about tile loading

**Solutions:**

1. **Check Iowa State NEXRAD service status:**
   - Service may be temporarily down
   - Try again in a few minutes

2. **Verify API endpoint works:**
   ```bash
   curl http://localhost:3000/api/weather/iowa-nexrad
   ```

3. **Check browser console for errors:**
   - DevTools → Console
   - Look for tile loading errors
   - Check for CORS issues

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache via DevTools

5. **Check network firewall:**
   - Some corporate firewalls block external tile servers
   - Try on different network

6. **Reduce animation frames:**
   - Edit map component to use fewer frames
   - Reduces load on tile server

---

### 5. Build Errors

**Symptoms:**
- `npm run build` fails
- TypeScript compilation errors
- Next.js optimization errors

**Solutions:**

#### TypeScript Errors

```bash
# Check TypeScript errors
npx tsc --noEmit

# Common fixes:
npm install --save-dev @types/node @types/react @types/react-dom
```

#### Module Not Found

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### Out of Memory

```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

#### Dependency Issues

```bash
# Update dependencies
npm update

# Or reinstall specific package
npm uninstall <package-name>
npm install <package-name>
```

---

### 6. Cache Issues

**Symptoms:**
- Old data showing
- Changes not reflected
- localStorage growing too large

**Solutions:**

#### Clear Next.js Cache

```bash
rm -rf .next
npm run dev
```

#### Clear Browser Cache

**Manual:**
- DevTools → Application → Storage
- Click "Clear site data"

**Programmatic:**
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
```

#### Clear Weather Cache

```javascript
// In browser console
import { userCacheService } from '@/lib/user-cache-service'
userCacheService.clearExpiredCache()
```

#### Automatic Cache Cleanup

Weather cache automatically cleans up:
- Expired entries (older than 10 minutes)
- Runs on app mount
- Keeps cache under 5MB

---

### 7. Sentry Error Monitoring - 403 Forbidden (DISABLED)

**Status:** Currently disabled

**Issue:**
All attempts to send events to Sentry return 403 Forbidden errors.

**Root Cause:**
- Project ID returns 403
- Likely due to account verification issues or project access permissions
- Auth token may not have correct permissions

**Attempted Solutions:**
- ✅ Fixed double initialization
- ✅ Added proper error handling
- ✅ Updated DSN with new security token
- ❌ Still returns 403

**Current Status:**
Sentry is **disabled** in `.env.local` to prevent console spam:
```env
# SENTRY_DSN=your_sentry_dsn_here
# NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

**To Re-enable:**
1. Verify Sentry account access and email confirmation
2. Create a new Sentry project or verify existing project exists
3. Get fresh DSN from project settings
4. Uncomment DSN lines in `.env.local`
5. Restart dev server

**Alternative Solutions:**
- Use PostHog for combined analytics + error tracking
- Use Rollbar (easier setup, better free tier)
- Implement custom error logging to own backend
- Skip error monitoring for now (app works fine without it)

---

### 8. Hydration Errors in Development

**Symptoms:**
- Console warnings about hydration mismatch
- Specifically with `AuthDebug` component showing time mismatches

**Example:**
```
Hydration failed: server rendered "4:28:00 PM", client rendered "4:28:01 PM"
```

**Root Cause:**
- Server renders with one timestamp
- Client renders 1-2 seconds later with different timestamp
- React detects mismatch in time-based components

**Impact:**
- **Development only** - causes no issues in production
- Component re-renders correctly after hydration
- No functional impact on users

**Solutions:**

1. **Suppress hydration warnings:**
   ```tsx
   <div suppressHydrationWarning={true}>
     {formattedTime}
   </div>
   ```

2. **Remove `AuthDebug` in production:**
   ```tsx
   {process.env.NODE_ENV === 'development' && <AuthDebug />}
   ```

3. **Use client-side only rendering:**
   ```tsx
   const [mounted, setMounted] = useState(false)
   useEffect(() => setMounted(true), [])
   if (!mounted) return null
   ```

---

### 9. Performance Issues

**Symptoms:**
- Slow page load
- Laggy interactions
- High memory usage

**Diagnostic Tools:**

1. **Lighthouse Audit:**
   ```bash
   npx lighthouse http://localhost:3000 --view
   ```

2. **React DevTools Profiler:**
   - Install React DevTools extension
   - Open Profiler tab
   - Record interaction
   - Identify slow components

3. **Network Tab:**
   - DevTools → Network
   - Check for slow API requests
   - Look for large bundle sizes

**Solutions:**

#### Slow API Requests

1. **Enable caching:**
   - Weather data cached for 10 minutes
   - Location cached for 5 minutes

2. **Reduce API calls:**
   - Batch requests where possible
   - Use cached data when available

3. **Check API rate limits:**
   - May be throttled if exceeding limits

#### Large Bundle Size

1. **Analyze bundle:**
   ```bash
   npm run build
   # Check output for large chunks
   ```

2. **Dynamic imports:**
   ```tsx
   const LazyComponent = dynamic(() => import('./Component'))
   ```

3. **Tree shaking:**
   - Import specific functions: `import { func } from 'lib'`
   - Not entire library: `import * as lib from 'lib'`

#### Memory Leaks

1. **Clean up useEffect:**
   ```tsx
   useEffect(() => {
     const timer = setInterval(...)
     return () => clearInterval(timer) // Cleanup
   }, [])
   ```

2. **Remove event listeners:**
   ```tsx
   useEffect(() => {
     window.addEventListener('resize', handler)
     return () => window.removeEventListener('resize', handler)
   }, [])
   ```

---

## Debug Mode

### Enable Debug Logging

Set environment variable:
```env
NEXT_PUBLIC_DEBUG=true
```

**Enables:**
- Location service debug logs
- API request/response logging
- Cache hit/miss logging
- Authentication state logging

### Check Logs

**Client-side logs:**
- Browser console (DevTools → Console)

**Server-side logs:**
- Terminal running `npm run dev`

**Production logs:**
- Vercel Dashboard → Deployments → View Function Logs

---

## Getting Help

### 1. Check Documentation

- [Architecture](./ARCHITECTURE.md)
- [Features](./FEATURES.md)
- [API Reference](./API_REFERENCE.md)
- [Components](./COMPONENTS.md)
- [Deployment](./DEPLOYMENT.md)

### 2. Search Issues

- Check GitHub Issues for similar problems
- Search discussions

### 3. Gather Information

Before reporting an issue, gather:
- Error message (full text)
- Console logs (browser and server)
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, browser, Node version)

### 4. Report Issue

Include:
- Clear description
- Steps to reproduce
- Screenshots/videos if applicable
- Environment details
- Relevant code snippets

---

## Known Limitations

### Location Detection

- **Accuracy varies:** WiFi/IP triangulation is less accurate than GPS
- **WiFi-based location:** Can be 1-5 miles off actual position
- **ISP location:** May show regional hub city instead of actual city
- **Workaround:** Manual search always works accurately

### API Rate Limits

- **OpenWeatherMap Free Tier:** 1,000 calls/day
- **One Call API:** Requires subscription
- **Caching:** Reduces API calls but data may be up to 10 minutes old

### Browser Support

- **Geolocation:** Requires HTTPS (except localhost)
- **Modern browsers only:** No IE11 support
- **JavaScript required:** Core features require JS enabled

### Mobile

- **PWA features:** Limited on iOS
- **Notification:** Not supported on all platforms
- **Offline mode:** Requires service worker support

---

**For more details:**
- [Architecture Documentation](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](../TESTING_GUIDE.md)
