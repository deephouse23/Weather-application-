# 16-Bit Weather: Lighthouse 90+ Performance Refactor PRD

## Project Overview

**Project Name:** Operation Lighthouse 90+  
**Application:** 16-Bit Weather (16bitweather.co)  
**Current Score:** 69 (Production)  
**Target Score:** 90+ across all Lighthouse categories  
**Priority:** High  
**Estimated Duration:** 2-3 weeks (phased approach)

---

## Executive Summary

This PRD outlines a **comprehensive refactoring initiative** to achieve Lighthouse scores of 90+ across Performance, Accessibility, Best Practices, and SEO. Based on analysis of current codebase and previous optimization attempts (46→69), reaching 90+ requires **architectural changes**, not just incremental optimizations.

### Current State (from lighthouse-report-prod-site.json)
- **Performance Score:** 69
- **FCP:** 3.0s (target: <1.8s)
- **LCP:** 5.1s (target: <2.5s)  
- **Speed Index:** 4.7s (target: <3.4s)
- **Total JS Bundle:** ~2.5MB uncompressed

### Why 90+ Requires Refactoring

Previous optimization phases improved score from 46→69 through:
- Sentry optimization (disabled Replay, tracing)
- Font migration to next/font
- Removed unused packages
- Console log removal in production

**But these weren't enough because:**
1. `home-client.tsx` is entirely client-rendered ("use client")
2. All weather data fetching happens client-side
3. OpenLayers map loads on initial render (not lazy)
4. No streaming/Suspense architecture
5. Heavy hydration costs from client-heavy architecture

---

## 1. Refactoring Requirements

### 1.1 CRITICAL: Map Lazy Loading with Intersection Observer

**Current Problem:**
- OpenLayers full bundle: ~400KB loads on page render
- Map loads even when user hasn't scrolled to it

**Required Refactor:**
Only load map when user scrolls to it:

```typescript
// components/maps/map-container.tsx
'use client'

import { useInView } from 'react-intersection-observer'
import dynamic from 'next/dynamic'
import { MapSkeleton } from '@/components/skeletons/map-skeleton'

const WeatherMapOpenLayers = dynamic(
  () => import('../weather-map-openlayers').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <MapSkeleton />
  }
)

interface MapContainerProps {
  latitude: number
  longitude: number
  locationName?: string
  displayMode?: 'widget' | 'full-page'
  className?: string
}

export function MapContainer({ 
  latitude, 
  longitude, 
  locationName,
  displayMode = 'widget',
  className 
}: MapContainerProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
    threshold: 0,
  })

  const height = displayMode === 'full-page' ? 'h-[600px]' : 'h-[400px]'

  return (
    <div 
      ref={ref} 
      className={`w-full ${height} ${className || ''}`}
      style={{ 
        contain: 'layout style paint',
        minHeight: displayMode === 'full-page' ? '600px' : '400px',
      }}
    >
      {inView ? (
        <WeatherMapOpenLayers 
          latitude={latitude} 
          longitude={longitude}
          locationName={locationName}
        />
      ) : (
        <MapSkeleton height={height} />
      )}
    </div>
  )
}

export default MapContainer
```

### 1.2 Create Map Skeleton (CLS Prevention)

```typescript
// components/skeletons/map-skeleton.tsx
import { cn } from '@/lib/utils'

interface MapSkeletonProps {
  height?: string
  className?: string
}

export function MapSkeleton({ 
  height = 'h-[400px]',
  className 
}: MapSkeletonProps) {
  return (
    <div 
      className={cn(
        'w-full rounded-lg border-2 border-dashed',
        'bg-muted/50 animate-pulse',
        'flex items-center justify-center',
        'font-mono text-muted-foreground',
        height,
        className
      )}
      style={{ minHeight: '400px' }}
      aria-label="Loading radar map"
    >
      <div className="text-center">
        <div className="text-4xl mb-2">📡</div>
        <div className="text-sm uppercase tracking-wider">Loading Radar...</div>
      </div>
    </div>
  )
}
```

### 1.3 Tree-Shake OpenLayers

Audit `components/weather-map-openlayers.tsx` and convert:

```typescript
// FIND AND REPLACE these patterns:

// BAD: import * as ol from 'ol'
// GOOD: import Map from 'ol/Map'

// BAD: import * as olLayer from 'ol/layer'  
// GOOD: import TileLayer from 'ol/layer/Tile'

// BAD: import { everything } from 'ol/source'
// GOOD: import XYZ from 'ol/source/XYZ'
```

