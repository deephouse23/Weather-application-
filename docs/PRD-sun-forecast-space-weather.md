# Product Requirements Document: Sun Forecast & Space Weather

## 16-Bit Weather - SOLAR COMMAND Terminal

**Version:** 1.0  
**Date:** January 2026  
**Timeline:** 2-Day Sprint  
**Branch:** `feature/space-weather`

---

## 0. Pre-Implementation Instructions

**CRITICAL: Before writing ANY code, execute the following:**

```bash
git checkout main
git pull origin main
git checkout -b feature/space-weather
```

All work MUST be done on this feature branch. Do NOT push directly to main.

---

## 1. Executive Summary

This PRD outlines the implementation of a comprehensive Sun Forecast & Space Weather feature for 16-Bit Weather, inspired by SpaceWeatherNews (S0/Suspicious0bservers). The feature provides real-time solar activity monitoring including sunspot tracking, coronal mass ejection (CME) visualization, solar flare alerts, geomagnetic storm forecasting, and aurora predictions.

The feature combines NASA and NOAA's free public APIs with the existing 16-bit retro terminal aesthetic, creating animated visualizations similar to the existing NEXRAD radar implementation. This differentiates 16bitweather.co as a comprehensive weather platform covering both terrestrial AND space weather.

**Target Audience:** Space weather enthusiasts, amateur astronomers, aurora chasers, ham radio operators, pilots concerned about solar radiation, and anyone curious about the Sun's impact on Earth.

### 1.1 Performance Constraint (Ralph Loop)

**Critical Requirement:** All implementations must maintain a Lighthouse performance score of **85 or higher**. Each milestone must include Lighthouse audit results before proceeding.

```bash
# Run Lighthouse audit after each major section
npx lighthouse http://localhost:3000/space-weather --output=json --output-path=./docs/lh-sun-{checkpoint}.json --chrome-flags="--headless"
```

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals

1. Provide real-time space weather intelligence in retro terminal format
2. Create animated visualizations of solar activity (like radar animations)
3. Educate users about Sun-Earth connection and space weather impacts
4. Integrate with existing AI assistant for space weather Q&A
5. Maintain Lighthouse score ≥85 throughout implementation

### 2.2 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse Score | ≥ 85 | CI/CD Lighthouse audit |
| Page Load Time | < 3 seconds | Core Web Vitals |
| Animation FPS | 30+ fps | Chrome DevTools |
| Feature Adoption | 10% of users | Analytics tracking |
| Data Freshness | < 15 min stale | API response timestamps |

---

## 3. Feature Scope

### 3.1 Core Features (MVP - Day 1)

**3.1.1 Solar Activity Dashboard**

Primary display showing current space weather conditions:
- **Space Weather Scales:** R (Radio Blackouts), S (Solar Radiation), G (Geomagnetic Storms) - NOAA scales 1-5
- **Current Solar Flare Status:** X-ray flux level (A, B, C, M, X class)
- **Sunspot Count:** Current daily sunspot number and solar cycle position
- **Kp Index Gauge:** 0-9 geomagnetic activity meter
- **Solar Wind Stats:** Speed (km/s), density, Bz direction (north/south)

**3.1.2 Real-Time Sun Imagery**

Animated/updating sun images from NASA SDO:
- AIA 304 (chromosphere - orange/red, shows prominences)
- AIA 193 (corona - green, shows coronal holes)  
- AIA 171 (corona - gold, shows coronal loops)
- HMI Intensitygram (sunspots - white light)
- Auto-refresh every 5-15 minutes
- Click to cycle through wavelengths

**3.1.3 CME Visualization (Coronagraph)**

SOHO LASCO coronagraph imagery showing CMEs:
- C2 coronagraph (close view, 1.5-6 solar radii)
- C3 coronagraph (wide view, 3.5-30 solar radii)
- Animated playback similar to radar animation
- Time controls: play/pause, step forward/back, speed control
- Loop last 6-12 hours of imagery

**3.1.4 Aurora Forecast Map**

NOAA OVATION aurora forecast overlay:
- Northern hemisphere aurora oval
- Southern hemisphere aurora oval
- Viewline (how far south aurora visible)
- Current Kp-based intensity coloring

**3.1.5 Alert Ticker**

Scrolling space weather alerts similar to aviation AlertTicker:
- Active NOAA watches/warnings/alerts
- Recent solar flare events (M and X class)
- CME arrival predictions
- Geomagnetic storm updates

### 3.2 Enhanced Features (MVP - Day 2)

**3.2.1 WSA-Enlil CME Animation**

NOAA's heliospheric model showing CME propagation:
- Animated solar wind spiral
- Earth position indicator
- CME cloud visualization
- Predicted arrival time at Earth

**3.2.2 X-Ray Flux Chart**

GOES satellite X-ray flux graph:
- Real-time updating chart
- M-class and X-class threshold lines
- Past 24-48 hours of data
- Flare event markers

**3.2.3 Solar Wind Graph**

Real-time solar wind parameters:
- Speed (typically 300-800 km/s)
- Density (particles/cm³)
- Bz component (critical for geomagnetic storms)
- Past 24 hours trending

**3.2.4 AI Space Weather Assistant**

Integration with existing AI chat:
- Space weather context injection
- Natural language explanations of current conditions
- Aurora viewing predictions
- Educational Q&A about solar phenomena

### 3.3 Out of Scope (Future Phases)

- GPS/GNSS interference predictions
- HF radio propagation forecasts
- Satellite anomaly predictions
- Historical space weather archive
- Push notifications for space weather events
- Integration with ham radio propagation tools

---

## 4. Technical Architecture

### 4.1 Data Sources (All FREE - No API Keys Required for Most)

| Source | Data Type | Cost | Update Frequency | Endpoint |
|--------|-----------|------|------------------|----------|
| **NOAA SWPC** | Alerts, Kp, X-ray flux, Solar wind | FREE | 1-15 min | services.swpc.noaa.gov |
| **NASA DONKI** | CME events, Flare data, GST events | FREE* | Near real-time | api.nasa.gov/DONKI |
| **NASA SDO** | Sun imagery (AIA, HMI) | FREE | 10-15 min | sdo.gsfc.nasa.gov |
| **SOHO LASCO** | Coronagraph images (C2, C3) | FREE | ~12 min | soho.nascom.nasa.gov |
| **NOAA SWPC** | Aurora forecast images | FREE | 30 min | services.swpc.noaa.gov |
| **NOAA SWPC** | WSA-Enlil animations | FREE | As available | services.swpc.noaa.gov |

*NASA DONKI requires free API key from api.nasa.gov (add to .env.local as `NASA_API_KEY`)

### 4.2 API Endpoints Detail

