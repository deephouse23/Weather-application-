# Product Requirements Document: Aviation & Turbulence Forecasts

## 16-Bit Weather - FLIGHT CONDITIONS Terminal

**Version:** 1.0  
**Date:** January 2026  
**Timeline:** 1-Day Sprint

---

## 1. Executive Summary

This PRD outlines the implementation of an Aviation & Turbulence Forecasts feature for 16-Bit Weather. The feature will provide pilots, aviation enthusiasts, and frequent flyers with real-time turbulence forecasts, jet stream visualization, and SIGMET/AIRMET alerts presented in an authentic retro terminal aesthetic.

The feature aligns with the existing 16-bit terminal design language while introducing specialized aviation weather data that differentiates 16bitweather.co from mainstream weather applications. **This is an open source project with no pricing tiers - all features available to authenticated users for free.**

### 1.1 Performance Constraint (Ralph Loop)

**Critical Requirement:** All implementations must maintain a Lighthouse performance score of **85 or higher**. Each milestone must include Lighthouse audit results before proceeding.

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals

Provide actionable aviation weather intelligence in a retro terminal format. Target audience includes private pilots, aviation enthusiasts, frequent business travelers, and anyone with flight anxiety who wants turbulence forecasts.

### 2.2 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse Score | ≥ 85 | CI/CD Lighthouse audit |
| Page Load Time | < 3 seconds | Core Web Vitals |
| Feature Adoption | 15% of users | Analytics tracking |
| Data Freshness | < 15 min stale | API response timestamps |

---

## 3. Feature Scope

### 3.1 Core Features (MVP)

**Turbulence Forecast Display:** Real-time turbulence intensity maps showing light, moderate, severe, and extreme turbulence zones. Route-based turbulence forecasts for popular flight corridors with altitude-specific data (FL200-FL450).

**Jet Stream Visualization:** Interactive jet stream position and intensity display with wind speed indicators. Historical jet stream movement animation (past 24 hours) and forecast projection (next 48 hours).

**SIGMET/AIRMET Alerts:** Real-time aviation weather alerts in classic teletype format. Alert categories include turbulence, icing, volcanic ash, mountain obscuration, IFR conditions, and convective activity. Auto-scrolling alert ticker with severity color coding.

**Flight Route Analysis:** Input departure/arrival airports (ICAO codes) to analyze route conditions. Display expected turbulence encounters along route with timing estimates.

### 3.2 Enhanced Features (Post-MVP)

- PIREP Integration (Pilot Reports)
- METAR/TAF display for airports
- Icing forecasts with freezing level indicators
- Clear Air Turbulence (CAT) specific forecasts
- Flight number lookup for commercial flights
- Push notifications for route-specific alerts

### 3.3 Out of Scope

- Flight booking/ticketing integration
- Real-time flight tracking (FlightAware-style)
- ATC communication or frequencies
- Detailed airport diagrams/charts
- Full EFB (Electronic Flight Bag) functionality

---

## 4. Technical Architecture

### 4.1 Data Sources (Cost-Efficient - All Free)

| Source | Data Type | Cost | Endpoint |
|--------|-----------|------|----------|
| NOAA AWC (Primary) | SIGMET, AIRMET, PIREPs | FREE | aviationweather.gov/api |
| NOAA GFS | Turbulence forecasts, Jet stream | FREE | nomads.ncep.noaa.gov |
| NOAA GTG | Graphical Turbulence Guidance | FREE | aviationweather.gov/gfa |
| OpenWeatherMap | Wind aloft, general weather | EXISTING | api.openweathermap.org |

**Note:** All data sources are free government APIs or existing integrations. No paid third-party APIs (like Turbli) are used to keep the project cost-free.

### 4.2 Component Architecture

New route at `/aviation`. Components to be created in `src/components/aviation/` directory following existing patterns from radar implementation.

**Primary Components:**
- `FlightConditionsTerminal.tsx` - Main container with retro terminal styling
- `TurbulenceMap.tsx` - Leaflet-based turbulence visualization (reuse radar patterns)
- `JetStreamOverlay.tsx` - Animated jet stream display layer
- `AlertTicker.tsx` - SIGMET/AIRMET scrolling display
- `RouteAnalyzer.tsx` - Flight route input and analysis
- `AltitudeSelector.tsx` - Flight level selection control

### 4.3 API Routes

- `src/app/api/aviation/alerts/route.ts` - SIGMET/AIRMET data
- `src/app/api/aviation/turbulence/route.ts` - Turbulence forecast data
- `src/app/api/aviation/jetstream/route.ts` - Jet stream data
- `src/app/api/ai/aviation-context/route.ts` - Aviation context for AI

