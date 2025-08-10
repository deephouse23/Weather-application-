# Claude CLI Instructions - Weather App UI Fixes (Branch v0.3.12) - UPDATED

## Step-by-Step Instructions for Claude CLI in Cursor

### 1. Switch to the v0.3.12 branch (if not already there)
```bash
# Fetch the latest changes
git fetch origin

# Check current branch
git branch --show-current

# If not on v0.3.12, switch to it
git checkout v0.3.12
```

### 2. Apply ALL the fixes to these three files

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

**Fix B:** Update the CityWeatherClientProps interface (around line 33-45):
Add `isPredefinedCity?: boolean` to the interface:
```typescript
interface CityWeatherClientProps {
  city: {
    name: string
    state: string
    searchTerm: string
    title: string
    description: string
    content: {
      intro: string
      climate: string
      patterns: string
    }
  }
  citySlug: string
  isPredefinedCity?: boolean  // ADD THIS LINE
}
```

**Fix C:** Update the function signature (around line 48):
Replace:
```typescript
export default function CityWeatherClient({ city, citySlug }: CityWeatherClientProps) {
```
With:
```typescript
export default function CityWeatherClient({ city, citySlug, isPredefinedCity = false }: CityWeatherClientProps) {
```

**Fix D:** Update the useEffect for citySlug changes (around line 82-89):
Replace:
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
With:
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

**Fix E:** Add Sun Times, UV Index, and Moon Phase sections (after line 224, after the Wind Box closing div):
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

**Fix F:** Make the "About Weather" section conditional (find the section around line 290-305):
Replace:
```typescript
          {/* SEO Content Section - Added below weather display */}
          <div className="mt-12 p-6 border-2 rounded-lg bg-weather-bg-elev border-weather-border text-weather-text">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-wider font-mono text-weather-primary">
              About {city.name} Weather
            </h2>
            
            <div className="space-y-4 text-sm leading-relaxed font-mono">
              <p>{city.content.intro}</p>
              <p>{city.content.climate}</p>
              <p>{city.content.patterns}</p>
            </div>
          </div>
```
With:
```typescript
          {/* SEO Content Section - Only show for predefined cities */}
          {isPredefinedCity && (
            <div className="mt-12 p-6 border-2 rounded-lg bg-weather-bg-elev border-weather-border text-weather-text">
              <h2 className="text-xl font-bold mb-4 uppercase tracking-wider font-mono text-weather-primary">
                About {city.name} Weather
              </h2>
              
              <div className="space-y-4 text-sm leading-relaxed font-mono">
                <p>{city.content.intro}</p>
                <p>{city.content.climate}</p>
                <p>{city.content.patterns}</p>
              </div>
            </div>
          )}
```

#### FILE 2: `components/location-context.tsx`

**Fix:** Update the route navigation logic (around line 131):
Replace:
```typescript
    const shouldClear = shouldClearOnRouteChange && (isNavigatingFromHomeToCityPage || isNavigatingFromCityPageToHome || isNavigatingBetweenCityPages)
```
With:
```typescript
    // Always clear when navigating between different city pages or from city to home
    const shouldClear = (isNavigatingFromCityPageToHome || isNavigatingBetweenCityPages) || 
                       (shouldClearOnRouteChange && isNavigatingFromHomeToCityPage)
```

#### FILE 3: `app/weather/[city]/page.tsx`

**Fix:** Pass the isPredefinedCity prop to CityWeatherClient (around line 296):
Replace:
```typescript
        <CityWeatherClient city={cityInfo} citySlug={citySlug} />
```
With:
```typescript
        <CityWeatherClient 
          city={cityInfo} 
          citySlug={citySlug} 
          isPredefinedCity={!!city}
        />
```

### 3. Test the fixes locally
```bash
# Start the development server
npm run dev
```

Then test:
1. Go to http://localhost:3000
2. Click on "HOUSTON" in the Weather by City section
3. Verify you see:
   - Sun Times, UV Index, and Moon Phase sections
   - "About Houston Weather" section at the bottom
4. Now search for "Tracy, CA" in the search box on the Houston page
5. Verify on the Tracy page:
   - Sun Times, UV Index, and Moon Phase sections STILL appear
   - "About Tracy Weather" section does NOT appear (this is correct)
6. Click on "SAN DIEGO" from Weather by City
7. Verify San Diego loads with fresh data and shows the "About San Diego Weather" section

### 4. Commit and push the changes
```bash
# Check what files were modified
git status

# Add the modified files
git add app/weather/[city]/client.tsx components/location-context.tsx app/weather/[city]/page.tsx

# Commit with a descriptive message
git commit -m "fix(v0.3.12): Complete UI fixes for city weather pages

- Added Sun Times, UV Index, and Moon Phase sections to all city weather pages
- Fixed location context to properly clear when navigating between cities
- Made 'About Weather' section conditional - only shows for predefined cities
- Prevents weather history from persisting across different city pages
- Non-predefined cities (via search) now work correctly without showing About section"

# Push to the v0.3.12 branch
git push origin v0.3.12
```

### 5. Create a Pull Request (if needed)
After pushing, go to GitHub and create a pull request from `v0.3.12` to `main` if you want to merge these fixes.

## Summary of ALL Changes
- ✅ City pages now show Sun Times, UV Index, and Moon Phase (matching homepage)
- ✅ Navigation between cities clears previous weather data
- ✅ Each city page loads with a clean state
- ✅ "About [City] Weather" section ONLY appears for predefined cities in "Weather by City" list
- ✅ User-searched cities (like Tracy, CA) show weather data WITHOUT the About section