**NOAA SWPC Services (No Auth Required):**
```
# Space Weather Scales (R, S, G)
https://services.swpc.noaa.gov/products/noaa-scales.json

# Planetary K-index
https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json

# GOES X-ray Flux (1-min data)
https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json

# Real-time Solar Wind
https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json
https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json

# Alerts/Watches/Warnings
https://services.swpc.noaa.gov/products/alerts.json

# Aurora Forecast Images
https://services.swpc.noaa.gov/images/aurora-forecast-northern-hemisphere.png
https://services.swpc.noaa.gov/images/aurora-forecast-southern-hemisphere.png

# Solar Cycle Progression (Sunspot numbers)
https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json

# 3-Day Forecast
https://services.swpc.noaa.gov/products/3-day-forecast.json

# WSA-Enlil (when available)
https://services.swpc.noaa.gov/products/animations/enlil.json
```

**NASA SDO Imagery (Direct URLs, No Auth):**
```
# Latest Sun Images (1024px)
https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg  # AIA 304 (chromosphere)
https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg  # AIA 193 (corona)
https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg  # AIA 171 (corona)
https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIF.jpg # HMI (sunspots)

# Smaller versions for performance (512px)
https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0304.jpg
```

**SOHO LASCO Coronagraph (Direct URLs, No Auth):**
```
# Latest coronagraph images
https://soho.nascom.nasa.gov/data/realtime/c2/512/latest.jpg
https://soho.nascom.nasa.gov/data/realtime/c3/512/latest.jpg

# Archive for animation frames
https://soho.nascom.nasa.gov/data/REPROCESSING/Completed/{YYYY}/c2/{YYYY}{MM}{DD}/
```

**NASA DONKI API (Requires Free API Key):**
```
# CME Events
https://api.nasa.gov/DONKI/CME?startDate={date}&endDate={date}&api_key={key}

# Solar Flares
https://api.nasa.gov/DONKI/FLR?startDate={date}&endDate={date}&api_key={key}

# Geomagnetic Storms
https://api.nasa.gov/DONKI/GST?startDate={date}&endDate={date}&api_key={key}

# Notifications (all types)
https://api.nasa.gov/DONKI/notifications?startDate={date}&endDate={date}&api_key={key}
```

### 4.3 Component Architecture

```
app/
├── space-weather/
│   └── page.tsx                    # Main Space Weather page
├── api/
│   └── space-weather/
│       ├── scales/route.ts         # NOAA R/S/G scales
│       ├── kp-index/route.ts       # Planetary K-index
│       ├── xray-flux/route.ts      # GOES X-ray data
│       ├── solar-wind/route.ts     # Solar wind plasma/mag
│       ├── alerts/route.ts         # SWPC alerts
│       ├── aurora/route.ts         # Aurora forecast
│       ├── sunspots/route.ts       # Solar cycle/sunspot data
│       ├── cme/route.ts            # NASA DONKI CME data
│       ├── flares/route.ts         # NASA DONKI flare data
│       └── enlil/route.ts          # WSA-Enlil model data

components/
└── space-weather/
    ├── index.ts                    # Barrel exports
    ├── SolarCommandTerminal.tsx    # Main container (like FlightConditionsTerminal)
    ├── SpaceWeatherScales.tsx      # R/S/G scale display
    ├── SunImageViewer.tsx          # SDO imagery with wavelength selector
    ├── CoronagraphAnimation.tsx    # LASCO C2/C3 playback (like radar animation)
    ├── AuroraForecastMap.tsx       # Aurora oval visualization
    ├── AlertTicker.tsx             # Scrolling space weather alerts
    ├── KpIndexGauge.tsx            # Kp meter (0-9)
    ├── SolarWindStats.tsx          # Speed, density, Bz display
    ├── XRayFluxChart.tsx           # GOES X-ray line chart
    ├── SunspotDisplay.tsx          # Current sunspot count
    └── EnlilAnimation.tsx          # WSA-Enlil CME model (Phase 2)
```

### 4.4 Caching Strategy

To maintain performance and respect API rate limits:

| Data Type | Cache TTL | Strategy |
|-----------|-----------|----------|
| Sun Images | 5 min | CDN cache + browser cache |
| NOAA Scales | 5 min | Server-side cache |
| Kp Index | 5 min | Server-side cache |
| X-ray Flux | 1 min | Stale-while-revalidate |
| Solar Wind | 1 min | Stale-while-revalidate |
| Alerts | 5 min | Server-side cache |
| CME/Flare events | 15 min | Server-side cache |
| Coronagraph images | 10 min | Browser cache |

### 4.5 Animation Implementation

**Coronagraph Animation (Similar to Radar):**

The coronagraph animation should follow the same pattern as `weather-map-openlayers.tsx`:

```typescript
// Animation constants (tune for smooth playback)
const FRAME_INTERVAL_MS = 500        // Time between frames
const FRAME_TRANSITION_MS = 300      // Crossfade duration
const FRAMES_TO_LOAD = 12            // ~2 hours of LASCO data
const PRELOAD_AHEAD = 3              // Frames to preload

// Frame generation (LASCO updates ~every 12 minutes)
const generateFrameTimestamps = () => {
  const now = Date.now()
  const frameInterval = 12 * 60 * 1000 // 12 minutes
  return Array.from({ length: FRAMES_TO_LOAD }, (_, i) => 
    now - (FRAMES_TO_LOAD - 1 - i) * frameInterval
  )
}
```

**Animation Controls:**
- Play/Pause button
- Step forward/backward
- Speed selector (0.5x, 1x, 2x)
- Frame indicator showing current timestamp
- Smooth crossfade transitions between frames

---

## 5. UI/UX Design

### 5.1 Visual Design Language

The Sun Forecast feature uses a "SOLAR COMMAND TERMINAL" aesthetic combining:
- NASA mission control retro styling
- 16-bit pixel art elements
- Amber/orange accent colors (solar theme)
- CRT monitor effects (optional)

**Color Palette (Solar Theme Additions):**
```css
/* Space Weather Severity Colors */
--sw-green: #00ff00;     /* Normal/Quiet */
--sw-yellow: #ffff00;    /* Minor/Moderate */
--sw-orange: #ff8c00;    /* Strong */
--sw-red: #ff0000;       /* Severe */
--sw-purple: #9400d3;    /* Extreme */

/* Solar Imagery Accent */
--solar-orange: #ff6b00;
--solar-gold: #ffd700;
--corona-green: #00ff7f;
```

