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

/** RFC-style CSV row split (handles quoted fields with commas). */
export function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out
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
    const cols = splitCsvLine(line)
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
  const dayJobs = Array.from({ length: days }, (_, dayOffset) => {
    const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000)
    const yymmdd = formatYYMMDD(date)
    const isoDate = date.toISOString().slice(0, 10)
    const url = `${SPC_BASE}/${yymmdd}_rpts.csv`
    return { yymmdd, isoDate, url }
  })

  const settled = await Promise.allSettled(
    dayJobs.map(async ({ yymmdd, isoDate, url }) => {
      const text = await fetchText(url)
      return parseCsv(text, isoDate)
    })
  )

  const reports: SpcReport[] = []
  for (let i = 0; i < settled.length; i++) {
    const r = settled[i]
    const { yymmdd } = dayJobs[i]
    if (r.status === 'fulfilled') {
      reports.push(...r.value)
      continue
    }
    const msg = (r.reason as Error)?.message ?? String(r.reason)
    if (msg.includes('404')) continue
    console.warn(`[spc-storm-reports] ${yymmdd}: ${msg}`)
  }
  return reports
}
