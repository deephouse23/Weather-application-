# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Active Feature Work

**Current PRD:** `docs/PRD-earth-sciences-chat.md`
- Expanding AI chat to cover meteorology, geology, volcanology, and seismology
- Integrating USGS earthquake API for real-time seismic data
- See PRD for detailed requirements and Ralph loop command

## Project Overview

16-Bit Weather is a retro-styled weather education platform built with Next.js 15 (App Router) and React 19. It combines real-time weather data with 16-bit pixel art aesthetics, featuring educational content, interactive games, and global weather tracking. Live at 16bitweather.co, deployed on Vercel.

## Common Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
npm run analyze          # Bundle analysis (ANALYZE=true build)

# Unit Testing (Jest)
npm test                 # Run all unit tests
npm test -- weather-utils.test.ts                    # Single test file
npm test -- --testNamePattern="should convert 0°C"   # Single test by name
npm run test:watch       # Jest in watch mode
npm run test:ci          # Jest for CI (sequential, --runInBand)

# E2E Testing (Playwright)
npx playwright test                                  # All E2E tests
npx playwright test --project=chromium               # Single browser
npx playwright test tests/e2e/weather-app.spec.ts    # Single test file

# PR Validation
npm run validate:pr      # Build + E2E + Lighthouse CI (runs on pre-push hook)
npm run lighthouse       # Lighthouse CI only
```

## Pre-Push Git Hook

A pre-push hook runs automatically before every `git push`:
1. Playwright E2E tests (Chromium)
2. Lighthouse CI (performance score >= 85)

Config: `.git/hooks/pre-push` and `lighthouserc.js`

## Architecture

### Next.js App Router Structure

- **`app/`** - Routes using Next.js 15 App Router conventions
  - Server Components by default, `"use client"` for interactivity
  - `api/` - API routes that proxy external services (keeps API keys server-side)
  - Dynamic routes: `weather/[city]`, `games/[slug]`, `gfs-model/[region]/[run]`

### API Route Groups

- **Weather**: `api/weather/{current,forecast,onecall,precipitation,air-quality,uv,geocoding}`
- **Aviation**: `api/aviation/{alerts,metar,pireps,flight-lookup,turbulence}`
- **Space Weather**: `api/space-weather/{kp-index,aurora,coronagraph,cme,flares,alerts,solar-wind,xray-flux,sunspots,scales}`
- **News**: `api/news/{aggregate,rss,fox,nasa,reddit}`
- **Games**: `api/games/{route,scores,play}`
- **AI Chat**: `api/chat` (uses Vercel AI SDK + `@ai-sdk/anthropic`)
- **Radar**: `api/weather/{noaa-wms,iowa-nexrad,radar}`

### Key Directories

- **`lib/`** - Core business logic
  - `weather-server.ts` - Server-side weather data fetching
  - `location-service.ts` - Geolocation with GPS, IP fallback, and reverse geocoding
  - `user-cache-service.ts` - Client-side caching (10-min weather TTL)
  - `theme-config.ts` - Theme definitions (12 themes with CSS custom properties)
  - `env-validation.ts` - Environment variable validation
  - `supabase/` - Database client, auth, middleware, SQL schemas
  - `services/` - Domain services (games, news, GFS models, RSS, AI chat, aviation, space weather, USGS earthquakes, volcanoes)
  - `weather/` - Weather data modules (current, forecast, geocoding, utils)
  - `validations/` - Zod validation schemas
  - `ai/` - AI utilities and configuration

- **`components/`** - React components
  - `ui/` - shadcn/ui primitives
  - `ai/` - AI chat interface (AIChat, QuickActions, SuggestedPrompts)
  - `dashboard/` - Dashboard cards, modals, theme selector
  - `aviation/` - Flight conditions terminal, turbulence map
  - `space-weather/` - Aurora forecast, Kp index, solar wind, coronagraph
  - `news/` - News grid, cards, filters
  - `games/` - Game cards, score submission
  - `terminal/` - Terminal-style UI components
  - `location-context.tsx` - Location state provider

- **`hooks/`** - Custom React hooks
  - `useAIChat.ts` - AI chat functionality
  - `useWeatherController.ts` - Weather data orchestration
  - `useNewsFeed.ts` - News feed data
  - `use-theme-preview.ts` - Theme preview

### Data Flow

1. API keys are never exposed to client (no `NEXT_PUBLIC_` prefix on sensitive keys)
2. All external API calls go through `app/api/` routes
3. Weather data cached client-side via `user-cache-service.ts`
4. Auth state managed via Supabase with Row-Level Security

### External Services

- **OpenWeatherMap** - Weather data, forecasts, AQI
- **Supabase** - PostgreSQL database, authentication
- **NOAA MRMS** - High-resolution US radar via WMS (nowcoast.noaa.gov)
- **Vercel AI SDK + Anthropic** - AI chat (`@ai-sdk/anthropic`)
- **USGS** - Earthquake data
- **NASA** - Space/climate data
- **Sentry** - Error monitoring
- **OpenLayers** - Map rendering (~400KB, code-split)

### Context Providers

Three main contexts wrap the app in `app/layout.tsx`:
- `LocationContext` - Current location state
- `AuthContext` - Supabase auth session
- `ThemeContext` - 12 available themes with persistence

### Path Aliases

`@/*` maps to project root (configured in `tsconfig.json`). Use `@/lib/`, `@/components/`, `@/hooks/`, etc.

## Testing

**Unit tests** in `__tests__/` with `.test.ts` suffix (Jest + jsdom).
**E2E tests** in `tests/e2e/` with `.spec.ts` suffix (Playwright).

Playwright config supports hybrid mode: local browsers for development, Kernel cloud browsers for CI. Auto-starts dev server locally unless `PLAYWRIGHT_TEST_BASE_URL` is set.

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
- Zod for form validation (schemas in `lib/validations/`)
- Tailwind CSS v4 with CSS custom properties for theming (`var(--bg)`, `var(--text)`, `var(--primary)`)
- `cn()` utility from `@/lib/utils` for conditional Tailwind classes
- React Hook Form for forms
- Sonner for toast notifications
- Prefer `type` imports: `import type { MyType } from './types'`
- API routes return JSON with consistent error format: `{ error: string }`
- Console logging: `console.error('[context]', error)` with context prefix
- Props interfaces named `{ComponentName}Props`

## Pull Requests

Use the GitHub CLI (`gh`). Always create descriptive titles. Never include emojis in PR descriptions.

## Workflow Orchestration

### Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First:** Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan:** Check in before starting implementation
3. **Track Progress:** Mark items complete as you go
4. **Explain Changes:** High-level summary at each step
5. **Document Results:** Add review section to `tasks/todo.md`
6. **Capture Lessons:** Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First:** Make every change as simple as possible. Impact minimal code.
- **No Laziness:** Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact:** Changes should only touch what's necessary. Avoid introducing bugs.