### 5.2 Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Navigation Bar - Same as other pages]                               │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  SOLAR COMMAND TERMINAL v1.0  │  DATA: LIVE  │  2026-01-20 15:42 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [ALERT TICKER - Scrolling space weather alerts]                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐  ┌─────────────────────────────────────────┐│
│ │ SPACE WEATHER SCALES│  │ SUN VIEWER                              ││
│ │ ┌─────┬─────┬─────┐ │  │ ┌─────────────────────────────────────┐ ││
│ │ │  R  │  S  │  G  │ │  │ │                                     │ ││
│ │ │  1  │  0  │  4  │ │  │ │     [SDO Sun Image - 512px]         │ ││
│ │ └─────┴─────┴─────┘ │  │ │                                     │ ││
│ │                     │  │ └─────────────────────────────────────┘ ││
│ │ X-RAY FLUX: M2.4    │  │ [304] [193] [171] [HMI] << wavelength  ││
│ │ Kp INDEX: ████░░ 4  │  │                                         ││
│ │ SUNSPOTS: 142       │  └─────────────────────────────────────────┘│
│ └─────────────────────┘                                             │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐  ┌─────────────────────────────┐│
│ │ CORONAGRAPH (LASCO C2/C3)       │  │ AURORA FORECAST             ││
│ │ ┌─────────────────────────────┐ │  │ ┌─────────────────────────┐ ││
│ │ │                             │ │  │ │                         │ ││
│ │ │   [Animated Coronagraph]    │ │  │ │  [Aurora Oval Map]      │ ││
│ │ │                             │ │  │ │                         │ ││
│ │ └─────────────────────────────┘ │  │ └─────────────────────────┘ ││
│ │ [◀][▶] [▶▶] Speed: 1x [C2][C3] │  │ Viewline: 45°N | Kp: 4     ││
│ └─────────────────────────────────┘  └─────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ SOLAR WIND                                                       │ │
│ │ Speed: 523 km/s │ Density: 4.2/cm³ │ Bz: -8.5 nT (SOUTH) ⚠️    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Mobile Layout

On mobile, stack components vertically:
1. Alert ticker (full width, shorter)
2. Space Weather Scales (compact horizontal)
3. Sun Image Viewer (full width, tap to change wavelength)
4. Coronagraph Animation (full width)
5. Aurora Forecast (full width)
6. Solar Wind Stats (compact cards)

### 5.4 Theme Integration

Must support all 12 themes. Key theme-specific elements:
- Alert severity colors adapt to theme
- Sun image borders/frames match theme
- Chart colors integrate with theme palette
- Terminal chrome (borders, headers) use theme colors

---

## 6. Implementation Plan (2-Day Sprint)

### Day 1: Foundation & Core Features

**Morning Session (4 hours):**

1. **Create feature branch**
   ```bash
   git checkout -b feature/sun-forecast-space-weather
   ```

2. **Create API routes for NOAA SWPC data**
   - `app/api/space-weather/scales/route.ts`
   - `app/api/space-weather/kp-index/route.ts`
   - `app/api/space-weather/alerts/route.ts`
   - `app/api/space-weather/solar-wind/route.ts`

3. **Create base page and terminal container**
   - `app/sun/page.tsx`
   - `components/space-weather/SolarCommandTerminal.tsx`

4. **Implement Space Weather Scales display**
   - `components/space-weather/SpaceWeatherScales.tsx`

5. **Run Lighthouse checkpoint**
   ```bash
   npm run build && npm run start
   npx lighthouse http://localhost:3000/sun --output=json --output-path=./docs/lh-sun-day1-morning.json
   ```
   **Must score ≥85 before proceeding**

**Afternoon Session (4 hours):**

5. **Implement Sun Image Viewer**
   - `components/space-weather/SunImageViewer.tsx`
   - Wavelength selector (304, 193, 171, HMI)
   - Auto-refresh logic
   - Loading states with skeleton

6. **Implement Alert Ticker**
   - `components/space-weather/AlertTicker.tsx`
   - Reuse patterns from aviation AlertTicker
   - Scrolling animation

7. **Implement Kp Index Gauge**
   - `components/space-weather/KpIndexGauge.tsx`
   - Visual meter 0-9
   - Color coding by severity

8. **Run Lighthouse checkpoint**
   ```bash
   npx lighthouse http://localhost:3000/sun --output=json --output-path=./docs/lh-sun-day1-afternoon.json
   ```
   **Must score ≥85 before proceeding**

**Evening Session (2 hours):**

9. **Implement Solar Wind Stats**
   - `components/space-weather/SolarWindStats.tsx`
   - Speed, density, Bz display
   - Warning indicators for southward Bz

10. **Implement Sunspot Display**
    - `components/space-weather/SunspotDisplay.tsx`
    - Current count
    - Solar cycle position indicator

11. **Theme integration pass**
    - Ensure all components work with all 12 themes
    - Test on Dark Terminal, Miami Vice, Matrix

12. **Day 1 Final Lighthouse**
    ```bash
    npx lighthouse http://localhost:3000/sun --output=json --output-path=./docs/lh-sun-day1-final.json
    ```
    **Must score ≥85**

13. **Commit and push**
    ```bash
    git add .
    git commit -m "feat(sun): Day 1 - Core space weather dashboard with NOAA data"
    git push origin feature/sun-forecast-space-weather
    ```

---

### Day 2: Animations & Polish

**Morning Session (4 hours):**

1. **Implement Coronagraph Animation**
   - `components/space-weather/CoronagraphAnimation.tsx`
   - Follow `weather-map-openlayers.tsx` animation pattern
   - LASCO C2/C3 selector
   - Play/pause/step controls
   - Speed control (0.5x, 1x, 2x)
   - Frame preloading
   - Smooth crossfade transitions

2. **Create coronagraph API route**
   - `app/api/space-weather/coronagraph/route.ts`
   - Return list of available frame URLs
   - Handle caching headers

3. **Run Lighthouse checkpoint**
   ```bash
   npx lighthouse http://localhost:3000/sun --output=json --output-path=./docs/lh-sun-day2-morning.json
   ```
   **Must score ≥85**

**Afternoon Session (4 hours):**

4. **Implement Aurora Forecast Map**
   - `components/space-weather/AuroraForecastMap.tsx`
   - Northern/Southern hemisphere toggle
   - Overlay on simple map or standalone image
   - Viewline indicator

5. **Implement X-Ray Flux Chart**
   - `components/space-weather/XRayFluxChart.tsx`
   - Use recharts (already in project)
   - M/X class threshold lines
   - 24-hour data display
   - Lazy load for performance

6. **Add NASA DONKI integration**
   - Add `NASA_API_KEY` to `.env.local`
   - `app/api/space-weather/cme/route.ts`
   - `app/api/space-weather/flares/route.ts`
   - Display recent CME/flare events in dashboard

7. **Run Lighthouse checkpoint**
   ```bash
   npx lighthouse http://localhost:3000/sun --output=json --output-path=./docs/lh-sun-day2-afternoon.json
   ```
   **Must score ≥85**

**Evening Session (2 hours):**

8. **Update Navigation**
   - Add SUN link to navigation
   - Icon: `Sun` from lucide-react
   - Position after RADAR: HOME | RADAR | SUN | AVIATION | EDUCATION | AI | User

9. **AI Integration**
   - Add space weather context to AI assistant
   - Update `app/api/chat/route.ts` to include current space weather data
   - Add suggested prompts for space weather queries

