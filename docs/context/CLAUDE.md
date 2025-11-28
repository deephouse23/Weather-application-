# 16-Bit Weather Platform - Claude Instructions

**Version:** 0.6.0 | **Live:** [16bitweather.co](https://www.16bitweather.co/) | **Last Updated:** January 2025

---

## Critical Instructions for Claude

### Branch Creation Protocol ⚠️

When the user requests to create a new branch, fix a bug, add a feature, or make a hotfix, you MUST:

1. **Ask the user** to describe what they want to do
2. **Suggest the appropriate branch name** following the convention:
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `hotfix/` - Urgent production fixes
   - `chore/` - Maintenance tasks
   - `refactor/` - Code refactoring
   - `docs/` - Documentation
   - `test/` - Testing
   - `perf/` - Performance

**Example Interaction:**
```
User: "Let's create a new branch to add hurricane tracking"
Assistant: "I'll help you create a new branch for hurricane tracking.
This sounds like a new feature, so I suggest:

Branch name: feature/add-hurricane-tracker

Does this work for you, or would you like a different name?"
```

**Always confirm the branch name before creating it.** Reference [WORKFLOW.md](./WORKFLOW.md) for complete naming conventions.

---

## Project Overview

A professional weather application combining modern meteorological data with retro terminal aesthetics.

### Tech Stack
- **Next.js 15** (App Router) + **React 19** + **TypeScript 5**
- **Supabase** (Auth + Database with Row-Level Security)
- **OpenWeatherMap API** (primary weather data source)
- **Tailwind CSS** + **Radix UI** (styling and components)
- **OpenLayers** (interactive radar maps)

### Key Architecture Rules

1. **Server Components by default** - Better performance and SEO
2. **API routes keep keys secure** - ALL external API calls go through `/api/*` routes (server-side only)
3. **Never expose `SUPABASE_SERVICE_ROLE_KEY` to client** - Server-side only, never use `NEXT_PUBLIC_` prefix
4. **Always use TodoWrite for multi-step tasks** - Critical for tracking progress

---

## Essential File Locations

### Core Services
- **Weather API client:** `lib/weather-api.ts`
- **Location service:** `lib/location-service.ts`
- **User cache:** `lib/user-cache-service.ts`

### Authentication
- **Auth context:** `lib/auth/auth-context.tsx`
- **Supabase client:** `lib/supabase/client.ts`
- **Middleware:** `middleware.ts` (protects routes)

### API Routes
- **Weather:** `app/api/weather/`
- **User data:** `app/api/locations/`, `app/api/user/preferences/`
- **News:** `app/api/news/`
- **Games:** `app/api/games/`

### Components
- **Weather:** `components/forecast.tsx`, `components/environmental-display.tsx`
- **Maps:** `components/weather-map-openlayers.tsx`
- **UI:** `components/ui/` (Radix UI primitives)

---

## Documentation Index

**Before making changes, always consult:**

### Architecture & Setup
- 📋 [**WORKFLOW.md**](./WORKFLOW.md) - Git workflow, branch naming conventions, PR process
- 🏗️ [**docs/ARCHITECTURE.md**](./docs/ARCHITECTURE.md) - Tech stack, folder structure, architectural decisions
- 🚀 [**docs/DEPLOYMENT.md**](./docs/DEPLOYMENT.md) - Environment setup, deployment guide, API keys

### Features & Implementation
- ✨ [**docs/FEATURES.md**](./docs/FEATURES.md) - Detailed feature documentation for all major features
- 🌐 [**docs/API_REFERENCE.md**](./docs/API_REFERENCE.md) - Complete API endpoint reference
- 🧩 [**docs/COMPONENTS.md**](./docs/COMPONENTS.md) - Component library and usage guide

### Specialized Systems
- 🎮 [**docs/GAMES_SETUP.md**](./docs/GAMES_SETUP.md) - Games system setup and database schema
- 📰 [**docs/GFS_MODEL_INTEGRATION.md**](./docs/GFS_MODEL_INTEGRATION.md) - GFS weather model integration
- 🔐 [**docs/OAUTH_SETUP.md**](./docs/OAUTH_SETUP.md) - OAuth authentication setup

### Testing & Troubleshooting
- 🧪 [**docs/TESTING_GUIDE.md**](./docs/TESTING_GUIDE.md) - Testing strategies and best practices
- 🔧 [**docs/TROUBLESHOOTING.md**](./docs/TROUBLESHOOTING.md) - Common issues and solutions

### Project Management
- 📦 [**releases/v0.6.0.md**](./releases/v0.6.0.md) - v0.6.0 release notes and changelog
- 🧹 [**docs/cleanup-plan.md**](./docs/cleanup-plan.md) - Repository maintenance guidelines

---

## Environment Variables

### Required
```env
OPENWEATHER_API_KEY=required          # Weather data
NEXT_PUBLIC_SUPABASE_URL=required     # Auth/DB
NEXT_PUBLIC_SUPABASE_ANON_KEY=required
SUPABASE_SERVICE_ROLE_KEY=required    # ⚠️ Server-side only!
```

### Optional
```env
GOOGLE_POLLEN_API_KEY=optional        # Enhanced pollen data
GOOGLE_AIR_QUALITY_API_KEY=optional   # Enhanced AQI data
```

**See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete setup instructions.**

---

## Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm start                # Start production server

# Testing
npm test                 # Run Jest tests
npx playwright test      # Run E2E tests

# Code Quality
npm run lint             # Run ESLint
npx tsc --noEmit         # Type checking
```

---

## Known Issues (Critical Only)

### 1. Sentry Error Monitoring - DISABLED ⚠️
- Returns 403 Forbidden errors
- Currently **disabled** in `.env.local`
- See [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md#7-sentry-error-monitoring---403-forbidden-disabled) for details

### 2. Location Detection Accuracy
- Browser geolocation may be inaccurate (uses WiFi/IP triangulation, not GPS)
- WiFi-based location can be 1-5 miles off actual position
- **This is expected behavior** - not a bug in our code
- **Workaround:** User can manually search for their city
- See [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md#3-location-detection-fails) for full details

### 3. Hydration Warnings (Development Only)
- `AuthDebug` component may show time mismatches
- **Development only** - no production impact
- Can be safely ignored or suppressed

**For all issues:** See [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

---

## Quick Reference

### Making Changes

1. **Read relevant docs first** - Check documentation index above
2. **Create branch** - Follow branch naming protocol (see top of this file)
3. **Use TodoWrite** - For multi-step tasks, always create a todo list
4. **Test changes** - Run `npm run build` and tests before committing
5. **Follow workflow** - See [WORKFLOW.md](./WORKFLOW.md) for PR process

### Code Style

- **TypeScript** - All new code must be TypeScript
- **Server Components** - Default to server components, use `"use client"` only when needed
- **API Security** - All external API calls through `/api/*` routes
- **Accessibility** - Use Radix UI components for accessibility
- **Responsive** - Mobile-first design with Tailwind

### Database Rules

- **Row-Level Security (RLS)** - All user tables must have RLS enabled
- **Never use service role key on client** - Only in API routes
- **Migrations** - SQL files in `lib/supabase/`

---

## Recent Major Features (v0.6.0)

- ✅ **Games System** - 6 retro games with leaderboards and score tracking
- ✅ **Multi-Source News** - FOX Weather, NASA, Reddit, GFS models, NHC integration
- ✅ **Learn Hub** - Educational portal for weather knowledge
- ✅ **Hourly Forecast** - 48-hour detailed forecast with modern icons

See [releases/v0.6.0.md](./releases/v0.6.0.md) for complete changelog.

---

## Getting Help

### For Development Questions:
1. Check [docs/](./docs/) folder for detailed documentation
2. Search [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for common issues
3. Review [WORKFLOW.md](./WORKFLOW.md) for process questions

### For Bugs:
1. Gather error logs and steps to reproduce
2. Check [Known Issues](#known-issues-critical-only) above
3. See [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for solutions

---

**This is your primary instruction file.** For detailed information on any topic, consult the documentation links above. The documentation is organized for quick access and optimal performance.

**Document Version:** 2.0 (Optimized)
**Maintained By:** Development Team
**For:** Claude AI Assistant & Development Reference
