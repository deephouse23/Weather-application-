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
import { z } from 'zod';
import { fetchOpenMeteoForecast, fetchOpenMeteoAirQuality } from '@/lib/open-meteo';
import { getWMODescription } from '@/lib/wmo-codes';
import { toStateAbbr } from '@/lib/us-states';
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

/** Geocode a city / ZIP / "City, ST" string → { lat, lon, name }.
 *  Uses Open-Meteo geocoding (keyless) + Zippopotam.us for US ZIPs. */
export async function geocodeLocation(
    location: string
): Promise<{ lat: number; lon: number; name: string } | null> {
    try {
        const trimmed = location.trim();

        // US ZIP fast path (5 digits, optional -4 suffix).
        const zipMatch = trimmed.match(/^(\d{5})(-\d{4})?$/);
        if (zipMatch) {
            const stem = zipMatch[1];
            const { data, error } = await safeFetch(
                `https://api.zippopotam.us/us/${stem}`,
                'ZIP lookup failed'
            );
            if (error || !data) return null;
            const place = data.places?.[0];
            if (!place) return null;
            return {
                lat: parseFloat(place.latitude),
                lon: parseFloat(place.longitude),
                name: `${place['place name']}, ${place['state abbreviation']}`,
            };
        }

        // Parse "City" | "City, ST" | "City, Country".
        const parts = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
        const cityName = parts[0] || trimmed;
        const filterHint = parts[1]?.toUpperCase() || null;

        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json`;
        const { data, error } = await safeFetch(url, 'Geocoding failed');
        if (error) throw new Error(error);

        const results: Array<{
            name: string;
            latitude: number;
            longitude: number;
            country_code?: string;
            admin1?: string;
        }> = data?.results || [];
        if (results.length === 0) return null;

        // Filter by state/country hint if provided.
        let pick = results[0];
        if (filterHint) {
            const match = results.find((r) => {
                const abbr = toStateAbbr(r.admin1);
                if (abbr && abbr === filterHint) return true;
                if (r.admin1?.toUpperCase() === filterHint) return true;
                if (r.country_code?.toUpperCase() === filterHint) return true;
                if (filterHint === 'UK' && r.country_code?.toUpperCase() === 'GB') return true;
                return false;
            });
            if (match) pick = match;
        }

        const stateLabel =
            pick.country_code?.toUpperCase() === 'US'
                ? (toStateAbbr(pick.admin1) ?? pick.admin1)
                : pick.admin1;

        return {
            lat: pick.latitude,
            lon: pick.longitude,
            name: stateLabel ? `${pick.name}, ${stateLabel}` : pick.name,
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
    // 1. Current weather (Open-Meteo)
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

            // --- OLD OWM implementation (kept for reference) ---
            // const apiKey = OWM_KEY();
            // const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=imperial&appid=${apiKey}`;
            // const { data: d, error } = await safeFetch(url, 'Weather data unavailable');
            // if (error || !d) return { error: error ?? 'Weather data unavailable' };
            // return { location: coords.name, temperature: Math.round(d.main?.temp ?? 0), ... };
            // --- END OLD OWM implementation ---

            try {
                const d = await fetchOpenMeteoForecast(coords.lat, coords.lon, {
                    forecastDays: 1,
                    extraCurrentVars: ['dewpoint_2m', 'cape'],
                });

                const c = d.current;
                if (!c) return { error: 'Weather data unavailable' };

                // Visibility: grab first hourly value (meters → miles)
                const visMeters = d.hourly?.visibility?.[0];
                const visMiles = visMeters != null ? Math.round(visMeters / 1609) : null;

                return {
                    location: coords.name,
                    temperature: Math.round(c.temperature_2m ?? 0),
                    feelsLike: Math.round(c.apparent_temperature ?? 0),
                    condition: getWMODescription(c.weather_code),
                    humidity: c.relative_humidity_2m ?? 0,
                    wind_mph: Math.round(c.wind_speed_10m ?? 0),
                    wind_direction: c.wind_direction_10m ?? 0,
                    wind_gusts_mph: Math.round(c.wind_gusts_10m ?? 0),
                    pressure_hPa: Math.round(c.surface_pressure ?? 0),
                    visibility_miles: visMiles,
                    clouds_pct: c.cloud_cover ?? 0,
                    uv_index: c.uv_index ?? 0,
                    rain_1h_in: c.precipitation ?? 0,
                    snow_1h_in: 0,
                    // Enriched context for AI
                    dewpoint_f: (c as unknown as Record<string, unknown>).dewpoint_2m as number ?? null,
                    cape: (c as unknown as Record<string, unknown>).cape as number ?? null,
                    cloud_cover: c.cloud_cover ?? 0,
                };
            } catch (err) {
                console.error('[AI Tools] Current weather error:', err);
                return { error: 'Weather data unavailable' };
            }
        },
    }),

    // 2. Multi-day forecast (Open-Meteo)
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

            // --- OLD OWM implementation (kept for reference) ---
            // const apiKey = OWM_KEY();
            // const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`;
            // const { data: d, error } = await safeFetch(url, 'Forecast data unavailable');
            // --- END OLD OWM implementation ---

            try {
                const d = await fetchOpenMeteoForecast(coords.lat, coords.lon, {
                    forecastDays: Math.min(days, 8),
                });

                const daily = d.daily;
                if (!daily) return { error: 'Forecast data unavailable' };

                const forecast = daily.time.slice(0, days).map((dateStr, i) => {
                    const date = new Date(dateStr + 'T12:00:00');
                    return {
                        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                        high: Math.round(daily.temperature_2m_max[i] ?? 0),
                        low: Math.round(daily.temperature_2m_min[i] ?? 0),
                        condition: getWMODescription(daily.weather_code[i]),
                        description: getWMODescription(daily.weather_code[i]).toLowerCase(),
                        pop: Math.round(daily.precipitation_probability_max[i] ?? 0),
                        precipitation_sum_in: Math.round((daily.precipitation_sum[i] ?? 0) * 100) / 100,
                    };
                });

                return { location: coords.name, forecast };
            } catch (err) {
                console.error('[AI Tools] Forecast error:', err);
                return { error: 'Forecast data unavailable' };
            }
        },
    }),

    // 3. Hourly forecast (48 hours, Open-Meteo)
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

            // --- OLD OWM implementation (kept for reference) ---
            // const apiKey = OWM_KEY();
            // const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&units=imperial&exclude=daily,minutely,alerts&appid=${apiKey}`;
            // --- END OLD OWM implementation ---

            try {
                const d = await fetchOpenMeteoForecast(coords.lat, coords.lon, {
                    forecastDays: 2,
                    extraHourlyVars: [
                        'temperature_2m',
                        'apparent_temperature',
                        'weather_code',
                        'relative_humidity_2m',
                        'wind_speed_10m',
                    ],
                });

                const h = d.hourly;
                if (!h?.time?.length) return { error: 'Hourly forecast unavailable' };

                const hourly = h.time.slice(0, hours).map((timeStr, i) => {
                    const time = new Date(timeStr);
                    const hrData = h as unknown as Record<string, number[]>;
                    return {
                        time: time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
                        date: time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                        temp: Math.round(hrData.temperature_2m?.[i] ?? 0),
                        feelsLike: Math.round(hrData.apparent_temperature?.[i] ?? 0),
                        condition: getWMODescription(hrData.weather_code?.[i] ?? 0),
                        pop: Math.round(hrData.precipitation_probability?.[i] ?? 0),
                        humidity: hrData.relative_humidity_2m?.[i] ?? 0,
                        wind_mph: Math.round(hrData.wind_speed_10m?.[i] ?? 0),
                    };
                });

                return { location: coords.name, hourly };
            } catch (err) {
                console.error('[AI Tools] Hourly forecast error:', err);
                return { error: 'Hourly forecast unavailable' };
            }
        },
    }),

    // 4. Precipitation timing (Open-Meteo hourly probability)
    get_precipitation_timing: tool({
        description:
            'Get hourly precipitation probability for the next several hours. Use for "When will it rain?" or "Is the rain going to stop soon?" Shows hourly probability rather than minute-by-minute.',
        inputSchema: z.object({
            location: z.string().describe('City name, ZIP, or "City, State"'),
        }),
        execute: async ({ location }) => {
            const coords = await geocodeLocation(location);
            if (!coords) return { error: `Could not find location: ${location}` };

            // --- OLD OWM implementation (kept for reference) ---
            // Used OWM One Call minutely precipitation data (not available in Open-Meteo).
            // const url = `https://api.openweathermap.org/data/3.0/onecall?...&exclude=daily,hourly,alerts`;
            // --- END OLD OWM implementation ---

            try {
                const d = await fetchOpenMeteoForecast(coords.lat, coords.lon, {
                    forecastDays: 1,
                });

                const h = d.hourly;
                if (!h?.time?.length) return { error: 'Precipitation data unavailable' };

                // Find current hour index
                const now = new Date(d.current?.time ?? h.time[0]);
                const currentHourStr = now.toISOString().slice(0, 13);
                let startIdx = h.time.findIndex(t => t.startsWith(currentHourStr));
                if (startIdx < 0) startIdx = 0;

                // Next 6 hours of precipitation data
                const HOURS_AHEAD = 6;
                const hours = h.time.slice(startIdx, startIdx + HOURS_AHEAD).map((timeStr, i) => {
                    const idx = startIdx + i;
                    const time = new Date(timeStr);
                    return {
                        time: time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
                        precipitation_probability: h.precipitation_probability[idx] ?? 0,
                        precipitation_in: Math.round((h.precipitation[idx] ?? 0) * 100) / 100,
                    };
                });

                // Build summary
                const isCurrentlyRaining = (d.current?.precipitation ?? 0) > 0;
                const firstRainHour = hours.find(hr => hr.precipitation_probability >= 50);
                const firstDryHour = isCurrentlyRaining
                    ? hours.find(hr => hr.precipitation_probability < 30)
                    : null;

                let summary: string;
                if (isCurrentlyRaining && firstDryHour) {
                    summary = `Rain may ease up around ${firstDryHour.time}`;
                } else if (isCurrentlyRaining) {
                    summary = 'Rain is expected to continue for the next several hours';
                } else if (firstRainHour) {
                    summary = `Rain likely around ${firstRainHour.time} (${firstRainHour.precipitation_probability}% chance)`;
                } else {
                    summary = 'No significant rain expected in the next several hours';
                }

                return {
                    location: coords.name,
                    currently_raining: isCurrentlyRaining,
                    hours,
                    summary,
                };
            } catch (err) {
                console.error('[AI Tools] Precipitation timing error:', err);
                return { error: 'Precipitation data unavailable' };
            }
        },
    }),

    // 5. Air quality (Open-Meteo)
    get_air_quality: tool({
        description:
            'Get air quality index (AQI) and pollutant levels. Uses US EPA AQI scale (0-500). Use for "Is the air quality good?" or "Is it safe to exercise outside?"',
        inputSchema: z.object({
            location: z.string().describe('City name, ZIP, or "City, State"'),
        }),
        execute: async ({ location }) => {
            const coords = await geocodeLocation(location);
            if (!coords) return { error: `Could not find location: ${location}` };

            // --- OLD OWM implementation (kept for reference) ---
            // const apiKey = OWM_KEY();
            // const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}`;
            // const { data: d, error } = await safeFetch(url, 'Air quality data unavailable');
            // --- END OLD OWM implementation ---

            try {
                const d = await fetchOpenMeteoAirQuality(coords.lat, coords.lon);
                const c = d.current;
                if (!c) return { error: 'No air quality data' };

                // EPA AQI category labels
                const getAqiCategory = (aqi: number): string => {
                    if (aqi <= 50) return 'Good';
                    if (aqi <= 100) return 'Moderate';
                    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
                    if (aqi <= 200) return 'Unhealthy';
                    if (aqi <= 300) return 'Very Unhealthy';
                    return 'Hazardous';
                };

                return {
                    location: coords.name,
                    aqi: c.us_aqi ?? 0,
                    category: getAqiCategory(c.us_aqi ?? 0),
                    pollutants: {
                        pm2_5: c.pm2_5,
                        pm10: c.pm10,
                        o3: c.ozone,
                        no2: c.nitrogen_dioxide,
                        so2: c.sulphur_dioxide,
                        co: c.carbon_monoxide,
                    },
                };
            } catch (err) {
                console.error('[AI Tools] Air quality error:', err);
                return { error: 'Air quality data unavailable' };
            }
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

    // 10. Travel route weather (Open-Meteo)
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

            // --- OLD OWM implementation (kept for reference) ---
            // const fetchWeather = async (lat, lon) => {
            //     const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely&appid=${apiKey}`;
            //     ...
            // };
            // --- END OLD OWM implementation ---

            try {
                const [originData, destData, aviationData] = await Promise.all([
                    fetchOpenMeteoForecast(originCoords.lat, originCoords.lon, { forecastDays: 1 }),
                    fetchOpenMeteoForecast(destCoords.lat, destCoords.lon, { forecastDays: 1 }),
                    getAviationContext().catch((err) => {
                        console.error('[AI Tools] Aviation context error:', err);
                        return null;
                    }),
                ]);

                const summarizeWeather = (name: string, d: typeof originData | null) => {
                    if (!d?.current) return { location: name, error: 'Data unavailable' };
                    const c = d.current;
                    const daily = d.daily;

                    return {
                        location: name,
                        current_temp: Math.round(c.temperature_2m ?? 0),
                        feels_like: Math.round(c.apparent_temperature ?? 0),
                        condition: getWMODescription(c.weather_code),
                        wind_mph: Math.round(c.wind_speed_10m ?? 0),
                        humidity: c.relative_humidity_2m ?? 0,
                        today_high: daily ? Math.round(daily.temperature_2m_max[0] ?? 0) : null,
                        today_low: daily ? Math.round(daily.temperature_2m_min[0] ?? 0) : null,
                    };
                };

                return {
                    origin: summarizeWeather(originCoords.name, originData),
                    destination: summarizeWeather(destCoords.name, destData),
                    aviation_alerts: aviationData?.hasActiveAlerts
                        ? { count: aviationData.alertCount, details: aviationData.contextBlock }
                        : { count: 0, message: 'No active aviation advisories' },
                };
            } catch (err) {
                console.error('[AI Tools] Travel route weather error:', err);
                return { error: 'Travel route weather data unavailable' };
            }
        },
    }),
};