---

## 5. UI/UX Design

### 5.1 Terminal Aesthetic

The aviation feature will embrace the classic aviation teletype/AFTN (Aeronautical Fixed Telecommunication Network) aesthetic. All data displays should feel like reading from a vintage flight service station terminal.

**Visual Elements:**
- Monospace font throughout (Inconsolata per existing system)
- Green/amber text on dark background for alerts
- Blinking cursor effects on active elements
- CRT scanline overlay option
- ASCII-style borders and decorations
- Typewriter animation for alert text

### 5.2 Layout Structure

- **Terminal Header:** FLIGHT CONDITIONS TERMINAL v1.0 with timestamp and data source indicator
- **Alert Ticker (Top):** Scrolling SIGMET/AIRMET alerts in teletype format
- **Main Display (Center):** Turbulence map with jet stream overlay, retro-styled with pixel effects
- **Control Panel (Left):** Layer toggles, altitude selector, time controls
- **Route Analyzer (Right):** Airport input fields, route display, turbulence timeline
- **Legend/Status Bar (Bottom):** Turbulence intensity scale, data freshness, system status

### 5.3 Theme Integration

Must support all existing themes: Dark Terminal, Miami Vice, Tron Grid, Synthwave, Tokyo Night, Dracula, Cyberpunk, Matrix, plus premium themes (Atari, Monochrome Green, 8-Bit Classic, 16-Bit SNES). Each theme should have aviation-specific color mappings for turbulence severity levels.

---

## 6. Implementation Plan (1-Day Sprint)

**Timeline:** Complete implementation in a single day using Claude CLI (Ralph). Focus on MVP functionality with clean, working code.

### 6.1 Morning: Foundation (Hours 1-4)

1. Update navigation to 6-item structure (HOME, RADAR, AVIATION, EDUCATION, AI, User)
2. Create `/education` hub page with cards linking to existing pages
3. Create `/aviation` page with FlightConditionsTerminal container
4. Implement NOAA AWC API route for SIGMET/AIRMET
5. **Lighthouse checkpoint (must pass ≥85)**

### 6.2 Afternoon: Features (Hours 5-8)

1. Build AlertTicker component with teletype animation
2. Create `/ai` page with expanded chat interface
3. Add aviation context injection to AI
4. Implement quick action buttons and suggested prompts
5. **Lighthouse checkpoint (must pass ≥85)**

### 6.3 Evening: Polish (Hours 9-10)

1. Theme integration across all new components
2. Mobile responsive fixes
3. Authentication gating on new pages
4. Fix AI input clear-on-submit bug
5. **Final Lighthouse audit (must pass ≥85)**
6. Deploy to Vercel

---

## 7. Performance Requirements

### 7.1 Lighthouse Targets

| Metric | Target |
|--------|--------|
| Performance Score | ≥ 85 |
| First Contentful Paint | < 1.8s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Total Blocking Time | < 200ms |

### 7.2 Optimization Strategies

- Lazy load map components (dynamic import)
- Use React Server Components where possible
- Implement tile caching for map layers
- Debounce API calls for route analysis
- Use skeleton loaders to prevent CLS
- Minimize JavaScript bundle with tree shaking

---

## 8. Testing Strategy

### 8.1 Playwright E2E Tests

- Navigation to /aviation page loads successfully
- Alert ticker displays and scrolls SIGMET data
- Education hub displays all 6 cards
- AI page accepts input and responds
- Theme switching applies correctly to all components
- Authentication gate prevents unauthenticated access
- Mobile responsive layout functions correctly

### 8.2 Unit Tests

- API route handlers return correct data structures
- ICAO code validation logic
- Turbulence severity calculation
- Alert parsing and formatting

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limits | High | Implement caching, use multiple sources |
| Map performance | Medium | Lazy loading, tile caching, LOD |
| Lighthouse regression | High | Checkpoint audits each phase |
| Data accuracy | High | Disclaimer, official sources only |
| Niche audience | Medium | Market as unique differentiator |

---

## 10. Navigation Restructure

With the addition of Aviation and AI features, the navigation requires restructuring. This includes consolidating educational content into a dedicated Education hub and streamlining the primary navigation.

### 10.1 Current vs Proposed Structure

**Current (9 items):** HOME, EXTREMES, CLOUD TYPES, WEATHER SYSTEMS, 16-BIT TAKES, GAMES, NEWS, RADAR, [User]

**Proposed (7 items):** HOME | RADAR | SPACE WEATHER | AVIATION | GAMES | EDUCATION | AI | [User]

