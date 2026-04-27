/**
 * Iowa State Mesonet (IEM) — VTEC Storm-Based Warnings (SBW) archive.
 * Free, no API key required for the endpoints used here.
 *
 * Scope note: `vtec/sbw_interval` returns POLYGON-based warnings only —
 * Tornado, Severe Thunderstorm, Flash Flood, Marine, and Extreme Wind
 * Warnings (TO.W, SV.W, FF.W, MA.W, EW.W). Zone- or county-based
 * products (Winter Storm, Heat, Coastal Flood, Fire Weather) and watches
 * are NOT included. Treat output as severe-event coverage, not a
 * comprehensive NWS picture.
 *
 * Docs: https://mesonet.agron.iastate.edu/api/1/
 */

const IEM_BASE = 'https://mesonet.agron.iastate.edu/api/1';
const FETCH_TIMEOUT_MS = 20_000;

export interface MesonetWarning {
  phenomena: string;
  significance: string;
  issued: string;
  expired: string;
  wfo: string;
  area_desc: string;
  event_id: number | null;
}

export interface MesonetPastWeekSummary {
  totalWarnings: number;
  byType: Record<string, number>;
  notable: MesonetWarning[];
  daysCovered: number;
}

/**
 * Fetches polygon-based NWS warnings (TO.W, SV.W, FF.W, MA.W, EW.W)
 * issued in the trailing N days. Returns counts by phenomenon and a list
 * of the most notable events.
 *
 * Throws MesonetEmptyError if the API responds but returns no records.
 * Genuinely quiet weeks in deep winter or mid-summer can legitimately
 * return zero SBWs in the contiguous US — callers may want to widen the
 * window or downgrade to a soft-fail before escalating.
 */
interface IemSbwRow {
  utc_issue: string;
  utc_expire: string;
  wfo: string;
  phenomena: string;
  significance: string;
  eventid: number;
  ugclist?: string;
  locations?: string;
}

export async function fetchPastWeekWarnings(days = 7, now = new Date()): Promise<MesonetPastWeekSummary> {
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    begints: start.toISOString(),
    endts: now.toISOString(),
  });
  const url = `${IEM_BASE}/vtec/sbw_interval.json?${params.toString()}`;
  const data = (await fetchJson(url)) as { data?: IemSbwRow[] };
  const rows = Array.isArray(data.data) ? data.data : [];

  if (rows.length === 0) {
    throw new MesonetEmptyError(`Iowa Mesonet returned no SBW events for ${days}-day window starting ${start.toISOString()}`);
  }

  const events: MesonetWarning[] = rows.map((r) => ({
    phenomena: r.phenomena,
    significance: r.significance,
    issued: r.utc_issue,
    expired: r.utc_expire,
    wfo: r.wfo,
    area_desc: r.locations ?? r.ugclist ?? '',
    event_id: r.eventid,
  }));

  const byType: Record<string, number> = {};
  for (const ev of events) {
    const key = `${ev.phenomena}.${ev.significance}`;
    byType[key] = (byType[key] ?? 0) + 1;
  }

  const notable = pickNotable(events).slice(0, 10);

  return {
    totalWarnings: events.length,
    byType,
    notable,
    daysCovered: days,
  };
}

/**
 * Heuristic for "notable" events:
 * - Tornado warnings/emergencies (TO.W)
 * - Severe Thunderstorm Warnings tagged with destructive criteria (SV.W high-end)
 * - Flash Flood Emergencies (FF.E or FF.W with emergency)
 * - Hurricane / Tropical Storm warnings
 *
 * Falls back to the most recent events if the heuristic returns nothing.
 */
function pickNotable(events: MesonetWarning[]): MesonetWarning[] {
  const priority = ['TO', 'FF', 'HU', 'TR', 'SV'];
  const ranked = events
    .filter((e) => priority.includes(e.phenomena))
    .sort((a, b) => {
      const ai = priority.indexOf(a.phenomena);
      const bi = priority.indexOf(b.phenomena);
      if (ai !== bi) return ai - bi;
      return new Date(b.issued).getTime() - new Date(a.issued).getTime();
    });
  if (ranked.length > 0) return ranked;
  return [...events].sort((a, b) => new Date(b.issued).getTime() - new Date(a.issued).getTime());
}

export class MesonetEmptyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MesonetEmptyError';
  }
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': '16bitweather-newsletter/1.0 (https://16bitweather.co; contact: justinelrod111@gmail.com)' },
    });
    if (!res.ok) {
      throw new Error(`Mesonet ${res.status} for ${url}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}
