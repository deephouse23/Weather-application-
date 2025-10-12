# Coordinate Loss Diagnostic Report

## Root Cause Identified

The `/map` route renders `WeatherMap` with **ZERO PROPS**, causing coordinates to be undefined.

## Data Flow Comparison

### Main Page (/) - WORKS ✅
```
User searches "San Ramon, CA"
  ↓
fetchWeatherData() called
  ↓
weather state updated: {
  location: "San Ramon",
  coordinates: { lat: 37.7497, lon: -121.9549 }
}
  ↓
Saved to localStorage: 'bitweather_weather_data'
  ↓
Props passed to LazyWeatherMap:
  latitude={weather?.coordinates?.lat}  ← 37.7497 ✅
  longitude={weather?.coordinates?.lon} ← -121.9549 ✅
  ↓
WeatherMap receives coordinates
  ↓
isUSLocation = true ✅
  ↓
MRMS radar loads ✅
```

### Map Page (/map) - BROKEN ❌
```
User navigates to /map
  ↓
MapPage component mounts
  ↓
No state initialization
No localStorage read
No context access
  ↓
Renders: <WeatherMap />  ← NO PROPS! ❌
  ↓
WeatherMap receives:
  latitude={undefined}   ❌
  longitude={undefined}  ❌
  locationName={undefined} ❌
  ↓
isUSLocation = false (no coordinates)
  ↓
Warning overlay shows ❌
```

## File Analysis

### app/page.tsx (Main Page)
- **Lines 81:** `const [weather, setWeather] = useState<WeatherData | null>(null)`
- **Lines 1017-1019:** Passes coordinates to LazyWeatherMap
- **Status:** WORKS ✅

### app/map/page.tsx (Map Page)  
- **Line 26:** `<WeatherMap />` - NO PROPS
- **No state management**
- **No localStorage access**
- **No context for coordinates**
- **Status:** BROKEN ❌

### components/location-context.tsx
- **Stores:** Location name strings only
- **Does NOT store:** Coordinates
- **Not suitable for:** Coordinate sharing

### localStorage Data
- **Key:** `bitweather_weather_data`
- **Contains:** Full WeatherData including coordinates
- **Main page:** Writes to it ✅
- **Map page:** Doesn't read from it ❌

## Why Both Logs Occur

### Log 1: Main Page Initial Render
- Triggered by: Main page mounting with weather data
- Props: Coordinates from `weather` state
- Result: isUSLocation = true

### Log 2: Navigation to /map
- Triggered by: Map page mounting
- Props: All undefined (no props passed)
- Result: isUSLocation = "no coordinates"

## Technical Details

### WeatherMap Component Chain

**Main Page:**
```typescript
LazyWeatherMap (app/page.tsx)
  ↓ imports
components/lazy-weather-map.tsx
  ↓ dynamic import
components/weather-map-client.tsx
  ↓ receives props ✅
```

**Map Page:**
```typescript
WeatherMap (app/map/page.tsx)
  ↓ imports
components/weather-map.tsx
  ↓ dynamic import
components/weather-map-client.tsx
  ↓ receives NO props ❌
```

### Interface Definition

**components/weather-map.tsx:**
```typescript
interface WeatherMapProps {
  latitude?: number      // Optional
  longitude?: number     // Optional
  locationName?: string  // Optional
  theme?: 'dark' | 'miami' | 'tron'
}

const WeatherMap = (props: WeatherMapProps) => {
  return <MapComponent {...props} />
}
```

All props are optional, so TypeScript doesn't catch the missing props error.

### Default Values

**components/weather-map-client.tsx line 47:**
```typescript
const position: [number, number] = [latitude || 39.8283, longitude || -98.5795]
// Falls back to center of USA when no coordinates provided
```

This is why the map loads at all - it defaults to center of USA.

## The Missing Link

The map page needs to:
1. Read weather data from somewhere
2. Extract coordinates  
3. Pass them as props to WeatherMap

Currently, it does NONE of these steps.

## Storage Locations Available

### Option 1: localStorage ✅ Available
```typescript
const cachedWeather = localStorage.getItem('bitweather_weather_data')
const weatherData = JSON.parse(cachedWeather)
// Contains: weatherData.coordinates.lat, weatherData.coordinates.lon
```

### Option 2: LocationContext ❌ Insufficient
```typescript
const { currentLocation } = useLocationContext()
// Only contains: "San Ramon, California, United States" (string)
// Missing: coordinates
```

