# Cursor AI Assistant Guide - 16-Bit Weather Platform

This document provides context and guidelines for AI coding assistants working on the 16-Bit Weather Platform.

## Project Overview

**16-Bit Weather Platform** is a retro-styled weather application built with modern web technologies. It provides real-time weather data, animated radar maps, and a nostalgic terminal aesthetic reminiscent of 16-bit era computing.

### Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI**: React 18, Tailwind CSS, shadcn/ui components
- **Maps**: OpenLayers (for radar visualization)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Context + useState/useEffect
- **API Integration**: OpenWeather API, Iowa State NEXRAD radar
- **Testing**: Jest, Playwright, React Testing Library
- **Deployment**: Vercel
- **Monitoring**: Sentry

## Project Structure

```
Weather-application--main/
├── app/                          # Next.js app directory
│   ├── page.tsx                  # Main weather page (homepage)
│   ├── api/                      # API routes (32 endpoints)
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # User dashboard
│   ├── map/                      # Full-screen radar map page
│   ├── weather/[city]/           # Dynamic city weather pages
│   └── globals.css               # Global styles & theme variables
├── components/                   # React components
│   ├── weather-map-openlayers.tsx # Main radar component
│   ├── weather-search-enhanced.tsx # Search with autocomplete
│   ├── lazy-weather-map.tsx      # Lazy-loaded map wrapper
│   ├── theme-provider.tsx        # Theme management
│   ├── ui/                       # shadcn/ui components
│   └── dashboard/                # Dashboard components
├── lib/                          # Shared utilities
│   ├── weather-api.ts            # Weather API client
│   ├── location-service.ts       # Geolocation utilities
│   ├── user-cache-service.ts     # Cache management
│   ├── theme-config.ts           # Theme definitions
│   ├── utils/                    # Helper functions
│   └── supabase/                 # Supabase client & types
├── docs/                         # Documentation
│   └── archive/                  # Archived docs (>30 days old)
└── public/                       # Static assets

Key files not in node_modules or generated directories.
```

## Important File Locations

### Core Application Files

- **`app/page.tsx`** - Main weather homepage (1000+ lines)
  - Weather search and display
  - Location detection logic
  - Cache management
  - Radar map integration
  - Line 1030: Radar default mode configuration

- **`components/weather-map-openlayers.tsx`** - Animated radar component
  - OpenLayers map implementation
  - NEXRAD radar animation (4 hours historical data)
  - Static vs animation mode toggle
  - 49 frames at 5-minute intervals

- **`components/weather-search-enhanced.tsx`** - Search component
  - City autocomplete
  - Location detection button
  - Toast notifications
  - Rate limiting

- **`lib/location-service.ts`** - Location detection service
  - Geolocation API wrapper
  - IP-based fallback
  - Error handling
  - Cache management

### Configuration Files

- **`next.config.mjs`** - Next.js configuration
- **`tailwind.config.ts`** - Tailwind + theme configuration
- **`components.json`** - shadcn/ui configuration
- **`.gitignore`** - Includes `docs/archive/` exclusion

## Development Conventions

### Branch Naming

- `hotfix-##` - Hot fixes for production issues
- `feature/description` - New features
- `fix/description` - Bug fixes
- `chore/description` - Maintenance tasks

Current stable branch: `hotfix-01`

### Commit Message Format

Follow conventional commits:

```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Testing
- `perf:` - Performance improvement

### Pull Request Guidelines

1. **Always use GitHub CLI** to create PRs
2. **Never include emojis** in PR titles or descriptions
3. **Use descriptive titles** that explain what was changed
4. **Include detailed body** with:
   - Summary of changes
   - Issues fixed
   - Testing instructions
   - Impact assessment

Example command:
```bash
gh pr create --title "Fix radar animation default mode" --body "..." --base hotfix-01
```

See `.cursor/commands/pr.md` for the PR creation command.

### Code Style

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use proper TypeScript types (avoid `any`)
- Follow existing component patterns
- Use semantic HTML
- Implement proper error boundaries
- Add JSDoc comments for complex functions

## Common Tasks & Patterns

### 1. Adding a New API Route

Location: `app/api/[endpoint]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    )
  }
}
```

### 2. Cache Management Pattern

The app uses localStorage for caching. Key patterns:

```typescript
// Cache keys
const CACHE_KEY = 'bitweather_city'
const WEATHER_KEY = 'bitweather_weather_data'
const CACHE_TIMESTAMP_KEY = 'bitweather_cache_timestamp'

