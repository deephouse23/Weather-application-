# 16-Bit Weather Platform - Comprehensive Documentation

**Version:** 0.3.37
**Live URL:** [16bitweather.co](https://www.16bitweather.co/)
**Repository:** Private development build
**Last Updated:** January 2025

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Environment Configuration](#environment-configuration)
5. [Core Features](#core-features)
6. [API Routes](#api-routes)
7. [Library Files](#library-files)
8. [Components](#components)
9. [Authentication System](#authentication-system)
10. [Theme System](#theme-system)
11. [Location Services](#location-services)
12. [Weather Radar & Maps](#weather-radar--maps)
13. [Known Issues](#known-issues)
14. [Recent Changes](#recent-changes)
15. [Development Workflow](#development-workflow)
16. [Deployment](#deployment)

---

## Project Overview

A professional weather application combining modern meteorological data with retro terminal aesthetics. Built with Next.js 15, React 19, and TypeScript, featuring comprehensive weather monitoring, interactive radar maps, and user authentication.

### Key Features

- **Real-time Weather Data**: Current conditions, forecasts, UV index, air quality, pollen counts
- **Interactive Radar**: NEXRAD radar with animation timeline
- **Location Services**: GPS auto-detection, city search, ZIP code lookup
- **User Authentication**: Supabase-powered accounts with saved locations
- **Multi-Theme Support**: Dark, Miami, Tron themes
- **Progressive Web App**: Installable with offline capabilities
- **Global Coverage**: Weather data for locations worldwide

---

## Architecture

### Next.js 15 App Router Structure

```
app/
├── (routes)
│   ├── page.tsx                    # Homepage with weather search
│   ├── dashboard/                  # User dashboard
│   ├── profile/                    # User profile management
│   ├── weather/[city]/             # Dynamic city weather pages
│   ├── map/                        # Interactive weather map
│   ├── games/                      # Weather-themed games
│   ├── cloud-types/                # Cloud atlas
│   ├── weather-systems/            # Weather phenomena database
│   ├── extremes/                   # Global temperature extremes
│   ├── fun-facts/                  # Weather trivia
│   ├── news/                       # Weather news
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
│   └── news/                       # Weather news API
├── layout.tsx                      # Root layout with auth provider
├── error.tsx                       # Error boundary
├── global-error.tsx                # Global error handler
└── not-found.tsx                   # 404 page
```

### Key Architectural Decisions

- **Server Components by default**: Better performance and SEO
- **Client Components**: Used for interactive features (marked with `"use client"`)
- **API Routes**: Internal API layer to secure API keys (server-side only)
- **Context Providers**: Location, Auth, and Theme contexts
- **Progressive Enhancement**: Core features work without JavaScript

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
- **Tailwind CSS 3.4**: Utility-first styling
- **Class Variance Authority**: Type-safe component variants

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
- **Sentry**: Error monitoring (currently disabled - see Known Issues)

---

## Environment Configuration

### Required Environment Variables

```env
# OpenWeatherMap API (Required)
OPENWEATHER_API_KEY=your_api_key_here

# Supabase Authentication (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Development Environment
NODE_ENV=development
```

### Optional Environment Variables

```env
# Google APIs (Optional - Enhanced Data)
GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here
GOOGLE_AIR_QUALITY_API_KEY=your_google_air_quality_api_key_here

# Sentry Error Monitoring (Currently Disabled)
# SENTRY_DSN=your_sentry_dsn_here
# NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_auth_token_here
SENTRY_ORG=16bitweather
SENTRY_PROJECT=javascript-nextjs
```

### API Key Setup

1. **OpenWeatherMap**:
   - Sign up at [openweathermap.org](https://openweathermap.org/api)
   - Free tier: 1,000 calls/day
   - Get API key from dashboard

2. **Supabase**:
   - Create project at [supabase.com](https://supabase.com)
   - Get URL and keys from Settings > API
   - Service role key is for server-side only (NEVER expose to client)

3. **Google APIs** (Optional):
   - Enable Pollen API and Air Quality API at [console.cloud.google.com](https://console.cloud.google.com)
   - Create API key with appropriate restrictions

---

## Core Features

### 1. Weather Data Display

**Current Weather:**
- Temperature with "feels like" calculation
- Weather condition with icon
- Wind speed, direction, and gusts
- Humidity and visibility
- Atmospheric pressure
- Sunrise and sunset times
- Moon phase with illumination percentage

**Environmental Data:**
- **UV Index**: Real-time solar radiation levels with safety recommendations
- **Air Quality (AQI)**: Pollution levels with health advisories (Google AQI or OpenWeatherMap fallback)
- **Pollen Count**: Tree, grass, and weed pollen levels (Google Pollen API)

**5-Day Forecast:**
- Daily temperature ranges (high/low)
- Weather conditions and precipitation probability
- Expandable detailed view with hourly breakdown
- Date formatting: M.DD.YY

### 2. Location Services

**Search Methods:**
- City name search (e.g., "San Francisco")
- State/Country search (e.g., "Paris, France")
- ZIP/Postal codes (e.g., "94102")
- GPS coordinates (e.g., "37.7749, -122.4194")

**Auto-Detection:**
- Browser geolocation API with high accuracy mode disabled for silent operation
- IP-based fallback using multiple services (ipapi.co, ipinfo.io, ipgeolocation.io)
- Reverse geocoding using Nominatim (OpenStreetMap) with zoom=18 for city-level precision
- Location caching to reduce API calls (5-minute cache duration)

**Location Memory:**
- Last searched location saved to localStorage
- Automatic reload on page revisit
- User-specific saved locations (requires authentication)

### 3. User Authentication (Supabase)

**Features:**
- Email/password authentication
- Password reset functionality
- Email verification
- Session management with automatic refresh
- Row-level security on database

**User Data:**
- Profile information (name, email)
- Saved locations (up to 10 per user)
- Theme preferences
- Last viewed location

### 4. Interactive Weather Radar

**NEXRAD Radar:**
- Real-time precipitation data from Iowa State University NEXRAD server
- Animated radar with 49 frames (4-hour window)
- Timeline controls for playback
- Base reflectivity layer
- OpenLayers-based map with location marker

**Map Features:**
- Zoom and pan controls
- Location marker at searched coordinates
- Frame-by-frame animation
- Opacity controls for radar layer
- Multiple map modes (animation, static, interactive)

### 5. Theme System

**Available Themes:**
- **Dark**: Professional dark mode (default)
- **Miami**: Retro neon/synthwave aesthetics
- **Tron**: Sci-fi inspired blue theme

**Theme Features:**
- Persistent across sessions (localStorage)
- Per-user preferences (requires auth)
- Dynamic CSS custom properties
- Smooth transitions between themes

### 6. Dashboard (Authenticated Users)

**Features:**
- Overview of all saved locations
- Quick weather summary cards
- Add/remove locations
- Set default location
- Theme selector
- Profile management

---

## API Routes

All API routes are internal Next.js routes that proxy external APIs to keep API keys secure (server-side only).

### Weather APIs

#### `/api/weather/current`
**GET** - Current weather data for a location
- Query params: `q` (city name) OR `lat` + `lon` (coordinates)
- Returns: Current temperature, conditions, wind, humidity, pressure, etc.
- Source: OpenWeatherMap Current Weather API

#### `/api/weather/forecast`
**GET** - 5-day weather forecast
- Query params: `lat`, `lon`
- Returns: Array of daily forecasts with temp, conditions, precipitation
- Source: OpenWeatherMap 5-Day Forecast API

#### `/api/weather/onecall`
**GET** - Comprehensive weather data (One Call API 3.0)
- Query params: `lat`, `lon`, `units`
- Returns: Current, hourly, daily, alerts, UV, moon phase
- Source: OpenWeatherMap One Call API

#### `/api/weather/uv`
**GET** - UV index data
- Query params: `lat`, `lon`
- Returns: Current UV index with safety level
- Source: OpenWeatherMap UV Index API

#### `/api/weather/air-quality`
**GET** - Air quality index (AQI)
- Query params: `lat`, `lon`
- Returns: AQI value, pollutant levels, health recommendations
- Source: Google Air Quality API (fallback to OpenWeatherMap)

#### `/api/weather/pollen`
**GET** - Pollen count data
- Query params: `lat`, `lon`
- Returns: Tree, grass, weed pollen levels
- Source: Google Pollen API

#### `/api/weather/geocoding`
**GET** - City name to coordinates
- Query params: `q` (location query), `limit` (default: 5)
- Returns: Array of matching locations with lat/lon
- Source: OpenWeatherMap Geocoding API

#### `/api/weather/noaa-wms`
**GET** - NOAA WMS proxy for radar tiles
- Query params: WMS parameters
- Returns: Radar tile images
- Source: NOAA nowCOAST WMS service

#### `/api/weather/iowa-nexrad`
**GET** - Iowa State NEXRAD radar metadata
- Returns: Available radar products and timestamps
- Source: Iowa State University NEXRAD archive

#### `/api/weather/iowa-nexrad-tiles/[timestamp]/[z]/[x]/[y]`
**GET** - NEXRAD radar tiles for specific timestamp
- Path params: `timestamp`, `z` (zoom), `x`, `y` (tile coords)
- Returns: Radar tile image
- Source: Iowa State University NEXRAD tile service

### User APIs

#### `/api/locations`
**GET** - Get user's saved locations
- Auth: Required (Supabase session)
- Returns: Array of saved location objects

**POST** - Save a new location
- Auth: Required
- Body: `{ city, state, country, lat, lon }`
- Returns: Created location object

**DELETE** - Remove a saved location
- Auth: Required
- Query param: `id` (location ID)
- Returns: Success message

#### `/api/user/preferences`
**GET** - Get user preferences
- Auth: Required
- Returns: User preferences object (theme, units, etc.)

**POST** - Update user preferences
- Auth: Required
- Body: Preference object
- Returns: Updated preferences

### Utility APIs

#### `/api/geocode`
**GET** - Reverse geocode coordinates to city name
- Query params: `lat`, `lon`
- Returns: City, state, country
- Source: OpenWeatherMap Reverse Geocoding

#### `/api/extremes`
**GET** - Global temperature extremes (hottest/coldest places)
- Returns: Current global temperature extremes
- Source: Aggregated weather data

#### `/api/news`
**GET** - Weather news and updates
- Returns: Array of weather news articles
- Source: Curated weather news feed

---

## Library Files

### `lib/weather-api.ts`
Main weather API client with functions for fetching weather data.

**Key Functions:**
- `fetchWeatherData(location, units)` - Get comprehensive weather for a location
- `fetchWeatherByLocation(lat, lon, units)` - Get weather by coordinates
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

### `lib/location-service.ts`
Comprehensive location detection and management service.

**Key Functions:**
- `getCurrentLocation(options)` - Get user's current location via browser geolocation
- `getLocationByIP()` - Fallback IP-based location detection
- `getLocationWithFallback(options)` - Try geolocation, then IP fallback
- `reverseGeocode(lat, lon)` - Convert coordinates to city name
- `getPermissionStatus()` - Check geolocation permission state
- `clearCache()` - Clear cached location data

**Features:**
- High accuracy GPS with silent mode (no permission prompt)
- Multi-service IP fallback (ipapi.co, ipinfo.io, ipgeolocation.io)
- Nominatim reverse geocoding with zoom=18 for precision
- Improved city detection (checks city, town, suburb, village, hamlet)
- 5-minute location cache to reduce API calls
- Comprehensive error handling with user-friendly messages

**Recent Improvements:**
- Added `zoom=18` to Nominatim queries for city-level precision
- Added `suburb` field detection for better accuracy in smaller cities
- Added User-Agent header (required by Nominatim usage policy)
- Prioritizes city > town > suburb > village > hamlet

### `lib/user-cache-service.ts`
Client-side caching service for weather data and user preferences.

**Key Functions:**
- `getCachedWeatherData(lat, lon)` - Get cached weather data
- `setCachedWeatherData(lat, lon, data)` - Cache weather data (10-minute TTL)
- `getUserPreferences()` - Get user preferences from localStorage
- `saveUserPreferences(preferences)` - Save user preferences
- `clearExpiredCache()` - Remove expired cache entries
- `getCacheMetrics()` - Get cache statistics

**Features:**
- 10-minute cache TTL for weather data
- Persistent user preferences
- Automatic cache cleanup
- Cache size monitoring
- Coordinate-based cache keys (rounded to 4 decimals)

### `lib/location-context.tsx`
React context for managing location state across the application.

**Provides:**
- `locationInput` - Current location input string
- `currentLocation` - Active location
- `setLocationInput()` - Update location input
- `setCurrentLocation()` - Update current location
- `clearLocationState()` - Clear location state
- `shouldClearOnRouteChange` - Flag for route-based clearing

**Features:**
- Route-aware state management
- localStorage persistence
- Debug logging in development
- Automatic cleanup on route changes

### `lib/toast-service.ts`
Toast notification service using Sonner.

**Functions:**
- `toastService.success(message)` - Success notification
- `toastService.error(message)` - Error notification
- `toastService.info(message)` - Info notification
- `toastService.warning(message)` - Warning notification

### `lib/theme-utils.ts`
Theme management utilities.

**Functions:**
- `getComponentStyles(theme, component)` - Get theme-specific styles
- `getThemeColors(theme)` - Get theme color palette
- Theme type definitions for TypeScript

### `lib/types.ts`
TypeScript type definitions for weather data and application state.

**Key Types:**
- `WeatherData` - Complete weather data object
- `ForecastData` - Forecast day data
- `LocationData` - Location information
- `UserPreferences` - User settings
- `AirQualityData` - AQI information
- `PollenData` - Pollen count data

### `lib/auth/`
Authentication-related utilities and contexts.

**Files:**
- `auth-context.tsx` - Authentication context provider
- `supabase/client.ts` - Supabase client initialization
- `supabase/server.ts` - Server-side Supabase client
- `supabase/middleware.ts` - Auth middleware for protected routes

---

## Components

### Main Application Components

#### `app/page.tsx`
Homepage with weather search and display.

**Features:**
- Weather search input with autocomplete
- Current weather display
- 5-day forecast
- Environmental data (UV, AQI, pollen)
- Interactive weather map
- Auto-location detection on mount
- Rate limiting (10 searches per hour)
- Search result caching

#### `app/dashboard/page.tsx`
User dashboard for authenticated users.

**Features:**
- Saved locations grid
- Weather summary cards
- Add new location modal
- Quick weather details
- Theme selector
- Profile access

#### `app/weather/[city]/page.tsx`
Dynamic city weather pages with SEO optimization.

**Features:**
- Server-side data fetching
- Dynamic metadata generation
- Detailed weather information
- Interactive map centered on city
- Breadcrumb navigation

### Weather Components

#### `components/forecast.tsx`
5-day weather forecast display with expandable details.

**Props:**
- `forecast: ForecastData[]` - Array of forecast days
- `onDayClick?: (day) => void` - Optional click handler

#### `components/expandable-forecast.tsx`
Enhanced forecast with collapsible detailed view.

**Features:**
- Animated expansion
- Hourly breakdown
- Precipitation charts
- Wind direction indicators

#### `components/environmental-display.tsx`
Display environmental data (UV, AQI, pollen) in a grid.

**Props:**
- `weatherData: WeatherData` - Complete weather data object

#### `components/air-quality-display.tsx`
Detailed air quality information with health recommendations.

**Props:**
- `airQuality: AirQualityData` - AQI data object
- `compact?: boolean` - Compact view mode

#### `components/pollen-display.tsx`
Pollen count display with allergy information.

**Props:**
- `pollenData: PollenData` - Pollen count data

#### `components/sunrise-sunset.tsx`
Sunrise and sunset times with moon phase.

**Props:**
- `sunrise: number` - Unix timestamp
- `sunset: number` - Unix timestamp
- `moonPhase?: number` - Moon phase (0-1)

### Map Components

#### `components/weather-map-openlayers.tsx`
OpenLayers-based weather radar map with NEXRAD data.

**Props:**
- `lat: number` - Center latitude
- `lon: number` - Center longitude
- `mode?: 'animation' | 'static'` - Display mode

**Features:**
- NEXRAD radar overlay
- 49-frame animation (4-hour window)
- Timeline controls
- Location marker
- Zoom/pan controls
- Base map with OpenStreetMap tiles

#### `components/lazy-weather-map.tsx`
Lazy-loaded wrapper for weather map to improve initial load performance.

### Dashboard Components

#### `components/dashboard/location-card.tsx`
Saved location card with weather summary.

**Props:**
- `location: SavedLocation` - Location object
- `onDelete: () => void` - Delete handler
- `onClick: () => void` - Click handler

#### `components/dashboard/add-location-modal.tsx`
Modal for adding new saved locations.

**Features:**
- City search with autocomplete
- Coordinate input
- GPS location detection
- Form validation

#### `components/dashboard/theme-selector.tsx`
Grid of theme options with preview.

**Features:**
- Theme preview cards
- Active theme indicator
- Instant theme switching
- Persistence to user preferences

#### `components/dashboard/detailed-weather-modal.tsx`
Full weather details modal from dashboard.

**Features:**
- All weather metrics
- Forecast view
- Environmental data
- Map view

### Authentication Components

#### `components/auth/auth-button.tsx`
Login/Signup button with auth state.

**Features:**
- Shows "Login" when logged out
- Shows user avatar when logged in
- Dropdown menu with profile/logout

#### `components/auth/auth-form.tsx`
Unified authentication form for login/signup.

**Props:**
- `mode: 'login' | 'signup'` - Form mode
- `onSuccess?: () => void` - Success callback

**Features:**
- Email/password validation (Zod schema)
- Error handling
- Loading states
- Password strength indicator (signup)

#### `components/auth/signin-prompt-modal.tsx`
Modal prompting users to sign in for features.

**Features:**
- Triggered when accessing auth-required features
- Direct link to login page
- Dismissible

### UI Components (Radix UI Based)

Located in `components/ui/`:
- `button.tsx` - Button with variants
- `input.tsx` - Form input
- `card.tsx` - Card container
- `dialog.tsx` - Modal dialog
- `dropdown-menu.tsx` - Dropdown menu
- `tabs.tsx` - Tab navigation
- `toast.tsx` - Toast notifications
- `avatar.tsx` - User avatar
- `badge.tsx` - Status badges
- `separator.tsx` - Divider line
- `skeleton.tsx` - Loading skeleton
- `toggle.tsx` - Toggle button
- `form.tsx` - Form field wrapper

All components are built with:
- Full keyboard accessibility
- ARIA labels
- Focus management
- TypeScript props
- Tailwind CSS styling
- Class Variance Authority for variants

---

## Authentication System

### Supabase Setup

**Database Tables:**

1. **`users`** (managed by Supabase Auth)
   - Standard auth user table
   - Email, password hash, metadata

2. **`user_profiles`**
   - `id` (UUID, foreign key to auth.users)
   - `username` (text, unique)
   - `full_name` (text)
   - `avatar_url` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

3. **`user_locations`**
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `city` (text)
   - `state` (text, optional)
   - `country` (text)
   - `latitude` (float)
   - `longitude` (float)
   - `is_default` (boolean)
   - `created_at` (timestamp)
   - Row-Level Security enabled

4. **`user_preferences`**
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `theme` (text: 'dark' | 'miami' | 'tron')
   - `units` (text: 'imperial' | 'metric')
   - `default_location_id` (UUID, optional)
   - `updated_at` (timestamp)
   - Row-Level Security enabled

### Row-Level Security (RLS) Policies

```sql
-- User locations: Users can only see/modify their own locations
CREATE POLICY "Users can view own locations" ON user_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own locations" ON user_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own locations" ON user_locations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own locations" ON user_locations
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for user_preferences
```

### Authentication Flow

1. **Sign Up:**
   - User enters email and password
   - Supabase creates auth user
   - Confirmation email sent (if enabled)
   - User redirected to dashboard

2. **Login:**
   - User enters credentials
   - Supabase validates and creates session
   - Session stored in cookie (httpOnly, secure)
   - User redirected to dashboard or return URL

3. **Password Reset:**
   - User requests reset via email
   - Supabase sends reset link
   - User clicks link and enters new password
   - Password updated, user logged in

4. **Session Management:**
   - Session automatically refreshed by Supabase client
   - Session expires after 1 hour (configurable)
   - Refresh token used to get new access token

### Protected Routes

Routes that require authentication redirect to `/auth/login`:
- `/dashboard`
- `/profile`
- Any route accessing user data

Implemented via middleware in `middleware.ts`:
```typescript
export async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request);
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return response;
}
```

---

## Theme System

### Available Themes

1. **Dark** (Default)
   - Background: `#0a0a0a`
   - Text: `#e0e0e0`
   - Accent: `#3b82f6` (blue)
   - Professional, easy on eyes

2. **Miami** (Retro)
   - Background: `#1a0f2e`
   - Text: `#f0f0f0`
   - Accent: `#ff006e` (neon pink)
   - Synthwave/80s aesthetic

3. **Tron** (Sci-Fi)
   - Background: `#000000`
   - Text: `#00d9ff` (cyan)
   - Accent: `#00d9ff`
   - Futuristic grid lines

### Implementation

Themes use CSS custom properties defined in `app/globals.css`:

```css
[data-theme="dark"] {
  --bg: #0a0a0a;
  --text: #e0e0e0;
  --accent: #3b82f6;
  /* ... more variables */
}

[data-theme="miami"] {
  --bg: #1a0f2e;
  --text: #f0f0f0;
  --accent: #ff006e;
  /* ... more variables */
}

[data-theme="tron"] {
  --bg: #000000;
  --text: #00d9ff;
  --accent: #00d9ff;
  /* ... more variables */
}
```

### Theme Context

Located in `components/theme-provider.tsx`:

```typescript
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Load from localStorage or user preferences
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    // If authenticated, save to Supabase
    if (user) {
      saveUserPreference('theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Theme Persistence

1. **Unauthenticated Users:**
   - Theme saved to `localStorage`
   - Persists across browser sessions
   - Lost if user clears browser data

2. **Authenticated Users:**
   - Theme saved to `user_preferences` table
   - Synced across devices
   - Overrides localStorage on login

---

## Location Services

### Browser Geolocation

**Implementation:**
```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // Reverse geocode to get city name
  },
  (error) => {
    // Handle error (permission denied, timeout, etc.)
  },
  {
    enableHighAccuracy: false,  // Silent mode - no permission prompt
    timeout: 5000,
    maximumAge: 300000  // 5-minute cache
  }
);
```

**Options:**
- `enableHighAccuracy: false` - Uses WiFi/IP for silent operation (no GPS permission prompt)
- `timeout: 5000` - 5-second timeout for silent mode
- `maximumAge: 300000` - Accept cached position up to 5 minutes old

**Error Handling:**
- `PERMISSION_DENIED` - User blocked geolocation
- `POSITION_UNAVAILABLE` - Location services disabled or unavailable
- `TIMEOUT` - Request took too long

### IP-Based Fallback

When geolocation fails or is blocked, the app tries IP-based location detection using multiple services in sequence:

1. **ipapi.co** - First choice, most reliable
2. **ipinfo.io** - Fallback if ipapi.co fails
3. **ipgeolocation.io** - Last resort fallback

**Note:** IP-based location is less accurate (city-level, not precise coordinates).

### Reverse Geocoding

Converts coordinates to human-readable location names using Nominatim (OpenStreetMap).

**Recent Improvements:**
- Added `zoom=18` parameter for city-level precision
- Added `addressdetails=1` for comprehensive address components
- Added User-Agent header (required by Nominatim)
- Improved city detection: checks `city`, `town`, `suburb`, `village`, `hamlet` in that order
- Handles edge cases for smaller cities that may be tagged as "suburb"

**API Call:**
```
https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&accept-language=en&zoom=18&addressdetails=1
User-Agent: 16BitWeather/1.0
```

**Known Limitations:**
- Browser geolocation accuracy varies (WiFi triangulation, GPS, IP)
- WiFi-based location can be 1-5 miles off actual position
- ISP location may show regional hub city instead of actual city
- Reverse geocoding accuracy depends on OpenStreetMap data quality

### Location Caching

**Weather Data Cache:**
- 10-minute TTL
- Coordinate-based keys (rounded to 4 decimals)
- Stored in localStorage
- Automatic cleanup of expired entries

**Location Detection Cache:**
- 5-minute TTL
- Caches geolocation result to avoid repeated permission prompts
- Cleared on page refresh or manual location search

---

## Weather Radar & Maps

### NEXRAD Radar Implementation

**Data Source:**
Iowa State University NEXRAD (Next-Generation Radar) archive
- Base reflectivity radar images
- 5-minute update intervals
- 4-hour rolling window (49 frames)

**Technology:**
- OpenLayers (ol) for map rendering
- WMS (Web Map Service) protocol for tile fetching
- Custom tile server at `/api/weather/iowa-nexrad-tiles`

**Features:**
- Animated playback with timeline controls
- Frame-by-frame navigation
- Opacity control for radar layer
- Timestamp display
- Location marker overlay

**Implementation Details:**

1. **Timestamp Generation:**
   ```typescript
   function generateNEXRADTimestamps(hours = 4) {
     const now = new Date();
     const timestamps = [];

     // Round to nearest 5 minutes
     const minutes = Math.floor(now.getMinutes() / 5) * 5;
     now.setMinutes(minutes, 0, 0);

     // Generate 49 timestamps (5-minute intervals, 4 hours)
     for (let i = 0; i < 49; i++) {
       const timestamp = new Date(now.getTime() - (i * 5 * 60 * 1000));
       timestamps.unshift(timestamp.toISOString());
     }

     return timestamps;
   }
   ```

2. **Map Initialization:**
   ```typescript
   const map = new Map({
     target: mapRef.current,
     layers: [
       new TileLayer({
         source: new OSM(), // Base map
       }),
       ...radarLayers, // NEXRAD layers
       new VectorLayer({
         source: locationMarkerSource, // Location marker
       }),
     ],
     view: new View({
       center: fromLonLat([lon, lat]),
       zoom: 8,
     }),
   });
   ```

3. **Radar Layer:**
   ```typescript
   const radarLayer = new TileLayer({
     source: new XYZ({
       url: `/api/weather/iowa-nexrad-tiles/${timestamp}/{z}/{x}/{y}`,
       tileSize: 256,
     }),
     opacity: isCurrentFrame ? 0.85 : 0.15,
     visible: true,
   });
   ```

4. **Animation Loop:**
   ```typescript
   function animate() {
     // Hide all frames
     radarLayers.forEach(layer => layer.setVisible(false));

     // Show current frame
     radarLayers[currentFrame].setVisible(true);

     // Advance to next frame
     currentFrame = (currentFrame + 1) % radarLayers.length;

     // Continue animation
     if (isPlaying) {
       animationTimeout = setTimeout(animate, 500); // 0.5s per frame
     }
   }
   ```

**Performance Optimizations:**
- Lazy loading of radar tiles (only load visible tiles)
- Frame buffering (pre-load 3 frames ahead)
- Opacity fade for non-current frames
- Tile caching in browser

---

## Known Issues

### 1. Sentry Error Monitoring - 403 Forbidden (DISABLED)

**Issue:**
All attempts to send events to Sentry return 403 Forbidden errors.

**Root Cause:**
- Project ID `4508684595814400` returns 403
- Likely due to account verification issues or project access permissions
- Auth token may not have correct permissions

**Attempted Solutions:**
- ✅ Fixed double initialization (removed duplicate init from `instrumentation-client.ts`)
- ✅ Added proper error handling
- ✅ Updated DSN with new security token
- ❌ Still returns 403

**Current Status:**
Sentry is **disabled** in `.env.local` to prevent console spam. Environment variables are commented out.

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

### 2. Location Detection Accuracy

**Issue:**
Browser geolocation may show incorrect city, even though coordinates are correct.

**Example:**
- User physically in San Ramon, CA (`37.7497, -121.9549`)
- Browser geolocation returns San Jose coordinates (`37.3752, -121.8675`)
- Reverse geocoding correctly identifies San Jose for those coordinates

**Root Cause:**
- Browser geolocation uses WiFi triangulation or IP geolocation in silent mode
- WiFi access points may be registered to wrong city
- ISP networks may show regional hub city instead of actual location
- GPS (high accuracy mode) requires permission prompt, which we avoid for better UX

**Workarounds:**
- User can manually search for their city
- GPS on mobile devices (with permission) is more accurate
- IP-based fallback provides approximate city

**Recent Improvements:**
- Improved Nominatim reverse geocoding with `zoom=18` for city-level precision
- Added `suburb` field detection for better accuracy in smaller cities
- Better handling of edge cases where smaller cities are tagged as suburbs

**Not a Bug:**
The reverse geocoding is working correctly. The inaccuracy is from the browser's geolocation API itself, which is a limitation of the technology.

### 3. Hydration Errors in Development

**Issue:**
React hydration mismatch warnings in console, specifically with `AuthDebug` component showing time mismatches.

**Example:**
```
Hydration failed: server rendered "4:28:00 PM", client rendered "4:28:01 PM"
```

**Root Cause:**
- Server renders with one timestamp
- Client renders 1-2 seconds later with different timestamp
- React detects mismatch in `AuthDebug` component

**Impact:**
- **Development only** - causes no issues in production
- Component re-renders correctly after hydration
- No functional impact on users

**Solution:**
- Suppress hydration warnings for time-based components
- Use `suppressHydrationWarning={true}` on time display elements
- Or remove `AuthDebug` component in production builds

### 4. Cache Cleanup

**Issue:**
localStorage can grow large with cached weather data over time.

**Solution:**
Automatic cache cleanup runs on mount:
- Removes expired cache entries (older than 10 minutes)
- Keeps cache size under 5MB
- Manual cleanup via `userCacheService.clearExpiredCache()`

---

## Recent Changes

### January 2025 - Location & Error Monitoring Fixes

**Location Service Improvements:**
- ✅ Improved Nominatim reverse geocoding with `zoom=18` parameter for city-level precision
- ✅ Added `suburb` field detection for better accuracy in smaller cities
- ✅ Added User-Agent header to Nominatim requests (required by usage policy)
- ✅ Better city name prioritization: `city` → `town` → `suburb` → `village` → `hamlet`
- ✅ Added comprehensive logging for location detection debugging

**Sentry Configuration Fixes:**
- ✅ Fixed double initialization issue by removing duplicate `Sentry.init()` from `instrumentation-client.ts`
- ✅ Added error handling to prevent initialization failures
- ✅ Removed unsupported `makeBrowserTransportWithOptions` function
- ✅ Updated DSN with new security token
- ❌ 403 Forbidden errors persist - Sentry **disabled** until account access resolved

**File Changes:**
- Modified: `lib/location-service.ts` - Improved reverse geocoding
- Modified: `sentry.client.config.ts` - Fixed initialization, added validation
- Modified: `instrumentation-client.ts` - Removed duplicate Sentry init
- Modified: `.env.local` - Disabled Sentry DSN (commented out)

### December 2024 - v0.3.37

**NEXRAD Radar Improvements:**
- Added 49-frame animation (4-hour window)
- Improved timeline controls
- Better frame buffering
- Opacity controls for radar overlay

**Performance Optimizations:**
- Lazy loading for weather map component
- Image optimization with Next.js Image component
- Reduced initial bundle size
- Improved cache hit rates

**Bug Fixes:**
- Fixed location memory not persisting
- Resolved forecast expansion animation jank
- Fixed theme switcher flashing
- Corrected UV index nighttime caching

---

## Development Workflow

### Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   - Copy `.env.example` to `.env.local`
   - Add API keys (see Environment Configuration section)

3. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   - App runs at http://localhost:3000
   - Hot module replacement enabled
   - API routes available at `/api/*`

4. **Development Features:**
   - Fast Refresh for instant component updates
   - TypeScript type checking
   - ESLint warnings in console
   - Automatic page reloading

### Building for Production

```bash
npm run build
```

**Build Process:**
1. TypeScript compilation
2. Next.js optimization
3. Static page generation for public pages
4. API route bundling
5. Sentry source map upload (if configured)

**Output:**
- `.next/` directory with optimized build
- Static assets in `.next/static/`
- Server-side code in `.next/server/`

### Running Production Build Locally

```bash
npm run build
npm start
```

- Runs on http://localhost:3000
- No hot reloading
- Production optimizations active

### Testing

**Unit Tests (Jest):**
```bash
npm test
npm run test:watch  # Watch mode
npm run test:ci     # CI mode
```

**E2E Tests (Playwright):**
```bash
npx playwright test
npx playwright test --ui  # Interactive mode
```

**Test Coverage:**
- Components: `__tests__/` directories
- API routes: Integration tests in `__tests__/api/`
- E2E: `e2e/` directory

### Code Quality

**Linting:**
```bash
npm run lint
npm run lint --fix  # Auto-fix issues
```

**Type Checking:**
```bash
npx tsc --noEmit
```

### Common Development Tasks

**Clear Next.js Cache:**
```bash
rm -rf .next
npm run dev
```

**Clear Node Modules:**
```bash
rm -rf node_modules
npm install
```

**Update Dependencies:**
```bash
npm update
npm outdated  # Check for newer versions
```

**Add New API Route:**
1. Create `app/api/your-route/route.ts`
2. Export `GET`, `POST`, etc. functions
3. Test at http://localhost:3000/api/your-route

**Add New Page:**
1. Create `app/your-page/page.tsx`
2. Export default component
3. Add to navigation if needed
4. Access at http://localhost:3000/your-page

---

## Deployment

### Vercel Deployment (Recommended)

**Automatic Deployment:**
1. Connect GitHub repository to Vercel
2. Push to `main` branch
3. Vercel automatically builds and deploys

**Environment Variables:**
Set all required environment variables in Vercel dashboard:
- Project Settings → Environment Variables
- Add production values for all API keys
- Separate variables for Preview vs Production if needed

**Build Settings:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node.js Version: 18.x or 20.x

**Domains:**
- Production: www.16bitweather.co
- Preview: Auto-generated for PRs

### Manual Deployment

**Build:**
```bash
npm run build
```

**Start Production Server:**
```bash
npm start
```

**Using PM2 (Process Manager):**
```bash
npm install -g pm2
pm2 start npm --name "16bit-weather" -- start
pm2 save
pm2 startup
```

### Post-Deployment Checks

1. **Health Check:**
   - Visit homepage
   - Test weather search
   - Verify auto-location detection
   - Check authentication flow

2. **API Endpoints:**
   - `/api/weather/current?q=London` - Should return weather data
   - `/api/health` - Should return 200 OK (if implemented)

3. **Database:**
   - Verify Supabase connection
   - Test user registration
   - Check RLS policies

4. **Performance:**
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Verify image optimization

5. **Error Monitoring:**
   - Confirm Sentry is receiving events (when re-enabled)
   - Test error boundaries
   - Check API error handling

---

## Troubleshooting

### Common Issues

**1. "API Key not configured" Error:**
- Check `.env.local` has `OPENWEATHER_API_KEY`
- Restart dev server after adding env vars
- Verify key is valid at openweathermap.org

**2. Authentication Not Working:**
- Check Supabase URL and keys in `.env.local`
- Verify Supabase project is active
- Check browser console for CORS errors
- Clear cookies and try again

**3. Location Detection Fails:**
- Check browser permissions for geolocation
- Try manual search instead
- Check console for geolocation errors
- Verify IP fallback services are accessible

**4. Radar Map Not Loading:**
- Check Iowa State NEXRAD service status
- Verify `/api/weather/iowa-nexrad-tiles` endpoint works
- Check browser console for tile loading errors
- Try refreshing the page

**5. Build Errors:**
- Clear `.next/` directory: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Update Next.js: `npm install next@latest`

**6. Cache Issues:**
- Clear browser cache and hard reload
- Clear localStorage: `localStorage.clear()` in console
- Clear weather cache: `userCacheService.clearExpiredCache()`

### Debug Mode

**Enable Debug Logging:**
Set environment variable:
```env
NEXT_PUBLIC_DEBUG=true
```

This enables:
- Location service debug logs
- API request/response logging
- Cache hit/miss logging
- Authentication state logging

**Check Logs:**
- Browser console for client-side logs
- Terminal for server-side logs
- Vercel logs for production issues

---

## API Rate Limits

### OpenWeatherMap Free Tier
- **Current Weather API**: 60 calls/minute, 1,000,000 calls/month
- **5-Day Forecast API**: 60 calls/minute, 1,000,000 calls/month
- **One Call API 3.0**: 1,000 calls/day (requires subscription)
- **Geocoding API**: 60 calls/minute

**Rate Limit Handling:**
- Client-side throttling (max 1 request per second per endpoint)
- Response caching (10 minutes for weather data)
- User search rate limiting (10 searches per hour)
- Automatic retry with exponential backoff

### Google APIs (Optional)
- **Pollen API**: Free tier limits vary
- **Air Quality API**: Free tier limits vary

**Fallbacks:**
- Air Quality: Falls back to OpenWeatherMap AQI if Google API fails
- Pollen: Shows "Data unavailable" if API fails

### Iowa State NEXRAD
- No official rate limit
- Tile-based caching reduces server load
- Pre-load only 3 frames ahead

---

## Security

### API Key Protection
- All API keys are **server-side only** (never exposed to client)
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
- SQL injection prevention (Supabase client handles escaping)

---

## Performance Optimization

### Implemented Optimizations

1. **Code Splitting:**
   - Lazy loading for weather map component
   - Dynamic imports for heavy libraries (OpenLayers, Chart.js)
   - Route-based code splitting (automatic with App Router)

2. **Image Optimization:**
   - Next.js Image component for automatic optimization
   - WebP format with AVIF fallback
   - Responsive image sizing
   - Lazy loading below fold

3. **Caching:**
   - 10-minute weather data cache in localStorage
   - Browser HTTP cache for static assets (1 year)
   - CDN caching for images and fonts
   - Service worker caching (PWA)

4. **Data Fetching:**
   - Parallel API requests where possible
   - Request deduplication
   - Stale-while-revalidate pattern
   - Progressive data loading

5. **Bundle Size:**
   - Tree shaking for unused code
   - Sentry logger statements removed in production
   - Tailwind CSS purging
   - Dynamic imports for large dependencies

### Performance Metrics (Target)

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Monitoring

- Vercel Analytics for Core Web Vitals
- Real User Monitoring (RUM) data
- Lighthouse CI in GitHub Actions

---

## Future Enhancements

### Planned Features

1. **Severe Weather Alerts:**
   - Push notifications for weather warnings
   - Tornado, hurricane, flood alerts
   - Customizable alert preferences

2. **Historical Weather Data:**
   - Past weather for any date
   - Historical trends and averages
   - Climate comparison tools

3. **Enhanced Forecasting:**
   - Hourly forecast (currently daily)
   - 10-day extended forecast
   - Precipitation minute-by-minute

4. **Social Features:**
   - Share weather reports
   - User-submitted weather photos
   - Community weather observations

5. **Premium Features:**
   - Advanced radar products (velocity, storm relative motion)
   - Lightning strike data
   - Satellite imagery
   - Storm tracking

6. **Mobile Apps:**
   - Native iOS app
   - Native Android app
   - Widget support

### Technical Improvements

- Migrate to Next.js 15 Server Actions for data mutations
- Implement React Server Components more broadly
- Add internationalization (i18n) support
- GraphQL API layer
- Real-time weather updates via WebSockets
- Offline mode with service worker data sync

---

## Credits & Attribution

### APIs & Services
- **OpenWeatherMap** - Weather data
- **Supabase** - Authentication and database
- **Iowa State University** - NEXRAD radar data
- **OpenStreetMap** - Nominatim geocoding
- **Vercel** - Hosting and analytics

### Libraries & Frameworks
- **Next.js** by Vercel
- **React** by Meta
- **Radix UI** by WorkOS
- **Tailwind CSS** by Tailwind Labs
- **OpenLayers** by OpenLayers Contributors
- **Chart.js** by Chart.js Contributors

### License
Fair Source License, Version 0.9
- Use limitation: 5 users
- Change date: January 2029
- After change date: MIT License

---

## Contact & Support

**Issues & Bugs:**
Report at GitHub Issues (repository URL)

**Feature Requests:**
Submit via GitHub Discussions

**Documentation:**
This file (`claude.md`) is the comprehensive reference for the project.

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Maintained By:** Development Team
**For:** Claude AI Assistant & Development Reference
