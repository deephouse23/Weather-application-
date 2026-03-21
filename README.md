# 16bitweather.co

Retro-styled weather education platform that pairs live environmental data with a pixel-influenced interface and structured learning paths.

**Version 1.512** | [Live Site](https://www.16bitweather.co)

## Version 1.512 highlights

Work in this line focused on earth-science depth, smarter assistance, durable preferences on the server, and more reliable automated testing.

- **AI tools**: The in-app assistant uses tool calling (Vercel AI SDK, Anthropic) so it can pull weather, aviation context, USGS earthquake summaries, and space weather when the question needs them, instead of prefetching large fixed bundles.
- **User AI memory**: Supabase holds per-user memory rows (notes and recent locations) for the assistant. Row level security keeps direct client access off; the app uses service-role API paths, and SQL RPCs cap how much text and how many locations accumulate.
- **Earth science in the feed layer**: RSS and news aggregation includes USGS earthquake and volcano alert sources alongside existing space and NASA-style channels.
- **USGS and volcanoes in services**: Server modules query USGS event APIs for nearby or significant quakes; volcano activity data is wired for dashboards and future assistant tools.
- **E2E stability**: Playwright runs use explicit profile controls, calmer navigation to `/profile`, theme handling when test mode is on, and weather cache restore rules so local Chromium runs align better with preview deployments.

Earlier baseline features remain: real-time weather and forecasts, Learn Hub, radar, global extremes, themes, games, accounts, and aggregated news.

## About

The site targets learners and hobbyists who want accurate data without a generic weather app layout. Content mixes forecasts, education, games, and optional sign-in for saved locations and preferences.

## Features

- **Real-time weather**: Current conditions, forecasts, air quality, pollen, and related environmental metrics
- **Learn Hub**: Cloud types, weather systems, and extreme phenomena
- **Interactive radar**: Map-based radar with overlay options
- **Global extremes**: Hot and cold location tracking
- **Custom themes**: Twelve themes with persistence for signed-in users and sensible behavior in test environments
- **Weather Arcade**: Educational games with score tracking
- **User accounts**: Saved locations and preferences via Supabase
- **AI assistant**: Tool-backed answers spanning meteorology, aviation conditions, seismic activity, and space weather where data is available
- **News and feeds**: Multi-source RSS including earth science and space categories

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4, shadcn-style UI primitives
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL, Auth, RLS)
- **APIs**: OpenWeatherMap, USGS, NASA and other integrated providers behind server routes
- **AI**: Anthropic via Vercel AI SDK
- **Testing**: Jest, Playwright
- **Deployment**: Vercel

## Getting started

### Prerequisites

- Node.js 20.9 or newer (required by Next.js 16)
- npm or pnpm
- API keys for OpenWeatherMap and Supabase, plus any optional keys you enable locally

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/deephouse23/Weather-application-.git
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
| `npm run validate:pr` | Build, Playwright, and Lighthouse gate (also used by hooks in some setups) |

## Documentation

The `docs` folder is the home for deeper references when present (API notes, architecture, deployment, testing). If a file is missing in your checkout, it may still be on the default branch or pending documentation passes.

## License

Licensed under the Fair Source License, Version 0.9.
