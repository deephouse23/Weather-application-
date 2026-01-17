# PRD: Earth Sciences Chat Expansion

## Overview

Expand 16bitweather.co's AI chat from a weather-focused assistant to a comprehensive **Earth Sciences** assistant covering meteorology, geology, volcanology, and seismology. The chat already handles weather queries well - this PRD focuses on adding real-time geological data and expanding the knowledge base.

## Current State

The app has a working AI chat with:
- Real-time weather data via OpenWeatherMap
- 8-day forecasts with precipitation totals
- 24-hour precipitation history (authenticated users)
- Three personality modes (STORM, SASS, CHILL)
- Rate limiting and chat history
- Location extraction and geocoding

**Key files:**
- `app/api/chat/route.ts` - Main API route
- `lib/services/ai-config.ts` - System prompt and personalities
- `components/chat/` - Chat UI components
- `hooks/useAIChat.ts` - Client-side hook

## Expansion Goals

Transform the chat into an Earth Sciences assistant that can answer:
- "Were there any earthquakes near me today?"
- "Is there volcanic activity affecting air quality?"
- "What's the geology of this area?"
- "Any seismic activity in California this week?"
- Combined queries: "Is it safe to hike today?" (weather + seismic)

---

## User Stories

### Earthquake Queries
- [x] As a user, I can ask "Were there any earthquakes near me?" and get real USGS data
- [x] As a user, I can ask "Any earthquakes in California this week?" and see recent activity
- [x] As a user, I can ask "Was that an earthquake?" and get confirmation with magnitude/location
- [x] As a user, I can ask about earthquake safety and preparedness

### Volcanic Activity
- [x] As a user, I can ask "Is there volcanic activity I should know about?" and get relevant alerts
- [x] As a user, I can ask about specific volcanoes (Kilauea, Mt. St. Helens, etc.)
- [x] As a user, I can learn how volcanic activity affects air quality and travel

### Geology Knowledge
- [x] As a user, I can ask "Tell me about the geology of my area" and learn about local terrain
- [x] As a user, I can ask about fault lines, tectonic plates, and why earthquakes happen
- [x] As a user, I can learn about geological hazards (landslides after rain, etc.)

### Combined Queries
- [x] As a user, I can ask "Is it safe to hike today?" and get weather + seismic context
- [x] As a user, I can ask "Should I be worried?" and get a comprehensive safety assessment
- [x] As a user, I can ask about conditions for outdoor activities with all factors considered

---

## Technical Requirements

### Phase 1: Expand System Prompt Knowledge Base
**Location:** `lib/services/ai-config.ts`

- [x] Add GEOLOGY section to knowledge base
  - Tectonic plates, fault lines, continental drift
  - Rock types, terrain formation, erosion
  - Regional geology patterns (why California has earthquakes, etc.)

- [x] Add SEISMOLOGY section to knowledge base
  - Earthquake mechanics (P-waves, S-waves, magnitude scales)
  - Fault types (strike-slip, thrust, normal)
  - Earthquake safety and preparedness
  - Aftershocks and earthquake swarms

- [x] Add VOLCANOLOGY section to knowledge base
  - Volcano types (shield, stratovolcano, caldera)
  - Eruption types and hazards
  - Volcanic gases and air quality impacts
  - Famous eruptions and their effects

- [x] Add EARTH SCIENCE CONNECTIONS section
  - Weather + geology interactions (mudslides, flooding, freeze-thaw)
  - Volcanic winter and climate effects
  - Tsunami basics (earthquake-triggered)

- [x] Update personality prompts to handle Earth Sciences queries naturally
- [x] Maintain the 16-bit retro friendly tone across all topics

### Phase 2: USGS Earthquake API Integration
**New file:** `lib/services/usgs-earthquake.ts`

- [x] Create USGS earthquake service
  - Endpoint: `https://earthquake.usgs.gov/fdsnws/event/1/query`
  - Parameters: format=geojson, starttime, endtime, latitude, longitude, maxradiuskm

- [x] Implement `fetchRecentEarthquakes(lat, lon, radiusKm, days)`
  - Default: 250km radius, 7 days
  - Return: array of { magnitude, location, time, depth, distance }

- [x] Implement `fetchSignificantEarthquakes(days)`
  - Get M4.5+ earthquakes globally (or regionally)
  - For "any big earthquakes lately?" type queries

- [x] Add error handling
  - Graceful fallback if USGS API is down
  - Rate limiting awareness

- [x] Add response formatting for Claude context
  - Concise format: "M3.2 earthquake 45km NE of San Jose, 2 hours ago, depth 8km"

### Phase 3: Update Chat API Route
**Location:** `app/api/chat/route.ts`

- [x] Import USGS earthquake service

- [x] Add `fetchEarthquakeContext(lat, lon)` function
  - Call USGS API for recent earthquakes near user
  - Format results for Claude context

- [x] Update context assembly
  - Add earthquake data to weather context when available
  - Create unified `EarthSciencesContext` type

- [x] Update `WeatherContext` interface in `ai-config.ts`
  ```typescript
  export interface EarthSciencesContext extends WeatherContext {
    earthquakes?: {
      recent: EarthquakeData[];
      significantNearby: boolean;
      lastSignificant?: EarthquakeData;
    };
    // Future: volcanic alerts, air quality from volcanic sources
  }
  ```