10. **Mobile responsive fixes**
    - Test all breakpoints
    - Ensure animations work on mobile
    - Touch-friendly controls

11. **Accessibility pass**
    - ARIA labels on all interactive elements
    - Keyboard navigation for animation controls
    - Color contrast verification

12. **Final Lighthouse audit**
    ```bash
    npx lighthouse http://localhost:3000/sun --output=json --output-path=./docs/lh-sun-final.json
    ```
    **Must score ≥85**

13. **Create Pull Request**
    ```bash
    git add .
    git commit -m "feat(sun): Complete Sun Forecast & Space Weather feature"
    git push origin feature/sun-forecast-space-weather
    ```
    
    Create PR with title: `feat: Add Sun Forecast & Space Weather dashboard`

---

## 7. Performance Requirements

### 7.1 Lighthouse Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Performance Score | ≥ 85 | YES |
| First Contentful Paint | < 1.8s | YES |
| Largest Contentful Paint | < 2.5s | YES |
| Cumulative Layout Shift | < 0.1 | YES |
| Total Blocking Time | < 200ms | YES |

### 7.2 Performance Optimization Strategies

1. **Lazy Loading:**
   ```typescript
   // Lazy load heavy components
   const CoronagraphAnimation = dynamic(
     () => import('@/components/space-weather/CoronagraphAnimation'),
     { ssr: false, loading: () => <CoronagraphSkeleton /> }
   )
   
   const XRayFluxChart = dynamic(
     () => import('@/components/space-weather/XRayFluxChart'),
     { ssr: false, loading: () => <ChartSkeleton /> }
   )
   ```

2. **Image Optimization:**
   - Use 512px sun images instead of 1024px for initial load
   - Implement progressive image loading
   - Use `next/image` with proper sizing
   - Preload critical images

3. **Animation Performance:**
   - Use CSS transitions for crossfades
   - Preload upcoming frames
   - Limit concurrent image loads
   - Use `requestAnimationFrame` for smooth playback
   - Implement frame caching in memory

4. **Data Fetching:**
   - Server Components for initial data
   - Client-side polling for real-time updates
   - Stale-while-revalidate caching
   - Debounce API calls

5. **Bundle Size:**
   - Tree-shake unused lucide icons
   - Lazy load recharts
   - Avoid importing entire libraries

---

## 8. Testing Strategy

### 8.1 Playwright E2E Tests

Create `tests/e2e/sun-forecast.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Sun Forecast Page', () => {
  test('loads successfully with space weather data', async ({ page }) => {
    await page.goto('/sun')
    await expect(page.locator('text=SOLAR COMMAND TERMINAL')).toBeVisible()
    await expect(page.locator('[data-testid="space-weather-scales"]')).toBeVisible()
  })

  test('sun image viewer changes wavelengths', async ({ page }) => {
    await page.goto('/sun')
    await page.click('[data-testid="wavelength-193"]')
    await expect(page.locator('[data-testid="sun-image"]')).toHaveAttribute('src', /0193/)
  })

  test('coronagraph animation plays', async ({ page }) => {
    await page.goto('/sun')
    await page.click('[data-testid="coronagraph-play"]')
    await expect(page.locator('[data-testid="coronagraph-frame"]')).toBeVisible()
  })

  test('alert ticker displays alerts', async ({ page }) => {
    await page.goto('/sun')
    await expect(page.locator('[data-testid="alert-ticker"]')).toBeVisible()
  })

  test('page maintains Lighthouse score ≥85', async ({ page }) => {
    // This is verified by separate Lighthouse runs
  })
})
```

### 8.2 Unit Tests

Create `__tests__/space-weather/` directory:

- `parse-noaa-scales.test.ts` - NOAA scale parsing
- `parse-solar-wind.test.ts` - Solar wind data parsing
- `coronagraph-frames.test.ts` - Frame URL generation
- `alert-formatting.test.ts` - Alert message formatting

---

## 9. Error Handling

### 9.1 Data Unavailability

When APIs are unreachable:
- Show "DATA OFFLINE" status indicator
- Display last cached data with timestamp
- Retry with exponential backoff
- Log errors to Sentry

### 9.2 Image Loading Failures

When sun/coronagraph images fail:
- Show placeholder with "SIGNAL LOST" message
- Retry loading after 30 seconds
- Skip failed frames in animation
- Log to error tracking

### 9.3 User-Facing Messages

```
// Connection issues
"SOLAR DATA LINK: INTERRUPTED - Reconnecting..."

// No current alerts
"SPACE WEATHER: ALL QUIET - No active alerts"

// API rate limit
"DATA THROTTLED - Refreshing in 60s"
```

---

## 10. Navigation Update

### 10.1 Updated Navigation Structure

**Desktop:** HOME | RADAR | SPACE WEATHER | AVIATION | GAMES | EDUCATION | AI | [User/Login]

**Icons:** 
- Home: `Home`
- Radar: `Radio`
- Space Weather: `Sun`
- Aviation: `Plane`
- Games: `Gamepad2`
- Education: `GraduationCap`
- AI: `Bot`
- User: `User`

### 10.2 Navigation Code Update

In `components/navigation.tsx`, add:
```typescript
{ href: '/space-weather', label: 'SPACE WEATHER', icon: Sun },
{ href: '/games', label: 'GAMES', icon: Gamepad2 }
```

---

## 11. Environment Variables

Add to `.env.local`:
```bash
# NASA API Key (get free key at api.nasa.gov)
NASA_API_KEY=your_nasa_api_key_here
```

Add to `.env.example`:
```bash
# NASA API Key for DONKI space weather data (free at api.nasa.gov)
NASA_API_KEY=
```

---

## 12. File Structure Summary

```
app/
├── space-weather/
│   └── page.tsx                         # Main Space Weather page
└── api/
    └── space-weather/
        ├── scales/route.ts              # NOAA R/S/G scales
        ├── kp-index/route.ts            # Planetary K-index
        ├── xray-flux/route.ts           # GOES X-ray flux
        ├── solar-wind/route.ts          # Solar wind plasma/mag
        ├── alerts/route.ts              # SWPC alerts
        ├── aurora/route.ts              # Aurora forecast URLs
        ├── sunspots/route.ts            # Solar cycle data
        ├── coronagraph/route.ts         # LASCO frame URLs
        ├── cme/route.ts                 # NASA DONKI CME
        └── flares/route.ts              # NASA DONKI flares

components/
└── space-weather/
    ├── index.ts
    ├── SolarCommandTerminal.tsx
    ├── SpaceWeatherScales.tsx
    ├── SunImageViewer.tsx
    ├── CoronagraphAnimation.tsx
    ├── AuroraForecastMap.tsx
    ├── AlertTicker.tsx
    ├── KpIndexGauge.tsx
    ├── SolarWindStats.tsx
    ├── XRayFluxChart.tsx
    └── SunspotDisplay.tsx

tests/
└── e2e/
    └── sun-forecast.spec.ts

__tests__/
└── space-weather/
    ├── parse-noaa-scales.test.ts
    └── coronagraph-frames.test.ts
```

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **CME** | Coronal Mass Ejection - Massive burst of solar plasma |
| **Kp Index** | Planetary K-index - Global geomagnetic activity (0-9) |
| **GOES** | Geostationary Operational Environmental Satellite |
| **SDO** | Solar Dynamics Observatory - NASA sun-watching satellite |
| **SOHO** | Solar and Heliospheric Observatory - ESA/NASA solar mission |
| **LASCO** | Large Angle Spectrometric Coronagraph (on SOHO) |
| **AIA** | Atmospheric Imaging Assembly (on SDO) |
| **HMI** | Helioseismic and Magnetic Imager (on SDO) |
| **Bz** | Z-component of interplanetary magnetic field |
| **X-ray Class** | Solar flare intensity (A, B, C, M, X) |
| **SWPC** | Space Weather Prediction Center (NOAA) |
| **DONKI** | Database Of Notifications, Knowledge, Information (NASA) |
| **WSA-Enlil** | Heliospheric model predicting solar wind/CME arrival |

