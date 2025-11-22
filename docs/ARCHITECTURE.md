# 16-Bit Weather Platform - Architecture Documentation

**Version:** 0.6.0
**Last Updated:** January 2025

---

## Technology Stack

### Frontend Framework
- **React 19**: Latest React with concurrent features
- **Next.js 15**: App Router with Server Components
- **TypeScript 5**: Full type safety

### UI Libraries
- **Radix UI**: Accessible component primitives
  - Alert Dialog, Avatar, Dialog, Dropdown Menu, Label, Select, Separator, Switch, Tabs, Toast, Toggle
- **Lucide React**: Icon library
- **Meteocons**: Weather-specific icon library for modern weather icons
- **Tailwind CSS 3.4**: Utility-first styling
- **Class Variance Authority**: Type-safe component variants
- **next-themes**: Theme management with system preference detection

### State Management
- **React Context**: Location, Auth, Theme state
- **React Hook Form**: Form validation with Zod schemas
- **Local Storage**: User preferences and cache

### Data Fetching
- **OpenWeatherMap API**: Weather data (current, forecast, One Call)
- **Google APIs**: Pollen and Air Quality data (optional)
- **Supabase**: User authentication and database

### Maps & Visualization
- **OpenLayers (ol)**: Interactive map library for NEXRAD radar
- **Chart.js**: Weather data visualization
- **React-ChartJS-2**: React wrapper for Chart.js

### Authentication & Database
- **Supabase**: PostgreSQL database with auth
- **@supabase/ssr**: Server-side rendering support
- **Row-Level Security**: Database access control

### Development Tools
- **Jest**: Unit testing
- **Playwright**: E2E testing
- **ESLint**: Code linting
- **PostCSS**: CSS processing

### Deployment & Monitoring
- **Vercel**: Hosting platform
- **Vercel Analytics**: Usage analytics
- **Sentry**: Error monitoring (currently disabled - see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md))

---

## Next.js 15 App Router Structure

```
app/
├── (routes)
│   ├── page.tsx                    # Homepage with weather search
│   ├── dashboard/                  # User dashboard
│   ├── profile/                    # User profile management
│   ├── weather/[city]/             # Dynamic city weather pages
│   ├── map/                        # Interactive weather map
│   ├── hourly/                     # Hourly forecast page
│   ├── games/                      # Games arcade hub
│   │   └── [slug]/                 # Individual game pages
│   ├── learn/                      # Educational hub
│   ├── cloud-types/                # Cloud atlas
│   ├── weather-systems/            # Weather phenomena database
│   ├── extremes/                   # Global temperature extremes
│   ├── fun-facts/                  # Weather trivia (16-Bit Takes)
│   ├── news/                       # Multi-source weather news
│   ├── gfs-model/[region]/[run]/   # GFS model viewer
│   └── about/                      # About page
├── auth/
│   ├── login/                      # Login page
│   ├── signup/                     # Registration page
│   ├── callback/                   # OAuth callback
│   └── reset-password/             # Password reset
├── api/
│   ├── weather/                    # Weather API routes
│   ├── locations/                  # Saved locations API
│   ├── user/preferences/           # User preferences API
│   ├── geocode/                    # Geocoding service
│   ├── extremes/                   # Temperature extremes API
│   ├── news/                       # News aggregation APIs
│   │   ├── aggregate/              # Multi-source aggregator
│   │   ├── fox/                    # FOX Weather
│   │   ├── nasa/                   # NASA Earth Observatory
│   │   └── reddit/                 # Reddit weather feeds
│   ├── games/                      # Games API
│   │   └── [slug]/                 # Game-specific endpoints
│   └── gfs-image/                  # GFS model image proxy
├── layout.tsx                      # Root layout with auth provider
├── error.tsx                       # Error boundary
├── global-error.tsx                # Global error handler
└── not-found.tsx                   # 404 page
```

---

## Key Architectural Decisions

### 1. Server Components by Default
- Better performance and SEO
- Reduced client-side JavaScript bundle
- Direct database access without API routes (when appropriate)

### 2. Client Components for Interactivity
- Used for interactive features (marked with `"use client"`)
- Maps, animations, forms, and real-time updates
- State management via React Context

### 3. API Routes as Security Layer
- Internal API layer to secure API keys (server-side only)
- All external API calls proxied through Next.js API routes
- Never expose API keys to client (no `NEXT_PUBLIC_` prefix on sensitive keys)

