# Repository Guidelines

## Project Structure & Module Organization
- `app/` — Next.js App Router pages and API routes (e.g., `app/api/weather/...`).
- `components/` — Reusable React components (`*.tsx`; e.g., `components/weather-map.tsx`).
- `lib/` — Core utilities, services, and Supabase integration (`lib/supabase/*`, `lib/weather-api.ts`).
- `public/` — Static assets (icons, game HTML, images).
- `__tests__/` — Jest unit/component tests; additional tests colocated in component folders.
- `tests/` — Playwright end‑to‑end tests; config in `playwright.config.ts`.
- `scripts/` — One‑off maintenance/utility scripts.

## Build, Test, and Development Commands
- `npm run dev` — Start local dev server (http://localhost:3000).
- `npm run build` — Production build (Next.js).
- `npm start` — Run the built app.
- `npm run lint` — Lint with ESLint (Next core‑web‑vitals rules).
- `npm test` / `npm run test:watch` — Jest unit/component tests.
- `npx playwright install --with-deps` then `npx playwright test` — E2E tests.

## Coding Style & Naming Conventions
- Language: TypeScript (strict mode). Indentation: 2 spaces.
- Components: export `PascalCase` React components; filenames are generally kebab‑case (some feature folders use `PascalCase`).
- Imports: prefer `@/*` path alias over deep relative paths.
- Styling: Tailwind CSS + CSS Modules where needed. Keep class lists readable and grouped by purpose.
- Linting: fix issues surfaced by `npm run lint` before PRs.

## Testing Guidelines
- Unit/Component: Jest + Testing Library. File patterns: `**/?(*.)+(test|spec).[tj]s?(x)`.
- E2E: Playwright specs live in `tests/`; server is auto‑started by config.
- Add tests for new logic, edge cases, and critical UI flows.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits where possible (e.g., `feat:`, `fix:`, `chore:`). Keep subjects concise; reference issues (`#123`).
- PRs: include a clear summary, screenshots/GIFs for UI changes, testing notes, and any env/config changes. Keep scope focused and small.

## Security & Configuration Tips
- Create `.env.local` from `.env.example` or `env.example`. Common keys: `NEXT_PUBLIC_OPENWEATHER_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `lib/supabase/README.md`).
- Do not commit secrets. Sentry config is optional and must use env vars.
- When adding APIs under `app/api/*`, validate inputs and avoid leaking secrets to the client.