---

## 14. Reference Links

- NOAA SWPC Data Services: https://services.swpc.noaa.gov
- NOAA Space Weather Scales: https://www.swpc.noaa.gov/noaa-scales-explanation
- NASA SDO Data: https://sdo.gsfc.nasa.gov/data/
- SOHO LASCO: https://soho.nascom.nasa.gov/data/realtime/
- NASA DONKI: https://kauai.ccmc.gsfc.nasa.gov/DONKI/
- NASA API Portal: https://api.nasa.gov/
- Helioviewer: https://helioviewer.org/

---

## 15. Quick Start for Ralph

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/sun-forecast-space-weather

# 2. Start development
npm run dev

# 3. After each major section, run Lighthouse
npm run build && npm run start
npx lighthouse http://localhost:3000/sun --output=json --output-path=./docs/lh-sun-checkpoint.json

# 4. Verify score ≥85 before proceeding

# 5. When complete
git add .
git commit -m "feat(sun): Add Sun Forecast & Space Weather dashboard"
git push origin feature/sun-forecast-space-weather

# 6. Create PR on GitHub
```

**Implementation Order:**
1. ✅ Create feature branch
2. Create API routes (NOAA SWPC first, no auth needed)
3. Create `/space-weather` page with SolarCommandTerminal
4. Implement SpaceWeatherScales (R/S/G)
5. **Lighthouse checkpoint ≥85**
6. Implement SunImageViewer (SDO images)
7. Implement AlertTicker
8. Implement KpIndexGauge
9. **Lighthouse checkpoint ≥85**
10. Implement SolarWindStats
11. Implement SunspotDisplay
12. Implement CoronagraphAnimation (LASCO)
13. **Lighthouse checkpoint ≥85**
14. Implement AuroraForecastMap
15. Implement XRayFluxChart
16. Add NASA DONKI integration
17. Update navigation
18. AI integration for space weather
19. Mobile responsive pass
20. Theme integration pass
21. **Final Lighthouse ≥85**
22. Create PR

---

## 16. Appendix: API Response Examples

### NOAA Scales Response
```json
{
  "0": {
    "DateStamp": "2026-01-20",
    "TimeStamp": "1542",
    "R": { "Scale": "1", "Text": "Minor" },
    "S": { "Scale": "0", "Text": "None" },
    "G": { "Scale": "4", "Text": "Severe" }
  }
}
```

### Kp Index Response
```json
[
  ["time_tag", "Kp", "a_running", "station_count"],
  ["2026-01-20 12:00:00.000", "4.00", "15", "8"]
]
```

### Solar Wind Response
```json
[
  ["time_tag", "density", "speed", "temperature"],
  ["2026-01-20 15:30:00.000", "4.23", "523.4", "152340"]
]
```

### GOES X-ray Response
```json
[
  {
    "time_tag": "2026-01-20T15:30:00Z",
    "satellite": 16,
    "flux": 2.45e-5,
    "observed_flux": 2.45e-5,
    "electron_correction": 0,
    "electron_contaminaton": false,
    "energy": "0.1-0.8nm"
  }
]
```

---

## 17. News Feed Integration - Space Weather Content

The existing News page (`/news`) should be updated to include space weather news and events alongside terrestrial weather news.

### 17.1 Space Weather News Categories

Add the following content types to the news feed:

| Category | Source | Content Type |
|----------|--------|-------------|
| Solar Flares | NOAA SWPC / NASA DONKI | M-class and X-class flare events |
| CME Events | NASA DONKI | Earth-directed CME alerts |
| Geomagnetic Storms | NOAA SWPC | G1-G5 storm reports |
| Aurora Sightings | NOAA SWPC | Aurora visibility reports |
| Solar Cycle Updates | NOAA SWPC | Sunspot counts, cycle progression |
| Space Weather Watches | NOAA SWPC | Official watches/warnings |

### 17.2 News Item Format

```typescript
interface SpaceWeatherNewsItem {
  id: string
  type: 'solar_flare' | 'cme' | 'geomagnetic_storm' | 'aurora' | 'solar_cycle' | 'watch_warning'
  title: string
  summary: string
  severity: 'info' | 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme'
  timestamp: Date
  source: 'NOAA_SWPC' | 'NASA_DONKI'
  link?: string
  data?: {
    flareClass?: string      // e.g., "X1.5", "M2.3"
    kpIndex?: number         // 0-9
    stormScale?: string      // G1-G5
    region?: string          // Active region number
  }
}
```

### 17.3 News Feed Display

```
┌─────────────────────────────────────────────────────────────────────┐
│ 16-BIT NEWS TERMINAL                                                │
├─────────────────────────────────────────────────────────────────────┤
│ [ALL] [TERRESTRIAL] [SPACE WEATHER] << Filter tabs                 │
├─────────────────────────────────────────────────────────────────────┤
│ ☀️ X2.1 SOLAR FLARE - Region 3842                    2 hours ago   │
│ Strong X-class flare detected. Potential radio blackouts on        │
│ Earth's dayside. CME analysis in progress.                         │
├─────────────────────────────────────────────────────────────────────┤
│ 🌍 Winter Storm Warning - Northeast US               3 hours ago   │
│ Heavy snow expected across New England...                          │
├─────────────────────────────────────────────────────────────────────┤
│ 🌌 GEOMAGNETIC STORM WATCH - G2 Expected             5 hours ago   │
│ CME arrival expected Jan 21. Aurora possible as far south as       │
│ northern tier US states.                                           │
├─────────────────────────────────────────────────────────────────────┤
│ 🌡️ Heat Advisory - Phoenix Metro                    6 hours ago   │
│ Temperatures exceeding 110°F expected...                           │
└─────────────────────────────────────────────────────────────────────┘
```

### 17.4 News API Route Update

Update `app/api/news/route.ts` to fetch and merge space weather news:

```typescript
// Fetch space weather events from NOAA SWPC alerts
const spaceWeatherAlerts = await fetch(
  'https://services.swpc.noaa.gov/products/alerts.json'
)