---

## 2. Technology Change Recommendations

### 2.1 KEEP (No Change)
| Technology | Reason |
|------------|--------|
| Next.js 15 | Great SSR/streaming support |
| React 19 | Server Components, Suspense |
| TypeScript | Type safety |
| Tailwind CSS | Already optimized |
| Supabase Auth | Already optimized |
| Vercel | Best Next.js hosting |

### 2.2 MODIFY (Optimize Usage)
| Technology | Current Issue | Recommended Change |
|------------|---------------|-------------------|
| **OpenLayers** | Full bundle loaded | Tree-shake AND lazy load with intersection observer |
| **Sentry** | ~30KB, blocking | Lazy load after page interactive |
| **shadcn/ui** | Barrel imports | Direct component imports |
| **Fonts** | Partially optimized | Full next/font with preload |

### 2.3 ADD (New Technologies)
| Technology | Purpose | Install Command |
|------------|---------|-----------------|
| `react-intersection-observer` | Lazy load map on scroll | `npm install react-intersection-observer` |
| `web-vitals` | Monitor Core Web Vitals | `npm install web-vitals` |
| `@next/bundle-analyzer` | Track bundle size | `npm install -D @next/bundle-analyzer` |

---

## 3. Phase-by-Phase Implementation

### Phase 1: Setup (Do First)

```bash
npm install react-intersection-observer web-vitals
npm install -D @next/bundle-analyzer
```

Update `next.config.mjs`:
```javascript
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// ... rest of config

export default withBundleAnalyzer(nextConfig)
```

---

### Phase 2: Map Refactor (HIGHEST IMPACT - +15-25 points)

**Tasks:**
1. Create `components/skeletons/` directory
2. Create `components/skeletons/map-skeleton.tsx` (code above)
3. Create `components/maps/` directory  
4. Create `components/maps/map-container.tsx` (code above)
5. Tree-shake imports in `components/weather-map-openlayers.tsx`
6. Update `components/lazy-weather-map.tsx` to use MapContainer
7. Update `app/home-client.tsx` to use new MapContainer

**Update lazy-weather-map.tsx:**
```typescript
'use client'

import { MapContainer } from './maps/map-container'

interface LazyWeatherMapProps {
  latitude: number
  longitude: number
  locationName?: string
  theme?: string
  displayMode?: 'widget' | 'full-page'
}

export default function LazyWeatherMap(props: LazyWeatherMapProps) {
  return <MapContainer {...props} />
}
```

**Expected Impact:** Initial JS -300KB to -400KB, LCP -2 to -3 seconds

---

### Phase 3: Server Components Migration (+10-15 points)

**Create lib/weather-server.ts:**
```typescript
import 'server-only'

export async function fetchWeatherDataServer(
  lat?: number, 
  lon?: number,
  city?: string
) {
  try {
    const params = new URLSearchParams()
    if (lat && lon) {
      params.set('lat', lat.toString())
      params.set('lon', lon.toString())
    } else if (city) {
      params.set('city', city)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(
      `${baseUrl}/api/weather?${params}`,
      { next: { revalidate: 300 } }
    )

    if (!response.ok) return null
    return response.json()
  } catch (error) {
    console.error('Server weather fetch failed:', error)
    return null
  }
}
```

**Refactor app/page.tsx to Server Component:**
```typescript
import { Suspense } from 'react'
import { fetchWeatherDataServer } from '@/lib/weather-server'
import HomeClient from './home-client'
import { WeatherSkeleton } from '@/components/weather-skeleton'

export const revalidate = 300

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const city = typeof params.city === 'string' ? params.city : undefined
  
  // Fetch weather data on server
  const initialWeather = city ? await fetchWeatherDataServer(undefined, undefined, city) : null

  return (
    <Suspense fallback={<WeatherSkeleton />}>
      <HomeClient initialWeather={initialWeather} />
    </Suspense>
  )
}
```

---

### Phase 4: Bundle Optimization (+5-10 points)

**Tree-shake shadcn/ui imports:**
```typescript
// BEFORE (bad - may import entire library)
import { Button, Card, Input } from '@/components/ui'

// AFTER (good - direct imports)
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
```