- [x] Modify POST handler to fetch earthquake data
  - Only fetch when location is known
  - Parallel fetch with weather data for performance

### Phase 4: System Prompt Context Injection
**Location:** `lib/services/ai-config.ts`

- [x] Update `buildSystemPrompt` to include earthquake data
  ```
  SEISMIC DATA (last 7 days, 250km radius):
  ================================================
  Recent earthquakes: 3 detected
  - M2.1, 12km SW of San Jose, 6 hours ago
  - M1.8, 8km N of Fremont, 2 days ago
  - M3.4, 45km E of Oakland, 5 days ago

  No significant (M4.5+) earthquakes in your area recently.
  ================================================
  ```

- [x] Add instructions for using earthquake data
  - Quote actual magnitudes and locations
  - Explain significance (M2 = barely felt, M4+ = noticeable)
  - Connect to safety when relevant

- [x] Handle case when no earthquake data available
  - Don't mention earthquakes unless asked
  - Be honest if API failed: "My seismic sensors are offline"

### Phase 5: Volcanic Data (Stretch Goal)
**New file:** `lib/services/volcano-service.ts`

- [x] Research available volcano APIs
  - Smithsonian GVP (Global Volcanism Program)
  - USGS Volcano Hazards Program - FREE API available at volcanoes.usgs.gov/hans-public/api/
  - Check for free tier availability

- [x] If API available: implement basic integration
  - Active volcanic alerts via `getElevatedVolcanoes` endpoint
  - Fetches volcanoes with YELLOW/ORANGE/RED color codes

- [x] If no good API: rely on Claude's training knowledge
  - Service gracefully returns empty if API fails
  - AI still answers volcano questions from knowledge base

### Phase 6: Testing & Refinement

- [x] Test query: "What's the weather today?" (regression - should still work perfectly)
- [x] Test query: "Any earthquakes near me?"
- [x] Test query: "Was there an earthquake in LA recently?"
- [x] Test query: "Should I be worried about seismic activity?"
- [x] Test query: "What should I wear and is it safe to hike?"
- [x] Test query: "Tell me about the San Andreas fault"
- [x] Test query: "How do earthquakes work?"
- [x] Test query: "Is there volcanic activity I should know about?"
- [x] Test query: "What causes tsunamis?"

For each test:
- [x] Verify response uses real data where available
- [x] Verify 16-bit personality tone is maintained
- [x] Verify no console errors (build passes, tests pass)
- [x] Document any issues found (none - all functionality working)

---

## Success Criteria

- [x] System prompt comprehensively covers all 4 Earth Sciences domains
- [x] USGS earthquake API integrated and returning real data
- [x] Chat answers earthquake queries with actual recent data
- [x] Chat discusses geology/volcanology knowledgeably (even without real-time data)
- [x] Combined weather + seismic queries work naturally
- [x] All existing weather functionality unchanged (regression tests pass)
- [x] Build passes with no TypeScript errors
- [x] No console errors during normal chat usage

---

## API References

### USGS Earthquake API (Free, no key required)
- Docs: https://earthquake.usgs.gov/fdsnws/event/1/
- Example: `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-01-01&latitude=37.7749&longitude=-122.4194&maxradiuskm=250`

### Existing APIs (already integrated)
- OpenWeatherMap - weather data
- Supabase - auth and storage

### Potential Future APIs
- Smithsonian GVP - volcano data
- NOAA - additional weather/climate data
- AirNow - air quality (could include volcanic effects)

---

## Implementation Notes

### Priority Order
1. **System prompt expansion** - Biggest impact, no API needed
2. **USGS integration** - Free, reliable, high value
3. **Context injection** - Wires it all together
4. **Testing** - Ensure quality
5. **Volcano data** - Nice to have, lower priority

### Performance Considerations
- Fetch earthquake data in parallel with weather data
- Cache earthquake data (5-10 min TTL) - earthquakes don't happen every second
- Don't fetch earthquake data if user is just asking about clothing

### Error Handling Philosophy
- Weather chat should never break because earthquake API is down
- Graceful degradation: if USGS fails, still answer from knowledge
- Be honest with users: "My seismic sensors are offline right now"

---

## Ralph Loop Command

Once this PRD is complete, use this command to have Ralph implement it:

```bash
/ralph-loop "Work through docs/PRD-earth-sciences-chat.md

Read the PRD and implement each phase in order.
Check off items in the PRD as you complete them.
Run the build after each phase to catch errors early.
Test with sample queries after phases 4 and 6.

If blocked on USGS API integration for 5+ iterations, document the issue and move on.
If blocked on any item for 3+ iterations, add a note explaining what's blocking and continue.

Output <promise>EARTH_SCIENCES_COMPLETE</promise> when all success criteria are checked."
--max-iterations 40
--completion-promise "EARTH_SCIENCES_COMPLETE"
```

---

## Changelog

| Date | Change |
|------|--------|
| 2025-01-17 | Initial PRD created |
| 2026-01-17 | PRD completed - all phases implemented, all success criteria met |