### Option 3: URL Params ❌ Not Implemented
```typescript
// Could be: /map?lat=37.7497&lon=-121.9549
// Currently: Just /map with no params
```

### Option 4: New Coordinates Context ❌ Not Exists
```typescript
// Would need to create:
// WeatherContext or CoordinatesContext
// Currently doesn't exist
```

## Recommended Solution Path

### Option A: Read from localStorage (Quickest)
```typescript
// In app/map/page.tsx
'use client'

export default function MapPage() {
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null, name: null })
  
  useEffect(() => {
    const cached = localStorage.getItem('bitweather_weather_data')
    if (cached) {
      const data = JSON.parse(cached)
      setCoordinates({
        lat: data.coordinates?.lat,
        lon: data.coordinates?.lon,
        name: data.location
      })
    }
  }, [])
  
  return (
    <WeatherMap 
      latitude={coordinates.lat}
      longitude={coordinates.lon}
      locationName={coordinates.name}
    />
  )
}
```

**Pros:**
- Quick to implement
- Uses existing data
- No new dependencies

**Cons:**
- Relies on localStorage
- No SSR support
- Stale data possible

### Option B: Create Weather Context (Better)
```typescript
// Create lib/weather-context.tsx
export const WeatherContext = createContext({
  weatherData: null,
  setWeatherData: () => {},
})

// Wrap app in layout.tsx
<WeatherProvider>
  {children}
</WeatherProvider>

// Use in map page
const { weatherData } = useWeatherContext()
<WeatherMap 
  latitude={weatherData?.coordinates?.lat}
  longitude={weatherData?.coordinates?.lon}
/>
```

**Pros:**
- Proper state management
- Shared across routes
- Type-safe
- React best practice

**Cons:**
- More code to write
- Needs testing

### Option C: URL Parameters (Alternative)
```typescript
// Navigate with params: /map?lat=37.7497&lon=-121.9549&name=San+Ramon

// In map page:
const searchParams = useSearchParams()
const lat = searchParams.get('lat')
const lon = searchParams.get('lon')
const name = searchParams.get('name')

<WeatherMap latitude={Number(lat)} longitude={Number(lon)} locationName={name} />
```

**Pros:**
- Shareable URLs
- Bookmarkable
- Clear data flow

**Cons:**
- URL clutter
- Requires navigation changes
- Param parsing needed

### Option D: Extend LocationContext (Hybrid)
```typescript
// Modify components/location-context.tsx
interface LocationContextType {
  locationInput: string
  currentLocation: string
  coordinates: { lat: number | null, lon: number | null }  // ADD THIS
  setCoordinates: (coords: { lat: number, lon: number }) => void  // ADD THIS
  // ... rest
}
```

**Pros:**
- Uses existing context
- Minimal new code
- Already provider-wrapped

**Cons:**
- Context gets bigger
- Mixing concerns (location string vs coords)

## Critical Questions Answered

### 1. Why does isUSLocation: true on first load?
Because main page passes actual coordinates from `weather` state to the component.

### 2. Why does isUSLocation: no coordinates after navigation?
Because `/map` route passes NO props, so `latitude` and `longitude` are undefined.

### 3. Are there two separate WeatherMap instances?
Yes:
- Main page uses LazyWeatherMap (with props)
- Map page uses WeatherMap (without props)

### 4. Is /map a different route or scroll target?
Different route: `app/map/page.tsx` is a separate Next.js page.

### 5. Where should coordinates be persisted?
**Best:** Context (React way) or localStorage (simple way)
**Current:** localStorage has data, but map page doesn't read it

## Summary

### The Bug
```typescript
// app/map/page.tsx line 26
<WeatherMap />  // ❌ Missing: latitude, longitude, locationName props
```

### The Fix (Conceptual)
```typescript
// app/map/page.tsx line 26  
<WeatherMap 
  latitude={/* get from somewhere */}
  longitude={/* get from somewhere */}
  locationName={/* get from somewhere */}
/>
```

### The Question
**Where should "somewhere" be?**
- ✅ localStorage (exists, has data, not being read)
- ✅ Context (doesn't exist, would need creation)
- ✅ URL params (not implemented, would need navigation changes)

### Recommendation
**Start with Option A (localStorage)** for quick fix, then migrate to **Option B (Context)** for proper architecture.

