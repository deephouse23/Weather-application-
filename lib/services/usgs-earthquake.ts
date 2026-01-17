/**
 * 16-Bit Weather Platform - v1.0.0
 *
 * USGS Earthquake API Service
 * Fetches real-time earthquake data from USGS FDSN Web Services
 * API Docs: https://earthquake.usgs.gov/fdsnws/event/1/
 */

export interface EarthquakeData {
    magnitude: number;
    location: string;
    time: Date;
    depth: number; // km
    distance?: number; // km from user (if coordinates provided)
    id: string;
    url: string;
}

export interface EarthquakeResponse {
    recent: EarthquakeData[];
    significantNearby: boolean;
    lastSignificant?: EarthquakeData;
    error?: string;
}

// Cache for earthquake data (5-minute TTL)
const earthquakeCache = new Map<string, { data: EarthquakeResponse; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

/**
 * Format time difference as human-readable string
 */
function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
}

/**
 * Get compass direction from user to earthquake
 */
function getDirection(fromLat: number, fromLon: number, toLat: number, toLon: number): string {
    const dLon = toLon - fromLon;
    const dLat = toLat - fromLat;
    const angle = Math.atan2(dLon, dLat) * 180 / Math.PI;

    // Normalize to 0-360
    const normalizedAngle = (angle + 360) % 360;

    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(normalizedAngle / 45) % 8;
    return directions[index];
}

/**
 * Parse USGS GeoJSON response into EarthquakeData array
 */
function parseUSGSResponse(
    data: {
        features: Array<{
            id: string;
            properties: {
                mag: number;
                place: string;
                time: number;
                url: string;
            };
            geometry: {
                coordinates: [number, number, number]; // [lon, lat, depth]
            };
        }>;
    },
    userLat?: number,
    userLon?: number
): EarthquakeData[] {
    return data.features.map(feature => {
        const [lon, lat, depth] = feature.geometry.coordinates;
        const quake: EarthquakeData = {
            magnitude: feature.properties.mag,
            location: feature.properties.place || 'Unknown location',
            time: new Date(feature.properties.time),
            depth: Math.round(depth),
            id: feature.id,
            url: feature.properties.url
        };

        if (userLat !== undefined && userLon !== undefined) {
            quake.distance = calculateDistance(userLat, userLon, lat, lon);
        }

        return quake;
    }).sort((a, b) => b.time.getTime() - a.time.getTime()); // Sort by most recent first
}

/**
 * Fetch recent earthquakes near a location
 * @param lat User's latitude
 * @param lon User's longitude
 * @param radiusKm Search radius in kilometers (default: 250)
 * @param days Number of days to look back (default: 7)
 */
export async function fetchRecentEarthquakes(
    lat: number,
    lon: number,
    radiusKm: number = 250,
    days: number = 7
): Promise<EarthquakeResponse> {
    const cacheKey = `earthquakes_${lat.toFixed(2)}_${lon.toFixed(2)}_${radiusKm}_${days}`;

    // Check cache
    const cached = earthquakeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);

        const url = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query');
        url.searchParams.set('format', 'geojson');
        url.searchParams.set('starttime', startTime.toISOString());
        url.searchParams.set('endtime', endTime.toISOString());
        url.searchParams.set('latitude', lat.toString());
        url.searchParams.set('longitude', lon.toString());
        url.searchParams.set('maxradiuskm', radiusKm.toString());
        url.searchParams.set('orderby', 'time');
        url.searchParams.set('limit', '20'); // Limit to 20 most recent

        const response = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
                'User-Agent': '16BitWeather/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`USGS API error: ${response.status}`);
        }

        const data = await response.json();
        const earthquakes = parseUSGSResponse(data, lat, lon);

        // Find if there are any significant (M4.5+) earthquakes nearby
        const significantQuakes = earthquakes.filter(q => q.magnitude >= 4.5);
        const lastSignificant = significantQuakes.length > 0 ? significantQuakes[0] : undefined;

        const result: EarthquakeResponse = {
            recent: earthquakes,
            significantNearby: significantQuakes.length > 0,
            lastSignificant
        };

        // Cache the result
        earthquakeCache.set(cacheKey, { data: result, timestamp: Date.now() });

        return result;

    } catch (error) {
        console.error('[USGS API] Error fetching earthquakes:', error);
        return {
            recent: [],
            significantNearby: false,
            error: 'Failed to fetch earthquake data'
        };
    }
}

