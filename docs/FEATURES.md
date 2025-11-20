# 16-Bit Weather Platform - Features Documentation

**Version:** 0.6.0
**Last Updated:** January 2025

---

## Overview

A professional weather application combining modern meteorological data with retro terminal aesthetics. Built with Next.js 15, React 19, and TypeScript, featuring comprehensive weather monitoring, interactive radar maps, and user authentication.

### Key Features

- **Real-time Weather Data**: Current conditions, hourly/daily forecasts, UV index, air quality, pollen counts
- **Interactive Radar**: NEXRAD radar with animation timeline
- **GFS Model Graphics**: Professional weather models and NHC tropical outlooks integrated into news feed
- **Multi-Source News**: Aggregated weather news from FOX Weather, NASA, Reddit, and NOAA
- **Games Arcade**: 6 retro games with leaderboards and score tracking
- **Learn Hub**: Educational content including cloud types, weather systems, and fun facts
- **Location Services**: GPS auto-detection, city search, ZIP code lookup
- **User Authentication**: Supabase-powered accounts with saved locations
- **Multi-Theme Support**: Dark, Miami, Tron themes
- **Progressive Web App**: Installable with offline capabilities
- **Global Coverage**: Weather data for locations worldwide

---

## 1. Weather Data Display

### Current Weather

**Metrics:**
- Temperature with "feels like" calculation
- Weather condition with icon
- Wind speed, direction, and gusts
- Humidity and visibility
- Atmospheric pressure
- Sunrise and sunset times
- Moon phase with illumination percentage

**Data Source:** OpenWeatherMap Current Weather API

### Environmental Data

#### UV Index
- Real-time solar radiation levels
- Safety recommendations (Low/Moderate/High/Very High/Extreme)
- Peak hours indication
- Sunscreen recommendations

**Data Source:** OpenWeatherMap UV Index API

#### Air Quality (AQI)
- Pollution levels (0-500 scale)
- Health advisories based on AQI level
- Pollutant breakdown (PM2.5, PM10, O3, NO2, SO2, CO)
- Sensitive group warnings

**Data Sources:**
- Primary: Google Air Quality API
- Fallback: OpenWeatherMap Air Pollution API

#### Pollen Count
- Tree pollen levels
- Grass pollen levels
- Weed pollen levels
- Allergy risk assessment

**Data Source:** Google Pollen API (optional)

### 5-Day Forecast

**Features:**
- Daily temperature ranges (high/low)
- Weather conditions and precipitation probability
- Expandable detailed view with hourly breakdown
- Wind speed and direction
- Humidity levels
- Date formatting: M.DD.YY

**Data Source:** OpenWeatherMap 5-Day Forecast API

---

## 2. Location Services

### Search Methods

**Supported Formats:**
- City name: "San Francisco"
- City with state: "Austin, TX"
- City with country: "Paris, France"
- ZIP/Postal codes: "94102"
- GPS coordinates: "37.7749, -122.4194"

### Auto-Detection

**Browser Geolocation:**
- High accuracy mode disabled for silent operation (no permission prompt)
- WiFi/IP triangulation for location
- 5-second timeout
- 5-minute cache duration

**IP-Based Fallback:**
Multiple services tried in sequence:
1. **ipapi.co** - First choice, most reliable
2. **ipinfo.io** - Fallback if ipapi.co fails
3. **ipgeolocation.io** - Last resort fallback

**Reverse Geocoding:**
- Nominatim (OpenStreetMap) API
- `zoom=18` for city-level precision
- Prioritizes: city → town → suburb → village → hamlet
- User-Agent header compliance

**Known Limitations:**
- Browser geolocation accuracy varies (WiFi triangulation, GPS, IP)
- WiFi-based location can be 1-5 miles off actual position
- ISP location may show regional hub city instead of actual city

### Location Memory

**Unauthenticated Users:**
- Last searched location saved to localStorage
- Automatic reload on page revisit

**Authenticated Users:**
- Save up to 10 locations
- Set default location
- Sync across devices via Supabase

---

## 3. User Authentication (Supabase)

### Authentication Features

**Sign Up:**
- Email/password authentication
- Password strength validation
- Email verification (optional)
- Automatic session creation

**Login:**
- Email/password credentials
- Session stored in httpOnly, secure cookies
- Automatic session refresh
- Remember me functionality

**Password Reset:**
- Email-based reset link
- Secure token generation
- Password strength validation on reset

