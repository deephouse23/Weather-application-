# 16bitweather.co

A retro 16-bit weather education platform combining accurate meteorological data with nostalgic gaming aesthetics.

**Version 1.0.0** | [Live Site](https://www.16bitweather.co)

## About

16bitweather.co is a weather application that transforms environmental data into an immersive retro experience. Built with modern web technologies but designed with a 16-bit pixel art philosophy, it serves as both a functional weather tool and an educational hub for meteorology enthusiasts.

## Features

- **Real-Time Weather**: Current conditions, forecasts, AQI, pollen counts, and environmental metrics
- **Learn Hub**: Educational resources on cloud types, weather systems, and extreme phenomena
- **Interactive Radar**: Weather radar with multiple overlay options
- **Global Extremes**: Live tracking of the hottest and coldest places on Earth
- **Custom Themes**: 12 themes including Dark, Tron, Miami, Tokyo Night, Dracula, and more
- **Weather Arcade**: Interactive educational games with high score tracking
- **User Accounts**: Save favorite locations and preferences

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Language**: TypeScript
- **Database**: Supabase
- **APIs**: OpenWeatherMap
- **Testing**: Playwright
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- API keys for OpenWeatherMap and Supabase

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
| `npx playwright test` | Run end-to-end tests |

## Documentation

See the [docs](./docs) folder for detailed documentation:
- [API Reference](./docs/API_REFERENCE.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Testing Guide](./docs/TESTING_GUIDE.md)

## License

Licensed under the Fair Source License, Version 0.9.