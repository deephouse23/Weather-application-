# Product Requirements Document: Coronagraph Animation Fix and Flight Number Lookup

## 16-Bit Weather - Space Weather and Aviation Enhancements

**Version:** 1.0
**Date:** January 2026
**Timeline:** 1-Day Sprint with Parallel Subagent Execution

---

## 1. Executive Summary

This PRD addresses two features for 16-Bit Weather:

1. CORONAGRAPH ANIMATION FIX: The SOHO LASCO coronagraph viewer currently displays a static image despite having animation controls. Fix it to fetch and display actual historical frames.

2. FLIGHT NUMBER LOOKUP: Allow users to search by commercial flight number (e.g., AA123) instead of manually entering airport codes.

### 1.1 Performance Constraint (Ralph Loop)

CRITICAL: All implementations must maintain a Lighthouse performance score of 85 or higher. Each milestone must include Lighthouse audit results. Save results to docs/lh-coronagraph-flight-*.json.

---

## 2. Problem Analysis

### 2.1 Coronagraph Animation Issue

Current State:
- CoronagraphAnimation.tsx uses getCurrentImageUrl() which returns latest.jpg with cache-busting
- Frame counter increments but all frames show the identical image
- The /api/space-weather/coronagraph route already generates timestamped frame URLs but is never called

Root Cause: Component does not fetch actual frame URLs from API.

### 2.2 Flight Number Lookup Gap

Current State:
- Users must know ICAO airport codes (KLAX, KJFK) to use turbulence lookup
- Most travelers only know their flight number (AA123, UA456)
- No way to convert flight number to departure/arrival airports

---

## 3. Goals and Success Metrics

| Goal | Feature | Success Criteria |
|------|---------|------------------|
| Working Animation | Coronagraph | Frames visibly change during playback |
| Flight Lookup | Aviation | User enters AA123, sees route plus turbulence |
| Performance | Both | Lighthouse 85 or higher on affected pages |

---

## 4. Technical Architecture

### 4.1 Coronagraph Animation Fix

Data Flow (Fixed):
1. Component Mount
2. Fetch /api/space-weather/coronagraph?camera=c2&frames=12
3. Receive array of timestamped frame URLs
4. Preload frames in background
5. Play button cycles through actual different frames

Frame URL Strategy:
- Option A: SOHO Archive URLs (Recommended) - historical images at predictable URLs
- Option B: Pre-made Animated GIFs as fallback

Files to Modify:
- components/space-weather/CoronagraphAnimation.tsx - Fetch frames from API, implement preloading
- app/api/space-weather/coronagraph/route.ts - Verify frame URL generation, add fallback

### 4.2 Flight Number Lookup

API Selection:
- Primary: AeroDataBox (RapidAPI) - 300 free requests/month
- Fallback: Aviationstack - 100 free requests/month

Data Flow:
1. User Input: AA123
2. Call /api/aviation/flight-lookup?flight=AA123
3. External API returns departure/arrival airports
4. Auto-populate FlightRouteLookup component
5. Fetch PIREPs along route and display turbulence

Files to Create:
- app/api/aviation/flight-lookup/route.ts - Flight number to route lookup API
- components/aviation/FlightNumberInput.tsx - Input component

Files to Modify:
- components/aviation/FlightRouteLookup.tsx - Accept flight data prop
- components/aviation/FlightConditionsTerminal.tsx - Add flight number section
- components/aviation/index.ts - Export new component

---

## 5. Implementation Plan

### 5.1 Subagent Architecture

This PRD is designed for parallel execution by two subagents:

ORCHESTRATOR (Claude)
- Coordinates subagents
- Runs Lighthouse audits
- Handles merge

SUBAGENT A: CORONAGRAPH
- CoronagraphAnimation.tsx
- coronagraph API route
- Frame preloading
- Target: /space-weather page

SUBAGENT B: FLIGHT LOOKUP
- flight-lookup API
- FlightNumberInput component
- FlightRouteLookup updates
- Terminal integration
- Target: /aviation page

Both pages must score 85 or higher on Lighthouse before merge.

### 5.2 Subagent A: Coronagraph Fix (Hours 1-4)

Phase A1: API Integration (1 hour)
1. Review existing /api/space-weather/coronagraph/route.ts
2. Verify frame URL generation produces valid SOHO archive URLs
3. Add fallback to animated GIF if frames unavailable
Checkpoint: API returns 12 distinct frame URLs

