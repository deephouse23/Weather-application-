/**
 * 16-Bit Weather Platform - AI Tool Definitions
 *
 * Vercel AI SDK tools that give the AI assistant on-demand access to
 * weather, aviation, seismic, and space weather data. Each tool wraps
 * existing server-side functions — no new external APIs needed.
 *
 * The AI decides which tools to call based on the user's question,
 * replacing the old "pre-fetch everything" approach.
 */

import { tool } from 'ai';
import { calculateVibeScore, type VibeInput } from '@/lib/services/vibe-check';
import { z } from 'zod';
import {
    fetchRecentEarthquakes,
    formatEarthquakeContextBlock,
} from '@/lib/services/usgs-earthquake';
// Volcano service available for future get_volcano_activity tool
// import { fetchElevatedVolcanoes, formatVolcanoContextBlock } from '@/lib/services/volcano-service';
import { getAviationContext } from '@/lib/services/aviation-service';
import { getSpaceWeatherContext } from '@/lib/services/space-weather-service';

// ---------------------------------------------------------------------------
// Shared helpers (moved from route.ts so tools can reuse them)
// ---------------------------------------------------------------------------

const OWM_KEY = () => process.env.OPENWEATHER_API_KEY ?? '';

/** Safe fetch wrapper with 10s timeout. Returns structured error on network/timeout failures. */
const FETCH_TIMEOUT_MS = 10_000;
async function safeFetch(url: string, errorLabel: string): Promise<{ data: any | null; error: string | null }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return { data: null, error: `${errorLabel} (HTTP ${res.status})` };
        const data = await res.json();
        return { data, error: null };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[AI Tools] ${errorLabel}:`, err);
        return { data: null, error: `${errorLabel}: ${message}` };
    } finally {
        clearTimeout(timeoutId);
    }
}

/** Geocode a city / ZIP / "City, ST" string → { lat, lon, name }. */
export async function geocodeLocation(
    location: string
): Promise<{ lat: number; lon: number; name: string } | null> {
    const apiKey = OWM_KEY();
    if (!apiKey) return null;

    try {
        // Try raw location first (supports international cities like "Paris", "London")
        let url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
        let { data, error } = await safeFetch(url, 'Geocoding failed');
        if (error) throw new Error(error);

        // If no results and no comma (bare city name), try with US bias as fallback
        if (!data?.length && !location.includes(',')) {
            url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(`${location},US`)}&limit=1&appid=${apiKey}`;
            ({ data, error } = await safeFetch(url, 'Geocoding failed'));
            if (error) throw new Error(error);
        }

        if (!data?.length) return null;

        return {
            lat: data[0].lat,
            lon: data[0].lon,
            name: data[0].state
                ? `${data[0].name}, ${data[0].state}`
                : data[0].name,
        };
    } catch (error) {
        console.error('[AI Tools] Geocoding error:', error);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

export const weatherTools = {
    // 1. Current weather
    get_current_weather: tool({
        description:
            'Get current weather conditions for a location. Use for questions like "What\'s the weather in NYC?" or "Is it cold outside?"',
        inputSchema: z.object({
            location: z
                .string()
                .describe('City name, ZIP code, or "City, State" (e.g. "San Francisco, CA")'),
        }),
        execute: async ({ location }) => {
            const coords = await geocodeLocation(location);
            if (!coords) return { error: `Could not find location: ${location}` };

            const apiKey = OWM_KEY();
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=imperial&appid=${apiKey}`;
            const { data: d, error } = await safeFetch(url, 'Weather data unavailable');
            if (error || !d) return { error: error ?? 'Weather data unavailable' };

            return {
                location: coords.name,
                temperature: Math.round(d.main?.temp ?? 0),
                feelsLike: Math.round(d.main?.feels_like ?? 0),
                condition: d.weather?.[0]?.description ?? 'unknown',
                humidity: d.main?.humidity ?? 0,
                wind_mph: Math.round(d.wind?.speed ?? 0),
                wind_direction: d.wind?.deg ?? 0,
                pressure_hPa: d.main?.pressure ?? 0,
                visibility_miles: d.visibility == null ? null : Math.round(d.visibility / 1609),
                clouds_pct: d.clouds?.all ?? 0,
                rain_1h_in: d.rain?.['1h'] ? Math.round((d.rain['1h'] / 25.4) * 100) / 100 : 0,
                snow_1h_in: d.snow?.['1h'] ? Math.round((d.snow['1h'] / 25.4) * 10) / 10 : 0,
            };
        },
    }),

    // 2. Multi-day forecast
    get_forecast: tool({
        description:
            'Get daily weather forecast (up to 8 days). Use for "What\'s the weather this week?" or "Will it rain tomorrow?"',
        inputSchema: z.object({
            location: z.string().describe('City name, ZIP, or "City, State"'),
            days: z
                .number()
                .min(1)
                .max(8)
                .optional()
                .default(7)
                .describe('Number of forecast days (1-8)'),
        }),
        execute: async ({ location, days }) => {
            const coords = await geocodeLocation(location);
            if (!coords) return { error: `Could not find location: ${location}` };

            const apiKey = OWM_KEY();
            const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`;
            const { data: d, error } = await safeFetch(url, 'Forecast data unavailable');
            if (error || !d) return { error: error ?? 'Forecast data unavailable' };

            // Use timezone from API response for location-correct date formatting
            const tz = (d.timezone as string) || undefined;

            const forecast = (d.daily ?? []).slice(0, days).map((day: Record<string, unknown>) => {
                const dt = day.dt as number;
                const temp = day.temp as { max: number; min: number };
                const weather = (day.weather as Array<{ main: string; description: string }>)?.[0];
                const date = new Date(dt * 1000);
                return {
                    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz }),
                    high: Math.round(temp?.max ?? 0),
                    low: Math.round(temp?.min ?? 0),
                    condition: weather?.main ?? 'Clear',
                    description: weather?.description ?? '',
                    pop: Math.round(((day.pop as number) ?? 0) * 100),
                    rain_in: day.rain ? Math.round(((day.rain as number) / 25.4) * 100) / 100 : 0,
                    snow_in: day.snow ? Math.round(((day.snow as number) / 25.4) * 10) / 10 : 0,
                };
            });

            return { location: coords.name, forecast };
        },
    }),

    // 3. Hourly forecast (48 hours)
    get_hourly_forecast: tool({
        description:
            'Get hourly weather forecast for the next 48 hours. Use for precise timing questions like "When will it rain?" or "What will it be like at 3pm?"',
        inputSchema: z.object({
            location: z.string().describe('City name, ZIP, or "City, State"'),
            hours: z
                .number()
                .min(1)
                .max(48)
                .optional()
                .default(24)
                .describe('Number of hours to forecast (1-48)'),
        }),
        execute: async ({ location, hours }) => {
            const coords = await geocodeLocation(location);
            if (!coords) return { error: `Could not find location: ${location}` };

            const apiKey = OWM_KEY();
            const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&units=imperial&exclude=daily,minutely,alerts&appid=${apiKey}`;
            const { data: d, error } = await safeFetch(url, 'Hourly forecast unavailable');
            if (error || !d) return { error: error ?? 'Hourly forecast unavailable' };

            const tz = (d.timezone as string) || undefined;

            const hourly = (d.hourly ?? []).slice(0, hours).map((h: Record<string, unknown>) => {
                const dt = h.dt as number;
                const weather = (h.weather as Array<{ main: string; description: string }>)?.[0];
                const time = new Date(dt * 1000);
                return {
                    time: time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, timeZone: tz }),
                    date: time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz }),
                    temp: Math.round((h.temp as number) ?? 0),
                    feelsLike: Math.round((h.feels_like as number) ?? 0),
                    condition: weather?.description ?? '',
                    pop: Math.round(((h.pop as number) ?? 0) * 100),
                    humidity: (h.humidity as number) ?? 0,
                    wind_mph: Math.round((h.wind_speed as number) ?? 0),
                };
            });

            return { location: coords.name, hourly };
        },
    }),

    // 4. Minute-by-minute precipitation (next 60 min)
    get_precipitation_timing: tool({
        description:
            'Get minute-by-minute rainfall predictions for the next 60 minutes. Use for "When exactly will it start raining?" or "Is the rain going to stop soon?"',
        inputSchema: z.object({
            location: z.string().describe('City name, ZIP, or "City, State"'),
        }),
        execute: async ({ location }) => {
            const coords = await geocodeLocation(location);
            if (!coords) return { error: `Could not find location: ${location}` };

            const apiKey = OWM_KEY();
            const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&units=imperial&exclude=daily,hourly,alerts&appid=${apiKey}`;
            const { data: d, error } = await safeFetch(url, 'Precipitation data unavailable');
            if (error || !d) return { error: error ?? 'Precipitation data unavailable' };

            if (!d.minutely?.length) {
                return {
                    location: coords.name,
                    message: 'No minute-by-minute precipitation data available for this location (usually only available in supported regions).',
                    current_rain: d.current?.rain?.['1h'] ? `${Math.round((d.current.rain['1h'] / 25.4) * 100) / 100}" in the last hour` : 'None',
                };
            }

            // Summarize: find transitions (dry→rain, rain→dry)
            const tz = (d.timezone as string) || undefined;
            const minutes = d.minutely.map((m: { dt: number; precipitation: number }) => ({
                time: new Date(m.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }),
                precipitation_mm: m.precipitation,
            }));

            const isCurrentlyRaining = minutes[0]?.precipitation_mm > 0;
            let transitionMinute: number | null = null;
            for (let i = 1; i < minutes.length; i++) {
                const wasRaining = minutes[i - 1].precipitation_mm > 0;
                const isRaining = minutes[i].precipitation_mm > 0;
                if (wasRaining !== isRaining) {
                    transitionMinute = i;
                    break;
                }
            }

            return {
                location: coords.name,
                currently_raining: isCurrentlyRaining,
                transition: transitionMinute
                    ? {
                        in_minutes: transitionMinute,
                        at_time: minutes[transitionMinute].time,
                        type: isCurrentlyRaining ? 'rain_stops' : 'rain_starts',
                    }
                    : null,
                summary: transitionMinute
                    ? `${isCurrentlyRaining ? 'Rain expected to stop' : 'Rain expected to start'} around ${minutes[transitionMinute].time} (in ~${transitionMinute} minutes)`
                    : isCurrentlyRaining
                        ? 'Rain is expected to continue for at least the next hour'
                        : 'No rain expected in the next hour',
            };
        },
    }),

    // 5. Air quality
    get_air_quality: tool({
        description:
            'Get air quality index (AQI) and pollutant levels. Use for "Is the air quality good?" or "Is it safe to exercise outside?"',
        inputSchema: z.object({
            location: z.string().describe('City name, ZIP, or "City, State"'),
        }),
        execute: async ({ location }) => {
            const coords = await geocodeLocation(location);
            if (!coords) return { error: `Could not find location: ${location}` };

            const apiKey = OWM_KEY();
            const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}`;
            const { data: d, error } = await safeFetch(url, 'Air quality data unavailable');
            if (error || !d) return { error: error ?? 'Air quality data unavailable' };

            const item = d.list?.[0];
            if (!item) return { error: 'No air quality data' };

            const aqiLabels: Record<number, string> = {
                1: 'Good',
                2: 'Fair',
                3: 'Moderate',
                4: 'Poor',
                5: 'Very Poor',
            };

            return {
                location: coords.name,
                aqi: item.main?.aqi ?? 0,
                category: aqiLabels[item.main?.aqi] ?? 'Unknown',
                pollutants: {
                    pm2_5: item.components?.pm2_5,
                    pm10: item.components?.pm10,
                    o3: item.components?.o3,
                    no2: item.components?.no2,
                    so2: item.components?.so2,
                    co: item.components?.co,
                },
            };
        },
    }),

    // 6. Airport conditions (METAR)
    get_airport_conditions: tool({
        description:
            'Get current airport weather conditions from METAR data. Use for "What are conditions at SFO?" or "Is JFK VFR or IFR?" Requires 4-letter ICAO code (add K prefix for US airports, e.g. SFO→KSFO).',
        inputSchema: z.object({
            station: z
                .string()
                .describe('4-letter ICAO airport code (e.g. KJFK, KSFO, EGLL)'),
        }),
        execute: async ({ station }) => {
            const code = station.trim().toUpperCase();
            if (!/^[A-Z]{4}$/.test(code)) {
                return { error: `Invalid ICAO code: ${station}. Must be exactly 4 letters (e.g. KJFK, EGLL).` };
            }
            const url = `https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(code)}&format=json&taf=false`;
            const { data, error } = await safeFetch(url, `METAR data unavailable for ${code}`);
            if (error || !Array.isArray(data)) return { error: error ?? `METAR data unavailable for ${code}` };
            if (!data.length) return { error: `No METAR data found for ${code}` };

            const m = data[0];
            return {
                station: code,
                raw_metar: m.rawOb,
                flight_category: m.fltcat ?? 'Unknown',
                temperature_c: m.temp,
                dewpoint_c: m.dewp,
                wind_dir: m.wdir,
                wind_speed_kt: m.wspd,
                wind_gust_kt: m.wgst,
                visibility_miles: m.visib,
                altimeter_inHg: m.altim ? Math.round(m.altim * 100) / 100 : null,
                clouds: m.clouds?.map((c: { cover: string; base: number }) => `${c.cover} at ${c.base} ft`) ?? [],
                weather: m.wxString ?? 'None',
                observed: m.reportTime,
            };
        },
    }),

    // 7. Aviation alerts (SIGMETs / AIRMETs)
    get_aviation_alerts: tool({
        description:
            'Get currently active SIGMETs and AIRMETs (aviation weather hazards). Use for "Are there any turbulence advisories?" or "What aviation alerts are active?"',
        inputSchema: z.object({}),
        execute: async () => {
            try {
                const data = await getAviationContext();
                if (!data?.hasActiveAlerts) {
                    return { message: 'No active aviation weather advisories at this time.' };
                }
                return {
                    alert_count: data.alertCount,
                    context: data.contextBlock,
                };
            } catch (error) {
                console.error('[AI Tools] Aviation alerts error:', error);
                return { error: 'Aviation alert data unavailable' };
            }
        },
    }),

    // 8. Earthquakes nearby
    get_earthquakes_nearby: tool({
        description:
            'Get recent earthquake activity near a location. Use for "Were there any earthquakes near LA?" or "Was that an earthquake?"',
        inputSchema: z.object({
            location: z.string().describe('City name, ZIP, or "City, State"'),
            radius_km: z
                .number()
                .min(10)
                .max(500)
                .optional()
                .default(250)
                .describe('Search radius in kilometers'),
            days: z
                .number()
                .min(1)
                .max(30)
                .optional()
                .default(7)
                .describe('Look back period in days'),
        }),
        execute: async ({ location, radius_km, days }) => {
            const coords = await geocodeLocation(location);
            if (!coords) return { error: `Could not find location: ${location}` };

            try {
                const data = await fetchRecentEarthquakes(coords.lat, coords.lon, radius_km, days);
                if (data.error) return { error: data.error };

                return {
                    location: coords.name,
                    radius_km,
                    days,
                    total_count: data.recent.length,
                    significant_nearby: data.significantNearby,
                    context: formatEarthquakeContextBlock(data, radius_km, days),
                };
            } catch (error) {
                console.error('[AI Tools] Earthquake error:', error);
                return { error: 'Earthquake data unavailable' };
            }
        },
    }),

    // 9. Space weather
    get_space_weather: tool({
        description:
            'Get current space weather conditions including Kp index, aurora forecast, and solar wind data. Use for "Can I see the aurora tonight?" or "What\'s the Kp index?"',
        inputSchema: z.object({}),
        execute: async () => {
            try {
                const data = await getSpaceWeatherContext();
                if (!data) return { error: 'Space weather data unavailable' };

                return {
                    kp_index: data.kpIndex,
                    aurora_activity: data.auroraActivity,
                    context: data.contextBlock,
                };
            } catch (error) {
                console.error('[AI Tools] Space weather error:', error);
                return { error: 'Space weather data unavailable' };
            }
        },
    }),

    // 10. Travel route weather
    get_travel_route_weather: tool({
        description:
            'Get weather comparison for a travel route (origin and destination). Use for "Flying from SFO to Chicago, what should I expect?" or "Road trip from LA to Vegas weather."',
        inputSchema: z.object({
            origin: z.string().describe('Origin city/location'),
            destination: z.string().describe('Destination city/location'),
        }),
        execute: async ({ origin, destination }) => {
            const [originCoords, destCoords] = await Promise.all([
                geocodeLocation(origin),
                geocodeLocation(destination),
            ]);

            if (!originCoords) return { error: `Could not find origin: ${origin}` };
            if (!destCoords) return { error: `Could not find destination: ${destination}` };

            const apiKey = OWM_KEY();
            const fetchWeather = async (lat: number, lon: number) => {
                const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely&appid=${apiKey}`;
                const { data } = await safeFetch(url, 'Weather data unavailable');
                return data;
            };

            const [originData, destData, aviationData] = await Promise.all([
                fetchWeather(originCoords.lat, originCoords.lon),
                fetchWeather(destCoords.lat, destCoords.lon),
                getAviationContext().catch((err) => {
                    console.error('[AI Tools] Aviation context error:', err);
                    return null;
                }),
            ]);

            const summarizeWeather = (name: string, data: Record<string, unknown> | null) => {
                if (!data) return { location: name, error: 'Data unavailable' };
                const current = data.current as Record<string, unknown>;
                const weather = (current?.weather as Array<{ description: string }>)?.[0];
                const daily = (data.daily as Array<Record<string, unknown>>)?.[0];
                const temp = daily?.temp as { max: number; min: number };
                const alerts = data.alerts as Array<{ event: string; description: string }> | undefined;

                return {
                    location: name,
                    current_temp: Math.round((current?.temp as number) ?? 0),
                    feels_like: Math.round((current?.feels_like as number) ?? 0),
                    condition: weather?.description ?? 'unknown',
                    wind_mph: Math.round((current?.wind_speed as number) ?? 0),
                    humidity: (current?.humidity as number) ?? 0,
                    today_high: Math.round(temp?.max ?? 0),
                    today_low: Math.round(temp?.min ?? 0),
                    alerts: alerts?.map(a => a.event) ?? [],
                };
            };

            return {
                origin: summarizeWeather(originCoords.name, originData),
                destination: summarizeWeather(destCoords.name, destData),
                aviation_alerts: aviationData?.hasActiveAlerts
                    ? { count: aviationData.alertCount, details: aviationData.contextBlock }
                    : { count: 0, message: 'No active aviation advisories' },
            };
        },
    }),


    // 11. Vibe check / comfort score
    get_vibe_check: tool({
        description:
            'Get the outdoor comfort "vibe check" score for a location. Returns a 0-100 score with category (Rough/Meh/Decent/Vibin/Immaculate) and component breakdown. Use when someone asks "how nice is it outside?" or "is it a good day to go out?" or "whats the vibe?"',
        inputSchema: z.object({
            location: z.string().describe('City name, ZIP code, or "City, State" format'),
        }),
        execute: async ({ location }) => {
            const coords = await geocodeLocation(location);
            if (!coords) return { error: `Could not find location: ${location}` };

            const apiKey = OWM_KEY();
            const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&units=imperial&exclude=minutely,alerts&appid=${apiKey}`;
            const { data, error } = await safeFetch(url, 'Weather data unavailable');
            if (error || !data) return { error };

            const current = data.current as Record<string, unknown>;
            const hourly = data.hourly as Array<Record<string, unknown>>;

            const input: VibeInput = {
                tempF: (current?.temp as number) ?? 72,
                humidity: (current?.humidity as number) ?? 50,
                windMph: (current?.wind_speed as number) ?? 5,
                precipChance: ((hourly?.[0]?.pop as number) ?? 0) * 100,
                uvIndex: (current?.uvi as number) ?? 3,
                cloudCover: (current?.clouds as number) ?? 20,
            };

            const vibe = calculateVibeScore(input);

            return {
                location: coords.name,
                score: vibe.score,
                category: vibe.category,
                breakdown: vibe.breakdown,
                conditions: {
                    temp: Math.round((current?.temp as number) ?? 0),
                    feels_like: Math.round((current?.feels_like as number) ?? 0),
                    humidity: (current?.humidity as number) ?? 0,
                    wind_mph: Math.round((current?.wind_speed as number) ?? 0),
                    uv_index: (current?.uvi as number) ?? 0,
                    cloud_cover: (current?.clouds as number) ?? 0,
                },
            };
        },
    }),
};
