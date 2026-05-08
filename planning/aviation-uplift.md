# Aviation Uplift Plan

Status: shipped, 2026-05-07
Owner: justinelrod

## Why now

The aviation section ships behaviors that don't match what users expect:

- `app/api/aviation/flight-lookup/route.ts` returns **fake routes** for any flight number — ~40 hardcoded routes, then a deterministic-random fallback. No "demo" disclaimer in the UI.
- `app/api/aviation/turbulence/route.ts` generates **simulated GTG** with seeded random; comment admits it.
- All 5 aviation components hardcode colors (`text-red-500`, `#22c55e`) and skip the theme tokens used everywhere else.
- `components/aviation/TurbulenceMap.tsx` is 685 LOC with 25 hooks — the next change in there will hurt.
- Zero tests across `app/api/aviation/**` and `components/aviation/**`.

The retro-terminal aesthetic is good. The data and the plumbing aren't.

## Non-goals

- This is **not for operational flight planning** — disclaimer stays. The fix is making the educational/recreational use case honest, not turning into an EFB.
- Not redesigning the page IA. Terminal layout stays.
- Not touching `app/api/aviation/{alerts,metar,pireps}/route.ts` data sources — they hit real AWC/NOAA endpoints already.

## Phasing

Three lanes, ordered so each unblocks the next.

### Phase 1 — Honesty + theme + a11y pass (1 session, low risk)

Smallest blast radius, ships value immediately, doesn't depend on external API decisions.

- Add a visible "Demo data" badge to flight-lookup results until Phase 2 lands. One line in `FlightRouteLookup.tsx`.
- Migrate hardcoded colors to theme tokens across `AlertTicker`, `FlightConditionsTerminal`, `TurbulenceMap`, `FlightNumberInput`, `FlightRouteLookup`. Map severity → semantic CSS vars (`--danger`, `--warning`, `--success`) defined in `lib/theme-config.ts`. If those vars don't exist yet, add them once and reuse.
- Replace inline `style={{ height: '400px' }}` and inline `backgroundColor` in `TurbulenceMap.tsx` with Tailwind classes + responsive breakpoints. Stack the 4-col status grid on `<md`.
- Add aria labels and focus management on the PIREP popup, severity legends, and collapsible terminal sections. Target: ≥30 aria attributes across aviation surface.
- Show "Updated X min ago" timestamp on `AlertTicker` and `TurbulenceMap` legends.

Exit criteria: theme switcher visibly changes aviation colors; mobile viewport doesn't overflow; flight-lookup demo badge visible.

### Phase 2 — Real flight data (1–2 sessions, medium risk)

The lie is the worst thing on the page. Replace it.