/**
 * Fetch significant earthquakes globally (M4.5+)
 * For "any big earthquakes lately?" type queries
 * @param days Number of days to look back (default: 7)
 */
export async function fetchSignificantEarthquakes(days: number = 7): Promise<EarthquakeResponse> {
    const cacheKey = `significant_global_${days}`;

    // Check cache
    const cached = earthquakeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);

        const url = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query');
        url.searchParams.set('format', 'geojson');
        url.searchParams.set('starttime', startTime.toISOString());
        url.searchParams.set('endtime', endTime.toISOString());
        url.searchParams.set('minmagnitude', '4.5');
        url.searchParams.set('orderby', 'time');
        url.searchParams.set('limit', '10'); // Top 10 significant quakes

        const response = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
                'User-Agent': '16BitWeather/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`USGS API error: ${response.status}`);
        }

        const data = await response.json();
        const earthquakes = parseUSGSResponse(data);

        const result: EarthquakeResponse = {
            recent: earthquakes,
            significantNearby: earthquakes.length > 0,
            lastSignificant: earthquakes.length > 0 ? earthquakes[0] : undefined
        };

        // Cache the result
        earthquakeCache.set(cacheKey, { data: result, timestamp: Date.now() });

        return result;

    } catch (error) {
        console.error('[USGS API] Error fetching significant earthquakes:', error);
        return {
            recent: [],
            significantNearby: false,
            error: 'Failed to fetch earthquake data'
        };
    }
}

/**
 * Format earthquake data for Claude context
 * Produces concise, human-readable strings
 */
export function formatEarthquakeForContext(
    earthquake: EarthquakeData,
    userLat?: number,
    userLon?: number
): string {
    const timeAgo = formatTimeAgo(earthquake.time);

    // Extract just the location description (USGS format: "Xkm DIR of Place")
    // The location already contains distance info from epicenter
    const location = earthquake.location;

    // If we have user coordinates and the earthquake has distance, add direction
    let distanceInfo = '';
    if (earthquake.distance !== undefined && userLat !== undefined && userLon !== undefined) {
        // Parse the original USGS coordinates to get direction
        // Since we don't store them, we'll just use the distance
        distanceInfo = ` (${earthquake.distance}km away)`;
    }

    return `M${earthquake.magnitude.toFixed(1)} ${location}${distanceInfo}, ${timeAgo}, depth ${earthquake.depth}km`;
}

/**
 * Format full earthquake context block for system prompt
 */
export function formatEarthquakeContextBlock(
    response: EarthquakeResponse,
    radiusKm: number = 250,
    days: number = 7
): string {
    if (response.error) {
        return `SEISMIC DATA: Currently unavailable (${response.error})`;
    }

    if (response.recent.length === 0) {
        return `SEISMIC DATA (last ${days} days, ${radiusKm}km radius):
================================================
No earthquakes detected in your area recently.
This is normal - most areas experience very few felt earthquakes.
================================================`;
    }

    const lines: string[] = [
        `SEISMIC DATA (last ${days} days, ${radiusKm}km radius):`,
        '================================================',
        `Recent earthquakes: ${response.recent.length} detected`
    ];

    // Add up to 5 most recent earthquakes
    const recentToShow = response.recent.slice(0, 5);
    for (const quake of recentToShow) {
        lines.push(`- ${formatEarthquakeForContext(quake)}`);
    }

    if (response.recent.length > 5) {
        lines.push(`... and ${response.recent.length - 5} more smaller quakes`);
    }

    lines.push('');

    // Add significance assessment
    if (response.significantNearby && response.lastSignificant) {
        lines.push(`⚠ SIGNIFICANT ACTIVITY: M${response.lastSignificant.magnitude.toFixed(1)} detected ${formatTimeAgo(response.lastSignificant.time)}`);
    } else {
        lines.push('No significant (M4.5+) earthquakes in your area recently.');
    }

    lines.push('================================================');

    return lines.join('\n');
}
