# PRD: Stargazer - Astrophotography Forecast Page

**Version:** 1.0
**Date:** 2026-04-04
**Author:** Justin Elrod / Claude Analysis
**Project:** 16-Bit Weather (16bitweather.co)
**Branch:** `feat/stargazer`
**Priority:** Medium (post Open-Meteo migration)
**Lighthouse Gate:** Performance score must remain >= 90 on mobile and desktop after all changes
**Dependency:** Open-Meteo migration (Phase 2 minimum) must be complete before starting. Cloud cover, humidity, dew point, wind, and visibility data from Open-Meteo are required inputs for the Stargazer scoring algorithm.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Motivation and Rationale](#2-motivation-and-rationale)
3. [Competitive Landscape](#3-competitive-landscape)
4. [Data Source Architecture](#4-data-source-architecture)
5. [Stargazer Score Algorithm](#5-stargazer-score-algorithm)
6. [Page Structure and Components](#6-page-structure-and-components)
7. [API Reference and Endpoint Mapping](#7-api-reference-and-endpoint-mapping)
8. [Deep Sky Object Catalog](#8-deep-sky-object-catalog)
9. [Meteor Shower Calendar](#9-meteor-shower-calendar)
10. [Implementation Plan](#10-implementation-plan)
11. [Testing Strategy](#11-testing-strategy)
12. [Quality Gates](#12-quality-gates)
13. [Claude CLI Execution Prompt](#13-claude-cli-execution-prompt)

---

## 1. Executive Summary

Add a dedicated Stargazer page at `/stargazer` that provides a comprehensive astrophotography forecast for any location. The page answers the core question every astrophotographer asks: "Is tonight worth going out, and what should I shoot?"

The feature combines atmospheric conditions from Open-Meteo and 7Timer ASTRO, celestial mechanics computed locally via the `astronomy-engine` npm package, a curated catalog of approximately 150 deep sky objects, ISS pass predictions via `satellite.js` with CelesTrak TLE data, and upcoming rocket launches from the Launch Library 2 API.

A composite 0-100 Stargazer Score provides an at-a-glance rating for tonight's conditions. A color-coded hourly conditions timeline gives granular detail. Planet visibility, deep sky targets, and space events round out the page.

All data sources are free, keyless, and require zero paid subscriptions. A small dashboard widget on the main city weather page links users to the full Stargazer page for their location.

---

## 2. Motivation and Rationale

### Why build this

- **Underserved niche in weather apps.** Most weather apps ignore astrophotography entirely. The few dedicated astro weather apps (Astrospheric, Clear Outside, Good to Stargaze) are either paywalled for extended forecasts, limited to North America, or missing celestial target information.
- **Natural extension of 16-Bit Weather.** The site already has space weather data from NOAA SWPC/NASA. An astrophotography forecast is a logical companion that bridges atmospheric weather and space observation.
- **Community pain point.** Astrophotographers currently cross-reference 3-5 separate apps to plan a session. They check one app for cloud cover, another for seeing, a third for planet positions, a fourth for ISS passes. Consolidating these into one free page with a retro aesthetic is a genuine differentiator.
- **Free APIs only.** Every data source in this PRD is free, keyless, and sustainable within the projects constraint model.
- **Engagement driver.** Astrophotography enthusiasts are deeply passionate and share tools within their communities. A well-executed free tool could drive significant organic traffic and establish 16-Bit Weather in a new niche.

### What makes this different from existing tools

- **Astrospheric** is the community gold standard but is paywalled for alerts and ensemble forecasts, North America only, and has no deep sky target recommendations.
- **Clear Outside** is free but has no seeing or transparency data, no planet information, no ISS passes, and no launch schedule.
- **Good to Stargaze** paywalls anything beyond 3 hours of forecast.
- **None of the above** combine atmospheric conditions, celestial targets, ISS passes, and launch schedules in one view.
- **16-Bit Weather Stargazer** will be free, global, and comprehensive with a distinctive retro visual identity.

---

## 3. Competitive Landscape

### Scoring and visualization patterns used in the community

| App | Scoring System | Visualization | Seeing Data | Deep Sky Targets | Free |
|-----|---------------|---------------|-------------|-----------------|------|
| Astrospheric | No single score, detailed hourly | Hourly strips, map overlays | Yes (proprietary model) | No | Freemium |
| Clear Outside | Traffic light (red/amber/green) per hour | Color-coded hourly strips | No | No | Yes |
| Good to Stargaze | Color-coded tiles with go/no-go | Tile grid | Yes | No | Freemium (3hr free) |
| Clear Sky Chart | Blue-block colored strips (96hr) | Iconic strip chart | Yes (Allan Rahill model) | No | Yes |
| NightShift | Excellent/Not report | Graph-based | Approximate | Yes (highlights) | Freemium |
| **Stargazer (ours)** | **0-100 composite score** | **Color-coded hourly strips** | **Yes (7Timer ASTRO)** | **Yes (~150 objects)** | **Yes** |

### Design decisions derived from competitive analysis

1. **0-100 score** rather than stars or traffic lights. Provides finer granularity and matches the existing pattern in 16-Bit Weather for other scores (AQI, comfort, etc.).
2. **Color-coded hourly condition strips** for the detailed view. This is the visual language the entire astro community already understands from Clear Outside and Clear Sky Chart.
3. **Sunset-to-sunrise orientation.** The timeline should center on the nighttime hours, not show a full 24-hour day. Astrophotographers care about 8pm to 5am, not noon.
4. **Include seeing and transparency.** These are the two variables that separate a "weather app" from an "astro weather app." 7Timer ASTRO provides both for free.
5. **Include what to shoot.** This is the gap in every weather-only app. Telling someone "the sky is clear" without telling them "and the Orion Nebula is at 60 degrees altitude right now" misses half the value.

---

## 4. Data Source Architecture

### Data flow diagram

```
Stargazer Page Request (lat, lon)
    |
    +---> Open-Meteo Forecast API (already integrated)
    |       - cloud_cover, cloud_cover_low, cloud_cover_mid, cloud_cover_high (hourly)
    |       - relative_humidity_2m, dewpoint_2m, temperature_2m (hourly)
    |       - wind_speed_10m, wind_gusts_10m (hourly)
    |       - visibility (hourly)
    |       - surface_pressure (hourly)
    |
    +---> 7Timer ASTRO API (new)
    |       - Astronomical seeing (1-8 scale, 3hr intervals)
    |       - Atmospheric transparency (1-8 scale, 3hr intervals)
    |       - Cloud cover (1-9 scale, 3hr intervals)
    |       - Lifted index / instability
    |       - Wind speed and direction at 10m
    |       - Temperature and humidity
    |
    +---> astronomy-engine (npm, computed server-side)
    |       - Sun rise/set, astronomical twilight start/end
    |       - Moon phase, illumination, rise/set times
    |       - Planet positions (altitude, azimuth, magnitude, rise/set)
    |       - Upcoming conjunctions, oppositions, eclipses
    |       - Deep sky object alt/az conversion from RA/Dec catalog
    |
    +---> satellite.js + CelesTrak TLE (npm + fetch, computed server-side)
    |       - ISS pass predictions (rise time, max elevation, set time, brightness)
    |       - TLE data refreshed daily from CelesTrak
    |
    +---> Launch Library 2 API (new)
    |       - Next 5-10 upcoming rocket launches
    |       - Launch name, date, provider, vehicle, pad location
    |       - Crewed mission flag for highlighting
    |
    +---> Static JSON data (bundled)
            - Deep sky object catalog (~150 objects: Messier + NGC highlights)
            - Meteor shower calendar (annual cycle, peak dates, ZHR, radiant)
```

### Server-side data fetching strategy

All external API calls and astronomical computations MUST run server-side in Next.js API routes or Server Components. This is critical for:
- Avoiding CORS issues (7Timer serves over HTTP only)
- Enabling ISR caching to stay within rate limits
- Keeping computation-heavy astronomy calculations off the client
- Reducing client bundle size (astronomy-engine is ~116KB minified)

Recommended caching:
- Open-Meteo cloud/weather data: revalidate every 900 seconds (15 min) - reuse existing proxy
- 7Timer ASTRO data: revalidate every 10800 seconds (3 hours, matching their update cycle)
- Astronomical calculations: revalidate every 3600 seconds (1 hour) or compute on request with short cache
- CelesTrak TLE data: revalidate every 86400 seconds (24 hours)
- Launch Library 2: revalidate every 3600 seconds (1 hour)
- Static catalog and meteor data: bundled at build time, no revalidation needed

---

## 5. Stargazer Score Algorithm

### Composite Score (0-100)

The Stargazer Score represents the overall quality of tonight's astrophotography conditions at the users location. It is calculated for the best upcoming dark window (astronomical twilight to astronomical twilight or moon-down period within that window).

#### Component weights

| Component | Weight | Source | Rationale |
|-----------|--------|--------|-----------|
| Cloud Cover | 35% | Open-Meteo hourly `cloud_cover` | Clouds are the #1 session killer. Any significant cloud cover makes imaging impossible. |
| Moon Interference | 25% | astronomy-engine moon phase + rise/set | Moon illumination and whether its above the horizon during the dark window determines what targets are viable. New moon = maximum score. Full moon overhead = minimum. |
| Seeing | 15% | 7Timer ASTRO `seeing` | Atmospheric turbulence affects detail on planets and small targets. Critical for high-magnification work. |
| Transparency | 15% | 7Timer ASTRO `transparency` | Atmospheric clarity affects contrast on faint objects like galaxies and nebulae. |
| Ground Conditions | 10% | Open-Meteo `wind_speed_10m`, `relative_humidity_2m`, `dewpoint_2m`, `temperature_2m` | High wind shakes equipment. High humidity causes dew on optics. Large temp swings cause focus drift. |

#### Score calculation details

**Cloud Cover Sub-Score (0-100):**
Calculate the average total cloud cover percentage across the dark window hours from Open-Meteo hourly data. Invert so that 0% clouds = 100 score, 100% clouds = 0 score.

```typescript
function cloudScore(avgCloudCoverPercent: number): number {
  // Non-linear: penalize even moderate cloud cover heavily
  // 0% clouds = 100, 20% = 80, 50% = 30, 80% = 5, 100% = 0
  if (avgCloudCoverPercent <= 10) return 100;
  if (avgCloudCoverPercent <= 25) return 100 - (avgCloudCoverPercent - 10) * 1.33;
  if (avgCloudCoverPercent <= 50) return 80 - (avgCloudCoverPercent - 25) * 2.0;
  if (avgCloudCoverPercent <= 75) return 30 - (avgCloudCoverPercent - 50) * 1.0;
  return Math.max(0, 5 - (avgCloudCoverPercent - 75) * 0.2);
}
```

**Moon Interference Sub-Score (0-100):**
Combines moon illumination percentage and whether the moon is above the horizon during the imaging window.

```typescript
function moonScore(
  illuminationPercent: number,
  moonUpDuringDarkWindowPercent: number
): number {
  // If moon is below horizon for the entire dark window, score is 100
  // regardless of phase (even a full moon below horizon = no interference)
  if (moonUpDuringDarkWindowPercent === 0) return 100;

  // Moon above horizon: score drops based on illumination * time above
  const interferenceRaw = (illuminationPercent / 100) * (moonUpDuringDarkWindowPercent / 100);
  // 0 interference = 100, 1.0 interference (full moon, always up) = 0
  return Math.round(100 * (1 - interferenceRaw));
}
```

**Seeing Sub-Score (0-100):**
7Timer returns seeing on a 1-8 scale where 1 is best (sub-arcsecond) and 8 is worst.

```typescript
function seeingScore(seeing7timer: number): number {
  // 7Timer scale: 1 = <0.5", 2 = 0.5-0.75", 3 = 0.75-1", 4 = 1-1.25"
  // 5 = 1.25-1.5", 6 = 1.5-2", 7 = 2-2.5", 8 = >2.5"
  const map: Record<number, number> = {
    1: 100, 2: 90, 3: 80, 4: 65,
    5: 50, 6: 35, 7: 20, 8: 5
  };
  return map[seeing7timer] ?? 50;
}
```

**Transparency Sub-Score (0-100):**
7Timer returns transparency on a 1-8 scale where 1 is best and 8 is worst.

```typescript
function transparencyScore(transparency7timer: number): number {
  // 7Timer scale: 1 = <0.3, 2 = 0.3-0.4, 3 = 0.4-0.5, 4 = 0.5-0.6
  // 5 = 0.6-0.7, 6 = 0.7-0.85, 7 = 0.85-1.0, 8 = >1.0 (mag/airmass)
  const map: Record<number, number> = {
    1: 100, 2: 90, 3: 80, 4: 65,
    5: 50, 6: 35, 7: 20, 8: 5
  };
  return map[transparency7timer] ?? 50;
}
```

**Ground Conditions Sub-Score (0-100):**

```typescript
function groundScore(
  windSpeedMph: number,
  humidityPercent: number,
  tempF: number,
  dewpointF: number
): number {
  let score = 100;

  // Wind penalty: gusts above 10mph start hurting, above 25mph unusable
  if (windSpeedMph > 10) score -= Math.min(40, (windSpeedMph - 10) * 2.5);

  // Humidity penalty: above 80% = dew risk
  if (humidityPercent > 80) score -= Math.min(25, (humidityPercent - 80) * 1.25);

  // Dew risk: temp approaching dewpoint means fog/dew on optics
  const dewDelta = tempF - dewpointF;
  if (dewDelta < 5) score -= Math.min(25, (5 - dewDelta) * 5);

  // Extreme cold penalty (below 20F): affects battery life and comfort
  if (tempF < 20) score -= Math.min(10, (20 - tempF) * 0.5);

  return Math.max(0, Math.round(score));
}
```

**Final composite:**

```typescript
function stargazerScore(
  cloud: number, moon: number, seeing: number,
  transparency: number, ground: number
): number {
  return Math.round(
    cloud * 0.35 +
    moon * 0.25 +
    seeing * 0.15 +
    transparency * 0.15 +
    ground * 0.10
  );
}
```

#### Score display labels

| Score Range | Label | Color (for retro themes) |
|-------------|-------|--------------------------|
| 90-100 | Exceptional | Bright green |
| 75-89 | Excellent | Green |
| 60-74 | Good | Yellow-green |
| 40-59 | Fair | Yellow |
| 20-39 | Poor | Orange |
| 0-19 | Bad | Red |

#### Natural language summary

Generate a one-sentence summary based on the dominant factor. Examples:
- Score 95: "Clear skies and new moon - exceptional night for deep sky imaging"
- Score 72: "Clear skies but waning gibbous moon rises at 11pm - plan early targets"
- Score 45: "Intermittent clouds expected after midnight with moderate seeing"
- Score 15: "Overcast skies forecast all night - stay home and process data"

---

## 6. Page Structure and Components

### Route: `/stargazer` (or `/city/[slug]/stargazer` if city-scoped)

The page should use the same layout wrapper as other 16-Bit Weather pages and inherit the active retro theme.

### Dashboard Widget (for main city page)

A compact card in the dashboard grid showing:
- Stargazer Score (0-100) with color indicator
- Moon phase icon and illumination percent
- One-line summary text
- Link text: "View full Stargazer forecast"

Widget component: `components/stargazer/StargazerCard.tsx`

### Full Page Layout

#### Section 1: Hero - Tonight's Stargazer Score

- Large 0-100 score display with color-coded background
- Score label (Exceptional/Excellent/Good/Fair/Poor/Bad)
- Natural language summary sentence
- Dark window time range: "Astronomical darkness: 9:47 PM - 5:12 AM"
- Moon phase icon with illumination percent and rise/set times
- Sub-scores displayed as small gauges or bars: Cloud, Moon, Seeing, Transparency, Ground

#### Section 2: Hourly Conditions Timeline

The core visualization. A grid showing conditions from sunset to sunrise at hourly intervals.

Rows (top to bottom):
1. **Time** - Hour labels (8pm, 9pm, 10pm, ...)
2. **Total Cloud Cover** - Color-coded cells (green = 0-10%, yellow = 10-30%, orange = 30-60%, red = 60%+)
3. **Low Clouds** - Same color scale
4. **Mid Clouds** - Same color scale
5. **High Clouds** - Same color scale (thin cirrus can still ruin imaging)
6. **Seeing** - Color-coded from 7Timer scale
7. **Transparency** - Color-coded from 7Timer scale
8. **Wind** - Color-coded (green < 5mph, yellow 5-15mph, orange 15-25mph, red 25mph+)
9. **Humidity** - Color-coded (green < 60%, yellow 60-80%, red 80%+)
10. **Temperature** - Numeric values
11. **Dew Risk** - Color-coded based on temp minus dewpoint delta

Color scale key displayed below the timeline.

Since 7Timer provides data at 3-hour intervals and Open-Meteo provides hourly, the 7Timer rows (seeing, transparency) will show the same color for 3 consecutive cells. This is expected behavior and should be noted in the UI.

#### Section 3: Moon Intel

- Moon phase name and visual representation (SVG or emoji-based phase icon)
- Illumination percentage
- Moonrise and moonset times
- **Dark Window** calculation: the period within astronomical darkness when the moon is below the horizon
- Days until next new moon (with date)
- Days until next full moon (with date)

#### Section 4: Visible Planets Tonight

Table showing all planets that rise above 10 degrees altitude during the dark window:

| Planet | Rise | Set | Peak Altitude | Peak Time | Magnitude | Notes |
|--------|------|-----|---------------|-----------|-----------|-------|
| Jupiter | 7:15 PM | 2:30 AM | 62 deg | 10:45 PM | -2.4 | Best planet target tonight |
| Saturn | 4:30 AM | ... | 28 deg | 5:45 AM | +0.8 | Low in pre-dawn east |
| Mars | 9:00 PM | 4:15 AM | 45 deg | 12:30 AM | +1.2 | In Gemini |

Notes should include notable conditions: opposition, conjunction, near a bright star, in a notable constellation.

Use `astronomy-engine` functions: `SearchRiseSet()`, `Horizon()`, `Illumination()` for each planet body.

#### Section 5: Deep Sky Highlights

Show the top 8 deep sky objects best positioned for imaging tonight at the users location. Selection criteria:
1. Object must reach at least 30 degrees altitude during the dark window
2. Prefer objects near transit (highest altitude) during the dark window
3. Filter by current season/month (exclude objects with RA that places them in daytime sky)
4. Prefer brighter objects (lower magnitude) and popular imaging targets
5. Avoid objects near the moon if moon is above horizon

Display for each object:

| Name | Type | Constellation | Mag | Alt at Transit | Transit Time | Difficulty |
|------|------|---------------|-----|---------------|--------------|------------|
| M42 - Orion Nebula | Emission Nebula | Orion | +4.0 | 55 deg | 9:30 PM | Beginner |
| M31 - Andromeda Galaxy | Spiral Galaxy | Andromeda | +3.4 | 72 deg | 8:45 PM | Beginner |
| NGC 2237 - Rosette Nebula | Emission Nebula | Monoceros | +9.0 | 48 deg | 10:15 PM | Intermediate |

Include a brief one-line description for each object: what it is, what makes it interesting, any imaging tips.

#### Section 6: Upcoming Sky Events

Chronological list of the next 5-10 notable events:
- Meteor showers (from static calendar): name, peak date, ZHR, radiant constellation, moon interference assessment
- Planetary conjunctions (from astronomy-engine `SearchConjunction`)
- Oppositions (from astronomy-engine `SearchOpposition`)
- Eclipses - lunar and solar (from astronomy-engine `SearchLunarEclipse`, `SearchSolarEclipse`)
- Equinoxes and solstices (from astronomy-engine `SearchEquinox`, `SearchSolstice`)

Each event shows date, description, and whether the moon will interfere (for meteor showers).

#### Section 7: ISS and Satellite Passes

Next 5 visible ISS passes for the user's location:

| Date | Rise Time | Rise Dir | Max Elev | Max Time | Set Dir | Set Time | Brightness |
|------|-----------|----------|----------|----------|---------|----------|------------|
| Apr 5 | 8:23 PM | WSW | 67 deg | 8:26 PM | ENE | 8:29 PM | -3.2 mag |

Only show passes that occur during darkness and reach sufficient brightness (magnitude < 0 for visibility). Astrophotographers care about ISS passes both as photo opportunities (long-exposure streaks) and as session interruptions (bright streak through a long exposure).

#### Section 8: Upcoming Launches

Next 5 launches from Launch Library 2:

| Date | Mission | Vehicle | Provider | Site | Status |
|------|---------|---------|----------|------|--------|
| Apr 14 | GS1-SN002 | New Glenn | Blue Origin | LC-36, Cape Canaveral | Go |
| Apr 23 | Kakushin Rising | Electron | Rocket Lab | Mahia Peninsula, NZ | Go |

Highlight crewed missions with a special indicator. Include launch window time in UTC and local.

#### Section 9: Attribution Footer

Required attributions for all data sources:
- "Astronomical seeing and transparency data from 7Timer.info"
- "Celestial calculations powered by Astronomy Engine"
- "Launch data from The Space Devs Launch Library 2"
- "Satellite tracking data from CelesTrak"
- Open-Meteo attribution (already in site footer from migration)

---

## 7. API Reference and Endpoint Mapping

### 7Timer ASTRO API

**Base URL:** `http://www.7timer.info/bin/astro.php`

NOTE: 7Timer serves over HTTP only, not HTTPS. All requests MUST be proxied through a server-side Next.js route handler.

**Request:**
```
http://www.7timer.info/bin/astro.php?lon={lon}&lat={lat}&ac=0&unit=metric&output=json&tzshift=0
```

**Response structure:**
```json
{
  "product": "astro",
  "init": "2026040406",
  "dataseries": [
    {
      "timepoint": 3,
      "cloudcover": 1,
      "seeing": 3,
      "transparency": 2,
      "lifted_index": 2,
      "rh2m": 5,
      "wind10m": {
        "direction": "NE",
        "speed": 2
      },
      "temp2m": 15,
      "prec_type": "none"
    },
    {
      "timepoint": 6,
      "cloudcover": 2,
      "seeing": 4,
      "transparency": 3,
      "lifted_index": 2,
      "rh2m": 8,
      "wind10m": {
        "direction": "N",
        "speed": 2
      },
      "temp2m": 12,
      "prec_type": "none"
    }
  ]
}
```

**Scale reference:**

Seeing (1 = best, 8 = worst):
| Value | Arcseconds | Quality |
|-------|-----------|---------|
| 1 | < 0.5" | Superb |
| 2 | 0.5" - 0.75" | Excellent |
| 3 | 0.75" - 1.0" | Good |
| 4 | 1.0" - 1.25" | Average |
| 5 | 1.25" - 1.5" | Below average |
| 6 | 1.5" - 2.0" | Poor |
| 7 | 2.0" - 2.5" | Bad |
| 8 | > 2.5" | Terrible |

Transparency (1 = best, 8 = worst):
| Value | Extinction (mag/airmass) | Quality |
|-------|--------------------------|---------|
| 1 | < 0.3 | Superb |
| 2 | 0.3 - 0.4 | Excellent |
| 3 | 0.4 - 0.5 | Good |
| 4 | 0.5 - 0.6 | Average |
| 5 | 0.6 - 0.7 | Below average |
| 6 | 0.7 - 0.85 | Poor |
| 7 | 0.85 - 1.0 | Bad |
| 8 | > 1.0 | Terrible |

Cloud Cover (1 = best, 9 = worst):
| Value | Coverage |
|-------|----------|
| 1 | 0% - 6% |
| 2 | 6% - 19% |
| 3 | 19% - 31% |
| 4 | 31% - 44% |
| 5 | 44% - 56% |
| 6 | 56% - 69% |
| 7 | 69% - 81% |
| 8 | 81% - 94% |
| 9 | 94% - 100% |

Wind Speed (10m):
| Value | Speed |
|-------|-------|
| 1 | < 0.3 m/s |
| 2 | 0.3 - 3.4 m/s |
| 3 | 3.4 - 8.0 m/s |
| 4 | 8.0 - 10.8 m/s |
| 5 | 10.8 - 17.2 m/s |
| 6 | 17.2 - 24.5 m/s |
| 7 | 24.5 - 32.6 m/s |
| 8 | > 32.6 m/s |

Relative Humidity (2m):
| Value | Humidity |
|-------|----------|
| 1 | 0% - 5% |
| 2 | 5% - 10% |
| 3 | 10% - 15% |
| 4 | 15% - 20% |
| 5 | 20% - 25% |
| 6 | 25% - 30% |
| 7 | 30% - 35% |
| 8 | 35% - 40% |
| 9 | 40% - 45% |
| 10 | 45% - 50% |
| 11 | 50% - 55% |
| 12 | 55% - 60% |
| 13 | 60% - 65% |
| 14 | 65% - 70% |
| 15 | 70% - 75% |
| 16 | > 75% |

**Timepoint interpretation:** The `init` field gives the model initialization time in format `YYYYMMDDHH`. Each `timepoint` is the number of hours after init. So if init is `2026040406`, timepoint 3 = 2026-04-04 09:00 UTC. The model updates every 6 hours.

### Launch Library 2 API

**Base URL:** `https://ll.thespacedevs.com/2.2.0`

**Upcoming launches (next 10):**
```
GET https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10&mode=list
```

**Rate limit:** 15 requests per hour per IP. Cache aggressively server-side (revalidate 3600).

**Response fields of interest:**
- `name` - Mission name including vehicle
- `net` - No Earlier Than date/time (ISO 8601)
- `status.name` - Go, TBD, TBC, Success, Failure
- `launch_service_provider.name` - SpaceX, NASA, Rocket Lab, etc.
- `rocket.configuration.name` - Falcon 9, SLS, Electron, etc.
- `pad.name` - Launch pad name
- `pad.location.name` - Location name
- `mission.name` - Payload/mission name
- `mission.description` - Mission description
- `mission.type` - Communications, Earth Science, Human Exploration, etc.

### CelesTrak TLE Data

**URL for ISS TLE:**
```
GET https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE
```

Returns two-line element set for ISS (NORAD catalog number 25544). Use `satellite.js` npm package to propagate orbital elements and compute pass predictions.

**Alternative for multiple satellites:**
```
GET https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=TLE
```

### astronomy-engine npm

**Package:** `astronomy-engine` (v2.1.19)
**Install:** `npm install astronomy-engine`
**Size:** ~116KB minified
**No API calls.** All computation is local.

Key functions to use:

```typescript
import {
  // Bodies
  Body,
  // Observer
  MakeObserver,
  // Position calculations
  Horizon,          // Get alt/az for a body at a time/place
  Equator,          // Get RA/Dec for a body
  Illumination,     // Get visual magnitude and phase angle
  // Rise/set
  SearchRiseSet,    // Find next rise or set time
  // Moon
  MoonPhase,        // Get moon phase angle (0=new, 180=full)
  SearchMoonPhase,  // Find next occurrence of a specific phase
  // Twilight
  SearchAltitude,   // Find when body reaches specific altitude
  // Events
  SearchConjunction,     // Find planetary conjunctions (not available - use manual calculation)
  SearchLunarEclipse,    // Find next lunar eclipse
  SearchGlobalSolarEclipse, // Find next solar eclipse
  // Time
  MakeTime,         // Create AstroTime from Date
  // Coordinate transforms
  HorizonFromEquator, // Convert RA/Dec to Alt/Az
} from 'astronomy-engine';
```

**Computing astronomical twilight:**
Astronomical twilight begins/ends when the sun is 18 degrees below the horizon.
```typescript
// Find astronomical dusk (sun drops to -18 degrees)
const dusk = SearchAltitude(Body.Sun, observer, +1, startTime, 1, -18);
// Find astronomical dawn (sun rises to -18 degrees)
const dawn = SearchAltitude(Body.Sun, observer, -1, startTime, 1, -18);
```

**Computing planet positions:**
```typescript
const observer = MakeObserver(lat, lon, 0);
const time = MakeTime(new Date());
const horizon = Horizon(time, observer, Body.Jupiter, 'normal');
// horizon.altitude = degrees above horizon
// horizon.azimuth = degrees from north clockwise
const illum = Illumination(Body.Jupiter, time);
// illum.mag = visual magnitude
```

**Computing deep sky object positions from catalog RA/Dec:**
```typescript
// For a catalog object with RA (hours) and Dec (degrees)
// Use sidereal time to convert to horizontal coordinates
import { SiderealTime } from 'astronomy-engine';

function catalogObjectAltAz(
  ra_hours: number,
  dec_degrees: number,
  lat: number,
  lon: number,
  time: Date
): { altitude: number; azimuth: number } {
  const astroTime = MakeTime(time);
  const lst = SiderealTime(astroTime);
  // Hour angle = LST - RA (adjusted for longitude)
  const ha = (lst + lon / 15) - ra_hours;
  const haRad = ha * 15 * Math.PI / 180;
  const decRad = dec_degrees * Math.PI / 180;
  const latRad = lat * Math.PI / 180;

  const sinAlt = Math.sin(decRad) * Math.sin(latRad) +
                 Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const altitude = Math.asin(sinAlt) * 180 / Math.PI;

  const cosA = (Math.sin(decRad) - Math.sin(altitude * Math.PI / 180) * Math.sin(latRad)) /
               (Math.cos(altitude * Math.PI / 180) * Math.cos(latRad));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosA))) * 180 / Math.PI;
  if (Math.sin(haRad) > 0) azimuth = 360 - azimuth;

  return { altitude, azimuth };
}
```

### satellite.js npm

**Package:** `satellite.js`
**Install:** `npm install satellite.js`

```typescript
import * as satellite from 'satellite.js';

// Parse TLE
const tleLine1 = '1 25544U 98067A   26094.50000000  .00016717  00000-0  30000-3 0  9993';
const tleLine2 = '2 25544  51.6400 200.0000 0001234  90.0000 270.0000 15.50000000400000';
const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

// Propagate to a specific time
const now = new Date();
const posVel = satellite.propagate(satrec, now);
const gmst = satellite.gstime(now);

// Get geodetic position
const geo = satellite.eciToGeodetic(posVel.position, gmst);
const lat = satellite.degreesLat(geo.latitude);
const lon = satellite.degreesLong(geo.longitude);
const alt = geo.height; // km

// For pass prediction, iterate over time steps and check
// when satellite is above minimum elevation for observer
```

Pass prediction requires iterating through time steps (e.g., every 30 seconds over the next 5 days) and checking when the satellite is above the observer's horizon. Filter for passes that occur during darkness and when the satellite is illuminated by the sun (otherwise invisible). This is computationally intensive but runs in milliseconds on modern hardware.

---

## 8. Deep Sky Object Catalog

### Catalog structure

Create a static JSON file `data/deep-sky-catalog.json` containing approximately 150 objects.

```typescript
interface DeepSkyObject {
  id: string;           // "M42", "NGC2237", etc.
  name: string;         // "Orion Nebula"
  altNames: string[];   // ["Great Nebula in Orion", "Sh2-281"]
  type: DeepSkyType;
  constellation: string;
  ra: number;           // Right ascension in decimal hours (0-24)
  dec: number;          // Declination in decimal degrees (-90 to +90)
  magnitude: number;    // Visual magnitude
  size: string;         // Angular size, e.g. "85' x 60'" or "11'"
  distance: string;     // "1,344 ly" or "2.5 Mly"
  bestMonths: number[]; // [11, 12, 1, 2] for Nov-Feb
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;  // 1-2 sentence description
  imagingTips: string;  // Brief imaging advice
}

type DeepSkyType =
  | 'emission_nebula'
  | 'reflection_nebula'
  | 'planetary_nebula'
  | 'dark_nebula'
  | 'supernova_remnant'
  | 'spiral_galaxy'
  | 'elliptical_galaxy'
  | 'irregular_galaxy'
  | 'galaxy_group'
  | 'open_cluster'
  | 'globular_cluster'
  | 'star_forming_region';
```

### Catalog contents

Include all 110 Messier objects plus approximately 40 popular NGC/IC targets known in the astrophotography community:

**NGC/IC additions (popular imaging targets not in Messier catalog):**
- NGC 7000 (North America Nebula)
- NGC 2237 (Rosette Nebula)
- IC 1396 (Elephant Trunk Nebula)
- NGC 6960/6992 (Veil Nebula - Western and Eastern)
- NGC 2244 (Rosette Cluster)
- IC 5070 (Pelican Nebula)
- NGC 7380 (Wizard Nebula)
- NGC 281 (Pac-Man Nebula)
- NGC 6888 (Crescent Nebula)
- IC 1805 (Heart Nebula)
- IC 1848 (Soul Nebula)
- NGC 2264 (Cone Nebula / Christmas Tree)
- NGC 7635 (Bubble Nebula)
- NGC 6543 (Cat's Eye Nebula)
- NGC 3628 (Hamburger Galaxy)
- NGC 891 (Silver Sliver Galaxy)
- NGC 2903 (barred spiral in Leo)
- IC 434 (Horsehead Nebula region)
- NGC 1499 (California Nebula)
- NGC 2359 (Thor's Helmet)
- NGC 3372 (Eta Carinae Nebula - southern hemisphere)
- NGC 5139 (Omega Centauri)
- NGC 104 (47 Tucanae)
- NGC 253 (Sculptor Galaxy)
- NGC 55 (in Sculptor)
- NGC 300 (in Sculptor)
- IC 2118 (Witch Head Nebula)
- NGC 1977 (Running Man Nebula)
- NGC 7293 (Helix Nebula)
- NGC 6334 (Cat's Paw Nebula)
- NGC 3132 (Eight-Burst / Southern Ring Nebula)
- NGC 2070 (Tarantula Nebula - southern hemisphere)
- Barnard 33 (Horsehead dark nebula)
- Sh2-155 (Cave Nebula)
- IC 5146 (Cocoon Nebula)
- NGC 6302 (Bug/Butterfly Nebula)
- NGC 1333 (reflection nebula in Perseus)
- NGC 7822 (in Cepheus)
- IC 410 (Tadpoles Nebula)
- IC 405 (Flaming Star Nebula)

### Object selection algorithm for "tonight's highlights"

```typescript
function selectTonightHighlights(
  catalog: DeepSkyObject[],
  lat: number,
  lon: number,
  darkStart: Date,
  darkEnd: Date,
  moonAltAtTransit: number,
  moonAz: number,
  moonIllumination: number,
  maxResults: number = 8
): DeepSkyObject[] {
  const candidates = catalog
    .map(obj => {
      // Calculate transit time and altitude for each object
      const transitInfo = computeTransit(obj.ra, obj.dec, lat, lon, darkStart, darkEnd);
      return { ...obj, ...transitInfo };
    })
    .filter(obj => {
      // Must reach at least 30 degrees altitude during dark window
      if (obj.maxAltitude < 30) return false;
      // Must transit during or near the dark window
      if (!obj.transitsDuringDarkWindow) return false;
      // If moon is bright and up, penalize objects near the moon
      return true;
    })
    .sort((a, b) => {
      // Sort by: altitude at transit (higher = better), then magnitude (brighter = better)
      // Bonus for being in bestMonths
      const currentMonth = darkStart.getMonth() + 1;
      const aInSeason = a.bestMonths.includes(currentMonth) ? 10 : 0;
      const bInSeason = b.bestMonths.includes(currentMonth) ? 10 : 0;
      return (b.maxAltitude + bInSeason) - (a.maxAltitude + aInSeason);
    });

  return candidates.slice(0, maxResults);
}
```

---

## 9. Meteor Shower Calendar

### Static calendar data

Create `data/meteor-showers.json` with the major annual meteor showers. This data is stable year to year - only the moon interference changes.

```typescript
interface MeteorShower {
  name: string;
  peak: string;        // "Jan 3-4" format for display
  peakMonth: number;   // 1-12
  peakDay: number;     // Day of peak
  activeStart: string; // "Dec 28"
  activeEnd: string;   // "Jan 12"
  zhr: number;         // Zenithal Hourly Rate at peak
  speed: number;       // km/s entry speed
  radiantConstellation: string;
  radiantRA: number;   // RA in decimal hours for alt/az calculation
  radiantDec: number;  // Dec in degrees
  parentBody: string;  // "Comet 2P/Encke", "Asteroid 3200 Phaethon"
  description: string;
}
```

**Major showers to include:**

| Name | Peak | ZHR | Parent Body |
|------|------|-----|-------------|
| Quadrantids | Jan 3-4 | 120 | Asteroid 2003 EH1 |
| Lyrids | Apr 22-23 | 18 | Comet Thatcher |
| Eta Aquariids | May 5-6 | 50 | Comet 1P/Halley |
| Delta Aquariids | Jul 28-29 | 25 | Comet 96P/Machholz |
| Perseids | Aug 12-13 | 100 | Comet 109P/Swift-Tuttle |
| Draconids | Oct 8-9 | 10 | Comet 21P/Giacobini-Zinner |
| Orionids | Oct 21-22 | 20 | Comet 1P/Halley |
| Taurids (South) | Nov 5 | 5 | Comet 2P/Encke |
| Taurids (North) | Nov 12 | 5 | Comet 2P/Encke |
| Leonids | Nov 17-18 | 15 | Comet 55P/Tempel-Tuttle |
| Geminids | Dec 13-14 | 150 | Asteroid 3200 Phaethon |
| Ursids | Dec 22-23 | 10 | Comet 8P/Tuttle |

For each shower, compute moon interference dynamically using astronomy-engine MoonPhase for the peak date.

---

## 10. Implementation Plan

This feature ships as a single implementation. However, internal task ordering matters for dependency management. Execute tasks in the following order within the single branch.

### Task Group A: Foundation - Data Layer (do first)

1. Install npm dependencies: `astronomy-engine`, `satellite.js`
2. Create `lib/stargazer/types.ts` with all TypeScript interfaces for the Stargazer feature including StargazerScore, HourlyCondition, PlanetVisibility, DeepSkyHighlight, ISSPass, Launch, MeteorShower types
3. Create `lib/stargazer/seven-timer.ts` with typed fetch function for 7Timer ASTRO endpoint, including response parsing and scale mapping helpers
4. Create `lib/stargazer/astronomy.ts` wrapping astronomy-engine with helper functions for: astronomical twilight calculation, moon phase and position, planet positions and rise/set times, deep sky object alt/az conversion from RA/Dec
5. Create `lib/stargazer/satellites.ts` with ISS TLE fetching from CelesTrak and pass prediction using satellite.js
6. Create `lib/stargazer/launches.ts` with typed fetch function for Launch Library 2 upcoming launches endpoint
7. Create `lib/stargazer/score.ts` with the complete Stargazer Score algorithm including all sub-score functions and natural language summary generator
8. Create `data/deep-sky-catalog.json` with the full ~150 object catalog matching the DeepSkyObject interface
9. Create `data/meteor-showers.json` with the 12 major annual meteor showers matching the MeteorShower interface

### Task Group B: API Routes (do second)

1. Create `app/api/stargazer/route.ts` as the main Stargazer API endpoint. Accepts `lat` and `lon` query parameters. Orchestrates all data fetching and computation:
   - Fetches Open-Meteo hourly data for tonight (cloud cover layers, humidity, dewpoint, wind, temp, visibility) - can reuse existing Open-Meteo proxy or make a direct call with stargazer-specific variables
   - Fetches 7Timer ASTRO data
   - Computes astronomical calculations (twilight, moon, planets, deep sky)
   - Computes ISS passes
   - Fetches upcoming launches
   - Calculates the Stargazer Score
   - Returns a single consolidated JSON response with all data needed to render the page
   - ISR caching: revalidate 900 seconds
2. Create `app/api/stargazer/tle/route.ts` as a CelesTrak TLE proxy with 24-hour cache

### Task Group C: UI Components (do third)

1. Create `components/stargazer/StargazerScore.tsx` - the hero score display with large number, color, label, summary text, and sub-score bars
2. Create `components/stargazer/HourlyTimeline.tsx` - the color-coded conditions grid from sunset to sunrise
3. Create `components/stargazer/MoonIntel.tsx` - moon phase display, rise/set, dark window, next new/full moon
4. Create `components/stargazer/PlanetTable.tsx` - planet visibility table for tonight
5. Create `components/stargazer/DeepSkyHighlights.tsx` - tonight's best deep sky targets
6. Create `components/stargazer/SkyEvents.tsx` - upcoming meteor showers, conjunctions, eclipses
7. Create `components/stargazer/ISSPasses.tsx` - ISS pass prediction table
8. Create `components/stargazer/LaunchSchedule.tsx` - upcoming rocket launches
9. Create `components/stargazer/StargazerAttribution.tsx` - data source attribution footer
10. Create `components/stargazer/StargazerCard.tsx` - compact dashboard widget for the main city page

### Task Group D: Page and Navigation (do fourth)

1. Create `app/stargazer/page.tsx` (or `app/city/[slug]/stargazer/page.tsx` depending on routing pattern) as the full Stargazer page that composes all components
2. Add navigation link to Stargazer page in the site header/nav matching existing navigation patterns
3. Add the StargazerCard widget to the main city dashboard grid
4. Add attribution text to the footer component

### Task Group E: Testing and Polish (do last)

1. Write unit tests for `lib/stargazer/score.ts` covering edge cases: perfect night (score ~100), overcast (score ~0), full moon (score ~30-50), mixed conditions
2. Write unit tests for `lib/stargazer/astronomy.ts` verifying planet positions against known values
3. Write unit tests for 7Timer response parsing and scale mapping
4. Write unit tests for deep sky object selection algorithm
5. Add Playwright E2E test: Stargazer page loads with all sections populated
6. Add Playwright E2E test: StargazerCard widget displays on dashboard
7. Run Lighthouse on the Stargazer page and confirm Performance >= 90 on mobile
8. Verify all retro themes render correctly on the Stargazer page
9. Verify responsive layout works on mobile viewports

---

## 11. Testing Strategy

### Unit Tests

- Test Stargazer Score algorithm with known inputs producing expected outputs
- Test all sub-score functions individually (cloudScore, moonScore, seeingScore, transparencyScore, groundScore)
- Test 7Timer response parsing for all scale values
- Test astronomical twilight calculation against known times for specific dates and locations
- Test planet position calculations against JPL Horizons reference values for 3-5 test dates
- Test deep sky object alt/az conversion against known catalog positions
- Test deep sky object selection algorithm: correct filtering by altitude, correct sorting by transit altitude and season
- Test ISS pass prediction against known pass times (compare with Heavens Above for validation)
- Test meteor shower moon interference calculation
- Test Launch Library 2 response parsing

### Integration Tests

- Test `/api/stargazer` route returns valid JSON with all expected fields
- Test 7Timer proxy handles HTTP-only source correctly
- Test CelesTrak TLE fetch and parse succeeds
- Test Launch Library 2 fetch handles rate limiting gracefully (return cached data)
- Test graceful degradation when 7Timer is unreachable (show Open-Meteo data only, mark seeing/transparency as unavailable)
- Test graceful degradation when Launch Library is unreachable (hide section)

### E2E Tests (Playwright)

- Stargazer page loads without errors for a US location
- All 9 sections render with content (no empty sections except ISS passes which may legitimately be empty)
- Stargazer Score displays a number between 0 and 100
- Hourly timeline renders correct number of columns (sunset to sunrise hours)
- Planet table shows at least one planet
- Deep sky highlights shows at least one object
- StargazerCard on dashboard shows score and links to full page
- Page loads and renders in under 3 seconds

### Lighthouse

- Run Lighthouse on `/stargazer` page
- Performance score must be >= 90 on mobile
- If heavy astronomical computations cause server response time issues, consider pre-computing and caching more aggressively

---

## 12. Quality Gates

All tasks must pass ALL of these before merging:

1. `npm run build` completes with zero errors and zero warnings
2. `npm run lint` passes
3. TypeScript strict mode passes (no `any` types in new code)
4. Lighthouse Performance >= 90 on mobile for the Stargazer page
5. Lighthouse Performance >= 90 on mobile for the main dashboard page (StargazerCard must not degrade performance)
6. No hydration errors in browser console
7. All existing Playwright E2E tests continue to pass
8. New unit tests for scoring algorithm pass
9. New E2E tests for Stargazer page pass
10. Stargazer page renders correctly in at least 3 retro themes (Dark Terminal, Synthwave, 8-Bit Classic)
11. Responsive layout works on mobile viewport (375px width)
12. All data source attributions are visible on the page

---

## 13. Claude CLI Execution Prompt

Use the following prompt to feed this PRD to Claude CLI for execution. This is a single-phase build. Copy the entire block below as a single prompt.

IMPORTANT: Because the Ralph Loop prompt parser does not handle special characters well, the prompt below avoids parentheses, quotes, colons after the first word, and line breaks within the prompt block. If splitting into sub-tasks for parallel worktrees, each sub-prompt should follow the same constraint.

---

### Prompt for Full Build

```
Read the file docs/PRD-stargazer.md completely. Execute all task groups A through E in order. First install astronomy-engine and satellite.js as dependencies. Create all TypeScript interfaces in lib/stargazer/types.ts matching Section 5 and Section 6 of the PRD. Create lib/stargazer/seven-timer.ts with a typed fetch function for the 7Timer ASTRO API endpoint that proxies through HTTP and parses the response into typed objects with seeing and transparency scale mappings. Create lib/stargazer/astronomy.ts wrapping the astronomy-engine npm package with helper functions for astronomical twilight times and moon phase and illumination and planet positions with altitude azimuth magnitude and rise set times and deep sky object RA Dec to alt az coordinate conversion. Create lib/stargazer/satellites.ts that fetches ISS TLE data from CelesTrak and computes pass predictions using satellite.js. Create lib/stargazer/launches.ts that fetches upcoming launches from Launch Library 2 API. Create lib/stargazer/score.ts implementing the complete Stargazer Score algorithm from Section 5 including cloudScore moonScore seeingScore transparencyScore groundScore and the composite stargazerScore function plus a natural language summary generator. Create data/deep-sky-catalog.json with approximately 150 deep sky objects including all 110 Messier objects plus the NGC and IC targets listed in Section 8 with RA Dec magnitude size bestMonths difficulty and description fields. Create data/meteor-showers.json with the 12 major annual meteor showers from Section 9. Create app/api/stargazer/route.ts as the main API endpoint that accepts lat and lon and orchestrates all data sources and returns a single consolidated JSON response with ISR caching at 900 seconds. Create app/api/stargazer/tle/route.ts as a CelesTrak TLE proxy with 24 hour cache. Create all UI components in components/stargazer/ following the layout described in Section 6 including StargazerScore HourlyTimeline MoonIntel PlanetTable DeepSkyHighlights SkyEvents ISSPasses LaunchSchedule StargazerAttribution and StargazerCard. Create the Stargazer page at app/stargazer/page.tsx composing all components. Add navigation to the Stargazer page in the site nav. Add the StargazerCard widget to the main city dashboard. Add attribution text to the footer. Write unit tests for the scoring algorithm and astronomy helpers. Add Playwright E2E tests for the Stargazer page loading and the dashboard widget rendering. Ensure all retro themes apply correctly to Stargazer components. Run npm run build and confirm zero errors. Run npm run lint and confirm it passes. Run Lighthouse on the Stargazer page and the main dashboard and confirm Performance is 90 or above on mobile for both.
```

### Alternate Sub-Prompts for Parallel Worktrees

If using parallel worktrees with the orchestrator pattern, split into these focused sub-tasks. Task Group A must complete first. Groups B C and D can run in parallel after A. Group E runs last.

**Sub-prompt A - Foundation Data Layer:**

```
Read the file docs/PRD-stargazer.md completely. Execute Task Group A only. Install astronomy-engine and satellite.js. Create all files in lib/stargazer/ and data/ as specified. Do not create any components pages or API routes. Ensure all new files pass TypeScript strict mode. Run npm run build and confirm zero errors.
```

**Sub-prompt B - API Routes:**

```
Read the file docs/PRD-stargazer.md completely. Execute Task Group B only. Create app/api/stargazer/route.ts and app/api/stargazer/tle/route.ts as specified in the PRD. The route handler should import from lib/stargazer/ modules created in Task Group A. Use ISR caching with revalidate 900 for the main endpoint and 86400 for the TLE endpoint. Run npm run build and confirm zero errors.
```

**Sub-prompt C - UI Components:**

```
Read the file docs/PRD-stargazer.md completely. Execute Task Group C only. Create all components in components/stargazer/ as specified in Section 6. Components should accept typed props matching the API response shape from lib/stargazer/types.ts. Use the existing retro theme CSS variables for all colors. Do not create pages or API routes. Run npm run build and confirm zero errors.
```

**Sub-prompt D - Page Navigation and Integration:**

```
Read the file docs/PRD-stargazer.md completely. Execute Task Group D only. Create the Stargazer page at app/stargazer/page.tsx composing all components from components/stargazer/. Add navigation link to the site header. Add StargazerCard to the main city dashboard grid. Add data source attribution to the footer. Run npm run build and confirm zero errors.
```

**Sub-prompt E - Testing and Polish:**

```
Read the file docs/PRD-stargazer.md completely. Execute Task Group E only. Write unit tests for lib/stargazer/score.ts covering perfect night and overcast and full moon and mixed conditions scenarios. Write unit tests for astronomy helpers verifying planet positions. Add Playwright E2E tests for the Stargazer page loading with all sections and for the dashboard widget. Run all tests. Run Lighthouse on the Stargazer page and main dashboard and confirm Performance is 90 or above on mobile.
```

---

## Appendix A: Attribution Requirements

### 7Timer
7Timer is a free service. No specific license text is required but credit is good practice:
> "Astronomical seeing and transparency data from [7Timer.info](http://7timer.info/)"

### astronomy-engine
MIT licensed. No attribution required but credit is good practice:
> "Celestial calculations powered by [Astronomy Engine](https://github.com/cosinekitty/astronomy)"

### Launch Library 2 (The Space Devs)
Free to access. Attribution encouraged:
> "Launch data from [The Space Devs](https://thespacedevs.com/)"

### CelesTrak
Public domain TLE data:
> "Satellite tracking data from [CelesTrak](https://celestrak.org/)"

### Open-Meteo
Already attributed in site footer from Open-Meteo migration.

---

## Appendix B: Rate Limits Reference

| Source | Rate Limit | Our Caching Strategy | Effective Calls |
|--------|-----------|---------------------|-----------------|
| Open-Meteo | 10,000/day | Reuse existing proxy (revalidate 900s) | Shared with main weather |
| 7Timer ASTRO | Reasonable use (no published limit) | Revalidate every 10,800s (3hr) | ~8/day per location |
| Launch Library 2 | 15/hour per IP | Revalidate every 3,600s (1hr) | ~1/hour total |
| CelesTrak TLE | No published limit | Revalidate every 86,400s (24hr) | 1/day |
| astronomy-engine | N/A (local computation) | Cache computed results for 3,600s | N/A |
| satellite.js | N/A (local computation) | Recompute with each API request | N/A |

---

## Appendix C: Files Expected to Be Created

### New dependencies
- `astronomy-engine` (npm)
- `satellite.js` (npm)

### New data files
- `data/deep-sky-catalog.json`
- `data/meteor-showers.json`

### New library files
- `lib/stargazer/types.ts`
- `lib/stargazer/seven-timer.ts`
- `lib/stargazer/astronomy.ts`
- `lib/stargazer/satellites.ts`
- `lib/stargazer/launches.ts`
- `lib/stargazer/score.ts`

### New API routes
- `app/api/stargazer/route.ts`
- `app/api/stargazer/tle/route.ts`

### New components
- `components/stargazer/StargazerScore.tsx`
- `components/stargazer/HourlyTimeline.tsx`
- `components/stargazer/MoonIntel.tsx`
- `components/stargazer/PlanetTable.tsx`
- `components/stargazer/DeepSkyHighlights.tsx`
- `components/stargazer/SkyEvents.tsx`
- `components/stargazer/ISSPasses.tsx`
- `components/stargazer/LaunchSchedule.tsx`
- `components/stargazer/StargazerAttribution.tsx`
- `components/stargazer/StargazerCard.tsx`

### New pages
- `app/stargazer/page.tsx`

### Modified files
- `package.json` (new dependencies)
- Site navigation component (add Stargazer link)
- Main dashboard grid component (add StargazerCard)
- Site footer component (add attributions)

### New test files
- `__tests__/stargazer/score.test.ts`
- `__tests__/stargazer/astronomy.test.ts`
- `e2e/stargazer.spec.ts`

---

## Appendix D: Bortle Scale Reference (Future Enhancement)

Not included in v1 but documented for future consideration. The Bortle scale (1-9) classifies night sky darkness at a location. There is no free API for this data. Options for a future version:

1. **User self-configuration:** Let users set their Bortle class in preferences. This affects score interpretation ("Score 80 at Bortle 7 = good for bright targets only" vs "Score 80 at Bortle 2 = excellent for faint galaxies").
2. **Link to lightpollutionmap.info:** External resource for users to check their Bortle class.
3. **Static dataset:** The World Atlas of Artificial Night Sky Brightness (Falchi et al. 2016) dataset may be available but would require significant processing and storage.

For v1, the Stargazer Score assumes the user knows their local light pollution conditions. The score reflects atmospheric and celestial conditions only.