### 10.2 Education Hub (New Consolidated Section)

Create `/education` as a hub page that consolidates weather learning content:

- **Weather Systems:** Existing content from /weather-systems
- **Cloud Types:** Existing content from /cloud-types
- **16-Bit Takes:** Existing content from /fun-facts
- **Extremes:** Existing content from /extremes
- **Games:** Removed from Education hub - now top-level nav item
- **News:** Weather news and stories

The Education hub page displays these as interactive terminal-styled cards. Existing routes remain functional but are now accessible through the hub. Use `GraduationCap` icon from lucide-react.

### 10.3 Final Navigation Layout

**Desktop:** HOME | RADAR | SPACE WEATHER | AVIATION | GAMES | EDUCATION | AI | [User/Login]

**Icons:** Home, Radio, Sun, Plane, Gamepad2, GraduationCap, Bot/Sparkles, User

**Mobile:** Hamburger menu with grouped sections:
- Weather Tools: Home, Radar, Space Weather, Aviation
- Fun: Games
- Learn: Education (with sub-items)
- AI: Weather AI Assistant

---

## 11. AI Weather Assistant Expansion

Expand the existing AI chat functionality to become a comprehensive weather intelligence assistant with specialized aviation/turbulence knowledge. This transforms the AI from a simple chat into a powerful differentiator.

### 11.1 Core AI Capabilities

**Turbulence Intelligence:**
- Read and interpret SIGMET/AIRMET data in natural language
- Explain turbulence forecasts for specific routes (e.g., "What turbulence can I expect flying LAX to JFK tomorrow?")
- Provide altitude recommendations to avoid turbulence
- Translate pilot reports (PIREPs) into plain English

**Weather Education:**
- Answer questions about weather phenomena, cloud types, and systems
- Explain current weather conditions in educational context
- Connect to Education hub content for deeper learning

**Flight Planning Assistant:**
- Suggest best days/times to fly based on forecast
- Compare weather conditions for multiple routes
- Proactive alerts for saved routes (future feature)

### 11.2 AI Technical Implementation

**Context Injection:**
- Inject current SIGMET/AIRMET data into AI context
- Include current weather data for searched locations
- Provide aviation glossary for accurate terminology

**New API Routes:**
- `src/app/api/ai/aviation-context/route.ts` - Fetch and format aviation data for AI
- `src/app/api/ai/route-analysis/route.ts` - AI-powered route weather analysis
- Update existing AI chat endpoint to accept context type parameter

**UI Updates:**
- Dedicated `/ai` page with full-screen chat interface
- Quick action buttons: "Check my flight", "Explain turbulence", "Weather forecast"
- Context indicator showing what data AI has access to
- Suggested prompts carousel for new users

### 11.3 Example AI Interactions

**User:** "I'm flying from SFO to Denver tomorrow morning. Should I be worried about turbulence?"

**AI:** "Based on current forecasts, there's a SIGMET for moderate turbulence over the Rockies between FL350-FL410 tomorrow morning. Your flight will likely encounter light to moderate chop during descent into Denver. The jet stream is positioned at FL380 along your route. I'd recommend requesting FL320 if possible, or expect about 20-30 minutes of bumpy air over Colorado."

**User:** "What causes clear air turbulence?"

**AI:** "Clear Air Turbulence (CAT) happens when fast-moving air masses meet slower ones, usually near the jet stream. Unlike turbulence from storms, CAT is invisible - no clouds to warn pilots. It's most common above 15,000 feet where the jet stream lives. Want me to check if there's any CAT forecast for a specific route?"

### 11.4 AI Implementation Phases

- **Phase 1 (MVP - Today):** Aviation context injection, basic turbulence Q&A
- **Phase 2 (Future):** Route analysis, flight number lookup, proactive insights
- **Phase 3 (Future):** Saved routes with alerts, personalized recommendations

---

## 12. File Structure

```
src/
├── app/
│   ├── aviation/
│   │   └── page.tsx
│   ├── education/
│   │   └── page.tsx
│   ├── ai/
│   │   └── page.tsx
│   └── api/
│       ├── aviation/
│       │   └── alerts/route.ts
│       └── ai/
│           └── aviation-context/route.ts
└── components/
    ├── navigation.tsx (updated)
    ├── aviation/
    │   ├── FlightConditionsTerminal.tsx
    │   ├── AlertTicker.tsx
    │   └── index.ts
    ├── education/
    │   ├── EducationHub.tsx
    │   ├── EducationCard.tsx
    │   └── index.ts
    └── ai/
        ├── AIChat.tsx
        ├── QuickActions.tsx
        ├── SuggestedPrompts.tsx
        └── index.ts
```

