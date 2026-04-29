/**
 * SPC daily storm reports (CSV) — shared by warnings hub and newsletter tooling.
 * https://www.spc.noaa.gov/climo/reports/YYMMDD_rpts.csv
 */

const SPC_BASE = 'https://www.spc.noaa.gov/climo/reports'
const FETCH_TIMEOUT_MS = 15_000
const SPC_UA =
  'Mozilla/5.0 (compatible; 16bitweather/1.0; +https://16bitweather.co)'

export type SpcReportCategory = 'tornado' | 'hail' | 'wind'

export interface SpcReport {
  category: SpcReportCategory
  time: string
  size: string
  location: string
  county: string
  state: string
  lat: number | null
  lon: number | null
  comments: string
  date: string
}

function formatYYMMDD(date: Date): string {
  const yy = String(date.getUTCFullYear() % 100).padStart(2, '0')
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yy}${mm}${dd}`
}

function splitCsv(line: string): string[] {
  return line.split(',')
}

function parseCsv(text: string, isoDate: string): SpcReport[] {
  const lines = text.split(/\r?\n/)
  let category: SpcReportCategory | null = null
  const out: SpcReport[] = []
  for (const line of lines) {
    if (!line.trim()) continue
    const lower = line.toLowerCase()
    if (lower.startsWith('time,f_scale')) {
      category = 'tornado'
      continue
    }
    if (lower.startsWith('time,size')) {
      category = 'hail'
      continue
    }
    if (lower.startsWith('time,speed')) {
      category = 'wind'
      continue
    }
    if (!category) continue
    const cols = splitCsv(line)
    if (cols.length < 8) continue
    const [time, size, location, county, state, lat, lon, ...rest] = cols
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
    })
  }
  return out
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': SPC_UA },
    })
    if (!res.ok) {
      throw new Error(`SPC ${res.status} for ${url}`)
    }
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Recent SPC storm reports (tornado, hail, wind) for the last `days` UTC days.
 * Missing days (404) are skipped.
 */
export async function fetchRecentSpcReports(
  days = 2,
  now = new Date()
): Promise<SpcReport[]> {
  const reports: SpcReport[] = []
  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000)
    const yymmdd = formatYYMMDD(date)
    const isoDate = date.toISOString().slice(0, 10)
    const url = `${SPC_BASE}/${yymmdd}_rpts.csv`
    try {
      const text = await fetchText(url)
      reports.push(...parseCsv(text, isoDate))
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('404')) continue
      console.warn(`[spc-storm-reports] ${yymmdd}: ${msg}`)
    }
  }
  return reports
}