**Session Management:**
- 1-hour session expiration (configurable)
- Automatic refresh via refresh token
- Logout clears all session data

### User Data

**Profiles:**
- Username, full name
- Avatar URL
- Email address

**Saved Locations:**
- Up to 10 locations per user
- City, state, country, coordinates
- Set default location
- Quick access from dashboard

**Preferences:**
- Theme selection (Dark/Miami/Tron)
- Unit system (Imperial/Metric)
- Default location
- Synced across devices

### Security

- Row-Level Security (RLS) on all user tables
- Password hashing with bcrypt
- JWT tokens for authentication
- CSRF protection
- SQL injection prevention

---

## 4. Interactive Weather Radar

### NEXRAD Radar

**Data Source:**
Iowa State University NEXRAD (Next-Generation Radar) archive

**Features:**
- Real-time precipitation data
- Base reflectivity layer
- 49-frame animation (4-hour window)
- 5-minute update intervals
- Timeline controls for playback
- Frame-by-frame navigation
- Location marker at searched coordinates

**Technology:**
- OpenLayers (ol) for map rendering
- WMS protocol for tile fetching
- Custom tile server: `/api/weather/iowa-nexrad-tiles`

### Map Features

**Controls:**
- Zoom and pan controls
- Play/pause animation
- Speed control (0.5x, 1x, 2x)
- Opacity slider for radar layer
- Full-screen mode

**Modes:**
- **Animation**: 49-frame loop showing precipitation movement
- **Static**: Single frame at current time
- **Interactive**: Pan, zoom, and explore

**Performance:**
- Lazy loading of radar tiles (only visible tiles loaded)
- Frame buffering (pre-load 3 frames ahead)
- Opacity fade for non-current frames
- Tile caching in browser

---

## 5. Theme System

### Available Themes

#### 1. Dark (Default)
- Background: `#0a0a0a`
- Text: `#e0e0e0`
- Accent: `#3b82f6` (blue)
- Professional, easy on eyes
- Optimal for night viewing

#### 2. Miami (Retro)
- Background: `#1a0f2e`
- Text: `#f0f0f0`
- Accent: `#ff006e` (neon pink)
- Synthwave/80s aesthetic
- Vibrant, energetic feel

#### 3. Tron (Sci-Fi)
- Background: `#000000`
- Text: `#00d9ff` (cyan)
- Accent: `#00d9ff`
- Futuristic grid lines
- High-contrast display

### Theme Features

**Persistence:**
- Unauthenticated users: localStorage
- Authenticated users: Supabase `user_preferences` table
- Synced across devices (authenticated only)

**Implementation:**
- CSS custom properties for theme variables
- Smooth transitions between themes
- System preference detection (optional)
- Instant theme switching (no page reload)

---

## 6. Dashboard (Authenticated Users)

### Features

**Location Management:**
- Grid view of all saved locations
- Weather summary cards for each location
- Add new locations (up to 10)
- Delete saved locations
- Set default location

**Quick Weather Details:**
- Current temperature and condition
- High/low for the day
- Precipitation probability
- Weather icon

**Theme Selector:**
- Preview all available themes
- Active theme indicator
- Instant switching

**Profile Access:**
- View profile information
- Update preferences
- Logout

---

## 7. Games System (New in v0.6.0)

### Features

**Games Arcade:**
- 6 retro-styled weather-themed games
- Authentic 16-bit experience
- Guest and authenticated play support

**High Score Tracking:**
- Persistent leaderboards per game
- Top 10 scores displayed
- Player name and score
- Timestamp of achievement

**Play Counter:**
- Track total plays per game
- User-specific play statistics (authenticated)
- Total plays across all users

**Score Submission:**
- Validation to prevent cheating
- Guest players can submit with name
- Authenticated users auto-tagged
- Real-time leaderboard updates

**Game Filtering:**
- By category (Puzzle, Action, Strategy)
- By difficulty (Easy, Medium, Hard)

### Database Schema

**Tables:**
- `games` - Game metadata and configuration
- `game_scores` - User high scores and rankings
- `user_game_stats` - Play counts and statistics
- `daily_challenges` - Daily challenge system (future)

**Key Files:**
- `lib/services/gamesService.ts` - Games data and scoring service
- `lib/types/games.ts` - TypeScript type definitions
- `components/games/` - GameCard, Leaderboard, ScoreSubmitModal

See [GAMES_SETUP.md](../GAMES_SETUP.md) for detailed setup instructions.

