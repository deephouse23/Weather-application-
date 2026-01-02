# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

16-Bit Weather is a retro-styled weather education platform built with Next.js 15 (App Router) and React 19. It combines real-time weather data with 16-bit pixel art aesthetics, featuring educational content, interactive games, and global weather tracking.

## Common Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint

# Testing
npm test                 # Run Jest unit tests
npm run test:watch       # Jest in watch mode
npx playwright test      # Run all E2E tests (Chromium, Firefox, WebKit)
npx playwright test --project=chromium  # Single browser
npx playwright test tests/e2e/weather-app.spec.ts  # Single test file
```

## Architecture

### Next.js App Router Structure

- **`app/`** - Routes using Next.js 15 App Router conventions
  - Server Components by default, `"use client"` for interactivity
  - `api/` - API routes that proxy external services (keeps API keys server-side)
  - Dynamic routes: `weather/[city]`, `games/[slug]`, `gfs-model/[region]/[run]`

### Key Directories

- **`lib/`** - Core business logic
  - `weather-api.ts` - Main weather API client with caching and deduplication
  - `location-service.ts` - Geolocation with GPS, IP fallback, and reverse geocoding
  - `user-cache-service.ts` - Client-side caching (10-min weather TTL)
  - `supabase/` - Database client, auth, middleware, SQL schemas
  - `services/` - Domain services (games, news, GFS models, RSS parsing, AI chat)

- **`components/`** - React components
  - `ui/` - shadcn/ui primitives
  - `weather-map-openlayers.tsx` - NOAA MRMS radar with OpenLayers
  - `location-context.tsx` - Location state provider

- **`hooks/`** - Custom React hooks
  - `useAIChat.ts` - AI chat functionality
  - `useWeatherController.ts` - Weather data orchestration

### Data Flow

1. API keys are never exposed to client (no `NEXT_PUBLIC_` prefix on sensitive keys)
2. All external API calls go through `app/api/` routes
3. Weather data cached client-side via `user-cache-service.ts`
4. Auth state managed via Supabase with Row-Level Security

### External Services

- **OpenWeatherMap** - Weather data, forecasts, AQI
- **Supabase** - PostgreSQL database, authentication
- **NOAA MRMS** - High-resolution US radar via WMS (nowcoast.noaa.gov)
- **Sentry** - Error monitoring

### Context Providers

Three main contexts wrap the app in `app/layout.tsx`:
- `LocationContext` - Current location state
- `AuthContext` - Supabase auth session
- `ThemeContext` - 12 available themes with persistence

## Testing

E2E tests are in `tests/e2e/` using Playwright:
- `weather-app.spec.ts` - Core weather functionality
- `profile.spec.ts` - User profile features
- `radar.spec.ts` - NOAA MRMS radar tests
- `themes.spec.ts` - Theme switching

Playwright auto-starts dev server unless `PLAYWRIGHT_TEST_BASE_URL` is set.

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENWEATHER_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Code Patterns

- TypeScript strict mode
- Zod for form validation
- Tailwind CSS v4 with CSS custom properties for theming
- React Hook Form for forms
- Sonner for toast notifications
