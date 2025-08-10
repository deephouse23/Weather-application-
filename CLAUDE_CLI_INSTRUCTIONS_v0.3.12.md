# Claude CLI Instructions - Weather App UI Fixes (Branch v0.3.12)

## Step-by-Step Instructions for Claude CLI in Cursor

### 1. Switch to the v0.3.12 branch
```bash
# Fetch the latest branches from GitHub
git fetch origin

# Switch to the v0.3.12 branch
git checkout v0.3.12

# If the branch doesn't exist locally yet, create it tracking the remote
git checkout -b v0.3.12 origin/v0.3.12
```

### 2. Apply the fixes to these two files

#### FILE 1: `app/weather/[city]/client.tsx`

**Fix A:** Add the moon phase helper function (add after line 14, before `interface CityWeatherClientProps`):
```typescript
// Helper function to get moon phase icon
const getMoonPhaseIcon = (phase: string): string => {
  const phaseLower = phase.toLowerCase();
  
  if (phaseLower.includes('new')) return '●';
  if (phaseLower.includes('waxing crescent')) return '🌒';
  if (phaseLower.includes('first quarter')) return '🌓';
  if (phaseLower.includes('waxing gibbous')) return '🌔';
  if (phaseLower.includes('full')) return '🌕';
  if (phaseLower.includes('waning gibbous')) return '🌖';
  if (phaseLower.includes('last quarter')) return '🌗';
  if (phaseLower.includes('waning crescent')) return '🌘';
  
  // Fallback for any other phases
  return '🌑';
};
```

**Fix B:** Update the useEffect for citySlug changes (around line 82-89):
Replace this:
```typescript
  // CLEAR local state whenever the route/citySlug changes (prevents ghost data)
  useEffect(() => {
    setWeather(null)
    setSelectedDay(null)
    setError("")
    // also clear any location input stored in context if desired
    setLocationInput(city.searchTerm)
    setCurrentLocation(city.searchTerm)
  }, [citySlug])
```

With this:
```typescript
  // CLEAR local state whenever the route/citySlug changes (prevents ghost data)
  useEffect(() => {
    setWeather(null)
    setSelectedDay(null)
    setError("")
    // Clear the location context completely to prevent history from carrying over
    clearLocationState()
    // Then set the current city as the location
    setLocationInput(city.searchTerm)
    setCurrentLocation(city.searchTerm)
  }, [citySlug])
```

**Fix C:** Add Sun Times, UV Index, and Moon Phase sections (after line 224, after the Wind Box closing div):
Add this new section after the first `</ResponsiveGrid>` and before the `{/* AQI and Pollen Count` comment:

```typescript
              {/* Sun Times, UV Index, Moon Phase - Same as homepage */}
              <ResponsiveGrid cols={{ sm: 1, md: 3 }} className="gap-4">
                {/* Sun Times Box */}
                <div className="p-4 rounded-lg text-center border-2 shadow-lg bg-weather-bg-elev border-weather-border">
                  <h2 className="text-xl font-semibold mb-2 text-weather-primary">Sun Times</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-yellow-400">☀️</span>
                      <p className="text-weather-text">Sunrise: {weather?.sunrise || 'N/A'}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-orange-400">🌅</span>
                      <p className="text-weather-text">Sunset: {weather?.sunset || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* UV Index Box */}
                <div className="p-4 rounded-lg text-center border-2 shadow-lg bg-weather-bg-elev border-weather-border">
                  <h2 className="text-xl font-semibold mb-2 text-weather-primary">UV Index</h2>
                  <p className="text-lg font-bold text-weather-text">{weather?.uvIndex || 'N/A'}</p>
                </div>

                {/* Moon Phase Box */}
                <div className="p-4 rounded-lg text-center border-2 shadow-lg bg-weather-bg-elev border-weather-border">
                  <h2 className="text-xl font-semibold mb-2 text-weather-primary">Moon Phase</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">{getMoonPhaseIcon(weather?.moonPhase?.phase || 'new')}</span>
                      <p className="text-lg font-semibold text-weather-text">{weather?.moonPhase?.phase || 'Unknown'}</p>
                    </div>
                    <p className="text-sm font-medium text-weather-muted">
                      {weather?.moonPhase?.illumination || 0}% illuminated
                    </p>
                  </div>
                </div>
              </ResponsiveGrid>
```

#### FILE 2: `components/location-context.tsx`

**Fix:** Update the route navigation logic (around line 123-134):
Replace this:
```typescript
    const shouldClear = shouldClearOnRouteChange && (isNavigatingFromHomeToCityPage || isNavigatingFromCityPageToHome || isNavigatingBetweenCityPages)
```

With this:
```typescript
    // Always clear when navigating between different city pages or from city to home
    const shouldClear = (isNavigatingFromCityPageToHome || isNavigatingBetweenCityPages) || 
                       (shouldClearOnRouteChange && isNavigatingFromHomeToCityPage)
```

### 3. Test the fixes locally
```bash
# Start the development server
npm run dev
```

Then test:
1. Go to http://localhost:3000
2. Click on "HOUSTON" in the Weather by City section
3. Verify you see Sun Times, UV Index, and Moon Phase sections
4. Click on another city like "SAN DIEGO" 
5. Verify the page loads with fresh data (no Houston history)
6. Go back to the homepage and verify it still works correctly

### 4. Commit and push the changes
```bash
# Check what files were modified
git status

# Add the modified files
git add app/weather/[city]/client.tsx components/location-context.tsx

# Commit with a descriptive message
git commit -m "fix(v0.3.12): Add missing weather sections to city pages and fix location persistence

- Added Sun Times, UV Index, and Moon Phase sections to city weather pages
- Fixed location context to properly clear when navigating between cities
- Prevents weather history from persisting across different city pages"

# Push to the v0.3.12 branch
git push origin v0.3.12
```

### 5. Create a Pull Request (if needed)
After pushing, go to GitHub and create a pull request from `v0.3.12` to `main` if you want to merge these fixes.

## Summary of Changes
- ✅ City pages now show Sun Times, UV Index, and Moon Phase (matching homepage)
- ✅ Navigation between cities clears previous weather data
- ✅ Each city page loads with a clean state
- ✅ "About [City] Weather" section remains only on city pages as intended