**Provider choice (decide before starting):**
- **OpenSky Network** — free, no key for anonymous, rate-limited (~100/day anon, 4000/day registered). Live position + callsign, but flight-number → route mapping is awkward (callsigns aren't always IATA flight numbers).
- **AviationStack** — free tier 100/month, real flight schedules with route data. Easier mapping. Caps low.
- **FlightAware AeroAPI** — paid only, $0.005–0.02/req. Best data, but cost.

Recommendation: start with **OpenSky for live tracking** (where is flight X right now) + **AviationStack for schedule lookup** (route for flight X) on a server-side cache to stay under quota. Fall back to current mock with explicit "schedule unavailable" UI when both miss.

Implementation:
- New `lib/services/flight-lookup-service.ts` with provider abstraction (so we can swap later).
- Server-side cache via existing patterns (10-min TTL on schedules, 60s on positions).
- Env vars: `AVIATIONSTACK_API_KEY`, `OPENSKY_USERNAME`, `OPENSKY_PASSWORD`. Add to `lib/env-validation.ts`.
- Keep `MOCK_ROUTES` only as last-resort fallback, behind a `mock: true` flag in the response so the UI can label it.
- Tests: `__tests__/flight-lookup-service.test.ts` covering parsing, provider fallback chain, cache behavior. Mock provider responses with MSW or fetch mock.

Exit criteria: real flights resolve to real routes; rate-limit handling is graceful; mock fallback only fires when providers fail and is labeled in UI.

### Phase 3 — TurbulenceMap rewrite + real GTG (2–3 sessions, higher risk)

The big one. Don't start until Phase 1+2 ship.

**Data:**
- Real NOAA GTG isn't on a clean public REST endpoint. Two options:
  1. AWC G-AIRMET turbulence polygons (`aviationweather.gov/api/data/gairmet?type=turb`) — already structured GeoJSON-ish, covers CONUS, free.
  2. NOMADS GFS turbulence index — heavier (GRIB2), more accurate, more work.
- Recommendation: **G-AIRMET first**, leave GFS hook for later. PIREPs already work and complement G-AIRMETs nicely.

**Component split** (`TurbulenceMap.tsx` 685 → 4 files):
- `TurbulenceMap.tsx` — container, OpenLayers init, ~150 LOC.
- `useTurbulenceData.ts` — data fetching + caching hook.
- `TurbulenceLegend.tsx` — severity legend, theme-aware.
- `TurbulenceControls.tsx` — hours/altitude filter UI.
- Move the seeded-random simulator out of `app/api/aviation/turbulence/route.ts`; route now proxies AWC G-AIRMET + caches.

**Tests:**
- E2E in `tests/e2e/aviation.spec.ts` covering: page loads, alerts render, flight lookup with real flight (mocked at network layer), turbulence map mounts, theme switcher cascades.

Exit criteria: turbulence data is real; component is splittable without ceremony; one E2E spec green.

## Risk register

- **External API quotas** — both flight providers are tight. Mitigation: aggressive server-side cache, public `Cache-Control` headers, per-IP throttle if abuse shows up.
- **AWC G-AIRMET coverage gaps** — non-CONUS may have less data. UI must handle empty results gracefully (don't show empty map as "smooth skies").
- **Theme token migration could regress visuals** — Phase 1 should land behind a careful visual diff (Playwright screenshot per theme is overkill; manual check across 3 themes is enough).
- **OpenLayers split could break map init order** — keep the rewrite mechanical: extract, don't redesign behavior in the same PR.

## Decisions (locked 2026-05-07)

1. **Provider tier**: OpenSky (free) + AviationStack free tier. Mock fallback stays, labeled clearly when active. Revisit paid tier only if quota becomes a real problem.
2. **Demo mode**: persistent user-facing toggle. Survives Phase 2 — useful when providers are down or quota is hit, and for screenshots. Lives in the flight lookup UI; remembers preference in localStorage.
3. **Turbulence scope**: CONUS + AK/HI only via AWC G-AIRMET. Outside that region, UI shows "No coverage for this area" rather than an empty smooth-skies map. No GFS GRIB2 work in this plan.

## What's not in this plan

- Aviation chat/AI integration (separate effort if wanted).
- METAR/TAF parser hardening — regex in `metar/route.ts` is fragile but not currently failing. Park it.
- Airport detail pages. Different feature.

## What shipped (2026-05-07)

### Phase 1
- `app/globals.css` — universal `--severity-{light,moderate,severe,extreme}` tokens (with `*-bg` companions) in `:root`.
- `app/aviation/page.tsx` — error banner uses severity tokens; threads `alertsFetchedAt` so the alerts feed shows "Updated Xm ago".
- `components/aviation/{AlertTicker,FlightConditionsTerminal,FlightNumberInput,FlightRouteLookup,TurbulenceMap}.tsx` — severity colors via CSS vars, `bg-card`/`text-primary` instead of `bg-gray-900`/`text-cyan-500`, full aria treatment on collapsibles + map dialog + alerts ticker, mobile responsive (status grid stacks, map height `h-[300px] sm:h-[400px] md:h-[480px]`).
- `app/api/aviation/flight-lookup/route.ts` — `mock: true` flag added to all responses.

### Phase 2
- `lib/services/flight-lookup-service.ts` — provider abstraction (`AviationStackProvider` + `MockProvider`), in-process schedule cache (10m TTL), live position cache (60s TTL), OpenSky enrichment when ICAO callsign matches, `forceMock` option for the demo toggle.
- `app/api/aviation/flight-lookup/route.ts` — refactored to use the service. Honors `?mock=1` query param. Forced-mock responses are `Cache-Control: no-store`; live responses get `s-maxage=600, stale-while-revalidate=1200`.
- `lib/env-validation.ts` — `AVIATIONSTACK_API_KEY`, `OPENSKY_USERNAME`, `OPENSKY_PASSWORD` registered as optional.
- `__tests__/flight-lookup-service.test.ts` — 18 tests covering parsing, fallback chain (success/null/unavailable/throw/exhausted), schedule cache (hit + bypass), forceMock semantics, OpenSky parsing (match/no-match/HTTP failure), default-providers integration.
- `hooks/useDemoMode.ts` + `components/aviation/FlightNumberInput.tsx` — persistent user-facing toggle (`localStorage` + cross-tab + same-tab event sync) that forces mock data when on. Visible in the flight lookup section.

### Phase 3
- `app/api/aviation/turbulence/route.ts` — replaced simulated GTG with real AWC G-AIRMET fetch (`aviationweather.gov/api/data/gairmet?type=turb&format=json`). Defensive coordinate normalization handles polygon, multipolygon, and legacy flat-ring shapes. CONUS + AK/HI coverage labeled in response.
- `hooks/useTurbulenceData.ts` — extracted from TurbulenceMap. Owns dual-fetch (PIREPs + G-AIRMET), client cache, abort handling, 1-min time tick.
- `components/aviation/turbulence/{TurbulenceLegend,TurbulenceControls}.tsx` — split sub-components, theme-aware.
- `components/aviation/TurbulenceMap.tsx` — slimmed from 685 → ~380 LOC. Adds G-AIRMET polygon layer (zIndex 50, ≤6h forecast hours only) under the existing PIREP point layer (zIndex 100). Filters PIREP-only feature hits for the popup.
- `tests/e2e/aviation.spec.ts` — header/alerts render, demo badge appears for mock provider, OpenLayers viewport mounts, theme tokens cascade.

### Open follow-ups (deferred)
- Surface `livePosition` in the UI (route map, ETA-style indicator). Plumbing exists; just unused.
- E2E coverage of the demo-mode toggle (turning it on while a real provider is configured — currently we have no key in CI so this can't be exercised).
- Per-IP throttle on `/api/aviation/flight-lookup` if abuse shows up. Not needed yet.
