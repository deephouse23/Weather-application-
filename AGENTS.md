# Agent Guidelines for 16-Bit Weather

This document provides guidelines for AI agents working on the 16-Bit Weather codebase.

## Project Overview

A retro-styled weather education platform built with Next.js 15 (App Router) and React 19. Features real-time weather data, pixel art aesthetics, educational content, interactive games, and global weather tracking.

## Build/Test/Lint Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server

# Testing
npm test                 # Run all Jest unit tests
npm test -- weather-utils.test.ts      # Run single test file
npm test -- --testNamePattern="should convert 0°C to 32°F"  # Run single test
npm run test:watch       # Jest in watch mode
npm run test:ci          # Jest for CI (sequential)
npx playwright test      # Run all E2E tests
npx playwright test tests/e2e/weather-app.spec.ts  # Run single E2E file
npx playwright test --project=chromium  # Single browser

# Linting
npm run lint             # ESLint

# PR Validation (runs automatically on push via git hook)
npm run validate:pr      # Build + Playwright tests + Lighthouse CI
npm run lighthouse       # Run Lighthouse CI manually
```

## Pre-Push Git Hook

A pre-push hook is configured to run automatically before every `git push`:

1. **Playwright E2E tests** - Must pass (Chromium browser)
2. **Lighthouse CI** - Performance score must be >= 85

The hook will:
- Start dev server if not running
- Run all E2E tests
- Build production version
- Run Lighthouse CI with assertions
- Block push if any check fails

**To bypass (not recommended):**
```bash
git push --no-verify
```

**Configuration files:**
- `.git/hooks/pre-push` - The hook script
- `lighthouserc.js` - Lighthouse CI configuration

## Code Style Guidelines

### TypeScript & Types
- Use TypeScript strict mode (configured in tsconfig.json)
- Define explicit return types for exported functions
- Use interfaces for object shapes, types for unions/complex types
- Prefer `type` imports: `import type { MyType } from './types'`

### Naming Conventions
- **Components**: PascalCase (e.g., `WeatherCard.tsx`)
- **Functions/Variables**: camelCase (e.g., `fetchWeatherData`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: PascalCase with descriptive names
- **Files**: kebab-case for utilities (e.g., `weather-utils.ts`)

### Imports Order
1. React imports
2. Next.js imports
3. Third-party libraries
4. Absolute imports (`@/lib/`, `@/components/`)
5. Relative imports (siblings)
6. Type-only imports last

### Component Patterns
- Server Components by default (Next.js App Router)
- Add `'use client'` only when needed (hooks, browser APIs, event handlers)
- Use React.forwardRef for components that accept refs
- Props interfaces named `{ComponentName}Props`

### Error Handling
- Use try/catch for async operations
- Use the `error-utils.ts` utilities for consistent error handling
- Never expose API keys to client (keep server-side in `app/api/`)
- Log errors with context: `console.error('[context]', error)`

### Styling (Tailwind)
- Use Tailwind CSS v4 with CSS custom properties for theming
- Use the `cn()` utility from `@/lib/utils` for conditional classes
- Use theme variables: `var(--bg)`, `var(--text)`, `var(--primary)`
- Mobile-first responsive design

### Form Handling
- Use React Hook Form for form state management
- Use Zod for form validation
- Use Sonner (`toast()`) for user notifications

### Testing Patterns
- Unit tests in `__tests__/` directory with `.test.ts` suffix
- E2E tests in `tests/e2e/` with `.spec.ts` suffix
- Use descriptive test names: `it('should convert 0°C to 32°F')`
- Group related tests with `describe()` blocks

### API Routes
- Place in `app/api/[route]/route.ts`
- Keep API keys server-side (never use `NEXT_PUBLIC_` prefix for sensitive keys)
- Use NextRequest/NextResponse from `next/server`
- Return JSON with consistent error format: `{ error: string }`

### Security
- Never commit `.env.local` or API keys
- Use Row-Level Security (RLS) for Supabase queries
- Validate user input with Zod schemas
- Use parameterized queries for database operations

## Architecture Quick Reference

- **app/**: Next.js App Router routes
- **components/**: React components (ui/ for shadcn primitives)
- **lib/**: Business logic, utilities, API clients
- **hooks/**: Custom React hooks (useAIChat, useWeatherController)
- **__tests__/**: Unit tests
- **tests/e2e/**: Playwright E2E tests

## Environment Setup

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENWEATHER_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## When Making Changes

1. Run `npm run lint` before committing
2. Run relevant tests: `npm test -- filename.test.ts`
3. For UI changes, test with `npm run dev`
4. Update tests when changing functionality
5. Follow existing file structure and naming patterns
6. Use existing utilities from `lib/utils.ts` and `lib/error-utils.ts`
