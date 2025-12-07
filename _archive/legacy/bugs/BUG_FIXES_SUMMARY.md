# Bug Fixes Summary - `bug-fixes` Branch

## ✅ Fixed Issues

### 1. **Removed Moon/Sun Theme Toggle**
- **Status:** ✅ COMPLETED
- **File:** `components/navigation.tsx`
- **Change:** Removed `<ThemeToggle />` component from navigation bar
- **Reason:** Theme switching should only be available from Profile/Dashboard settings
- **Commit:** `0f5b77c4`

---

## 🔍 Issues Requiring Investigation

### 2. **Login/Authentication Not Working**
- **Status:** 🔍 INVESTIGATING
- **Affected Files:**
  - `lib/supabase/client.ts`
  - `components/auth/auth-form.tsx`
  - `app/auth/login/page.tsx`
  - `middleware.ts`

**Possible Causes:**
1. **Missing/Invalid Supabase credentials**
   - Check `.env.local` has valid values for:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **OAuth Redirect URLs not configured**
   - Google/GitHub OAuth requires callback URLs to be added in Supabase Dashboard
   - Required callback: `https://your-domain.com/auth/callback`
   - Also add: `http://localhost:3000/auth/callback` for local dev

3. **Middleware blocking auth routes**
   - Check `middleware.ts` matcher config

**How to Test:**
```bash
# Run the test-login API endpoint
curl -X POST http://localhost:3000/api/test-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'
```

**Next Steps:**
- Verify Supabase environment variables are set
- Check Supabase Dashboard → Authentication → URL Configuration
- Test OAuth callbacks
- Check browser console for error messages during login

---

### 3. **Weather Radar Data Deprecated**
- **Status:** 🔍 INVESTIGATING
- **Affected Files:**
  - `app/api/weather/radar/[layer]/[...tile]/route.ts`
  - `components/weather-map-client.tsx`
  - `components/weather-map-animated.tsx`

**Current Implementation:**
```typescript
// Line 46: app/api/weather/radar/[layer]/[...tile]/route.ts
const base = 'https://tile.openweathermap.org/map'
const path = time
  ? `${mapped}/${time}/${z}/${x}/${y}.png`
  : `${mapped}/${z}/${x}/${y}.png`
const url = `${base}/${path}?appid=${apiKey}`
```

**Possible Issues:**
1. **OpenWeather Tile API Changes**
   - The tiles endpoint may have been deprecated or changed
   - Check: https://openweathermap.org/api/weathermaps

2. **API Key Access Level**
   - Weather tiles require a **paid subscription plan**
   - Free tier may not have access to map tiles
   - Check your OpenWeather subscription level

3. **Layer Names Changed**
   - Current layers:
     - `precipitation_new`
     - `clouds_new`
     - `wind_new`
     - `pressure_new`
     - `temp_new`
   - These may have been updated to new names

**How to Test:**
```bash
# Test radar tile endpoint directly
curl "https://tile.openweathermap.org/map/precipitation_new/1/0/0.png?appid=YOUR_API_KEY"
```

**Next Steps:**
1. Verify OpenWeather subscription includes map tiles
2. Test tile endpoint with current API key
3. Check OpenWeather documentation for current tile layer names
4. Consider alternative: Use static images with overlay data from One Call API 3.0

**Alternative Solution:**
If tiles are no longer available, we can:
- Use Leaflet/Mapbox base map
- Overlay precipitation/cloud data from One Call 3.0 API
- Draw custom canvas overlays instead of using tile layers

---

## 📋 Action Items

- [ ] Check `.env.local` for missing Supabase credentials
- [ ] Configure OAuth redirect URLs in Supabase Dashboard
- [ ] Test login with test-login API endpoint
- [ ] Verify OpenWeather API subscription level
- [ ] Test radar tile endpoints manually
- [ ] Check OpenWeather documentation for API changes
- [ ] Consider implementing canvas-based weather overlays

---

## 🔗 Useful Links

- Supabase Dashboard: https://app.supabase.com/
- OpenWeather Map Tiles: https://openweathermap.org/api/weathermaps
- One Call API 3.0: https://openweathermap.org/api/one-call-3
- OpenWeather API Docs: https://openweathermap.org/api


