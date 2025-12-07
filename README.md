# 16bitweather.co

A retro 16-bit weather education platform combining accurate meteorological data with nostalgic gaming aesthetics.

## About

16bitweather.co is a unique weather application that transforms standard environmental data into an immersive retro experience. Built with modern web technologies but designed with a strict 16-bit pixel art philosophy, it serves as both a functional weather tool and an educational hub for meteorology enthusiasts.

## Features

- **Real-Time Weather**: Accurate current conditions, forecasts, and environmental metrics.
- **Learn Hub**: Comprehensive educational resources on cloud types, weather systems, and extreme phenomena.
- **Interactive Maps**: Retro-styled radar and forecast models.
- **Global Extremes**: Live tracking of the hottest and coldest places on Earth.
- **Custom Themes**: Multiple 16-bit inspired themes (Standard, Tron, Miami, etc.).
- **Weather Arcade**: Interactive educational games.

## Recent Updates (December 2025)

- **UI Overhaul**: Migrated to shadcn/ui components for cleaner, consistent, and accessible interfaces while maintaining the retro aesthetic.
- **Content Enrichment**: Significantly expanded the "Learn" section with scientific depth, etymologies, and historical context for all weather topics.
- **Performance**: Optimized load times and interaction responsiveness.
- **Security**: Implemented GitHub Actions for automated security scanning.
- **Clean Codebase**: Removed stale testing artifacts and archived legacy planning documentation for a leaner repository.

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Language**: TypeScript
- **State/Data**: Supabase, OpenWeatherMap API
- **Testing**: Playwright
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Valid API keys for OpenWeatherMap and Supabase

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
   Create a `.env.local` file in the root directory and add the required keys (see `env.example`).

4. Run the development server:
   ```bash
   npm run dev
   ```

   Open http://localhost:3000 in your browser.

### Environment Variables

Required variables include:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENWEATHER_API_KEY`
- `NEXT_PUBLIC_BASE_URL`

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm test`: Run Jest unit tests (legacy)
- `npx playwright test`: Run end-to-end tests

## License

Licensed under the Fair Source License, Version 0.9.