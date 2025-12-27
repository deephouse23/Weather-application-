# Changelog

All notable changes to 16-Bit Weather are documented in this file.

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