Phase A2: Component Update (2 hours)
1. Add state for frame URLs array
2. Fetch frames on mount and camera change
3. Update getCurrentImageUrl() to use frames[currentFrame]
4. Implement frame preloading (next 3 frames)
5. Add loading state while fetching frames
6. Handle errors gracefully (fallback to latest image)
Checkpoint: Play button cycles through visibly different frames

Phase A3: Polish and Performance (1 hour)
1. Add frame loading progress indicator
2. Optimize preloading
3. Run Lighthouse audit, save to docs/lh-coronagraph-fix.json
Checkpoint: Lighthouse 85 or higher on /space-weather

### 5.3 Subagent B: Flight Lookup (Hours 1-4)

Phase B1: API Route (1.5 hours)
1. Create app/api/aviation/flight-lookup/route.ts
2. Implement flight number parsing (handle AA123, AA 123, aa123)
3. Call AeroDataBox or Aviationstack API
4. Transform response to standard format
5. Implement 1-hour cache
6. Handle errors: invalid flight, API limits, network failures
Checkpoint: GET /api/aviation/flight-lookup?flight=AA123 returns route data

Phase B2: UI Components (1.5 hours)
1. Create FlightNumberInput.tsx with text input and search button
2. Update FlightRouteLookup.tsx to accept flight data prop
3. Auto-populate departure/arrival when flight found
Checkpoint: User can enter AA123 and see route populate

Phase B3: Integration and Polish (1 hour)
1. Add Flight Number Lookup section to FlightConditionsTerminal
2. Connect flight lookup to turbulence map
3. Run Lighthouse audit, save to docs/lh-flight-lookup.json
Checkpoint: Lighthouse 85 or higher on /aviation

### 5.4 Orchestrator: Merge and Validate (Hours 5-6)

1. Review both subagent outputs
2. Run full Lighthouse audit on both pages
3. Run Playwright E2E tests
4. Fix any integration issues
5. Final Lighthouse verification
6. Deploy to Vercel

---

## 6. API Specifications

### 6.1 Coronagraph Frames API

Endpoint: GET /api/space-weather/coronagraph
Query Parameters:
- camera: c2 or c3 (default c2)
- frames: number 6-24 (default 12)

Response:
- success: boolean
- data.frames: array of {timestamp, url, available}
- data.fallbackGif: string URL

### 6.2 Flight Lookup API

Endpoint: GET /api/aviation/flight-lookup
Query Parameters:
- flight: string (required) - e.g., AA123, UA456
- date: string (optional) - YYYY-MM-DD format

Response:
- success: boolean
- data.flightNumber: string
- data.airline: {name, iata, icao}
- data.departure: {icao, iata, name, city, lat, lon, scheduledTime}
- data.arrival: {icao, iata, name, city, lat, lon, scheduledTime}
- data.status: scheduled, active, landed, cancelled, diverted

Error Responses:
- 400: INVALID_FLIGHT_NUMBER
- 404: FLIGHT_NOT_FOUND
- 429: RATE_LIMITED
- 500: API_ERROR

---

## 7. Performance Requirements

### 7.1 Lighthouse Targets

| Metric | Target |
|--------|--------|
| Performance Score | 85 or higher |
| First Contentful Paint | under 1.8s |
| Largest Contentful Paint | under 2.5s |
| Cumulative Layout Shift | under 0.1 |
| Total Blocking Time | under 200ms |

### 7.2 Optimization Strategies

Coronagraph:
- Lazy load animation component
- Preload only next 3 frames
- Use smaller resolution images (512px)

Flight Lookup:
- Cache flight lookup results (1 hour TTL)
- Debounce search input (300ms)
- Lazy load FlightNumberInput component
- Use skeleton loaders during API calls

---

## 8. Testing Strategy

### 8.1 Coronagraph Tests

Manual:
1. Load /space-weather page
2. Click Play button
3. Verify frames visibly change
4. Switch between C2 and C3 cameras
5. Verify new frames load for each camera

### 8.2 Flight Lookup Tests

Manual:
1. Navigate to /aviation
2. Enter AA123 and click Search
3. Verify route populates
4. Verify turbulence data loads along route
5. Test invalid flight number

---

## 9. Error Handling

### 9.1 Coronagraph Errors

