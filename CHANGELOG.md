# Changelog

All notable changes to 16-Bit Weather are documented in this file.

## [1.0.1] - 2026-03-12

### Codebase Cleanup

Comprehensive audit and cleanup pass removing dead code, consolidating duplicate types, and fixing import hygiene.

#### Removed
- **Dead components**: `modern-weather-icon.tsx`, `weather-search-enhanced.tsx` (zero imports)
- **Dead hooks**: `lib/hooks.ts` — 5 unused hooks (`useDebounce`, `useMemoizedCalculation`, `useLazyComponent`, `useOfflineDetection`, `useRetry`)
- **Deprecated shim**: `lib/weather-api.ts` — consumers migrated to `@/lib/weather`
- **Stale files**: `app/error.tsx.backup`, `.eslintrc.json` (empty), `.env.local.example` (redundant), `DELETION_MANIFEST.md` (root copy), `PiHole.txt`
- **Unused dependency**: `sonner` (toast system uses Radix, not Sonner)

#### Changed
- **Hooks consolidated**: Moved `useNewsFeed.ts` and `use-theme-preview.ts` from `lib/hooks/` to `hooks/`
- **`AviationAlert` type**: Consolidated 3 definitions → single source in `lib/services/aviation-service.ts`
- **`GeocodingResponse` type**: Removed duplicates from 2 API routes → import from `lib/weather`
- **`ForecastDay` type**: Removed duplicates from 3 components → centralized in `lib/types.ts`
- **`LocationTemperature` type**: Removed duplicate from API route → import from `lib/extremes/extremes-data`
- **`NEWS_API_KEY`**: Removed `NEXT_PUBLIC_NEWS_API_KEY` client-side check (redundant; API route handles missing keys)
- **`.env.example`**: Added missing vars (`CRON_SECRET`, `NASA_API_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `SUPABASE_SERVICE_ROLE_KEY`)

---

## [1.0.0] - 2025-12-27

### Release Highlights
Official 1.0 release of the 16-Bit Weather Platform.

### Features
- **Real-Time Weather Data**: Temperature, conditions, wind, humidity, pressure, UV index, AQI, and pollen counts
- **5-Day Forecast**: Extended forecasts with detailed daily breakdowns
- **Hourly Forecast**: Hour-by-hour weather predictions
- **Interactive Radar**: OpenLayers-based weather radar with precipitation overlays
- **Global Extremes**: Live tracking of Earth's hottest and coldest locations
- **Learn Hub**: Educational content on cloud types, weather systems, and extreme phenomena
- **Weather Arcade**: Retro-styled educational games with Supabase-backed high scores
- **News Aggregation**: Weather-related news from multiple RSS sources
- **User Authentication**: Supabase Auth with saved locations and preferences
- **12 Themes**: Dark, Miami, Tron, Tokyo Night, Dracula, Cyberpunk, Matrix, Synthwave '84, and more

### Technical
- Next.js 15 with React 19
- Tailwind CSS v4 with shadcn/ui components
- TypeScript throughout
- Playwright end-to-end testing
- Sentry error monitoring
- Vercel Analytics and Speed Insights

---

## [0.6.x] - December 2025

### Added
- Premium theme system with 12 total themes
- Theme-aware AQI and Pollen display cards
- RSS feed aggregation for weather news

### Changed
- Migrated UI components to shadcn/ui
- Updated radar navigation URL from /map to /radar
- Improved theme consistency across all components

### Fixed
- AQI and Pollen card border colors now match selected theme
- Card background colors use theme secondary colors for consistency

---

## [0.5.x] - December 2025

### Added
- User preferences service
- Theme persistence across sessions
- Enhanced theme selector with grid layout

### Changed
- Refactored theme provider architecture
- Improved authentication flow

---

## [0.3.x] - November-December 2025

### Added
- Initial weather dashboard
- OpenWeatherMap API integration
- Supabase authentication
- Basic theme support (Dark, Miami, Tron)
- Cloud types educational content
- Weather extremes tracking
- Interactive games (Snake, Pong, etc.)
- Playwright test suite

### Changed
- Multiple UI iterations
- Performance optimizations
- Security hardening

---

## [0.1.x - 0.2.x] - October-November 2025

### Added
- Initial project setup
- Next.js foundation
- Basic weather search functionality
