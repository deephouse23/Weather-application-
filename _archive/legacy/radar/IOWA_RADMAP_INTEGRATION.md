# Iowa State RadMap API Integration

## Overview

This document describes the integration of Iowa State University's IEM RadMap API into the 16-Bit Weather platform. The integration provides high-quality weather radar imagery for US locations using a hybrid approach that combines static snapshots with tile-based animations.

## Architecture

### Components

1. **API Proxy Route** (`app/api/weather/iowa-radmap/route.ts`)
   - Server-side proxy to Iowa State's RadMap service
   - Handles rate limiting (30 requests/minute per IP)
   - Implements intelligent caching strategy
   - Returns PNG images or transparent fallback on error

2. **Utility Functions** (`lib/utils/radmap-utils.ts`)
   - `calculateBoundingBox()` - Computes map bounds from center coordinates
   - `formatRadMapTimestamp()` - Converts Date to YYYYMMDDHHII format
   - `buildRadMapUrl()` - Constructs complete API request URLs
   - `getRadMapLayers()` - Returns layer configuration
   - `parseRadMapTimestamp()` - Parses timestamp strings back to Date
   - `calculateOptimalRadius()` - Determines zoom level based on viewport

3. **Static Image Component** (`components/weather-radmap-static.tsx`)
   - React component for displaying single radar snapshots
   - Includes refresh button and timestamp display
   - Theme-aware styling (dark/miami/tron)
   - Error handling with retry capability
   - Optional auto-refresh functionality

4. **Enhanced OpenLayers Component** (`components/weather-map-openlayers.tsx`)
   - Dual-mode radar display (static/animation)
   - Mode toggle with localStorage persistence
   - Static mode uses Iowa State RadMap
   - Animation mode uses NEXRAD tile streaming
   - Unified controls and UI

## API Endpoint

### Iowa State RadMap API

**Base URL:** `https://mesonet.agron.iastate.edu/GIS/radmap.php`

**Proxy Endpoint:** `/api/weather/iowa-radmap`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bbox` | string | Yes* | Bounding box: `minLon,minLat,maxLon,maxLat` |
| `sector` | string | Yes* | Predefined sector (e.g., `conus`, `iem`, `texas`) |
| `width` | number | No | Image width in pixels (default: 800) |
| `height` | number | No | Image height in pixels (default: 600) |
| `layers[]` | string[] | No | Layer names (default: `nexrad`) |
| `ts` | string | No | Timestamp in YYYYMMDDHHII format (UTC) |

*Either `bbox` or `sector` must be provided

### Available Layers

- **nexrad** - NEXRAD composite radar (precipitation)
- **cbw** - County-based warnings
- **lsrs** - Local storm reports
- **uscounties** - US county boundaries
- **interstates** - Interstate highways
- **watch_by_county** - Convective watches
- **goes** - GOES satellite imagery

### Example Request

```
GET /api/weather/iowa-radmap?bbox=-122.5,37.5,-121.5,38.5&width=800&height=600&layers[]=nexrad&layers[]=uscounties
```

## Usage

### Static Mode (Main Page)

The main weather page displays radar in static mode by default for faster initial load:

```tsx
<LazyWeatherMap 
  latitude={weather?.coordinates?.lat}
  longitude={weather?.coordinates?.lon}
  locationName={weather?.location}
  theme={theme || 'dark'}
  defaultMode="static"
/>
```

Features:
- Single high-quality radar image
- Faster page load
- Lower bandwidth usage
- Manual refresh button
- Perfect for quick weather checks

### Animation Mode (Map Page)

The dedicated `/map` page uses animation mode for detailed radar analysis:

```tsx
<WeatherMap 
  latitude={weatherData.coordinates.lat}
  longitude={weatherData.coordinates.lon}
  locationName={weatherData.location}
  theme={theme || 'dark'}
  defaultMode="animation"
/>
```

Features:
- 4 hours of historical radar (24 frames)
- Play/pause controls
- Speed adjustment (0.5x, 1x, 2x)
- Frame scrubbing
- Auto-preloading of nearby frames

### Mode Toggle

Users can switch between modes using the toggle button:
- **Static**: 📷 STATIC button (cyan when active)
- **Animation**: 🎬 ANIM button (gray when inactive)
- Preference is saved to `localStorage` and persists across sessions

## Caching Strategy

### API Response Caching

1. **Current/Realtime Images** (no timestamp or recent)
   - Browser cache: 5 minutes
   - CDN cache: 5 minutes
   - Stale-while-revalidate: 60 seconds

2. **Recent Past** (< 30 minutes old)
   - Browser cache: 10 minutes
   - CDN cache: 30 minutes
   - Stale-while-revalidate: 5 minutes

3. **Historical Images** (> 30 minutes old)
   - Browser cache: 1 hour
   - CDN cache: 24 hours
   - Stale-while-revalidate: 1 hour

### Client-Side Caching

- Mode preference stored in `localStorage` as `weather-map-mode`
- OpenLayers automatically caches rendered tiles
- Static image component uses browser image cache

## Rate Limiting

The API proxy implements rate limiting to protect Iowa State's servers:

- **Limit:** 30 requests per minute per IP address
- **Response:** 429 Too Many Requests with `Retry-After: 60` header
- **Tracking:** In-memory Map with automatic cleanup

## Error Handling

### Graceful Degradation

1. **API Unavailable**
   - Returns transparent 1x1 PNG
   - Displays error message to user
   - Includes retry button

2. **Invalid Parameters**
   - Returns 400 Bad Request
   - Clear error message in response

3. **Rate Limit Exceeded**
   - Returns 429 status
   - Includes retry-after header
   - User sees friendly message

### User Experience

- Loading states with spinners
- Clear error messages
- Retry buttons where applicable
- Fallback to OpenStreetMap base layer

## Supported Locations

### US Locations Only

High-resolution radar is only available for US locations:
- NEXRAD radar covers all 50 states
- Puerto Rico and US territories included
- International locations show base map only

### Detection

```typescript
import { isInMRMSCoverage } from '@/lib/utils/location-utils'