- API returns no frames: Fall back to animated GIF
- Animated GIF unavailable: Fall back to latest.jpg
- Frame image 404: Skip frame, continue animation
- Network timeout: Show error message, retry button

### 9.2 Flight Lookup Errors

- Invalid flight format: Enter a flight number like AA123 or UA456
- Flight not found: Flight not found. Check the number and try again.
- API rate limited: Too many searches. Please try again in a few minutes.
- Network error: Unable to search. Check your connection.
- API unavailable: Flight lookup temporarily unavailable. Enter airports manually below.

---

## 10. Environment Variables

Add to .env.local:

AERODATABOX_API_KEY=your_aerodatabox_key
AVIATIONSTACK_API_KEY=your_aviationstack_key
FLIGHT_API_PROVIDER=aerodatabox

---

## 11. File Structure

```text
app/
  api/
    aviation/
      flight-lookup/
        route.ts          # NEW
    space-weather/
      coronagraph/
        route.ts          # MODIFY
components/
  aviation/
    FlightConditionsTerminal.tsx  # MODIFY
    FlightNumberInput.tsx         # NEW
    FlightRouteLookup.tsx         # MODIFY
    index.ts                      # MODIFY
  space-weather/
    CoronagraphAnimation.tsx      # MODIFY
docs/
  PRD-coronagraph-flight-lookup.md
  lh-coronagraph-fix.json
  lh-flight-lookup.json
```

---

## 12. Acceptance Criteria

### 12.1 Coronagraph Animation

- Animation plays with visibly different frames
- C2 and C3 cameras both work
- Graceful fallback if frames unavailable
- Loading state shown while fetching frames
- Lighthouse score 85 or higher on /space-weather

### 12.2 Flight Number Lookup

- User can enter flight number (AA123, UA456, etc.)
- Valid flight returns departure and arrival airports
- Airports auto-populate in route lookup
- Turbulence data displays along route
- Invalid flight shows helpful error message
- Works without API key (falls back to manual entry)
- Lighthouse score 85 or higher on /aviation

---

## 14. Subagent Prompts

### 14.1 Orchestrator Prompt

You are coordinating two parallel implementation tasks for 16-Bit Weather. Read this PRD completely before proceeding.

TASK: Implement Coronagraph Animation Fix and Flight Number Lookup using subagents.

SUBAGENT A (Coronagraph):
- Fix CoronagraphAnimation.tsx to fetch actual frame URLs from API
- Update /api/space-weather/coronagraph if needed
- Implement frame preloading
- Target: Animation shows visibly different frames when playing

SUBAGENT B (Flight Lookup):
- Create /api/aviation/flight-lookup API route
- Create FlightNumberInput.tsx component
- Update FlightRouteLookup.tsx to accept flight data
- Integrate into FlightConditionsTerminal.tsx
- Target: User enters AA123, sees route plus turbulence

CONSTRAINTS:
1. Lighthouse score must be 85 or higher on both /space-weather and /aviation
2. Run Lighthouse after each phase, save to docs/lh-*.json
3. All changes must follow existing code patterns
4. Use lazy loading for new components
5. Handle errors gracefully with user-friendly messages

EXECUTION ORDER:
1. Spawn Subagent A for Coronagraph (Phases A1-A3)
2. Spawn Subagent B for Flight Lookup (Phases B1-B3)
3. Wait for both to complete
4. Run integration tests
5. Final Lighthouse audit on both pages
6. Fix any issues, re-audit if needed
7. Summarize changes and results

BEGIN by reading this full PRD, then spawn both subagents.

### 14.2 Subagent A Prompt (Coronagraph)

You are Subagent A, responsible for fixing the Coronagraph Animation feature.

CONTEXT: Read docs/PRD-coronagraph-flight-lookup.md, focusing on sections 4.1, 5.2, 6.1.

YOUR TASK: Fix CoronagraphAnimation.tsx so the animation shows actual different frames.

CURRENT PROBLEM:
- Component shows same image regardless of frame counter
- getCurrentImageUrl() just adds cache-busting to latest.jpg
- API at /api/space-weather/coronagraph generates frame URLs but is never called

IMPLEMENTATION STEPS:

PHASE A1 (API Integration):
1. Read app/api/space-weather/coronagraph/route.ts
2. Verify it generates valid SOHO archive URLs
3. Test the API endpoint
4. Verify returned URLs resolve to different images