// Cache duration: 10 minutes
const CACHE_DURATION = 10 * 60 * 1000

// Always check if client-side before accessing localStorage
if (isClient) {
  localStorage.setItem(key, value)
}
```

**Important**: When user explicitly clicks "detect your location", clear cache to prevent stale data:

```typescript
localStorage.removeItem(CACHE_KEY)
localStorage.removeItem(WEATHER_KEY)
localStorage.removeItem(CACHE_TIMESTAMP_KEY)
```

### 3. Location Detection Flow

```
User clicks "USE MY LOCATION"
  ↓
handleLocationSearch() clears cache
  ↓
locationService.getCurrentLocation()
  ↓ (if fails)
locationService.getLocationByIP()
  ↓
handleLocationDetected()
  ↓
fetchWeatherByLocation()
  ↓
Update UI with weather data
```

### 4. Radar Configuration

Two modes available:
- **Static**: Single high-quality radar image (faster load)
- **Animation**: 49 frames of historical data (4 hours)

Default mode set in `app/page.tsx`:
```tsx
<LazyWeatherMap 
  latitude={weather?.coordinates?.lat}
  longitude={weather?.coordinates?.lon}
  locationName={weather?.location}
  theme={theme || 'dark'}
  defaultMode="animation"  // or "static"
/>
```

Animation does NOT auto-play - user must click play button.

### 5. Theme System

Three themes available:
- **dark** - Default blue/gray theme
- **miami** - Pink/cyan retro aesthetic
- **tron** - Cyan with animated grid background

Managed by `theme-provider.tsx` using Context API.

Theme classes in `lib/theme-config.ts` and `lib/theme-utils.ts`.

### 6. Adding New Components

Always create in `components/` directory:

```typescript
'use client'  // Add if using hooks/browser APIs

import { ComponentProps } from './types'

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Implementation
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

For lazy loading:
```typescript
const LazyComponent = dynamic(() => import('./component'), {
  ssr: false,
  loading: () => <Loader2 className="animate-spin" />
})
```

## Known Patterns & Gotchas

### 1. Location Detection Cache Interference

**Problem**: Cached location data (e.g., Los Angeles) persists even after user clicks "detect your location".

**Solution**: Always clear cache in `handleLocationSearch()` before detecting location:

```typescript
// Clear cache before explicit location detection
localStorage.removeItem(CACHE_KEY)
localStorage.removeItem(WEATHER_KEY)
localStorage.removeItem(CACHE_TIMESTAMP_KEY)
```

**When it matters**: Silent auto-detection on page load should use cache, but explicit user clicks should bypass cache.

### 2. Radar Props Must Include Coordinates

The radar map requires valid coordinates to determine if location is in US (for NEXRAD data):

```typescript
// In weather-map-openlayers.tsx
const isUSLocation = useMemo(() => {
  if (!latitude || !longitude) return false
  return isInMRMSCoverage(latitude, longitude)
}, [latitude, longitude])
```

If coordinates are undefined, radar defaults to center of USA (39.8283, -98.5795).

### 3. Theme Persistence

Theme preference stored in localStorage key: `theme-preference`

The theme persists across sessions and is loaded on mount.

### 4. Rate Limiting

Weather searches limited to 10 per hour per user (localStorage tracking).

Key: `weather-app-rate-limit`

### 5. Server Components vs Client Components

- Use `'use client'` for components with:
  - useState, useEffect, useContext
  - Browser APIs (localStorage, geolocation)
  - Event handlers (onClick, onChange)
  
- Keep server components for:
  - Static content
  - Data fetching (when using Server Actions)
  - SEO metadata

