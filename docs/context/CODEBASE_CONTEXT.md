# 16-Bit Weather Platform - Codebase Context

## Project Overview
A retro-styled weather application combining modern meteorological data with 16-bit pixel art aesthetics.
**Version**: 0.6.2
**Tech Stack**: Next.js 15 (App Router), React 19, TypeScript 5, Supabase, Tailwind CSS, Radix UI.

## Architecture
- **Framework**: Next.js 15 App Router.
- **Rendering**: Server Components by default. Client components used for interactivity (maps, games, UI toggles).
- **Styling**: Tailwind CSS with a custom theme system (`themes.css`, `theme-enforcement.css`).
- **State Management**: React Context (`auth-context`, `location-context`) and URL state.
- **Data Fetching**: 
  - Server-side: Direct API calls in Server Components.
  - Client-side: Via `/api/*` proxy routes to hide secrets.
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS).

## Key Directories
- `app/`: Next.js routes and API endpoints.
  - `api/`: Proxy endpoints for external APIs (Weather, News, etc.).
- `components/`: Reusable UI components.
  - `ui/`: Radix UI primitives.
  - `weather/`: Weather-specific displays.
  - `games/`: Interactive game components.
- `lib/`: Core logic and utilities.
  - `weather-api.ts`: OpenWeatherMap integration.
  - `supabase/`: Database clients.
  - `auth/`: Authentication logic.
- `public/`: Static assets (pixel art icons, sounds).

## Core Features
1. **Weather Dashboard**: Current, hourly, and 7-day forecasts.
2. **Interactive Maps**: OpenLayers integration for radar and precipitation.
3. **Games**: Retro-style browser games (Snake, etc.) with leaderboards.
4. **News & Education**: Aggregated weather news and learning resources.
5. **User System**: Profiles, saved locations, and preferences via Supabase.

## Development Guidelines
- **Types**: Strict TypeScript usage.
- **Components**: Prefer Server Components. Use `use client` only when necessary.
- **Security**: 
  - Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
  - All external API calls must go through `app/api/` routes.
- **Testing**: Jest for unit tests, Playwright for E2E.

## Critical Files
- `middleware.ts`: Route protection and auth checks.
- `lib/weather-api.ts`: Weather data fetching logic.
- `components/weather-map-openlayers.tsx`: Complex map component.
- `app/page.tsx`: Main entry point/dashboard.

## Known Issues / Constraints
- **Geolocation**: Browser-based location can be inaccurate (IP-based).
- **Sentry**: Currently disabled due to 403 errors.
- **Hydration**: Minor warnings in dev mode (AuthDebug).