// Fetch recent flares from NASA DONKI
const recentFlares = await fetch(
  `https://api.nasa.gov/DONKI/FLR?startDate=${weekAgo}&api_key=${NASA_API_KEY}`
)

// Merge with terrestrial news, sort by timestamp
const allNews = [...terrestrialNews, ...spaceWeatherNews]
  .sort((a, b) => b.timestamp - a.timestamp)
```

### 17.5 Space Weather News Icons

| Event Type | Icon | Color |
|------------|------|-------|
| Solar Flare | `Sun` | Orange/Red based on class |
| CME | `Zap` | Purple |
| Geomagnetic Storm | `Globe` | Green to Red based on G-scale |
| Aurora | `Sparkles` | Green |
| Solar Cycle | `Activity` | Yellow |
| Watch/Warning | `AlertTriangle` | Yellow/Orange/Red |

---

## 18. Comprehensive AI Space Weather Knowledge Base

The AI assistant must have deep knowledge of space weather to answer user questions accurately and comprehensively.

### 18.1 AI Context Injection - Space Weather

When space weather context is relevant, inject the following data into the AI prompt:

```typescript
interface SpaceWeatherAIContext {
  current: {
    scales: { R: number, S: number, G: number }
    kpIndex: number
    xrayFlux: { class: string, value: number }
    solarWind: { speed: number, density: number, bz: number }
    sunspotCount: number
  }
  recent: {
    flares: Array<{ class: string, time: Date, region: string }>
    cmes: Array<{ speed: number, earthDirected: boolean, arrivalTime?: Date }>
    storms: Array<{ scale: string, startTime: Date, endTime?: Date }>
  }
  forecast: {
    auroraViewline: number  // latitude
    stormProbability: { G1: number, G2: number, G3Plus: number }
    flareProbability: { M: number, X: number }
  }
}
```

### 18.2 AI Knowledge Topics - Space Weather Encyclopedia

The AI must be able to explain and discuss the following topics in depth:

**The Sun & Solar Structure:**
- Solar core, radiative zone, convective zone
- Photosphere, chromosphere, corona
- Sunspots and active regions
- Solar magnetic field and polarity reversals
- Solar cycle (11-year cycle, solar minimum/maximum)
- Current solar cycle 25 status and predictions

**Solar Activity & Events:**
- Solar flares (A, B, C, M, X classification)
- Coronal Mass Ejections (CMEs) - formation, speed, Earth-directed vs glancing
- Solar prominences and filaments
- Coronal holes and high-speed solar wind streams
- Solar energetic particle (SEP) events
- Solar radio bursts

**Space Weather Measurements:**
- X-ray flux (GOES satellites)
- Kp index and planetary geomagnetic activity
- Dst index (ring current strength)
- Solar wind parameters (speed, density, temperature, Bz)
- Proton flux and radiation levels
- F10.7 solar radio flux

**NOAA Space Weather Scales:**
- R-scale (Radio Blackouts) R1-R5
  - R1: Minor - HF radio degradation on sunlit side
  - R2: Moderate - Limited HF radio blackout
  - R3: Strong - Wide area HF radio blackout
  - R4: Severe - HF radio blackout for hours
  - R5: Extreme - Complete HF radio blackout
- S-scale (Solar Radiation Storms) S1-S5
  - S1: Minor - Minor impacts on HF radio in polar regions
  - S2: Moderate - Infrequent satellite effects
  - S3: Strong - Single-event upsets in satellites
  - S4: Severe - Elevated radiation for astronauts/aircraft
  - S5: Extreme - Unavoidable high radiation exposure
- G-scale (Geomagnetic Storms) G1-G5
  - G1: Minor - Weak power grid fluctuations, aurora at high latitudes
  - G2: Moderate - High-latitude power systems may have voltage alarms
  - G3: Strong - Voltage corrections needed, aurora seen at ~50° latitude
  - G4: Severe - Widespread voltage control problems, aurora at ~45° latitude
  - G5: Extreme - Possible grid collapse, aurora at ~40° latitude (Florida!)

**Aurora & Geomagnetic Effects:**
- Aurora borealis/australis formation
- Kp index and aurora visibility correlation
- Geomagnetic substorms
- Ground-induced currents (GICs)
- Impacts on power grids and pipelines

**Impacts on Technology & Society:**
- Satellite operations (drag, charging, SEUs)
- GPS/GNSS accuracy degradation
- HF radio communications blackouts
- Aviation radiation exposure at high latitudes/altitudes
- Power grid vulnerabilities
- Pipeline corrosion from GICs

**Space Weather Forecasting:**
- WSA-Enlil heliospheric model
- CME arrival time predictions
- Flare probability forecasts
- OVATION aurora model
- 27-day recurrence patterns

**Historical Space Weather Events:**
- Carrington Event (1859) - largest recorded geomagnetic storm
- March 1989 Quebec blackout - G5 storm collapsed power grid
- Halloween Storms (2003) - multiple X-class flares
- July 2012 near-miss CME - Carrington-class event missed Earth
- September 2017 X9.3 flare - strongest of Solar Cycle 24

**Observatories & Data Sources:**
- NOAA Space Weather Prediction Center (SWPC)
- NASA Solar Dynamics Observatory (SDO)
- SOHO (Solar and Heliospheric Observatory)
- STEREO (Solar Terrestrial Relations Observatory)
- ACE (Advanced Composition Explorer) at L1
- DSCOVR (Deep Space Climate Observatory) at L1
- GOES satellites (X-ray and particle sensors)

### 18.3 Example AI Interactions - Space Weather

**User:** "What's a CME and should I be worried about them?"

**AI:** "A Coronal Mass Ejection (CME) is a massive burst of solar plasma and magnetic field ejected from the Sun. Think of it like the Sun sneezing billions of tons of charged particles into space at millions of miles per hour.

Should you worry? For day-to-day life, rarely. Most CMEs miss Earth entirely, and our planet's magnetic field deflects most of what does arrive. However, strong Earth-directed CMEs can:

• Trigger beautiful aurora displays (the fun part!)
• Cause GPS accuracy issues for a few hours
• Affect HF radio communications
• In extreme cases, stress power grids

Currently, there are no Earth-directed CMEs forecast. I'll let you know if one is incoming - they typically take 1-3 days to reach Earth after leaving the Sun."

---

**User:** "Why is Bz important for space weather?"

**AI:** "Great question! Bz is the north-south component of the interplanetary magnetic field (IMF) carried by the solar wind.

Here's why it matters:

**Bz North (positive):** The solar wind's magnetic field aligns WITH Earth's field. Our magnetosphere stays closed like a shield. Result: Quiet conditions, minimal aurora.

**Bz South (negative):** The solar wind's field points OPPOSITE to Earth's field. This allows magnetic reconnection - essentially opening holes in our magnetic shield. Solar wind energy pours in, causing:
• Geomagnetic storms
• Intense aurora pushed to lower latitudes
• Increased radiation in the magnetosphere

Current Bz is -8.5 nT (southward) ⚠️, which means geomagnetic activity is elevated. Aurora chasers should be on alert!

Think of it like two magnets: opposite poles attract and connect, same poles repel and deflect."

---

**User:** "Will there be aurora visible tonight in Seattle?"

**AI:** "Let me check the current conditions for Seattle (47.6°N latitude):

**Current Space Weather:**
• Kp Index: 4 (Active)
• Aurora viewline forecast: 50°N
• Bz: -8.5 nT (favorable southward orientation)

**Verdict: Marginal chance tonight.**

With Kp 4, the aurora oval typically extends to about 50°N. Seattle at 47.6°N is just south of that line, so you'd need:
1. A clear northern horizon with no light pollution
2. The Kp to bump up to 5+ (good chance given current Bz)
3. To be watching around midnight when it's darkest

**My recommendation:** Check around 11 PM - 2 AM, look north, and use a camera with long exposure even if you don't see it with your eyes - cameras often capture aurora before our eyes can.

I'll update you if conditions improve! There's a G2 storm watch for tomorrow which could push aurora visibility even further south."

---

**User:** "Explain solar flare classifications"

**AI:** "Solar flares are classified by their X-ray brightness, measured by GOES satellites. Think of it like the Richter scale for solar explosions:

**A-class:** Barely detectable background levels
**B-class:** Minor brightening, no Earth effects
**C-class:** Small flares, minor radio noise
**M-class:** Medium flares - can cause brief radio blackouts
**X-class:** Major flares - significant radio blackouts, potential CMEs

**The number after the letter indicates intensity within that class:**
• M1 is the weakest M-class
• M9 is almost an X-class
• X1 is 10x stronger than M1
• X10 is 10x stronger than X1

**Current status:** X-ray flux is M2.4 class

This means there's an active M-class flare occurring. It may cause some HF radio degradation on Earth's sunlit side for about an hour. The real question is whether it produces a CME - I'll monitor and let you know!

**Fun fact:** The largest flare ever recorded was estimated at X45 during the 2003 Halloween storms. It saturated the sensors!"

---

**User:** "What caused the 1989 Quebec blackout?"

**AI:** "The March 1989 Quebec blackout is one of the most famous space weather disasters and a stark reminder of our vulnerability to solar storms.

**What happened:**

On March 13, 1989, a powerful G5 geomagnetic storm struck Earth following a massive CME. Within 92 seconds, the entire Hydro-Québec power grid collapsed, leaving 6 million people without electricity for 9 hours in freezing March weather.

**The chain of events:**

1. **March 10:** X4.5 solar flare erupts from the Sun
2. **March 12:** CME arrives at Earth, Kp hits 9 (maximum)
3. **March 13, 2:44 AM:** Geomagnetically induced currents (GICs) flow through power lines
4. **2:44:17 AM:** Five transmission lines trip from GIC-caused harmonics
5. **2:45:16 AM:** Entire grid collapses in 92 seconds

**Why Quebec specifically?**
• Built on igneous rock (poor electrical conductor)
• Long transmission lines act as antennas for GICs
• Single-point-of-failure grid design

**Lessons learned:**
• Power companies now monitor space weather
• Grid operators can reduce load during storms
• Capacitors and resistors added to block GICs
• NOAA provides 15-60 minute storm warnings

This was only a G5 storm. The 1859 Carrington Event was likely 10x stronger. If that happened today without preparation, damages could exceed $2 trillion. That's why space weather forecasting matters!"

### 18.4 AI System Prompt Addition for Space Weather

Add to AI system prompt:

```
You are the 16-Bit Weather AI assistant with comprehensive knowledge of both terrestrial and space weather.