### 6. Map Page Coordinate Loss

**Known issue**: The `/map` page previously rendered WeatherMap with no props, causing undefined coordinates.

**Fix**: Map page must read cached weather data and pass coordinates:

```typescript
const weatherData = userCacheService.getCachedWeatherData(locationKey)
<WeatherMap 
  latitude={weatherData?.coordinates?.lat}
  longitude={weatherData?.coordinates?.lon}
  // ...other props
/>
```

See `COORDINATE_LOSS_DIAGNOSIS.md` for details.

## Key Dependencies & APIs

### External APIs

1. **OpenWeather API**
   - Current weather data
   - 5-day forecast
   - Air quality index
   - UV index
   - Handled by internal API routes (keys not exposed to client)

2. **Iowa State NEXRAD Radar**
   - WMS endpoint: `https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi`
   - TMS tiles (current): `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/`
   - Historical data available via TIME parameter
   - 5-minute intervals
   - Coverage: Continental USA only

3. **Iowa State RadMap API**
   - Static radar images
   - Endpoint: `https://mesonet.agron.iastate.edu/api/1/radarmap.png`
   - Used for static mode radar display

4. **IP Geolocation Fallback**
   - Used when browser geolocation fails
   - Multiple fallback services configured

### Key npm Packages

- `next` - Framework
- `react`, `react-dom` - UI library
- `ol` - OpenLayers (maps)
- `@supabase/supabase-js` - Database & auth
- `@supabase/ssr` - Server-side Supabase
- `@radix-ui/*` - UI primitives (via shadcn)
- `tailwindcss` - Styling
- `chart.js`, `react-chartjs-2` - Charts
- `lucide-react` - Icons
- `zod` - Schema validation
- `react-hook-form` - Form handling
- `sonner` - Toast notifications
- `@sentry/nextjs` - Error monitoring

## Testing

### Test Structure

```
__tests__/          # Jest tests
tests/              # Playwright E2E tests
setupTests.ts       # Jest setup
playwright.config.ts # Playwright config
```

### Running Tests

```bash
# Unit tests (Jest)
npm test

# E2E tests (Playwright)
npm run test:e2e

# Watch mode
npm run test:watch
```

### Test Files

- `__tests__/weather-app.test.tsx` - Main app tests
- `__tests__/smoke.test.ts` - Smoke tests
- `tests/*.spec.ts` - Playwright E2E tests

## Deployment

### Vercel Configuration

- Platform: Vercel
- Framework: Next.js
- Build command: `next build`
- Output directory: `.next`
- Environment variables required (see `.env.example`)

### Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENWEATHER_API_KEY`
- Sentry keys (optional but recommended)

### Build Process

1. TypeScript compilation
2. Next.js optimization
3. Static generation where possible
4. Asset optimization
5. Sentry source maps upload (if configured)

## Documentation Maintenance

### Archive Policy

**Rule**: Markdown files not modified/referenced in **30+ days** should be archived.

**Process**:
1. Review `.md` files in root and `docs/` (excluding `node_modules`)
2. Check last git commit date
3. Move files >30 days old to `docs/archive/`
4. Keep `README.md` and actively used docs in place
5. `docs/archive/` is in `.gitignore` but archived files are tracked

**Example**:
```bash
git mv OLD_DOC.md docs/archive/OLD_DOC.md
git commit -m "chore: archive outdated documentation"
```

### Active Documentation

Keep these updated:
- `README.md` - Main project README
- `TESTING_GUIDE.md` - Testing instructions
- `cursor.md` - This file (AI assistant guide)
- Recent fix/feature documentation (<30 days)

## Common Issues & Solutions

### Issue: Search bar shows correct location but map shows Los Angeles

**Cause**: Cached location data not cleared on explicit location detection.

**Solution**: Clear cache in `handleLocationSearch()` before calling location service.

**File**: `app/page.tsx`, lines 637-644

### Issue: Radar not animating (no movement)

**Cause**: 
- Not in animation mode (defaultMode="static")
- Animation not started (play button not clicked)
- Not in US location (NEXRAD only covers USA)