**Configure webpack splitChunks in next.config.mjs:**
```javascript
const nextConfig = {
  // ... existing config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          openlayers: {
            test: /[\\/]node_modules[\\/](ol)[\\/]/,
            name: 'openlayers',
            chunks: 'all',
            priority: 30,
          },
          sentry: {
            test: /[\\/]node_modules[\\/](@sentry)[\\/]/,
            name: 'sentry',
            chunks: 'all',
            priority: 20,
          },
        },
      }
    }
    return config
  },
}
```

**Lazy load Sentry - create lib/sentry-lazy.ts:**
```typescript
let sentryInitialized = false

export async function initSentryLazy() {
  if (sentryInitialized || typeof window === 'undefined') return
  
  if (document.readyState !== 'complete') {
    await new Promise(resolve => window.addEventListener('load', resolve, { once: true }))
  }

  await new Promise(resolve => setTimeout(resolve, 2000))

  const Sentry = await import('@sentry/nextjs')
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  })
  
  sentryInitialized = true
}
```

---

### Phase 5: CLS & LCP Optimization (+3-5 points)

**Create comprehensive skeletons for all async content.**

**Optimize fonts in app/layout.tsx:**
```typescript
import { Inconsolata } from 'next/font/google'

const inconsolata = Inconsolata({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  preload: true,
  adjustFontFallback: true,
})
```

**Add preconnects in app/layout.tsx head:**
```typescript
<link rel="preconnect" href="https://api.openweathermap.org" />
<link rel="preconnect" href="https://tile.openstreetmap.org" />
<link rel="dns-prefetch" href="https://mrms.ncep.noaa.gov" />
```

---

### Phase 6: Accessibility, SEO & Best Practices

**Add metadata in app/layout.tsx:**
```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://16bitweather.co'),
  title: {
    default: '16-Bit Weather | Retro Weather App',
    template: '%s | 16-Bit Weather',
  },
  description: 'A retro-themed weather application with real-time radar, forecasts, and a nostalgic 16-bit terminal aesthetic.',
  keywords: ['weather', 'forecast', 'radar', 'retro', '16-bit', 'terminal'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://16bitweather.co',
    siteName: '16-Bit Weather',
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

**Add security headers in next.config.mjs:**
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    },
    {
      source: '/:all*(svg|jpg|jpeg|png|webp|avif|woff|woff2)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ]
}
```

---

## 4. File Change Manifest

### Files to CREATE
| File | Purpose |
|------|---------|
| `components/maps/map-container.tsx` | Intersection observer wrapper |
| `components/skeletons/map-skeleton.tsx` | Map loading placeholder |
| `lib/weather-server.ts` | Server-side data fetching |
| `lib/sentry-lazy.ts` | Lazy Sentry initialization |

### Files to MODIFY
| File | Changes |
|------|---------|
| `next.config.mjs` | Bundle analyzer, splitChunks, headers |
| `app/layout.tsx` | Font optimization, metadata, preconnects |
| `app/page.tsx` | Convert to Server Component with Suspense |
| `app/home-client.tsx` | Accept initialWeather prop |
| `components/weather-map-openlayers.tsx` | Tree-shake imports |
| `components/lazy-weather-map.tsx` | Use MapContainer |

---

## 5. Success Metrics

### Target Scores (All 90+)
| Category | Current | Target |
|----------|---------|--------|
| Performance | 69 | 90+ |
| Accessibility | TBD | 90+ |
| Best Practices | TBD | 90+ |
| SEO | TBD | 90+ |

### Target Core Web Vitals
| Metric | Current | Target |
|--------|---------|--------|
| LCP | 5.1s | < 2.5s |
| FCP | 3.0s | < 1.8s |
| CLS | ~0.03 | < 0.1 |
| TBT | ~700ms | < 200ms |

---

## 6. Testing Checklist

After each phase:
- [ ] `npm run build` passes
- [ ] `npm run lint` passes  
- [ ] Run Lighthouse and record score
- [ ] No visual regressions
- [ ] Auth still works
- [ ] Weather data loads correctly
- [ ] Map displays correctly when scrolled to

---

## 7. Quick Reference Commands

```bash
# Bundle analysis
ANALYZE=true npm run build

# On Windows PowerShell
$env:ANALYZE="true"; npm run build

# Lighthouse CLI
npx lighthouse https://16bitweather.co --view

# Check unused dependencies
npx depcheck

# Run local production build
npm run build && npm run start
```

---

**End of PRD**