---

## 13. Appendix

### 13.1 Glossary

- **SIGMET:** Significant Meteorological Information - warnings of severe weather
- **AIRMET:** Airmen's Meteorological Information - advisories for less severe conditions
- **PIREP:** Pilot Report - weather observations from pilots in flight
- **ICAO:** International Civil Aviation Organization - 4-letter airport codes
- **FL:** Flight Level - altitude in hundreds of feet (FL350 = 35,000 ft)
- **CAT:** Clear Air Turbulence - turbulence without visible weather
- **AWC:** Aviation Weather Center - NOAA's aviation forecast center
- **GTG:** Graphical Turbulence Guidance - NOAA turbulence product

### 13.2 Reference Links

- NOAA Aviation Weather Center: https://aviationweather.gov
- NOAA AWC API: https://aviationweather.gov/api
- Leaflet Documentation: https://leafletjs.com
- Existing Radar Implementation: `src/components/radar/`

---

## 14. UI/UX Nitpicks & Adjustments

**IMPORTANT:** The following adjustments must be applied to the Aviation/Turbulence page:

### 14.1 Turbulence Forecast Map - Auto Display

**Current Behavior (WRONG):** User must click an arrow/chevron down to expand and view the turbulence forecast map.

**Required Behavior (CORRECT):** The turbulence forecast map should be **visible by default** when the page loads. No user interaction should be required to see the map. The map is the primary feature and should be immediately visible.

```typescript
// WRONG - Map hidden by default
const [mapExpanded, setMapExpanded] = useState(false)

// CORRECT - Map visible by default
const [mapExpanded, setMapExpanded] = useState(true)
// Or better: don't use collapsible at all for the map
```

### 14.2 Alerts Position - Below the Map

**Current Behavior (WRONG):** Alert ticker at the top of the page, above the map.

**Required Behavior (CORRECT):** Alerts should be positioned **underneath the map**, not above it. The map is the hero element and should be at the top. Alerts are supplementary information.

**Layout Order:**
1. Terminal Header
2. Turbulence Map (full width, prominent)
3. Alert Ticker (below map)
4. Other controls/panels

### 14.3 Data Sources & Guide - Grouped Together

**Current Behavior (WRONG):** Data sources and usage guide are in separate sections/locations.

**Required Behavior (CORRECT):** Group "Data Sources" and "Guide" together in a single collapsible panel or footer section. This keeps reference information consolidated.

```
┌─────────────────────────────────────────────────────────────────────┐
│ DATA SOURCES & GUIDE                                         [▼]   │
├─────────────────────────────────────────────────────────────────────┤
│ Sources: NOAA AWC, NOAA GFS, NOAA GTG                              │
│ Updated: Every 15 minutes | Last refresh: 2 min ago                │
├─────────────────────────────────────────────────────────────────────┤
│ Guide:                                                              │
│ • Light (Green): Minor bumps, seatbelt optional                    │
│ • Moderate (Yellow): Seatbelt recommended                          │
│ • Severe (Orange): Stay seated, expect movement                    │
│ • Extreme (Red): Avoid - structural damage possible                │
└─────────────────────────────────────────────────────────────────────┘
```

### 14.4 Updated Page Layout

Revised layout reflecting the above nitpicks:

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Navigation Bar]                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  FLIGHT CONDITIONS TERMINAL v1.0  │  LIVE  │  2026-01-20 15:42  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                   │ │
│ │                    TURBULENCE FORECAST MAP                       │ │
│ │                   (VISIBLE BY DEFAULT - NO CLICK)                │ │
│ │                                                                   │ │
│ │              [Full-width map with jet stream overlay]            │ │
│ │                                                                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│   [FL200] [FL300] [FL350] [FL400] << Altitude selector              │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ ALERTS (SIGMET/AIRMET)                                        │ │
│ │ [Scrolling alert ticker - NOW BELOW THE MAP]                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ DATA SOURCES & GUIDE                                      [▼]   │ │
│ │ (Grouped together - collapsible)                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start for Ralph

1. Read this entire PRD (including Section 14 - Nitpicks)
2. Start with navigation update in `components/navigation.tsx`
3. Create Education hub at `app/education/page.tsx`
4. Create Aviation page at `app/aviation/page.tsx`
5. Create API route at `app/api/aviation/alerts/route.ts`
6. Create AI page at `app/ai/page.tsx`
7. Run Lighthouse after each major section (must be ≥85)
8. Deploy to Vercel when complete