**Solution**: 
- Set `defaultMode="animation"` in LazyWeatherMap props
- Click play button to start animation
- Ensure location coordinates are in USA

**File**: `app/page.tsx`, line 1030

### Issue: Map showing center of USA instead of searched location

**Cause**: Coordinates not passed to WeatherMap component.

**Solution**: Always pass `latitude` and `longitude` props from weather data.

**Reference**: `COORDINATE_LOSS_DIAGNOSIS.md`

### Issue: Theme not persisting across sessions

**Cause**: localStorage not being set, or `isClient` check failing.

**Solution**: Ensure `isClient` state is true before accessing localStorage. Theme provider handles this automatically.

### Issue: Rate limit exceeded

**Cause**: User made 10+ searches in one hour.

**Solution**: Rate limit data stored in localStorage with key `weather-app-rate-limit`. Clear or wait for 1-hour window to reset.

## Radar Technical Details

### NEXRAD Animation Implementation

- **Frame Count**: 49 frames
- **Time Range**: 4 hours of historical data
- **Interval**: 5 minutes between frames
- **Start**: 4 hours ago (T-240 minutes)
- **End**: Now (T-0)

### Frame Generation

```typescript
const NEXRAD_STEP_MINUTES = 5
const NEXRAD_PAST_STEPS = 48  // 4 hours = 48 * 5 minutes
const now = Date.now()
const quantize = (ms) => Math.floor(ms / (5 * 60 * 1000)) * (5 * 60 * 1000)
const base = quantize(now)

for (let i = NEXRAD_PAST_STEPS; i >= 0; i--) {
  timestamps.push(base - i * NEXRAD_STEP_MINUTES * 60 * 1000)
}
```

### WMS Parameters

```typescript
url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi'
params: {
  'LAYERS': 'nexrad-n0q-900913',
  'FORMAT': 'image/png',
  'TRANSPARENT': true,
  'TIME': timeISO,  // ISO 8601 format
}
```

### Static Mode

Uses Iowa State RadMap API for single high-quality image:
- Covers entire continental USA
- Faster initial load
- Lower bandwidth
- Manual refresh button

## Useful Commands

### Development

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
npm test              # Run Jest tests
npm run test:e2e      # Run Playwright tests
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Stage and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feature/new-feature
gh pr create --title "..." --body "..." --base hotfix-01
```

### Database

```bash
# Run Supabase locally (if configured)
npx supabase start

# Generate types
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

## Additional Resources

### Documentation

- `TESTING_GUIDE.md` - Testing instructions
- `IOWA_RADMAP_INTEGRATION.md` - Radar implementation details
- `NOAA_MRMS_AUTO_ENABLE_FIX.md` - MRMS radar auto-enable
- `AUTH_OPTIMIZATION_README.md` - Authentication optimization
- `docs/` folder - Various technical documentation

### External Links

- [OpenWeather API Docs](https://openweathermap.org/api)
- [Iowa State Mesonet](https://mesonet.agron.iastate.edu/)
- [OpenLayers Docs](https://openlayers.org/doc/)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## Tips for AI Assistants

1. **Always check `isClient`** before using browser APIs (localStorage, geolocation)
2. **Read the plan files** (`.plan.md`) if they exist in the project
3. **Clear cache for explicit user actions** (location detection, theme changes)
4. **Pass coordinates to radar maps** - they need lat/lon to function properly
5. **Follow existing patterns** - consistency is important
6. **Test both desktop and mobile** - responsive design is critical
7. **Consider rate limits** - don't spam APIs
8. **Archive old docs** - keep the repo clean (30-day rule)
9. **No emojis in PRs** - project convention
10. **Use TypeScript properly** - avoid `any`, use proper types

## Version History

- **v0.3.31+** - Current version
- Major features: Weather data, animated radar, themes, authentication, dashboard
- License: Fair Source License v0.9 (5 users)

---

**Last Updated**: October 12, 2025

For questions or updates to this guide, create an issue or update this file directly.