SPACE WEATHER EXPERTISE:
You have deep knowledge of solar physics, space weather phenomena, and their impacts on Earth. You can explain:
- Solar activity (flares, CMEs, sunspots, solar cycles)
- Space weather measurements (Kp index, X-ray flux, solar wind, Bz)
- NOAA Space Weather Scales (R, S, G scales with all levels)
- Aurora forecasting and visibility
- Impacts on technology (satellites, GPS, power grids, radio)
- Historical space weather events
- Current conditions and forecasts

When discussing space weather:
- Use current real-time data when available
- Explain technical concepts in accessible terms
- Provide practical implications ("What does this mean for me?")
- Reference the SOLAR COMMAND TERMINAL (/space-weather) for visualizations
- Be enthusiastic about aurora opportunities!

Current space weather context will be injected with real-time data from NOAA SWPC and NASA.
```

---

## 19. AI Turbulence & Flight Weather Integration

The AI must provide comprehensive flight weather briefings including turbulence forecasts, route analysis, and destination weather.

### 19.1 Flight Query Detection

Detect flight-related queries using patterns:

```typescript
const flightQueryPatterns = [
  /flying (from|to)/i,
  /flight (from|to)/i,
  /turbulence .* (flight|flying|route)/i,
  /what('s| is) the (weather|turbulence) .* fly/i,
  /[A-Z]{3,4} to [A-Z]{3,4}/,  // Airport codes like "SFO to BUF"
  /should I (fly|expect turbulence)/i,
  /flight conditions/i,
  /aviation weather/i,
]
```

### 19.2 Flight Weather Context Injection

```typescript
interface FlightWeatherContext {
  route: {
    departure: {
      icao: string          // "KSFO"
      name: string          // "San Francisco International"
      weather: CurrentWeather
      metar?: string
    }
    arrival: {
      icao: string          // "KBUF"
      name: string          // "Buffalo Niagara International"
      weather: CurrentWeather
      forecast: WeatherForecast[]
      metar?: string
      taf?: string
    }
  }
  turbulence: {
    enroute: TurbulenceForecast[]
    sigmets: SIGMET[]
    airmets: AIRMET[]
    pireps: PIREP[]
  }
  jetStream: {
    position: string        // "FL350-FL400 over Rockies"
    speed: number           // knots
    crossingPoint?: string  // "Over Denver"
  }
  flightLevel: {
    recommended: string     // "FL350"
    avoid: string[]         // ["FL380-FL410 - moderate turbulence"]
  }
}
```

### 19.3 Turbulence Severity Guide for AI

The AI should explain turbulence in user-friendly terms:

| Severity | Pilot Report | Passenger Experience | AI Description |
|----------|--------------|---------------------|----------------|
| Light | Light | Coffee ripples, minor bumps | "You might notice some gentle bumps. Keep your seatbelt loosely fastened but you can move around." |
| Light-Moderate | Light-Mod | Drinks may spill, noticeable movement | "Expect some noticeable bumps. Flight attendants may pause service briefly." |
| Moderate | Moderate | Difficult to walk, items may shift | "Fasten your seatbelt snugly. Walking will be difficult. This is uncomfortable but not dangerous." |
| Moderate-Severe | Mod-Severe | Unsecured items tossed, strain against belt | "Keep your seatbelt tight. Flight attendants will be seated. Uncomfortable but the aircraft handles it fine." |
| Severe | Severe | Violent jolts, potential injuries if unsecured | "Rare and brief. Keep seatbelt fastened at ALL times. The aircraft is designed to handle this." |
| Extreme | Extreme | Aircraft may be momentarily out of control | "Extremely rare. Pilots actively avoid. You'll likely never experience this." |

### 19.4 Example AI Flight Briefing

**User:** "I am flying to Buffalo from SFO, what is the turbulence forecast and what is the weather"

**AI:** "Let me pull up a complete flight briefing for SFO → Buffalo (KBUF):

**✈️ ROUTE OVERVIEW**
San Francisco (SFO) → Buffalo (BUF)
Distance: ~2,500 miles | Typical flight time: ~5 hours

---

**🌤️ DEPARTURE - San Francisco (SFO)**
Current: 58°F, Partly Cloudy
Wind: W 12 mph
Visibility: 10 miles
Conditions: VFR - Good for departure

---

**🎯 DESTINATION - Buffalo (BUF)**
Current: 28°F, Light Snow
Wind: NW 18 mph, gusts to 25
Visibility: 4 miles in snow
Forecast: Snow continuing through evening, 2-4" expected
⚠️ Winter Weather Advisory in effect

---

**⚡ TURBULENCE FORECAST**

**Departure (CA coast):** Smooth
No significant turbulence expected.

**Mid-Route (Rockies - Colorado/Wyoming):**
⚠️ **Moderate turbulence** FL350-FL410
Jet stream crossing at 120kts over Denver area.
Most flights route through here - expect 15-20 minutes of bumps.

**Great Lakes Region (approach to BUF):**
🟡 **Light-Moderate chop** below FL250
Lake-effect convection and cold air advection.
Descent into Buffalo may be bumpy.

**Active SIGMETs along route:**
- SIGMET TANGO 2: Moderate turbulence, FL310-FL410, Rocky Mountain region

---

**🛫 MY RECOMMENDATION**

Overall: **Expect a mostly smooth flight with 20-30 minutes of moderate bumps over the Rockies and during descent.**

✅ Wear your seatbelt the entire flight (loosely when smooth)
✅ The turbulence is routine - uncomfortable but completely normal
✅ Descent into Buffalo will be choppy due to lake-effect weather
✅ Bring a good book - you'll be fine!

**For the weather in Buffalo:** Dress warm and expect delays if the snow picks up. Check your flight status closer to departure.

Want me to break down any part of this in more detail? I can also explain what causes turbulence over the Rockies if you're curious!"

---

**User:** "What about on Thursday instead?"

**AI:** "Let me check Thursday's forecast for your SFO → Buffalo route:

**Thursday Outlook:**

**Buffalo Weather:**
• High: 32°F, Low: 22°F
• Mostly cloudy, chance of flurries
• Much better than today's snow event!
• Winds lighter at 10-15 mph

**Turbulence Thursday:**
• Rockies: Light turbulence only (jet stream shifts north)
• Great Lakes: Smooth to light chop
• Overall: **Smoother flight than today**

**Verdict:** Thursday looks significantly better for your flight. Less turbulence, better weather in Buffalo, and lower chance of delays.

Would you like me to keep monitoring conditions and let you know if anything changes?"

### 19.5 AI API Route for Flight Weather

Create `app/api/ai/flight-weather/route.ts`:

```typescript
export async function POST(req: Request) {
  const { departure, arrival } = await req.json()
  
  // Fetch departure weather
  const departureWeather = await fetchAirportWeather(departure)
  
  // Fetch arrival weather + forecast
  const arrivalWeather = await fetchAirportWeather(arrival)
  const arrivalForecast = await fetchForecast(arrival)
  
  // Fetch turbulence data along route
  const routeTurbulence = await fetchRouteTurbulence(departure, arrival)
  
  // Fetch active SIGMETs/AIRMETs
  const sigmets = await fetchSIGMETs()
  const airmets = await fetchAIRMETs()
  
  // Filter for route-relevant alerts
  const relevantAlerts = filterAlertsForRoute(sigmets, airmets, departure, arrival)
  
  return NextResponse.json({
    departure: departureWeather,
    arrival: { current: arrivalWeather, forecast: arrivalForecast },
    turbulence: routeTurbulence,
    alerts: relevantAlerts,
  })
}
```

### 19.6 AI System Prompt Addition for Aviation

Add to AI system prompt:

```
AVIATION & TURBULENCE EXPERTISE:
You provide comprehensive flight weather briefings. When users mention flying or ask about flight conditions:

1. IDENTIFY the route (departure and arrival airports)
2. FETCH current weather at both airports
3. ANALYZE turbulence forecasts along the route
4. CHECK for SIGMETs, AIRMETs, and pilot reports
5. PROVIDE a friendly, reassuring briefing

When discussing turbulence:
- Explain in passenger-friendly terms (not pilot jargon)
- Reassure that turbulence is normal and aircraft handle it well
- Give practical advice (seatbelt, timing)
- Mention the cause (jet stream, mountains, convection) if educational
- Reference the FLIGHT CONDITIONS TERMINAL (/aviation) for maps

For flight anxiety:
- Be extra reassuring and factual
- Emphasize aircraft are designed for turbulence
- Explain what pilots do to minimize it
- Offer to explain the science if they're curious

Always structure flight briefings clearly:
- Departure conditions
- Arrival conditions + forecast
- En-route turbulence by segment
- Active alerts
- Your recommendation
```

---

## 20. Implementation Checklist - AI & News Updates

### News Feed Updates
- [ ] Add space weather news types to news schema
- [ ] Update `/api/news/route.ts` to fetch SWPC alerts
- [ ] Add filter tabs (All / Terrestrial / Space Weather)
- [ ] Add space weather icons and severity colors
- [ ] Test news feed with mixed content

### AI Space Weather Knowledge
- [ ] Update AI system prompt with space weather expertise
- [ ] Create `/api/ai/space-weather-context/route.ts`
- [ ] Inject real-time space weather data into AI context
- [ ] Add suggested prompts for space weather queries
- [ ] Test comprehensive Q&A scenarios

### AI Flight Weather Integration
- [ ] Create `/api/ai/flight-weather/route.ts`
- [ ] Implement airport code detection and parsing
- [ ] Fetch and merge weather + turbulence data
- [ ] Update AI system prompt with aviation expertise
- [ ] Add flight query detection patterns
- [ ] Test end-to-end flight briefing scenarios
- [ ] Add suggested prompts: "Check my flight conditions"

---

**END OF PRD**
