# 16bitweather.co

Retro-styled weather education platform that pairs live environmental data with a pixel-influenced interface and structured learning paths.

**Version 1.600** | [Live Site](https://www.16bitweather.co)

## Version 1.600 highlights

This release expands earth-science coverage, fixes social sharing, and hardens the database layer.

- **Space weather redesign**: Tabbed dashboard with interactive Kp index, solar wind, and X-ray flux charts. ENLIL solar wind model viewer, coronal mass ejection tracker, and aurora forecast maps powered by NOAA SWPC and NASA SDO.
- **Social sharing overhaul**: Fixed blank OG preview images on X, Facebook, and LinkedIn. Reusable share buttons now appear on space weather, severe weather, radar, travel, tropical, aviation, and education pages with contextual share text and dynamic OG images.
- **SPC convective outlooks and travel corridors**: Severe weather page displays Storm Prediction Center Day 1-3 outlook maps. Travel weather page scores interstate corridor driving conditions with hazard maps and WPC daily outlooks.
- **Education hub overhaul**: Consolidated learning pages under one hub with expanded content for cloud types, weather systems, fun facts, extremes, and a glossary.
- **Supabase hardening**: RLS policies added to user_ai_memory, initplan performance fixes across 17+ policies, duplicate policy cleanup, and missing foreign key indexes.
- **Sentry noise reduction**: Geocoding 401 auth errors filtered out of Sentry in metadata generation, broadened to catch all OWM authentication failure patterns.

Earlier baseline features remain: real-time weather and forecasts, Learn Hub, radar, global extremes, themes, games, accounts, and aggregated news.

## About

The site targets learners and hobbyists who want accurate data without a generic weather app layout. Content mixes forecasts, education, games, and optional sign-in for saved locations and preferences.

## Features

- **Real-time weather**: Current conditions, forecasts, air quality, pollen, and related environmental metrics
- **Space weather**: Solar activity monitoring with Kp index, solar wind, aurora forecast, flare tracking, and ENLIL model visualization
- **Severe weather**: SPC convective outlook maps (Day 1-3) and active NWS alerts filtered by tornado, thunderstorm, wind, hail, and flood
- **Travel weather**: Interstate corridor driving conditions with hazard scoring and WPC daily outlook maps
- **Tropical tracker**: NHC 2-day and 7-day outlooks, Atlantic satellite imagery, and sea surface temperature analysis
- **Aviation weather**: SIGMETs, AIRMETs, turbulence maps, and real-time flight conditions in a terminal-style interface
- **Learn Hub**: Cloud types, weather systems, extreme phenomena, fun facts, and a weather glossary
- **Interactive radar**: Map-based NOAA MRMS radar with precipitation overlays
- **Global extremes**: Hot and cold location tracking with live data
- **Custom themes**: Twelve themes with persistence for signed-in users
- **Weather Arcade**: Educational games with score tracking
- **User accounts**: Saved locations and preferences via Supabase
- **AI assistant**: Tool-backed answers spanning meteorology, aviation conditions, seismic activity, and space weather
- **News and feeds**: Multi-source RSS including earth science and space categories
- **Social sharing**: Share buttons on every major page with dynamic OG preview images

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4, shadcn-style UI primitives
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL, Auth, RLS)
- **APIs**: OpenWeatherMap, NOAA SWPC, USGS, NASA, NHC, SPC, and other providers behind server routes
- **AI**: Anthropic via Vercel AI SDK
- **Monitoring**: Sentry error tracking
- **Testing**: Jest (unit), Playwright (E2E), Lighthouse CI (performance gate)
- **Deployment**: Vercel

## Getting started

### Prerequisites

- Node.js 20.9 or newer (required by Next.js 16)
- npm or pnpm
- API keys for OpenWeatherMap and Supabase, plus any optional keys you enable locally

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jelrod27/Weather-application-.git
   cd Weather-application-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENWEATHER_API_KEY=your_openweather_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   Open http://localhost:3000 in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm test` | Run Jest unit tests |
| `npm run test:ci` | Jest in CI mode |
| `npx playwright test` | Run end-to-end tests |
| `npm run validate:pr` | Build, Playwright, and Lighthouse gate |

## Documentation

The `docs` folder contains deeper references when present (API notes, architecture, deployment, testing).

## License

Licensed under the Fair Source License, Version 0.9.
