/**
 * NOAA Storm Prediction Center daily storm reports.
 * Free, no API key. CSV format, one file per day.
 *
 * URLs follow the pattern:
 *   https://www.spc.noaa.gov/climo/reports/YYMMDD_rpts.csv
 *
 * The file contains three sections (Tornado, Hail, Wind) each with a
 * header row. We parse all three and tag each row with its category.
 *
 * Note: SPC sometimes refuses our default User-Agent. The fetcher uses
 * a browser-like UA which has historically been accepted.
 */

const SPC_BASE = 'https://www.spc.noaa.gov/climo/reports';
const FETCH_TIMEOUT_MS = 15_000;
// SPC blocks generic bot UAs; this UA has been historically accepted by
// the SPC server for non-abusive traffic patterns.
const SPC_UA = 'Mozilla/5.0 (compatible; 16bitweather-newsletter/1.0; +https://16bitweather.co)';

export type SpcReportCategory = 'tornado' | 'hail' | 'wind';

export interface SpcReport {
  category: SpcReportCategory;
  time: string; // HHMM in CST/UTC depending on file
  size: string; // F-scale, hail size in inches, wind in mph
  location: string;
  county: string;
  state: string;
  lat: number | null;
  lon: number | null;
  comments: string;
  date: string; // YYYY-MM-DD
}

export interface SpcWeekSummary {
  total: number;
  byCategory: Record<SpcReportCategory, number>;
  byState: Record<string, number>;
  reports: SpcReport[];
  daysCovered: number;
}

/**
 * Fetches the past N days of SPC reports and returns a summary.
 * Days where the file is missing (404) are skipped silently — SPC
 * doesn't publish a report file on days with zero events.
 *
 * Returns total=0 with empty reports[] when truly no severe events
 * happened in the window. Caller decides whether to treat that as
 * notable or a normal quiet week.
 */
export async function fetchPastWeekReports(days = 7, now = new Date()): Promise<SpcWeekSummary> {
  const reports: SpcReport[] = [];
  for (let dayOffset = 1; dayOffset <= days; dayOffset++) {
    const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const yymmdd = formatYYMMDD(date);
    const isoDate = date.toISOString().slice(0, 10);
    const url = `${SPC_BASE}/${yymmdd}_rpts.csv`;
    try {
      const text = await fetchText(url);
      reports.push(...parseCsv(text, isoDate));
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('404')) continue;
      // Other errors (e.g. 5xx, network) — log but keep going so a
      // single bad day doesn't kill the recap.
      console.warn(`[spc] ${yymmdd}: ${msg}`);
    }
  }
  return summarize(reports, days);
}

function summarize(reports: SpcReport[], days: number): SpcWeekSummary {
  const byCategory: Record<SpcReportCategory, number> = { tornado: 0, hail: 0, wind: 0 };
  const byState: Record<string, number> = {};
  for (const r of reports) {
    byCategory[r.category] += 1;
    if (r.state) byState[r.state] = (byState[r.state] ?? 0) + 1;
  }
  return { total: reports.length, byCategory, byState, reports, daysCovered: days };
}

function parseCsv(text: string, isoDate: string): SpcReport[] {
  const lines = text.split(/\r?\n/);
  let category: SpcReportCategory | null = null;
  const out: SpcReport[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const lower = line.toLowerCase();
    if (lower.startsWith('time,') || lower.startsWith('time:')) {
      // Header row — preceding line tells us the category.
      continue;
    }
    if (lower.includes('tornado')) {
      category = 'tornado';
      continue;
    }
    if (lower.includes('hail')) {
      category = 'hail';
      continue;
    }
    if (lower.includes('wind')) {
      category = 'wind';
      continue;
    }
    if (!category) continue;
    const cols = splitCsv(line);
    if (cols.length < 8) continue;
    const [time, size, location, county, state, lat, lon, ...rest] = cols;
    out.push({
      category,
      time: time?.trim() ?? '',
      size: size?.trim() ?? '',
      location: location?.trim() ?? '',
      county: county?.trim() ?? '',
      state: state?.trim() ?? '',
      lat: parseFloat(lat ?? '') || null,
      lon: parseFloat(lon ?? '') || null,
      comments: rest.join(',').trim(),
      date: isoDate,
    });
  }
  return out;
}

function splitCsv(line: string): string[] {
  // Naive split — SPC reports rarely contain quoted fields with commas,
  // but if they do, the trailing comments field absorbs them via .join.
  return line.split(',');
}

function formatYYMMDD(date: Date): string {
  const yy = String(date.getUTCFullYear() % 100).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': SPC_UA } });
    if (!res.ok) {
      throw new Error(`SPC ${res.status} for ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}