### 4. Context Providers
- **LocationContext**: Manages location state across app
- **AuthContext**: Authentication state and user session
- **ThemeContext**: Theme selection and persistence

### 5. Progressive Enhancement
- Core features work without JavaScript
- Enhanced experience with JavaScript enabled
- Graceful degradation for older browsers

---

## Library Files

### Core Services

#### `lib/weather-api.ts`
Main weather API client with functions for fetching weather data.

**Key Functions:**
- `fetchWeatherData(location, units)` - Comprehensive weather for a location
- `fetchWeatherByLocation(lat, lon, units)` - Weather by coordinates
- `fetchCurrentWeather(location)` - Current weather only
- `fetchForecast(lat, lon)` - 5-day forecast
- `fetchUVIndex(lat, lon)` - UV index data
- `fetchAirQuality(lat, lon)` - AQI data
- `fetchPollenData(lat, lon)` - Pollen counts

**Features:**
- Automatic error handling
- Request deduplication
- Response caching
- Unit conversion (Imperial/Metric)

#### `lib/location-service.ts`
Comprehensive location detection and management service.

**Key Functions:**
- `getCurrentLocation(options)` - Browser geolocation
- `getLocationByIP()` - IP-based fallback
- `getLocationWithFallback(options)` - Try geolocation, then IP
- `reverseGeocode(lat, lon)` - Coordinates to city name
- `getPermissionStatus()` - Check geolocation permission
- `clearCache()` - Clear cached location data

**Features:**
- High accuracy GPS with silent mode
- Multi-service IP fallback (ipapi.co, ipinfo.io, ipgeolocation.io)
- Nominatim reverse geocoding with zoom=18 for precision
- 5-minute location cache to reduce API calls

#### `lib/user-cache-service.ts`
Client-side caching service for weather data and user preferences.

**Key Functions:**
- `getCachedWeatherData(lat, lon)` - Get cached weather
- `setCachedWeatherData(lat, lon, data)` - Cache weather (10-min TTL)
- `getUserPreferences()` - Get user preferences
- `saveUserPreferences(preferences)` - Save preferences
- `clearExpiredCache()` - Remove expired entries

### Context Providers

#### `lib/location-context.tsx`
React context for managing location state.

**Provides:**
- `locationInput` - Current location input string
- `currentLocation` - Active location
- `setLocationInput()`, `setCurrentLocation()`
- `clearLocationState()`

#### `lib/auth/auth-context.tsx`
Authentication context provider with Supabase integration.

### Utilities

#### `lib/toast-service.ts`
Toast notification service using Sonner.

#### `lib/theme-utils.ts`
Theme management utilities and type definitions.

#### `lib/types.ts`
TypeScript type definitions for weather data and application state.

### Service Layer (`lib/services/`)

**Key Services:**
- `gamesService.ts` - Games data management, scoring, leaderboards
- `gfsModelService.ts` - GFS weather model data fetching
- `newsAggregator.ts` - Multi-source news aggregation engine
- `newsService.ts` - News utilities
- `foxWeatherService.ts` - FOX Weather RSS integration
- `nasaService.ts` - NASA Earth Observatory integration
- `redditService.ts` - Reddit weather subreddit integration
- `rssParser.ts` - RSS feed parsing utilities
- `theme-service.ts` - Theme management utilities

### Configuration (`lib/config/`)

- `newsConfig.ts` - News source configuration and endpoints

### Type Definitions (`lib/types/`)

- `games.ts` - Games system type definitions
- `news.ts` - Extended news types and interfaces

### Custom Hooks (`lib/hooks/`)

- `useNewsFeed.ts` - News feed data fetching hook
- `use-theme-preview.ts` - Theme preview functionality hook

### Supabase (`lib/supabase/`)

**Client Files:**
- `client.ts` - Supabase client initialization
- `server.ts` - Server-side Supabase client
- `middleware.ts` - Auth middleware for protected routes
- `auth.ts` - Authentication utilities
- `database.ts` - Database utilities and helpers
- `schema-adapter.ts` - Schema compatibility layer

**SQL Files:**
- `schema.sql` - Main database schema
- `user-preferences-schema.sql` - User preferences table
- `fix-saved-locations-schema.sql` - Location table fixes

---

## Authentication System

### Supabase Database Tables

1. **`users`** (managed by Supabase Auth)
   - Standard auth user table
   - Email, password hash, metadata

2. **`user_profiles`**
   - User profile information
   - Username, full name, avatar URL

3. **`user_locations`**
   - Saved locations (up to 10 per user)
   - City, state, country, lat/lon
   - Row-Level Security enabled