PHASE A2 (Component Update):
1. Read components/space-weather/CoronagraphAnimation.tsx
2. Add state: frames array, isLoadingFrames boolean
3. Add useEffect to fetch frames from API on mount and camera change
4. Update getCurrentImageUrl() to return frames[currentFrame]
5. Add frame preloading (next 3 frames)
6. Handle errors: fall back to latest.jpg if API fails

PHASE A3 (Polish):
1. Add loading indicator while fetching frames
2. Test play/pause/step controls
3. Test C2/C3 camera switching
4. Run Lighthouse audit, save to docs/lh-coronagraph-fix.json
5. Verify score 85 or higher

CONSTRAINTS:
- DO NOT change the visual design or layout
- DO NOT remove existing functionality
- MUST maintain lazy loading of component
- MUST handle errors gracefully

DELIVERABLES:
1. Updated CoronagraphAnimation.tsx
2. Updated coronagraph/route.ts (if needed)
3. Lighthouse report at docs/lh-coronagraph-fix.json
4. Summary of changes

BEGIN by reading the existing CoronagraphAnimation.tsx file.

### 14.3 Subagent B Prompt (Flight Lookup)

You are Subagent B, responsible for implementing Flight Number Lookup.

CONTEXT: Read docs/PRD-coronagraph-flight-lookup.md, focusing on sections 4.2, 5.3, 6.2.

YOUR TASK: Add ability to search turbulence by flight number (e.g., AA123).

CURRENT STATE:
- FlightRouteLookup.tsx requires manual airport code entry (KLAX, KJFK)
- No way to convert flight number to route
- Most travelers only know their flight number

IMPLEMENTATION STEPS:

PHASE B1 (API Route):
1. Create app/api/aviation/flight-lookup/route.ts
2. Accept query param: ?flight=AA123
3. Parse flight number (handle AA123, AA 123, aa123)
4. Call external API (check if AERODATABOX_API_KEY or AVIATIONSTACK_API_KEY exists)
5. Transform response to standard format (see PRD section 6.2)
6. Implement 1-hour cache
7. Handle errors: 400 invalid, 404 not found, 429 rate limited
8. Test the endpoint

PHASE B2 (UI Components):
1. Create components/aviation/FlightNumberInput.tsx
   - Input field with placeholder Enter flight e.g. AA123
   - Search button with loading spinner
   - Error message display
   - data-testid attributes for testing
2. Update components/aviation/FlightRouteLookup.tsx
   - Add optional prop: initialFlight
   - When initialFlight provided, auto-fill departure/arrival
   - Auto-trigger route analysis
3. Export FlightNumberInput from components/aviation/index.ts

PHASE B3 (Integration):
1. Update components/aviation/FlightConditionsTerminal.tsx
   - Add Flight Number Lookup section above route lookup
   - Connect FlightNumberInput to FlightRouteLookup
   - When flight found, pass data to FlightRouteLookup
2. Run Lighthouse audit, save to docs/lh-flight-lookup.json
3. Verify score 85 or higher

CONSTRAINTS:
- MUST use lazy loading for FlightNumberInput
- MUST match existing code style (check FlightRouteLookup.tsx)
- MUST use theme classes from useTheme()
- MUST handle API unavailable gracefully (show manual entry fallback)
- DO NOT require API key for basic functionality

DELIVERABLES:
1. New app/api/aviation/flight-lookup/route.ts
2. New components/aviation/FlightNumberInput.tsx
3. Updated components/aviation/FlightRouteLookup.tsx
4. Updated components/aviation/FlightConditionsTerminal.tsx
5. Updated components/aviation/index.ts
6. Lighthouse report at docs/lh-flight-lookup.json
7. Summary of changes

BEGIN by reading the existing FlightRouteLookup.tsx and FlightConditionsTerminal.tsx files.

---

## 15. Airline IATA Codes Reference

| Code | Airline |
|------|---------|
| AA | American Airlines |
| UA | United Airlines |
| DL | Delta Air Lines |
| WN | Southwest Airlines |
| B6 | JetBlue Airways |
| AS | Alaska Airlines |
| NK | Spirit Airlines |
| F9 | Frontier Airlines |
| G4 | Allegiant Air |
| HA | Hawaiian Airlines |

---

END OF PRD
