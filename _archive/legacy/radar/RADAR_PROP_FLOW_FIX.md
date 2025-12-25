# Radar Prop Flow Fix - Critical Bug Resolution

**Date:** October 11, 2025  
**Status:** FIXED

---

## Problem Description

Users reported seeing "US LOCATIONS ONLY" warning even when searching for US cities like "San Ramon, CA" on the main weather page. The radar was not displaying NOAA MRMS tiles despite being a US location with valid coordinates.

---

## Root Cause Analysis

### Issue 1: Wrong Component Import

The main weather page was using the WRONG radar component:

**Component Chain (BROKEN):**
```
app/page.tsx (passes props correctly)
  ↓
components/lazy-weather-map.tsx 
  ↓ imports weather-map-animated.tsx (WRONG!)
components/weather-map-animated.tsx (old OpenWeather code, no MRMS logic)
```

**What Happened:**
1. `app/page.tsx` correctly passed `latitude`, `longitude`, and `locationName` from weather data
2. `lazy-weather-map.tsx` imported `weather-map-animated.tsx` instead of `weather-map-client.tsx`
3. `weather-map-animated.tsx` had old OpenWeather precipitation code (no MRMS logic)
4. Our recent changes to `weather-map-client.tsx` were never being used on the main page

### Issue 2: API Route Blocking OpenWeather Precipitation

The API route changes we made now return 410 Gone for `/api/weather/radar/precipitation_new/`, which `weather-map-animated.tsx` was trying to use at line 216:

```typescript
url={`/api/weather/radar/precipitation_new/{z}/{x}/{y}`}
```

This caused the radar tiles to fail to load, showing the warning message.

---

## The Fix

### File 1: components/lazy-weather-map.tsx

**Changed import from:**
```typescript
const WeatherMap = dynamic(() => import('./weather-map-animated'), {
```

**To:**
```typescript
const WeatherMap = dynamic(() => import('./weather-map-client'), {
```

**Why This Fixes It:**
- Now the main page uses `weather-map-client.tsx` which has our MRMS-only logic
- Props flow correctly to the component with MRMS detection
- `isUSLocation` calculation works properly with the coordinates

### File 2: components/weather-map-client.tsx

**Added Debug Logging:**
```typescript
// Debug logging
useEffect(() => {
  console.log('WeatherMap props received:', { latitude, longitude, locationName })
  console.log('isUSLocation:', latitude && longitude ? isInMRMSCoverage(latitude, longitude) : 'no coordinates')
}, [latitude, longitude, locationName])
```

**Why This Helps:**
- Developers can verify props are being received correctly
- Can confirm `isUSLocation` detection is working
- Helps debug future issues with location detection

---

## Verification

### Correct Prop Flow (NOW):
```
app/page.tsx
  ↓ passes { latitude: 37.7799, longitude: -121.9780, locationName: "San Ramon" }
components/lazy-weather-map.tsx
  ↓ imports weather-map-client.tsx (CORRECT!)
components/weather-map-client.tsx
  ↓ receives props
  ↓ calculates isUSLocation = true
  ↓ shows NOAA MRMS radar with animation
```

### Expected Behavior After Fix:

**For US Locations (e.g., San Ramon, CA):**
1. Weather data loads with coordinates: `{ lat: 37.7799, lon: -121.9780 }`
2. Props passed to WeatherMap: `latitude={37.7799} longitude={-121.9780}`
3. WeatherMap component receives props
4. Console log shows: `{ latitude: 37.7799, longitude: -121.9780, locationName: "San Ramon" }`
5. `isUSLocation` calculates to `true`
6. Badge displays: "NOAA MRMS • HIGH-RES • LIVE" (blue)
7. MRMS radar tiles load and display
8. Animation controls are visible and functional
9. No warning overlay

**For International Locations (e.g., London, UK):**
1. Weather data loads with coordinates: `{ lat: 51.5074, lon: -0.1278 }`
2. Props passed correctly
3. `isUSLocation` calculates to `false`
4. Badge displays: "US LOCATIONS ONLY" (gray)
5. Warning overlay: "High-Resolution Radar Unavailable"
6. Clear explanation shown
7. No radar tiles attempt to load

---

## Testing Instructions

