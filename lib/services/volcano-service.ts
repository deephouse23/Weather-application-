/**
 * 16-Bit Weather Platform - v1.0.0
 *
 * USGS Volcano Hazards Program API Service
 * Fetches volcanic alert data from USGS
 * API Docs: https://volcanoes.usgs.gov/hans-public/api/volcano/
 *
 * NOTE: This is a stretch goal feature. The AI can still answer volcano
 * questions from its knowledge base even if this API is unavailable.
 */

export interface VolcanoAlert {
    name: string;
    code: string;
    alertLevel: 'NORMAL' | 'ADVISORY' | 'WATCH' | 'WARNING';
    colorCode: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
    observatory: string;
    state?: string;
    country: string;
    latitude?: number;
    longitude?: number;
    lastUpdate?: Date;
}

export interface VolcanoResponse {
    elevatedVolcanoes: VolcanoAlert[];
    hasElevatedActivity: boolean;
    error?: string;
}

// Cache for volcano data (15-minute TTL - volcano alerts don't change rapidly)
const volcanoCache = new Map<string, { data: VolcanoResponse; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Parse alert level string to typed enum
 */
function parseAlertLevel(level: string): VolcanoAlert['alertLevel'] {
    const upper = (level || '').toUpperCase();
    if (upper === 'WARNING') return 'WARNING';
    if (upper === 'WATCH') return 'WATCH';
    if (upper === 'ADVISORY') return 'ADVISORY';
    return 'NORMAL';
}

/**
 * Parse color code string to typed enum
 */
function parseColorCode(color: string): VolcanoAlert['colorCode'] {
    const upper = (color || '').toUpperCase();
    if (upper === 'RED') return 'RED';
    if (upper === 'ORANGE') return 'ORANGE';
    if (upper === 'YELLOW') return 'YELLOW';
    return 'GREEN';
}

/**
 * Fetch all volcanoes currently at elevated alert levels
 * Returns volcanoes with yellow, orange, or red color codes
 */
export async function fetchElevatedVolcanoes(): Promise<VolcanoResponse> {
    const cacheKey = 'elevated_volcanoes';

    // Check cache
    const cached = volcanoCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        const url = 'https://volcanoes.usgs.gov/hans-public/api/volcano/getElevatedVolcanoes';

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': '16BitWeather/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`USGS Volcano API error: ${response.status}`);
        }

        const data = await response.json();

        // Parse the response - structure may vary, handle flexibly
        const volcanoes: VolcanoAlert[] = [];

        if (Array.isArray(data)) {
            for (const v of data) {
                volcanoes.push({
                    name: v.volcanoName || v.name || 'Unknown',
                    code: v.volcanoCode || v.code || '',
                    alertLevel: parseAlertLevel(v.alertLevel || v.alert_level),
                    colorCode: parseColorCode(v.colorCode || v.color_code || v.aviationColor),
                    observatory: v.observatoryCode || v.observatory || '',
                    state: v.state,
                    country: v.country || 'United States',
                    latitude: v.latitude ? parseFloat(v.latitude) : undefined,
                    longitude: v.longitude ? parseFloat(v.longitude) : undefined,
                    lastUpdate: v.updateTime ? new Date(v.updateTime) : undefined
                });
            }
        }

        const result: VolcanoResponse = {
            elevatedVolcanoes: volcanoes,
            hasElevatedActivity: volcanoes.length > 0
        };

        // Cache the result
        volcanoCache.set(cacheKey, { data: result, timestamp: Date.now() });

        return result;

    } catch (error) {
        console.error('[USGS Volcano API] Error fetching elevated volcanoes:', error);
        return {
            elevatedVolcanoes: [],
            hasElevatedActivity: false,
            error: 'Failed to fetch volcano data'
        };
    }
}

/**
 * Format volcano alert for display
 */
export function formatVolcanoAlert(volcano: VolcanoAlert): string {
    const location = volcano.state
        ? `${volcano.name} (${volcano.state})`
        : volcano.name;

    return `${location}: ${volcano.colorCode}/${volcano.alertLevel}`;
}

/**
 * Format volcano context block for system prompt
 * Only included if there are elevated volcanoes
 */
export function formatVolcanoContextBlock(response: VolcanoResponse): string | null {
    if (response.error) {
        return null; // Don't include if API failed - use knowledge instead
    }

    if (!response.hasElevatedActivity || response.elevatedVolcanoes.length === 0) {
        return null; // No elevated activity - don't clutter the context
    }

    const lines: string[] = [
        'VOLCANIC ACTIVITY ALERTS (US Volcanoes with Elevated Status):',
        '================================================'
    ];

    // Group by alert level severity
    const warnings = response.elevatedVolcanoes.filter(v => v.alertLevel === 'WARNING');
    const watches = response.elevatedVolcanoes.filter(v => v.alertLevel === 'WATCH');
    const advisories = response.elevatedVolcanoes.filter(v => v.alertLevel === 'ADVISORY');

    if (warnings.length > 0) {
        lines.push('RED/WARNING (Eruption imminent or underway):');
        warnings.forEach(v => lines.push(`  - ${formatVolcanoAlert(v)}`));
    }

    if (watches.length > 0) {
        lines.push('ORANGE/WATCH (Heightened unrest, increased potential):');
        watches.forEach(v => lines.push(`  - ${formatVolcanoAlert(v)}`));
    }

    if (advisories.length > 0) {
        lines.push('YELLOW/ADVISORY (Elevated unrest above background):');
        advisories.forEach(v => lines.push(`  - ${formatVolcanoAlert(v)}`));
    }

    lines.push('================================================');

    return lines.join('\n');
}
