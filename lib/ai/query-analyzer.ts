/**
 * 16-Bit Weather Platform - AI Query Analyzer
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Analyzes user queries to determine which data contexts are needed
 */

export type ContextType = 'weather' | 'precipitation' | 'space' | 'aviation' | 'earthquake' | 'volcano';

// Query patterns for each context type
const QUERY_PATTERNS: Record<ContextType, RegExp[]> = {
  precipitation: [
    /snow(?:fall|ed|ing|y)?/i,
    /rain(?:fall|ed|ing|y)?/i,
    /precip(?:itation)?/i,
    /inches of/i,
    /how much (snow|rain)/i,
    /accumulation/i,
    /blizzard/i,
    /ice storm/i,
    /sleet/i,
    /hail/i,
    /flood(?:ing)?/i,
    /drought/i,
  ],
  weather: [
    /weather/i,
    /temperature/i,
    /temp\b/i,
    /forecast/i,
    /conditions/i,
    /humid/i,
    /wind(?:y)?/i,
    /hot\b/i,
    /cold\b/i,
    /warm\b/i,
    /cool\b/i,
    /freezing/i,
    /sunny/i,
    /cloudy/i,
    /overcast/i,
    /storm(?:y)?/i,
    /thunder/i,
    /lightning/i,
    /pressure/i,
    /uv\b/i,
    /visibility/i,
    /dew point/i,
    /heat\s*(wave|index)/i,
    /wind\s*chill/i,
    /feels\s*like/i,
  ],
  space: [
    /aurora/i,
    /northern lights/i,
    /southern lights/i,
    /solar (flare|wind|storm|activity|cycle)/i,
    /geomagnetic/i,
    /kp\s*index/i,
    /sun\s*spot/i,
    /sunspot/i,
    /cme\b/i,
    /coronal\s*mass/i,
    /space weather/i,
    /x-ray flux/i,
    /radio blackout/i,
    /radiation storm/i,
    /carrington/i,
    /magnetic storm/i,
    /\bg[1-5]\b/i, // G-scale
    /\br[1-5]\b/i, // R-scale
    /\bs[1-5]\b/i, // S-scale
  ],
  aviation: [
    /fly(?:ing)?/i,
    /flight/i,
    /turbulence/i,
    /airport/i,
    /sigmet/i,
    /airmet/i,
    /pirep/i,
    /metar/i,
    /taf\b/i,
    /pilot/i,
    /jet\s*stream/i,
    /clear\s*air\s*turbulence/i,
    /cat\b/i,
    /icing/i,
    /wind\s*shear/i,
    /microburst/i,
    /convective/i,
    /\b[A-Z]{4}\b/, // ICAO airport codes (e.g., KJFK, KLAX)
    /\b[A-Z]{2}\d{1,4}\b/, // Flight numbers (e.g., AA123, UA456)
    /from\s+[A-Z]{3}\s+to\s+[A-Z]{3}/i, // "from LAX to JFK"
    /to\s+[A-Z]{3}\s+from\s+[A-Z]{3}/i, // "to JFK from LAX"
  ],
  earthquake: [
    /earthquake/i,
    /quake/i,
    /seismic/i,
    /tremor/i,
    /fault\s*(line)?/i,
    /tectonic/i,
    /richter/i,
    /magnitude/i,
    /aftershock/i,
    /shake/i,
    /shaking/i,
    /san\s*andreas/i,
    /tsunami/i,
  ],
  volcano: [
    /volcano/i,
    /volcanic/i,
    /eruption/i,
    /erupt(?:ing)?/i,
    /lava/i,
    /magma/i,
    /pyroclastic/i,
    /ash\s*cloud/i,
    /volcanic\s*ash/i,
    /lahar/i,
    /caldera/i,
    /yellowstone/i,
    /mount\s*st\.?\s*helens/i,
    /kilauea/i,
    /mauna\s*loa/i,
  ],
};