### Test 1: US Location
```
1. Go to http://localhost:3000
2. Search: "San Ramon, CA"
3. Scroll to Weather Radar section
4. Open browser console (F12)
5. Expected console output:
   - "WeatherMap props received: { latitude: 37.7799, longitude: -121.9780, locationName: 'San Ramon' }"
   - "isUSLocation: true"
6. Expected UI:
   - Badge: "NOAA MRMS • HIGH-RES • LIVE" (blue)
   - High-resolution radar tiles visible
   - Animation controls visible
   - Map centered on San Ramon
```

### Test 2: International Location
```
1. Search: "London, UK"
2. Scroll to Weather Radar section
3. Expected console output:
   - "WeatherMap props received: { latitude: 51.5074, longitude: -0.1278, locationName: 'London' }"
   - "isUSLocation: false"
4. Expected UI:
   - Badge: "US LOCATIONS ONLY" (gray)
   - Warning overlay visible
   - No radar tiles
   - Clear explanation message
```

### Test 3: Verify No Props (Edge Case)
```
1. Go directly to /map page (if it exists)
2. Expected console output:
   - "WeatherMap props received: { latitude: undefined, longitude: undefined, locationName: undefined }"
   - "isUSLocation: no coordinates"
3. Expected UI:
   - Map centered on default location (center of US)
   - Appropriate fallback behavior
```

---

## Files Modified

1. **components/lazy-weather-map.tsx**
   - Changed import from `weather-map-animated` to `weather-map-client`
   - Single line change with massive impact

2. **components/weather-map-client.tsx**
   - Added debug logging for prop verification
   - Helps troubleshoot future issues

---

## Why This Bug Occurred

1. **Multiple Radar Components:** The codebase had multiple radar components:
   - `weather-map.tsx` (dynamic loader wrapper)
   - `weather-map-client.tsx` (main component with MRMS logic - our PR changes)
   - `weather-map-animated.tsx` (old component with OpenWeather only)
   - `lazy-weather-map.tsx` (another dynamic loader)

2. **Import Confusion:** When we fixed the radar in PR #108, we modified `weather-map-client.tsx`, but the main page was importing `weather-map-animated.tsx` through `lazy-weather-map.tsx`

3. **No Direct Testing:** The PR was tested on the `/map` page (which might use a different component), not the main weather search page

---

## Prevention for Future

### Recommendations:

1. **Consolidate Components:**
   - Consider removing `weather-map-animated.tsx` entirely (deprecated)
   - Use only `weather-map-client.tsx` across the entire app
   - Remove redundant loader components

2. **Component Documentation:**
   - Add comments at the top of each radar component explaining its purpose
   - Document which pages use which components
   - Mark deprecated components clearly

3. **Testing Checklist:**
   - Always test on ALL pages where a component is used
   - Main page (`/`)
   - Map page (`/map`)
   - Any other pages with radar
   - Test both US and international locations

4. **Import Tracking:**
   - When modifying a component, search for ALL imports of that component
   - Verify the correct component is being imported everywhere
   - Use grep/search to find: `import.*weather.*map`

---

## Impact

### Before Fix:
- Users on main page saw warning for ALL locations (US and international)
- MRMS radar never displayed, even for US cities
- Poor user experience and confusion
- Recent PR #108 improvements not visible to users

### After Fix:
- US users see high-quality MRMS radar immediately
- International users see clear explanation
- Proper behavior matches PR #108 intent
- Debug logging helps prevent future issues

---

## Related Issues

- PR #108: "Remove OpenWeather radar, make NOAA MRMS the only radar source"
- The changes in PR #108 were correct, but not being used on the main page
- This fix ensures those changes are actually applied to the user-facing page

---

## Summary

**The Problem:**
- Main page imported wrong radar component (weather-map-animated.tsx instead of weather-map-client.tsx)
- Our MRMS improvements were in weather-map-client.tsx
- Users never saw the improvements

**The Solution:**
- Changed lazy-weather-map.tsx to import weather-map-client.tsx
- Added debug logging to help verify props
- Now the correct component with MRMS logic is used

**The Result:**
- US locations show NOAA MRMS radar with animation
- International locations show clear message
- Props flow correctly through the component chain
- Users get the intended experience from PR #108

