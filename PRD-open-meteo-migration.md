# PRD: Migrate Primary Weather Data Source from OpenWeatherMap to Open-Meteo

**Version:** 1.0
**Date:** 2026-03-25
**Author:** Justin Elrod / Claude Analysis
**Project:** 16-Bit Weather (16bitweather.co)
**Branch:** `feat/open-meteo-migration`
**Priority:** High
**Lighthouse Gate:** Performance score must remain >= 90 on mobile and desktop after all changes

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Motivation and Rationale](#2-motivation-and-rationale)
3. [Current State Audit](#3-current-state-audit)
4. [Target Architecture](#4-target-architecture)
5. [Migration Scope Matrix](#5-migration-scope-matrix)
6. [API Reference and Endpoint Mapping](#6-api-reference-and-endpoint-mapping)
7. [Implementation Phases](#7-implementation-phases)
8. [Bug Fixes Bundled With Migration](#8-bug-fixes-bundled-with-migration)
9. [New Feature Enhancements](#9-new-feature-enhancements)
10. [Testing Strategy](#10-testing-strategy)
11. [Rollback Plan](#11-rollback-plan)
12. [Quality Gates](#12-quality-gates)
13. [Claude CLI Execution Prompt](#13-claude-cli-execution-prompt)

---

## 1. Executive Summary

Replace OpenWeatherMap as the primary weather data provider with Open-Meteo across all applicable dashboard widgets, forecast cards, and AI assistant context. Open-Meteo provides a free, keyless, CC BY 4.0 licensed API with richer data coverage, sub-10ms response times, and up to 16-day forecasts. This migration eliminates the OPENWEATHER_API_KEY dependency for approximately 80 percent of dashboard data, reduces API cost risk to zero, and unlocks new weather variables that enhance the AI assistant and user experience.

Data sources that remain unchanged: IEM/NEXRAD for radar, current pollen provider for US species-level data, and client-side or existing moon phase calculation.

---

## 2. Motivation and Rationale

### Why migrate

- **Free APIs only constraint.** Open-Meteo free tier provides 10,000 calls per day and 300,000 per month with no API key, no credit card, and no overage risk. OpenWeather 3.0 free tier is 1,000 calls per day and requires billing info with overage charges at 0.14 EUR per 100 calls.
- **Richer data.** Open-Meteo exposes CAPE, lifted index, pressure-level winds, solar radiation variables, snow depth, freezing level height, precipitation probability, visibility, and multi-altitude wind. OpenWeather does not expose most of these in its free tier.
- **Performance.** Open-Meteo response times are typically under 10ms. Modular endpoints let us fetch only what each page needs, supporting the Lighthouse 90+ target by reducing payload size.
- **No key management.** Eliminates env var exposure risk and simplifies server-side fetching in Next.js.
- **Attribution model.** CC BY 4.0 requires only a footer credit line.

### Why NOT migrate (keep existing sources)

- **Radar.** Open-Meteo has no radar tile service. Keep IEM/NEXRAD LIVE NEXRAD RADAR as-is.
- **Pollen (US species).** Open-Meteo pollen data covers only Europe during pollen season with limited species (Alder, Birch, Grass, Mugwort, Olive, Ragweed). Current US breakdown includes Maple, Elm, Cottonwood, Ash, Pine, Oak, Juniper. Keep current pollen source.
- **Moon phase.** Open-Meteo has no lunar data. Keep current source or move to deterministic client-side calculation.
- **NWS Alerts.** Open-Meteo does not include government weather alerts. If needed, pull from api.weather.gov directly.
- **Geocoding.** Explicitly out of scope for this migration. OpenWeatherMap geocoding is working, well-tested, and migrating it adds risk with zero user-facing benefit. Keep as-is.

### Migration scope decisions (2026-03-25)

- **Dashboard weather cards** (`/api/dashboard-weather`): MIGRATE. Uses OpenWeatherMap for saved location cards. Must use the same Open-Meteo service layer to avoid two sources returning different numbers for the same location.
- **Precipitation card** (`/api/weather/precipitation-history`): MIGRATE. Confirmed to use OpenWeatherMap One Call 3.0 Day Summary API and 2.5 Weather API, not MRMS/NOAA.
- **AQI**: MIGRATE. Replace both Google Air Quality API and OpenWeatherMap Air Pollution with Open-Meteo as the sole AQI source. Eliminates two API key dependencies.
- **Optional enhancements** (dewpoint, cloud cover, CAPE, solar radiation): DEFERRED to a separate PR after migration lands. Exception: precipitation probability on forecast cards stays in Phase 3 since it's one additional field from data already being fetched.

---

## 3. Current State Audit

### Dashboard widgets visible on main page (from screenshots)

| Widget | Current Data Points | Current Source |
|--------|-------------------|----------------|
| 5-Day Forecast Cards | High/low temp, weather condition text, weather icon, date | OpenWeatherMap |
| Live NEXRAD Radar | Radar reflectivity tiles, 4hr history, playback controls, layers | IEM Iowa State Mesonet NEXRAD |
| Air Quality | AQI composite score, status label, EPA scale bar | OpenWeatherMap or third-party |
| Moon Phase | Phase name, illumination percent, moonset time, next full moon | Unknown - investigate |
| UV Index | UV value, severity label | OpenWeatherMap |
| Feels Like | Apparent temperature, delta from actual | OpenWeatherMap |
| Sun Times | Sunrise, sunset | OpenWeatherMap |
| Humidity | Relative humidity percent, severity label | OpenWeatherMap |
| Pressure | Sea level pressure in inHg, severity label | OpenWeatherMap |
| Wind | Speed mph, direction, gust label | OpenWeatherMap |
| Precipitation | 24h total in inches | OpenWeatherMap |
| Visibility | Distance in miles | OpenWeatherMap |
| Pollen | Tree species breakdown, grass, weed | Third-party pollen API |
| Weather by City | Quick links to 10 shuffled cities | Internal routing |

### Environment variables to audit

- `OPENWEATHER_API_KEY` - Primary target for removal or demotion to fallback-only
- Any other weather API keys in `.env.local` or `.env.example`

---

## 4. Target Architecture

### Data flow after migration

```
Dashboard Request
    |
    +---> Open-Meteo Forecast API (primary weather data)
    |       - Current conditions
    |       - Hourly forecast
    |       - Daily forecast (7-day default, up to 16)
    |       - UV index, apparent temp, sunrise/sunset
    |       - Humidity, pressure, wind, precipitation, visibility
    |       - CAPE, dewpoint, cloud cover, snow depth (new)
    |
    +---> Open-Meteo Air Quality API (AQI + pollutants)
    |       - US EPA AQI composite
    |       - PM2.5, PM10, O3, NO2, SO2, CO
    |       - Dust, aerosol optical depth
    |
    +---> IEM/NEXRAD (radar - unchanged)
    |       - NEXRAD base reflectivity tiles
    |       - WMS tile layer on Leaflet map
    |
    +---> Current Pollen Source (unchanged)
    |       - US species-level tree, grass, weed
    |
    +---> Moon Phase (unchanged or client-side calc)
    |
    +---> api.weather.gov (NWS alerts - if applicable)
    |
    +---> NOAA SWPC / NASA SDO (space weather - unchanged)
    |
    +---> NOAA PIREP/SIGMET/AIRMET (aviation - unchanged)
```

### Server-side data fetching pattern

All Open-Meteo calls should be made server-side in Next.js API routes or Server Components. No API key is needed but server-side fetching avoids CORS issues and enables response caching.

Recommended caching strategy:
- Current conditions: revalidate every 15 minutes (Open-Meteo updates hourly for high-res models)
- Daily forecast: revalidate every 60 minutes
- Air quality: revalidate every 60 minutes
- Use Next.js `fetch` with `next: { revalidate: N }` or Route Handler caching

---

## 5. Migration Scope Matrix

### MIGRATE to Open-Meteo

| Widget | Open-Meteo Endpoint | Key Variables | Notes |
|--------|---------------------|---------------|-------|
| Current Temperature | `/v1/forecast` current | `temperature_2m` | |
| Feels Like | `/v1/forecast` current | `apparent_temperature` | Fix floating point display bug |
| Humidity | `/v1/forecast` current | `relative_humidity_2m` | |
| Pressure | `/v1/forecast` current | `surface_pressure` or `pressure_msl` | Convert hPa to inHg client-side: `hPa * 0.02953` |
| Wind | `/v1/forecast` current | `wind_speed_10m`, `wind_direction_10m`, `wind_gusts_10m` | Convert km/h to mph if needed |
| Precipitation | `/v1/forecast` hourly | `precipitation` | Sum last 24 hours for 24h total |
| Visibility | `/v1/forecast` hourly | `visibility` | Convert meters to miles: `m * 0.000621371` |
| UV Index | `/v1/forecast` current or hourly | `uv_index` | Also available: `uv_index_clear_sky` |
| Sun Times | `/v1/forecast` daily | `sunrise`, `sunset` | ISO 8601 format |
| 5-Day Forecast | `/v1/forecast` daily | `temperature_2m_max`, `temperature_2m_min`, `weather_code`, `precipitation_probability_max` | Extend to 7-day |
| Weather Code to Icon | `/v1/forecast` | `weather_code` (WMO code) | Need mapping function WMO code to your icon set |
| Air Quality | `/v1/air-quality` current + hourly | `us_aqi`, `pm2_5`, `pm10`, `ozone`, `nitrogen_dioxide`, `sulphur_dioxide`, `carbon_monoxide` | Richer than current AQI |

### KEEP on current source (DO NOT MIGRATE)

| Widget | Current Source | Reason |
|--------|---------------|--------|
| Live NEXRAD Radar | IEM Iowa State Mesonet | Open-Meteo has no radar tile service |
| Pollen (US species) | Current pollen provider | Open-Meteo pollen is Europe-only with limited species |
| Moon Phase | Current source or client calc | Open-Meteo has no lunar data |
| Space Weather | NOAA SWPC / NASA SDO/SOHO | Specialized domain not covered by Open-Meteo |
| Aviation (PIREPs, SIGMETs) | NOAA | Specialized domain not covered by Open-Meteo |
| NWS Alerts | api.weather.gov | Open-Meteo does not include government alerts |

---

## 6. API Reference and Endpoint Mapping

### Open-Meteo Forecast API

**Base URL:** `https://api.open-meteo.com/v1/forecast`

**Primary dashboard call (current + daily + hourly):**

```
https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index
  &hourly=visibility,precipitation,precipitation_probability
  &daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max
  &temperature_unit=fahrenheit
  &wind_speed_unit=mph
  &precipitation_unit=inch
  &timezone=auto
  &forecast_days=7
```

**Response structure (abbreviated):**

```json
{
  "latitude": 37.68,
  "longitude": -121.77,
  "timezone": "America/Los_Angeles",
  "current": {
    "time": "2026-03-25T14:00",
    "temperature_2m": 74.0,
    "relative_humidity_2m": 74,
    "apparent_temperature": 60.0,
    "is_day": 1,
    "precipitation": 0.0,
    "weather_code": 3,
    "cloud_cover": 100,
    "surface_pressure": 1017.2,
    "wind_speed_10m": 12.66,
    "wind_direction_10m": 270,
    "wind_gusts_10m": 20.1,
    "uv_index": 0
  },
  "daily": {
    "time": ["2026-03-25", "2026-03-26", ...],
    "weather_code": [3, 3, ...],
    "temperature_2m_max": [74, 72, ...],
    "temperature_2m_min": [52, 46, ...],
    "sunrise": ["2026-03-25T07:03", ...],
    "sunset": ["2026-03-25T19:23", ...],
    "precipitation_probability_max": [10, 5, ...],
    ...
  }
}
```

### Open-Meteo Air Quality API

**Base URL:** `https://air-quality-api.open-meteo.com/v1/air-quality`

```
https://air-quality-api.open-meteo.com/v1/air-quality
  ?latitude={lat}
  &longitude={lon}
  &current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index
  &timezone=auto
```

### WMO Weather Code Mapping

Open-Meteo uses WMO weather interpretation codes. You need a mapping function to convert these to display text and your icon set.

```typescript
const WMO_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear Sky", icon: "clear" },
  1: { description: "Mainly Clear", icon: "mostly-clear" },
  2: { description: "Partly Cloudy", icon: "partly-cloudy" },
  3: { description: "Overcast", icon: "overcast" },
  45: { description: "Fog", icon: "fog" },
  48: { description: "Depositing Rime Fog", icon: "fog" },
  51: { description: "Light Drizzle", icon: "drizzle" },
  53: { description: "Moderate Drizzle", icon: "drizzle" },
  55: { description: "Dense Drizzle", icon: "drizzle" },
  56: { description: "Light Freezing Drizzle", icon: "freezing-drizzle" },
  57: { description: "Dense Freezing Drizzle", icon: "freezing-drizzle" },
  61: { description: "Slight Rain", icon: "rain-light" },
  63: { description: "Moderate Rain", icon: "rain" },
  65: { description: "Heavy Rain", icon: "rain-heavy" },
  66: { description: "Light Freezing Rain", icon: "freezing-rain" },
  67: { description: "Heavy Freezing Rain", icon: "freezing-rain" },
  71: { description: "Slight Snowfall", icon: "snow-light" },
  73: { description: "Moderate Snowfall", icon: "snow" },
  75: { description: "Heavy Snowfall", icon: "snow-heavy" },
  77: { description: "Snow Grains", icon: "snow-grains" },
  80: { description: "Slight Rain Showers", icon: "showers-light" },
  81: { description: "Moderate Rain Showers", icon: "showers" },
  82: { description: "Violent Rain Showers", icon: "showers-heavy" },
  85: { description: "Slight Snow Showers", icon: "snow-showers" },
  86: { description: "Heavy Snow Showers", icon: "snow-showers-heavy" },
  95: { description: "Thunderstorm", icon: "thunderstorm" },
  96: { description: "Thunderstorm with Slight Hail", icon: "thunderstorm-hail" },
  99: { description: "Thunderstorm with Heavy Hail", icon: "thunderstorm-hail-heavy" },
};
```

### Unit Conversions Required

Open-Meteo supports native unit selection via query parameters. Use these to minimize client-side conversion:

- `temperature_unit=fahrenheit` (eliminates C to F conversion)
- `wind_speed_unit=mph` (eliminates km/h to mph conversion)
- `precipitation_unit=inch` (eliminates mm to inch conversion)
- Pressure: Open-Meteo returns hPa only. Convert client-side: `inHg = hPa * 0.02953`
- Visibility: returned in meters. Convert: `miles = meters * 0.000621371`

---

## 7. Implementation Phases

### Phase 1: Foundation - Service Layer and Types

**Branch from main to `feat/open-meteo-migration`**

Create the Open-Meteo service layer without touching any existing components. All existing OpenWeatherMap code continues to work during this phase.

Tasks:
1. Create `lib/open-meteo.ts` with typed fetch functions for Forecast API and Air Quality API
2. Create `lib/open-meteo-types.ts` with full TypeScript interfaces for Open-Meteo responses
3. Create `lib/wmo-codes.ts` with the WMO weather code mapping table
4. Create `lib/weather-utils.ts` (or extend existing) with unit conversion helpers for pressure hPa to inHg and visibility meters to miles
5. Create `app/api/open-meteo/forecast/route.ts` as a server-side proxy route with ISR caching (revalidate 900 seconds for current, 3600 for daily)
6. Create `app/api/open-meteo/air-quality/route.ts` as a server-side proxy route with ISR caching (revalidate 3600 seconds)
7. Add Open-Meteo attribution text component for footer

**Quality gate:** All new files must pass TypeScript strict mode. No changes to existing components. `npm run build` must succeed with zero errors.

### Phase 2: Data Layer Swap - Current Conditions Widgets

Swap the data source for all current-conditions dashboard widgets from OpenWeatherMap to Open-Meteo. Each widget gets its data from the new service layer.

Tasks:
1. Identify the existing weather data fetching hook or function (likely in `lib/` or `hooks/`) that calls OpenWeatherMap for current conditions
2. Create a new hook `hooks/useOpenMeteoWeather.ts` (or equivalent pattern matching existing codebase) that calls the Open-Meteo proxy route
3. Swap data source for these widgets one at a time, verifying each:
   - Temperature display (current temp)
   - Feels Like card (use `apparent_temperature`, fix floating point bug with `toFixed(1)`)
   - Humidity card (use `relative_humidity_2m`)
   - Pressure card (use `surface_pressure`, convert to inHg)
   - Wind card (use `wind_speed_10m`, `wind_direction_10m`, `wind_gusts_10m`)
   - UV Index card (use `uv_index`)
   - Sun Times card (use daily `sunrise`, `sunset`)
   - Precipitation card (sum hourly `precipitation` for last 24h or use daily `precipitation_sum`)
   - Visibility card (use hourly `visibility`, convert to miles)
4. Ensure the `is_day` field is used for day/night icon variants if applicable

**Quality gate:** All swapped widgets must display correct data matching the Open-Meteo API response. Visual appearance must be identical to current state except for the feels-like floating point fix. Run Lighthouse on the main dashboard page and confirm Performance >= 90.

### Phase 3: Forecast Cards Upgrade

Swap the 5-day forecast cards to use Open-Meteo daily data and extend to 7-day.

Tasks:
1. Swap forecast card data source from OpenWeatherMap daily forecast to Open-Meteo daily endpoint
2. Map `weather_code` (WMO) to display text and icon using the mapping table from `lib/wmo-codes.ts`
3. Extend forecast display from 5 days to 7 days
4. Add `precipitation_probability_max` as a new data point on each forecast card (e.g. "30% rain")
5. Update any forecast-related components to handle the new data shape
6. Verify timezone handling is correct (Open-Meteo returns times in the requested timezone via `timezone=auto`)

**Quality gate:** Forecast cards must show 7 days of data with correct high/low temps, weather descriptions, icons, and precipitation probability. Lighthouse Performance >= 90.

### Phase 4: Air Quality Enhancement

Swap AQI data source to Open-Meteo Air Quality API and enhance the display.

Tasks:
1. Swap AQI card data source to Open-Meteo Air Quality API
2. Use `us_aqi` for the composite score (matches your current EPA-based display)
3. Add individual pollutant breakdown below the AQI score if UI space allows: PM2.5, PM10, O3, NO2, SO2, CO
4. Keep the existing AQI color scale and status labels (Good, Moderate, Unhealthy for Sensitive Groups, etc.)
5. Verify the AQI thresholds match EPA standards (they do per Open-Meteo docs)

**Quality gate:** AQI card displays correct EPA AQI score and status. Pollutant breakdown is visible and accurate. Lighthouse Performance >= 90.

### Phase 5: AI Assistant Context Enhancement

Inject richer weather data from Open-Meteo into the AI assistant context. This addresses the known issue where AI queries return generic responses without real data.

Tasks:
1. Identify where the AI assistant builds its weather context (likely in the tool-calling setup for the Vercel AI SDK / Anthropic integration)
2. Add these Open-Meteo variables to the AI weather context:
   - Current conditions: temperature, feels like, humidity, wind, precipitation, weather code description, visibility, UV index, pressure
   - CAPE (Convective Available Potential Energy) for storm potential assessment
   - Lifted Index for atmospheric stability
   - Dewpoint for comfort and fog prediction
   - Cloud cover (low, mid, high) for sky condition detail
   - Precipitation probability for forecast questions
   - Freezing level height for aviation and winter weather questions
   - Snow depth when applicable
3. Format the injected context as a structured text block the AI can reference naturally
4. Test with representative queries: "Will it rain tomorrow?", "Is it good weather for cycling?", "What are flying conditions like?"

**Quality gate:** AI assistant must reference real weather data in responses. Test at least 5 representative queries and verify data-backed answers. Lighthouse Performance >= 90.

### Phase 6: Cleanup and Attribution

Remove or demote OpenWeatherMap dependencies.

Tasks:
1. Audit all files that reference `OPENWEATHER_API_KEY` or OpenWeatherMap API URLs
2. For any remaining OpenWeatherMap usage (if pollen or other data still depends on it), keep the key but document which endpoints still use it
3. If OpenWeatherMap is fully removed, delete `OPENWEATHER_API_KEY` from `.env.example` and Vercel environment variables
4. Add Open-Meteo attribution to the site footer: "Weather data by Open-Meteo.com" with link
5. Update `README.md` to reflect the new data source architecture
6. Update `.env.example` to remove or annotate the OpenWeatherMap key

**Quality gate:** `npm run build` succeeds. No unused imports or dead code referencing removed OpenWeatherMap endpoints. Lighthouse Performance >= 90. Attribution visible in footer.

---

## 8. Bug Fixes Bundled With Migration

### BUG: Feels Like floating point display

**Current behavior:** Feels Like card shows "↓ 0.840000000000034° cooler" - a classic JavaScript floating point precision error.

**Fix:** Apply `toFixed(1)` or `Math.round()` to the delta calculation between actual temperature and apparent temperature before rendering.

**Location:** The component rendering the Feels Like card, likely comparing `temperature` and `apparent_temperature` and displaying the difference.

```typescript
// BEFORE (buggy)
const delta = temperature - apparentTemperature;
// renders as 0.840000000000034

// AFTER (fixed)
const delta = Math.round((temperature - apparentTemperature) * 10) / 10;
// renders as 0.8
```

### BUG: Visibility showing N/A

**Current behavior:** Visibility card shows "N/A mi" suggesting the current data source is not returning visibility data.

**Expected fix:** Open-Meteo provides `visibility` in meters in the hourly endpoint. This should resolve the N/A issue. Convert to miles for display.

---

## 9. New Feature Enhancements

These are optional enhancements unlocked by Open-Meteo data that can be added during or after migration. They are NOT required for the migration to be considered complete.

### Enhancement 1: Precipitation Probability on Forecast Cards

Add a percentage chance of rain to each daily forecast card. Data: `precipitation_probability_max` from Open-Meteo daily endpoint.

### Enhancement 2: Extended 7-Day Forecast (up from 5)

Open-Meteo supports up to 16 days. Extend current 5-day cards to 7-day as part of Phase 3.

### Enhancement 3: Dewpoint Card

Add a dewpoint card to the dashboard grid. Data: `dewpoint_2m` from current or hourly endpoint. Display with comfort level labels (Dry < 50F, Comfortable 50-60F, Humid 60-65F, Oppressive > 65F).

### Enhancement 4: Cloud Cover Detail

Current weather code gives general cloud state. Could add a cloud cover breakdown card showing low, mid, and high cloud percentages. Data: `cloud_cover_low`, `cloud_cover_mid`, `cloud_cover_high`.

### Enhancement 5: Solar Radiation Widget

For the education-focused audience. Display GHI (Global Horizontal Irradiance), DNI (Direct Normal Irradiance). Data: `shortwave_radiation`, `direct_radiation`, `direct_normal_irradiance` from hourly endpoint.

### Enhancement 6: CAPE and Storm Potential

Add atmospheric instability metrics for storm chasers. Data: `cape` and `lifted_index` from hourly endpoint. Could display as a simple stability gauge.

---

## 10. Testing Strategy

### Unit Tests

- Test `lib/open-meteo.ts` fetch functions with mocked responses
- Test `lib/wmo-codes.ts` mapping for all 33 WMO codes
- Test unit conversion helpers (hPa to inHg, meters to miles)
- Test 24h precipitation summation logic

### Integration Tests

- Test Open-Meteo proxy routes return valid JSON with expected shape
- Test error handling when Open-Meteo is unreachable (graceful fallback or error state)

### E2E Tests (Playwright)

- Dashboard loads with all weather cards populated (no N/A except pollen weed when genuinely no data)
- Forecast cards show 7 days of data
- AQI card shows numeric score and status
- Feels Like card shows properly rounded delta (no floating point artifacts)
- Visibility card shows a numeric value (not N/A)

### Lighthouse

- Run Lighthouse on main dashboard page after each phase
- Performance score must be >= 90 on mobile
- If score drops below 90, stop and optimize before proceeding

---

## 11. Rollback Plan

Each phase is independently deployable. If issues are found:

1. **Phase-level rollback:** Revert the specific phase branch merge. Previous phases remain intact.
2. **Full rollback:** Revert to the commit before `feat/open-meteo-migration` merge. OpenWeatherMap code remains functional throughout migration since we build the new service layer alongside, not replacing inline.
3. **Fallback pattern:** During migration, the old OpenWeatherMap fetch functions should remain in the codebase (not deleted until Phase 6). If Open-Meteo has an outage, a quick env-flag swap can revert data source.

---

## 12. Quality Gates

Every phase must pass ALL of these before merging:

1. `npm run build` completes with zero errors and zero warnings
2. `npm run lint` passes
3. TypeScript strict mode passes (no `any` types in new code)
4. Lighthouse Performance >= 90 on mobile for the main dashboard page
5. No visual regressions on dashboard cards (same layout, fonts, colors, labels)
6. No hydration errors in browser console
7. All existing Playwright E2E tests continue to pass
8. New E2E tests added for migrated widgets pass

---

## 13. Claude CLI Execution Prompt

Use the following prompt to feed this PRD to Claude CLI for execution. Copy the entire block below as a single prompt.

---

### Prompt for Phase 1 (Foundation)

```
Read the file docs/PRD-open-meteo-migration.md completely. Execute Phase 1 Foundation tasks. Create lib/open-meteo.ts with typed fetch functions for the Open-Meteo Forecast API and Air Quality API using the exact endpoint URLs and query parameters documented in Section 6. Create lib/open-meteo-types.ts with full TypeScript interfaces matching the Open-Meteo JSON response shapes for forecast current, hourly, and daily data plus air quality current and hourly data. Create lib/wmo-codes.ts with the complete WMO weather code mapping table from the PRD. Create or extend lib/weather-utils.ts with helper functions for hPa to inHg conversion and meters to miles conversion. Create app/api/open-meteo/forecast/route.ts as a Next.js Route Handler that proxies requests to the Open-Meteo Forecast API with ISR caching using revalidate 900 for current data. Create app/api/open-meteo/air-quality/route.ts as a Next.js Route Handler that proxies requests to the Open-Meteo Air Quality API with ISR caching using revalidate 3600. Add an OpenMeteoAttribution component that renders Weather data by Open-Meteo.com as a link. All new files must pass TypeScript strict mode. Run npm run build and confirm zero errors. Do not modify any existing components or data fetching logic in this phase.
```

### Prompt for Phase 2 (Current Conditions Swap)

```
Read the file docs/PRD-open-meteo-migration.md completely. Execute Phase 2 Data Layer Swap for current conditions widgets. First investigate the existing codebase to find where OpenWeatherMap current conditions data is fetched and how it flows to dashboard widgets. Document what you find. Then create a new hook or data fetching pattern that calls the Open-Meteo proxy route from Phase 1. Swap the data source for these widgets one at a time: temperature display, feels like card, humidity card, pressure card, wind card, UV index card, sun times card, precipitation card, and visibility card. For the feels like card fix the floating point display bug by applying Math.round to one decimal place on the delta calculation. For pressure convert hPa to inHg using the helper from lib/weather-utils.ts. For visibility convert meters to miles using the helper. Do not touch radar, pollen, or moon phase widgets. Run npm run build and confirm zero errors. Run Lighthouse on the main dashboard and confirm Performance score is 90 or above.
```

### Prompt for Phase 3 (Forecast Cards)

```
Read the file docs/PRD-open-meteo-migration.md completely. Execute Phase 3 Forecast Cards Upgrade. Find the existing forecast card components and their data source. Swap from OpenWeatherMap daily forecast to Open-Meteo daily endpoint data. Map WMO weather codes to display text and icons using lib/wmo-codes.ts. Extend the forecast display from 5 days to 7 days. Add precipitation probability as a new data point on each forecast card showing the percent chance of rain. Verify timezone handling works correctly with the auto timezone parameter. Run npm run build and confirm zero errors. Run Lighthouse on the main dashboard and confirm Performance score is 90 or above.
```

### Prompt for Phase 4 (Air Quality)

```
Read the file docs/PRD-open-meteo-migration.md completely. Execute Phase 4 Air Quality Enhancement. Find the existing AQI card component and its data source. Swap to the Open-Meteo Air Quality API using the proxy route from Phase 1. Use us_aqi for the composite EPA score. Add individual pollutant values below the main AQI score if the UI layout supports it including PM2.5, PM10, O3, NO2, SO2, and CO. Keep the existing AQI color scale and status label logic. Run npm run build and confirm zero errors. Run Lighthouse on the main dashboard and confirm Performance score is 90 or above.
```

### Prompt for Phase 5 (AI Assistant Context)

```
Read the file docs/PRD-open-meteo-migration.md completely. Execute Phase 5 AI Assistant Context Enhancement. Find where the AI weather assistant builds its context for tool calls in the Vercel AI SDK and Anthropic integration. Add real-time Open-Meteo weather data to the AI context including current conditions temperature, feels like, humidity, wind speed and direction, precipitation, weather description, visibility, UV index, pressure, plus CAPE, dewpoint, cloud cover low mid and high, precipitation probability, and freezing level height. Format the context as a structured text block the AI can naturally reference. Test by verifying the build succeeds and the AI tool definitions include the new weather data fields. Run npm run build and confirm zero errors.
```

### Prompt for Phase 6 (Cleanup)

```
Read the file docs/PRD-open-meteo-migration.md completely. Execute Phase 6 Cleanup and Attribution. Search the entire codebase for all references to OPENWEATHER_API_KEY and OpenWeatherMap API URLs. For each reference determine if it is still needed for pollen or other non-migrated data. Remove any references that are no longer needed. If OpenWeatherMap is still used for any endpoint document which ones in a code comment. Add the OpenMeteoAttribution component from Phase 1 to the site footer. Update README.md to list Open-Meteo as the primary weather data source. Update .env.example to reflect the current required and optional environment variables. Run npm run build and confirm zero errors. Run npm run lint and confirm it passes. Run Lighthouse on the main dashboard and confirm Performance score is 90 or above.
```

---

## Appendix A: Open-Meteo Attribution Requirement

Per CC BY 4.0 license, add the following to the site footer:

> Weather data provided by [Open-Meteo.com](https://open-meteo.com/)

This is sufficient for compliance. No additional licensing fees or registration required for non-commercial use.

## Appendix B: Rate Limits Reference

| Tier | Minutely | Hourly | Daily | Monthly |
|------|----------|--------|-------|---------|
| Free (non-commercial) | 600 | 5,000 | 10,000 | 300,000 |

At 15-minute revalidation intervals for current weather and 60-minute for forecasts, a single user session generates approximately 4-8 API calls per hour. With server-side caching via ISR, total API calls scale with cache invalidation frequency, not user count.

## Appendix C: Files Expected to Be Created or Modified

### New files (Phase 1)
- `lib/open-meteo.ts`
- `lib/open-meteo-types.ts`
- `lib/wmo-codes.ts`
- `lib/weather-utils.ts` (new or extended)
- `app/api/open-meteo/forecast/route.ts`
- `app/api/open-meteo/air-quality/route.ts`
- `components/OpenMeteoAttribution.tsx`

### Modified files (Phases 2-6)
- Dashboard weather card components (various in `components/`)
- Weather data fetching hooks (in `hooks/` or `lib/`)
- Forecast card components
- AQI card component
- AI assistant tool/context configuration
- Site footer component
- `README.md`
- `.env.example`