4. **`user_preferences`**
   - Theme, units, default location
   - Row-Level Security enabled

5. **`games`** (New in v0.6.0)
   - Game metadata and configuration

6. **`game_scores`** (New in v0.6.0)
   - User high scores and rankings
   - Guest and authenticated play support

7. **`user_game_stats`** (New in v0.6.0)
   - Play counts and statistics

### Row-Level Security (RLS)

All user tables have RLS policies ensuring users can only access their own data:
- SELECT, INSERT, UPDATE, DELETE policies check `auth.uid() = user_id`

### Protected Routes

Routes requiring authentication (enforced by `middleware.ts`):
- `/dashboard`
- `/profile`
- Any route accessing user-specific data

### Session Management

- Session stored in httpOnly, secure cookies
- Automatic refresh by Supabase client
- 1-hour session expiration (configurable)
- Refresh token for new access tokens

---

## Theme System

### Available Themes

1. **Dark** (Default) - Professional dark mode
2. **Miami** (Retro) - Synthwave/80s aesthetic
3. **Tron** (Sci-Fi) - Futuristic grid lines

### Implementation

Themes use CSS custom properties in `app/globals.css`:

```css
[data-theme="dark"] {
  --bg: #0a0a0a;
  --text: #e0e0e0;
  --accent: #3b82f6;
}
```

### Theme Persistence

- **Unauthenticated**: Saved to localStorage
- **Authenticated**: Saved to `user_preferences` table, synced across devices

---

## Location Services

### Browser Geolocation

**Silent Mode:**
- `enableHighAccuracy: false` - Uses WiFi/IP (no GPS permission prompt)
- `timeout: 5000` - 5-second timeout
- `maximumAge: 300000` - 5-minute cache

### IP-Based Fallback

Multiple services tried in sequence:
1. ipapi.co
2. ipinfo.io
3. ipgeolocation.io

### Reverse Geocoding

**Nominatim (OpenStreetMap):**
- `zoom=18` for city-level precision
- User-Agent header (required by policy)
- Prioritizes: city → town → suburb → village → hamlet

### Caching

- **Weather Data**: 10-minute TTL, coordinate-based keys
- **Location Detection**: 5-minute TTL, avoids repeated prompts

---

## Weather Radar & Maps

### NEXRAD Radar

**Data Source:**
Iowa State University NEXRAD archive
- Base reflectivity radar images
- 5-minute update intervals
- 4-hour rolling window (49 frames)

**Technology:**
- OpenLayers for map rendering
- WMS protocol for tile fetching
- Custom tile server: `/api/weather/iowa-nexrad-tiles`

**Features:**
- Animated playback with timeline controls
- Frame-by-frame navigation
- Opacity control for radar layer
- Location marker overlay

**Performance Optimizations:**
- Lazy loading of radar tiles
- Frame buffering (pre-load 3 frames ahead)
- Tile caching in browser

---

## Performance Optimization

### Code Splitting
- Lazy loading for weather map component
- Dynamic imports for heavy libraries (OpenLayers, Chart.js)
- Route-based code splitting (automatic with App Router)

### Image Optimization
- Next.js Image component for automatic optimization
- WebP format with AVIF fallback
- Responsive image sizing
- Lazy loading below fold

### Caching
- 10-minute weather data cache in localStorage
- Browser HTTP cache for static assets (1 year)
- CDN caching for images and fonts
- Service worker caching (PWA)

### Data Fetching
- Parallel API requests where possible
- Request deduplication
- Stale-while-revalidate pattern
- Progressive data loading

### Bundle Size
- Tree shaking for unused code
- Tailwind CSS purging
- Dynamic imports for large dependencies

---

## Security

### API Key Protection
- All API keys are server-side only (never exposed to client)
- API routes proxy external services
- No `NEXT_PUBLIC_` prefix on sensitive keys

### Authentication
- Supabase handles password hashing (bcrypt)
- JWT tokens for session management
- HttpOnly, Secure cookies
- CSRF protection enabled

### Database Security
- Row-Level Security (RLS) on all user tables
- Service role key only used in API routes (never client-side)
- SQL injection prevention via prepared statements

### Content Security
- CORS configured for API routes
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### Input Validation
- Zod schemas for all form inputs
- Server-side validation on API routes
- XSS prevention (React escapes by default)

---

**For more details:**
- [Features Documentation](./FEATURES.md)
- [API Reference](./API_REFERENCE.md)
- [Components Library](./COMPONENTS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