---

## 8. Multi-Source News Aggregation (New in v0.6.0)

### News Sources

#### NOAA GFS Models
- Weather model graphics updated 4x daily (00Z, 06Z, 12Z, 18Z)
- 7-day forecast outlook
- Temperature, precipitation, wind forecasts
- Special ModelCard display component

#### NASA Earth Observatory
- Satellite imagery and earth science articles
- Natural phenomena and climate events
- High-quality imagery

#### FOX Weather RSS
- Breaking weather news
- Severe weather alerts
- Storm coverage

#### Reddit
- Community weather discussions
- Subreddits: r/weather, r/tropicalweather
- User-submitted content

#### National Hurricane Center
- Tropical storm outlooks
- Hurricane forecasts and tracks
- Advisories and warnings

### Features

**Priority-Based Filtering:**
- High: Breaking news, severe weather alerts
- Medium: Regular weather news, forecasts
- Low: Educational content, fun facts

**Category-Based Filtering:**
- Breaking, Weather, Severe, Alerts
- Tropical, Climate, Science
- Models, Imagery

**Content Management:**
- Automatic deduplication
- Content ranking algorithm
- 5-minute response caching for performance
- News ticker for breaking updates

**Special Components:**
- **ModelCard** - GFS model graphics display
- **NewsCard** - Standard news article card
- **NewsHero** - Featured news section
- **NewsTicker** - Breaking news ticker

**Key Files:**
- `lib/services/newsAggregator.ts` - Multi-source aggregation engine
- `lib/services/gfsModelService.ts` - GFS model data fetching
- `lib/config/newsConfig.ts` - News source configuration
- `components/news/` - All news components

See [docs/GFS_MODEL_INTEGRATION.md](./GFS_MODEL_INTEGRATION.md) for GFS integration details.

---

## 9. Learn Hub (New in v0.6.0)

### Purpose

Central educational portal aggregating weather knowledge content.

### Content Sections

**Cloud Types Atlas:**
- 10 cloud formations
- Descriptions and characteristics
- When and where they form
- Associated weather patterns

**Weather Systems Database:**
- 12 weather phenomena
- Thunderstorms, tornadoes, hurricanes
- Formation processes
- Safety information

**Global Extremes Tracker:**
- Real-time hottest locations worldwide
- Real-time coldest locations worldwide
- Updated regularly
- Historical context

**16-Bit Takes (Fun Facts):**
- Weather trivia
- Interesting meteorological facts
- Did you know? style content
- Engaging and educational

**News Feed:**
- Educational weather articles
- Science and climate content
- Linked to main news aggregation

**Games Arcade:**
- Educational weather-themed games
- Learn while playing
- Linked to main games system

**Key Files:**
- `app/learn/page.tsx` - Learn hub page
- `components/learn/LearningCard.tsx` - Learning content cards

---

## 10. Hourly Forecast (New in v0.6.0)

### Features

**48-Hour Forecast:**
- Hourly breakdown for next 2 days
- Temperature, precipitation, wind, humidity
- Modern weather icons (Meteocons library)
- Visual temperature graphs

**Display Options:**
- Expandable hourly section in main weather card
- Dedicated `/hourly` page for full view
- Scroll through hours
- Quick reference

**Data Visualization:**
- Temperature trend line
- Precipitation probability bars
- Wind direction arrows
- Humidity percentage

**Key Files:**
- `app/hourly/page.tsx` - Dedicated hourly forecast page
- `components/hourly-forecast.tsx` - Hourly forecast component
- `components/lazy-hourly-forecast.tsx` - Lazy-loaded wrapper
- `components/modern-weather-icon.tsx` - Modern icon renderer

**API Endpoint:**
- Uses `/api/weather/onecall` with hourly data

---

## Feature Summary by User Type

### Unauthenticated Users Can:
- Search weather for any location
- View current weather and forecasts
- See UV index, AQI, pollen counts
- Use interactive radar map
- Read news articles
- Play games (with guest scores)
- Access learning content
- Switch themes (localStorage)

### Authenticated Users Additionally Get:
- Save up to 10 locations
- Dashboard with all saved locations
- Theme synced across devices
- Personalized game statistics
- Named high scores
- Profile management

---

**For more details:**
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [Components Library](./COMPONENTS.md)
- [GFS Model Integration](./GFS_MODEL_INTEGRATION.md)
- [Games Setup Guide](../GAMES_SETUP.md)