// Location patterns to extract city/coordinates
const LOCATION_PATTERNS = [
  // "in/for/at [location]"
  /\b(?:in|for|at|near|around)\s+([a-zA-Z][a-zA-Z.'\- ]+?)(?:\s+(?:on|today|tomorrow|this|next|thursday|friday|saturday|sunday|monday|tuesday|wednesday)\b|[?.,]|$)/i,
  // "City, ST" pattern
  /\b([a-zA-Z][a-zA-Z.'\- ]+),\s*([a-zA-Z]{2})\b/i,
  // "[location] weather"
  /\b([a-zA-Z][a-zA-Z.'\- ]+)\s+weather\b/i,
  // ZIP code
  /\b(\d{5}(?:-\d{4})?)\b/,
  // Coordinates
  /(-?\d{1,3}\.?\d*),\s*(-?\d{1,3}\.?\d*)/,
];

// Time/exclude words that shouldn't be treated as locations
const TIME_WORDS = new Set([
  'today', 'tomorrow', 'this', 'next', 'right', 'currently',
  'two', 'three', 'four', 'five', 'six', 'seven', 'few', 'couple',
  'thursday', 'friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday',
  'morning', 'afternoon', 'evening', 'night', 'week', 'month', 'year',
]);

const EXCLUDE_WORDS = new Set([
  'the', 'a', 'an', 'what', 'how', 'when', 'will', 'is', 'are',
  'do', 'does', 'can', 'should', 'it', 'be', 'going', 'to', 'on', 'i',
  'my', 'me', 'we', 'us', 'they', 'them', 'your', 'its',
]);

/**
 * Analyze a user query to determine which context types are needed
 */
export function analyzeQuery(query: string): ContextType[] {
  const contexts: Set<ContextType> = new Set();

  // Check each context type
  for (const [contextType, patterns] of Object.entries(QUERY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(query)) {
        contexts.add(contextType as ContextType);
        break;
      }
    }
  }

  // If no specific context detected, default to weather
  if (contexts.size === 0) {
    // Check if it looks like a location-based query
    const hasLocation = LOCATION_PATTERNS.some(p => p.test(query));
    if (hasLocation) {
      contexts.add('weather');
    }
  }

  // Always include weather if precipitation is requested
  if (contexts.has('precipitation')) {
    contexts.add('weather');
  }

  // Aviation queries often need weather context too
  if (contexts.has('aviation')) {
    contexts.add('weather');
  }

  return Array.from(contexts);
}

/**
 * Extract location from a user query
 */
export function extractLocation(query: string): string | null {
  // Limit input length
  const safeQuery = query.slice(0, 200);

  // Helper to capitalize location names
  const capitalize = (s: string): string =>
    s.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

  // Try each pattern
  for (const pattern of LOCATION_PATTERNS) {
    const match = safeQuery.match(pattern);
    if (match) {
      // Coordinates
      if (match[1] && match[2] && !isNaN(parseFloat(match[1])) && !isNaN(parseFloat(match[2]))) {
        return `${match[1]},${match[2]}`;
      }

      // City, State
      if (match[2] && match[2].length === 2) {
        const city = capitalize(match[1].trim());
        const state = match[2].toUpperCase();
        return `${city}, ${state}`;
      }

      // General location
      if (match[1]) {
        const loc = match[1].trim();
        const firstWord = loc.split(' ')[0].toLowerCase();

        // Skip if it's a time word or excluded word
        if (TIME_WORDS.has(firstWord) || EXCLUDE_WORDS.has(firstWord)) {
          continue;
        }

        if (loc.length > 2) {
          return capitalize(loc);
        }
      }
    }
  }

  return null;
}

/**
 * Detect if query is asking about a specific flight
 */
export function extractFlightInfo(query: string): {
  flightNumber?: string;
  departure?: string;
  arrival?: string;
} | null {
  const result: { flightNumber?: string; departure?: string; arrival?: string } = {};

  // Flight number pattern (e.g., AA123, UA456, DL789)
  const flightMatch = query.match(/\b([A-Z]{2})(\d{1,4})\b/);
  if (flightMatch) {
    result.flightNumber = flightMatch[0];
  }

  // Airport codes pattern (e.g., "LAX to JFK", "from SFO to DEN")
  const routeMatch = query.match(/(?:from\s+)?([A-Z]{3})\s+to\s+([A-Z]{3})/i);
  if (routeMatch) {
    result.departure = routeMatch[1].toUpperCase();
    result.arrival = routeMatch[2].toUpperCase();
  }

  // Alternative pattern: "flying to JFK from LAX"
  const altRouteMatch = query.match(/to\s+([A-Z]{3})\s+from\s+([A-Z]{3})/i);
  if (altRouteMatch && !result.departure) {
    result.arrival = altRouteMatch[1].toUpperCase();
    result.departure = altRouteMatch[2].toUpperCase();
  }

  if (Object.keys(result).length > 0) {
    return result;
  }

  return null;
}

/**
 * Check if query is asking about aurora/northern lights visibility
 */
export function isAuroraQuery(query: string): boolean {
  const auroraPatterns = [
    /aurora/i,
    /northern\s*lights/i,
    /southern\s*lights/i,
    /see\s+the\s+lights/i,
    /aurora\s+borealis/i,
    /aurora\s+australis/i,
  ];

  return auroraPatterns.some(p => p.test(query));
}

/**
 * Check if query is asking about current conditions
 */
export function isCurrentConditionsQuery(query: string): boolean {
  const currentPatterns = [
    /right\s*now/i,
    /currently/i,
    /current/i,
    /at\s+the\s+moment/i,
    /is\s+it\s+(raining|snowing|hot|cold|warm|windy)/i,
    /what\'?s\s+(the\s+)?(weather|temperature)/i,
  ];

  return currentPatterns.some(p => p.test(query));
}

/**
 * Check if query is asking about a forecast
 */
export function isForecastQuery(query: string): boolean {
  const forecastPatterns = [
    /forecast/i,
    /tomorrow/i,
    /this\s+week/i,
    /next\s+week/i,
    /weekend/i,
    /will\s+it\s+(rain|snow|be)/i,
    /going\s+to\s+(rain|snow|be)/i,
    /expect/i,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  ];

  return forecastPatterns.some(p => p.test(query));
}
