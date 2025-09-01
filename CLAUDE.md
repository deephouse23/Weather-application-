# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

16-Bit Weather is a retro-styled weather application that combines modern meteorological data with authentic 16-bit gaming aesthetics. It's built with Next.js 15, React 19, and TypeScript, featuring comprehensive weather data with a nostalgic terminal interface.

**Live Application**: [16bitweather.co](https://www.16bitweather.co/)

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run Next.js linting
```

### Testing & Verification
- No specific test commands configured - verify functionality manually
- Run `npm run build` to ensure production builds work correctly
- Check `npm run lint` to verify code style compliance

## Architecture Overview

### Application Structure
```
app/                     # Next.js App Router pages
├── page.tsx            # Main weather application (1200+ lines)
├── layout.tsx          # Root layout with theme provider
├── about/              # Static about page
├── games/              # Games collection page
├── weather/            # City-specific weather pages
│   ├── [city]/         # Dynamic city routing
│   └── specific cities/ # Pre-built city pages (austin-tx, chicago-il, etc.)
└── globals.css         # Global styles with theme variables

components/             # React components
├── weather-search.tsx  # Main search component
├── theme-provider.tsx  # Theme system (dark, miami, tron themes)
├── *-display.tsx      # Weather data display components
├── lazy-weather-*.tsx # Lazy-loaded weather components
├── error-boundary.tsx # Error handling wrapper
└── responsive-*.tsx   # Responsive layout components

lib/                   # Core utilities and APIs
├── weather-api.ts     # Main weather API integration (1400+ lines)
├── types.ts          # TypeScript interfaces
├── location-service.ts # Geolocation handling
├── cache.ts          # API response caching
├── user-cache-service.ts # User data persistence
└── utils.ts          # Utility functions
```

### Key Components

**Main Weather App** (`app/page.tsx`):
- Complex state management for weather data, themes, location, and caching
- Rate limiting (10 requests/hour) with localStorage tracking
- Auto-location detection with IP fallback
- Three theme system: dark, miami (retro), tron (sci-fi)
- Real-time weather updates with intelligent caching

**Weather API** (`lib/weather-api.ts`):
- OpenWeatherMap API integration with comprehensive error handling
- Location parsing: ZIP codes, city/state, city/country, coordinates
- Multi-API data fetching: weather, UV index, air quality, pollen data
- Regional unit conversion (Fahrenheit/Celsius, hPa/inHg)
- Moon phase calculations and forecast processing

**Theme System**:
- Three distinct themes with authentic retro aesthetics
- Dynamic CSS custom properties
- Persistent theme selection across sessions
- Tron theme includes animated grid backgrounds and light cycle watermarks

## Environment Configuration

### Required Environment Variables
```env
# Required for weather data
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Optional for enhanced pollen data  
NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here

# Optional for enhanced air quality data
NEXT_PUBLIC_GOOGLE_AIR_QUALITY_API_KEY=your_google_air_quality_key_here

# Optional for error monitoring
SENTRY_DSN=your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
```

### API Key Setup
- **OpenWeatherMap**: Get free API key from [openweathermap.org/api](https://openweathermap.org/api)
- **Google Pollen**: Get API key from [Google Maps Platform](https://developers.google.com/maps/documentation/pollen)
- **Sentry Error Monitoring**: Configure at [16bitweather.sentry.io](https://16bitweather.sentry.io/insights/projects/javascript-nextjs/getting-started/)
- Without Google APIs, app falls back to OpenWeather air pollution data for pollen/AQI estimates

## Data Flow & Caching

### Weather Data Pipeline
1. **Location Input** → Parsed by `parseLocationInput()` in weather-api.ts
2. **Geocoding** → Converts location to coordinates via OpenWeatherMap Geocoding API
3. **Weather Fetching** → Parallel API calls to multiple endpoints:
   - Current weather conditions
   - 5-day forecast
   - UV index (One Call API 3.0 or fallback)
   - Air quality (Google API or OpenWeather fallback)
   - Pollen data (Google API or estimation)
4. **Data Processing** → Regional unit conversion, moon phase calculation
5. **Caching** → Multiple layers: localStorage, search cache, user preferences

### Cache Strategy
- **Search Cache**: 5-minute TTL for recent searches
- **Location Cache**: Persistent last location with auto-detection
- **User Cache**: Persistent weather data and preferences
- **Rate Limiting**: 10 API calls per hour tracked in localStorage

## Styling & Theming

### Theme Architecture
- CSS custom properties in `globals.css`
- Theme-specific color schemes and animations
- Responsive design with mobile-first approach
- Pixel-perfect retro aesthetics with monospace fonts

### Key Style Patterns
```css
:root {
  /* Theme variables dynamically updated */
  --primary-bg: theme-specific;
  --accent-color: theme-specific;
  --text-primary: theme-specific;
}

/* 16-bit aesthetic patterns */
.pixel-border { /* Retro borders */ }
.glow-effect { /* Theme-appropriate glows */ }
.mono-font { font-family: monospace; }
```

## Common Development Tasks

### Adding New Weather Data
1. Update `WeatherData` interface in `lib/types.ts`
2. Modify API fetching functions in `lib/weather-api.ts`
3. Update display components in `components/` directory
4. Test with multiple locations and edge cases

### Theme Modifications
1. Update CSS custom properties in `app/globals.css`
2. Modify theme classes in `getThemeClasses()` function
3. Test across all three themes (dark, miami, tron)
4. Verify responsive behavior on mobile devices

### Location Handling
1. Location parsing logic in `parseLocationInput()`
2. Geocoding handled by `geocodeLocation()`
3. Error messages in `getLocationNotFoundError()`
4. Test with various formats: ZIP codes, international locations, coordinates

## Error Handling Patterns

### API Error Recovery
- Multiple fallback APIs for UV, air quality, and pollen data
- Graceful degradation when APIs are unavailable
- User-friendly error messages with specific guidance
- Rate limiting with clear user feedback

### Component Error Boundaries
- `ErrorBoundary` component wraps critical sections
- Theme-aware error displays
- Fallback UI for component failures

## Performance Considerations

### Bundle Optimization
- Lazy loading for non-critical components (`LazyEnvironmentalDisplay`, etc.)
- Dynamic imports for games and secondary features
- Optimized image handling with `OptimizedImage` component

### API Efficiency
- Request deduplication and caching
- Smart cache invalidation (10-minute TTL for weather data)
- Rate limiting prevents excessive API usage
- Parallel API calls where possible

## Security Notes

- API keys properly prefixed with `NEXT_PUBLIC_` for client-side usage
- No sensitive data stored in localStorage
- Input sanitization for location queries
- HTTPS-only API endpoints

## Testing & Quality Assurance

### Manual Testing Checklist
- Test all three themes across different devices
- Verify location search with various input formats
- Check API fallbacks when services are unavailable
- Validate responsive design on mobile/tablet/desktop
- Test rate limiting and caching behavior
- Verify accessibility features (keyboard navigation, screen readers)

### Common Issues
- API key missing: Check environment variables and console logs
- Location not found: Verify input format and try alternative spellings
- Rate limiting: Wait for rate limit reset or check localStorage
- Theme issues: Clear localStorage to reset theme state