const isUSLocation = isInMRMSCoverage(latitude, longitude)
```

## Theme Support

The radar components adapt to the active theme:

### Dark Theme (default)
- Border: `#4B5563` (gray-600)
- Background: `rgba(31, 41, 55, 0.9)` (gray-800/90)
- Accent: `#74c0fc` (blue-400)

### Miami Theme
- Border: `#EC4899` (pink-500)
- Background: `rgba(219, 39, 119, 0.9)` (pink-600/90)
- Accent: `#FF1493` (deep pink)
- Glow: `shadow-pink-500/50`

### Tron Theme
- Border: `#22D3EE` (cyan-400)
- Background: `rgba(8, 145, 178, 0.9)` (cyan-600/90)
- Accent: `#00DCFF` (cyan)
- Glow: `shadow-cyan-400/50`

## Navigation

### Main Navigation

The RADAR menu item in the main navigation links to `/map`:

```typescript
{ href: "/map", label: "RADAR", icon: Map }
```

### Page Navigation

1. **Main Page** → Inline radar (static mode) with "VIEW FULL MAP →" button
2. **Map Page** → Full-screen radar (animation mode) with breadcrumb navigation
3. **Breadcrumb:** Home > Radar Map > [Location]

## Performance Considerations

### Static Mode Benefits
- Single image request vs. 25+ tile requests
- Faster initial load time
- Lower bandwidth usage
- Better for mobile devices
- Ideal for quick checks

### Animation Mode Benefits
- Historical context (4 hours)
- Storm movement tracking
- Better for detailed analysis
- Smooth playback
- Preloading prevents stuttering

### Optimization Tips

1. Use static mode on main page (fewer resources)
2. Use animation mode for detailed analysis
3. Cache responses at CDN level (Vercel)
4. Preload limited frame buffer (±2 frames)
5. Lazy load map components with `dynamic()`

## Troubleshooting

### Common Issues

#### 1. "Failed to load radar image"

**Cause:** Iowa State API unavailable or network timeout

**Solution:**
- Click the REFRESH button
- Check network connection
- Verify location is in US
- Wait a moment and retry

#### 2. Blank/transparent radar

**Cause:** No precipitation in the area or outdated data

**Solution:**
- This is normal for clear weather
- Try switching to animation mode to see recent history
- Check county boundaries layer is visible

#### 3. Rate limit errors

**Cause:** Too many requests in short time

**Solution:**
- Wait 60 seconds before retrying
- Use static mode (fewer requests)
- Check for infinite refresh loops

#### 4. Mode toggle not persisting

**Cause:** localStorage disabled or cleared

**Solution:**
- Enable localStorage in browser settings
- Check browser privacy settings
- Default mode will be used each visit

### Debug Mode

Enable debug logging in browser console:

```typescript
localStorage.setItem('DEBUG', 'radmap:*')
```

Console output includes:
- RadMap URL generation
- API request/response times
- Image load events
- Mode changes
- Error details

## Future Enhancements

Potential improvements for future releases:

1. **Additional Layers**
   - Warnings overlay toggle
   - Storm reports toggle
   - Satellite imagery option

2. **Advanced Features**
   - Custom playback speed
   - Loop animation
   - Export radar as GIF
   - Share specific timestamps

3. **Mobile Optimizations**
   - Gesture controls (swipe to scrub)
   - Pinch to zoom
   - Reduced frame count for bandwidth

4. **Accessibility**
   - Keyboard shortcuts (Space = play/pause, Arrow keys = scrub)
   - Screen reader announcements
   - High contrast mode

## Credits

- **Iowa State University IEM** - RadMap API service
- **OpenLayers** - Map rendering library
- **16-Bit Weather Team** - Integration and UI

## References

- [Iowa State RadMap API Documentation](https://mesonet.agron.iastate.edu/GIS/radmap_api.phtml)
- [OpenLayers Documentation](https://openlayers.org/en/latest/apidoc/)
- [NEXRAD Information](https://www.ncei.noaa.gov/products/radar/next-generation-weather-radar)

## License

This integration is part of the 16-Bit Weather Platform:
- **License:** Fair Source License, Version 0.9
- **Use Limitation:** 5 users
- **Copyright:** © 2025 16-Bit Weather

---

**Last Updated:** October 12, 2025  
**Version:** 1.0.0

