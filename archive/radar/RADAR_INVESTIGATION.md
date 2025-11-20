# Weather Radar Deprecation Investigation

## Current Implementation

The app uses OpenWeather Map Tiles API via a proxy at:
- **File:** `app/api/weather/radar/[layer]/[...tile]/route.ts`
- **Endpoint:** `https://tile.openweathermap.org/map`
- **Layers Used:**
  - `precipitation_new` - Radar precipitation data
  - `clouds_new` - Cloud coverage
  - `wind_new` - Wind patterns
  - `pressure_new` - Atmospheric pressure
  - `temp_new` - Temperature overlay

## How It Works

1. Frontend requests tiles via: `/api/weather/radar/{layer}/{z}/{x}/{y}`
2. Backend proxy fetches from: `https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={key}`
3. Returns PNG tiles for map overlay

## Potential Issues

### 1. **API Key Configuration**
The code checks for `process.env.OPENWEATHER_API_KEY` but your production uses:
- **Vercel env var:** `NEXT_PUBLIC_OPENWEATHER_API_KEY` (from env.example)

**Problem:** Line 24 checks for `OPENWEATHER_API_KEY` (without `NEXT_PUBLIC_` prefix)

This would cause 500 errors in production!

### 2. **Layer Names**
The app uses `*_new` layer names:
- `precipitation_new`
- `clouds_new`
- `wind_new`
- `pressure_new`
- `temp_new`

These might be deprecated. OpenWeather may have updated layer names or removed them.

### 3. **Deprecated Map Tiles API**
OpenWeather has been migrating users from:
- **Old:** Free weather map tiles
- **New:** One Call API 3.0 with paid map tiles

## Required Actions

### Step 1: Check Environment Variable Name ✅
Fix the API key reference in the radar proxy route.

### Step 2: Test Current Endpoint 🔍
Check if `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png` still works.

### Step 3: Alternative Solutions

**Option A: Use One Call API 3.0**
- Fetch radar/precipitation data from One Call 3.0
- Render as canvas overlay instead of tiles
- More API calls but more reliable

**Option B: Use Third-Party Radar**
- RainViewer API (free alternative)
- Weather.gov NEXRAD (US only, free)
- Windy API (requires subscription)

**Option C: Update to New OpenWeather Tiles**
- Check OpenWeather docs for new layer names
- Update subscription if needed

## Files to Check/Fix

1. `app/api/weather/radar/[layer]/[...tile]/route.ts` - Fix API key name
2. `components/weather-map-client.tsx` - Uses the radar tiles
3. `components/weather-map-animated.tsx` - Animated radar

## Testing Steps

1. Check Vercel deployment logs for radar errors
2. Check browser console on production site
3. Manually test tile endpoint with your API key
4. Check OpenWeather dashboard for API usage/quotas

---

**Next:** Will fix the API key mismatch and document alternative solutions.

