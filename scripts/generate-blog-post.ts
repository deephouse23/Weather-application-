/**
 * Weekly Blog Post Generator
 * 
 * Fetches current weather data from multiple sources, sends it to Claude API
 * to generate an engaging blog post, and saves the result as a markdown file.
 * 
 * Usage: ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-blog-post.ts
 */

import fs from 'fs'
import path from 'path'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')
const SITE_URL = 'https://www.16bitweather.co'

// Curated catalog of public-domain images (NOAA, NASA, Wikimedia Commons PD/CC).
// All URLs verified 200 OK when added. The model picks from this list; no
// URL invention. Post-generation validation strips anything that 404s anyway.
type CuratedImage = { topics: string[]; url: string; alt: string }

const CURATED_IMAGES: CuratedImage[] = [
  { topics: ['lightning', 'thunderstorm', 'storm'], url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Lightning_NOAA.jpg/1280px-Lightning_NOAA.jpg', alt: 'Lightning strike captured by NOAA' },
  { topics: ['lightning', 'thunderstorm', 'storm'], url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Lightning_Pritzerbe_01_%28MK%29.jpg/1280px-Lightning_Pritzerbe_01_%28MK%29.jpg', alt: 'Cloud-to-ground lightning over Pritzerbe' },
  { topics: ['lightning', 'thunderstorm'], url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Lightning_in_Arlington.jpg/1280px-Lightning_in_Arlington.jpg', alt: 'Lightning over Arlington' },
  { topics: ['supercell', 'wall cloud', 'tornado', 'mesocyclone', 'severe weather'], url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Wall_cloud_with_lightning_-_NOAA.jpg/1280px-Wall_cloud_with_lightning_-_NOAA.jpg', alt: 'Supercell wall cloud illuminated by lightning (NOAA)' },
  { topics: ['supercell', 'thunderstorm', 'severe weather'], url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Chaparral_Supercell_2.JPG/1280px-Chaparral_Supercell_2.JPG', alt: 'Classic supercell thunderstorm in Chaparral, NM' },
  { topics: ['anvil', 'thunderstorm', 'cumulonimbus', 'clouds'], url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Anvil_shaped_cumulus_panorama_edit_crop.jpg/1280px-Anvil_shaped_cumulus_panorama_edit_crop.jpg', alt: 'Anvil-shaped cumulonimbus thunderstorm' },
  { topics: ['tornado', 'severe weather', 'plains'], url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/F5_tornado_Elie_Manitoba_2007.jpg/1280px-F5_tornado_Elie_Manitoba_2007.jpg', alt: 'F5 tornado near Elie, Manitoba (2007)' },
  { topics: ['tornado', 'severe weather', 'plains'], url: 'https://www.spc.noaa.gov/faq/tornado/binger.jpg', alt: 'Wedge tornado near Binger, Oklahoma (NOAA NSSL)' },
  { topics: ['mesocyclone', 'supercell', 'diagram'], url: 'https://www.spc.noaa.gov/faq/tornado/mesof.gif', alt: 'Mesocyclone structure diagram (NOAA SPC)' },
  { topics: ['aurora', 'northern lights', 'space weather'], url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Northern_Lights_02.jpg', alt: 'Aurora borealis (northern lights)' },
  { topics: ['aurora', 'space weather'], url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Aurora_Borealis_and_Australis_Poster.jpg/1280px-Aurora_Borealis_and_Australis_Poster.jpg', alt: 'Aurora borealis and australis from space' },
  { topics: ['aurora', 'space weather', 'forecast'], url: 'https://services.swpc.noaa.gov/images/aurora-forecast-northern-hemisphere.jpg', alt: 'NOAA SWPC aurora forecast (northern hemisphere)' },
  { topics: ['solar flare', 'sun', 'space weather'], url: 'https://upload.wikimedia.org/wikipedia/commons/d/da/171879main_LimbFlareJan12_lg.jpg', alt: 'Solar limb flare imaged by NASA' },
  { topics: ['sun', 'solar corona', 'space weather'], url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg', alt: 'Current Sun in extreme UV 193A (NASA SDO)' },
  { topics: ['sun', 'solar corona'], url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg', alt: 'Current Sun in extreme UV 171A (NASA SDO)' },
  { topics: ['sun', 'solar chromosphere'], url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg', alt: 'Current Sun in extreme UV 304A (NASA SDO)' },
  { topics: ['hurricane', 'tropical', 'satellite'], url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Hurricane_Katrina_August_28_2005_NASA.jpg/1280px-Hurricane_Katrina_August_28_2005_NASA.jpg', alt: 'Hurricane Katrina from NASA satellite' },
  { topics: ['satellite', 'weather', 'conus'], url: 'https://cdn.star.nesdis.noaa.gov/GOES16/ABI/CONUS/GEOCOLOR/1250x750.jpg', alt: 'GOES-16 geocolor satellite view of CONUS' },
  { topics: ['satellite', 'infrared', 'weather'], url: 'https://cdn.star.nesdis.noaa.gov/GOES16/ABI/CONUS/13/1250x750.jpg', alt: 'GOES-16 infrared satellite view of CONUS' },
  { topics: ['el nino', 'la nina', 'enso', 'climate', 'sst'], url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/figure01.gif', alt: 'NOAA CPC sea surface temperature anomaly map' },
]

function buildImageCatalog(): string {
  return CURATED_IMAGES.map(img => `- Topics: ${img.topics.join(', ')}\n  URL: ${img.url}\n  Alt: ${img.alt}`).join('\n')
}

// HEAD-check every markdown image in the post. Strip any that don't return 200.
// This is the safety net: even if the catalog changes or a source goes dark,
// we never ship a post with a broken image.
async function stripBrokenImages(markdown: string): Promise<string> {
  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  const matches: { full: string; url: string }[] = []
  let match: RegExpExecArray | null
  while ((match = imageRegex.exec(markdown)) !== null) {
    matches.push({ full: match[0], url: match[2] })
  }

  let cleaned = markdown
  for (const img of matches) {
    let ok = false
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10_000)
      const res = await fetch(img.url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': '16bitweather.co blog-image-check' },
      })
      clearTimeout(timeout)
      ok = res.ok
      if (!ok) console.warn(`[generate-blog-post] Stripping broken image (${res.status}): ${img.url}`)
    } catch (err) {
      console.warn(`[generate-blog-post] Stripping unreachable image: ${img.url}`, err)
    }
    if (!ok) {
      cleaned = cleaned.split(`${img.full}\n\n`).join('').split(`${img.full}\n`).join('').split(img.full).join('')
    }
  }
  return cleaned
}

// Day-of-week topic selection:
//   Sunday  → "This Week in Weather" weekly dispatch (recap past 7 days +
//             preview the week ahead: forecasts, astronomical events,
//             pattern shifts).
//   Wednesday (and any other day via manual workflow_dispatch) → random
//             deep-dive on a specific weather or space-weather topic,
//             rotating through a curated list so consecutive Wednesdays
//             don't repeat.
function getDayTheme(): { theme: string; instruction: string } {
  const now = new Date()
  const dayOfWeek = now.getUTCDay() // 0 = Sunday, 3 = Wednesday

  if (dayOfWeek === 0) {
    return {
      theme: 'this-week-in-weather',
      instruction:
        'Write a "This Week in Weather" weekly dispatch. Cover both what happened over the past 7 days (severe weather, record temperatures, notable storms, space weather, seismic activity) AND what is coming up this week (forecasted severe-weather windows, upcoming astronomical events like meteor showers / eclipses / moon phases, seasonal pattern shifts). Keep it forward-looking so readers finish knowing what to watch for in the week ahead. End with a Bottom Line section of 2-3 actionable takeaways.',
    }
  }

  // Wednesday deep-dive rotation. Pick deterministically from the ISO week
  // number so consecutive Wednesdays pick different topics.
  const deepDiveTopics: { theme: string; instruction: string }[] = [
    {
      theme: 'weather-phenomena',
      instruction:
        'Write an educational deep-dive about a specific weather phenomenon. Pick something seasonal or recently relevant (supercells, derechos, bomb cyclones, atmospheric rivers, lake-effect snow, heat domes, downbursts, haboobs, sun dogs, mesocyclones, microbursts, etc.). Explain the science in accessible terms with vivid language. Include at least one memorable real-world example.',
    },
    {
      theme: 'space-weather-report',
      instruction:
        'Write a space-weather deep-dive. Could cover: how solar flares work and what the class letters mean, the current Solar Cycle 25 progression, how auroras form and where to see them, CME impacts on aviation and power grids, or the Sun-Earth electromagnetic connection. Use accessible language, specific numbers, and at least one recent example.',
    },
    {
      theme: 'records-and-extremes',
      instruction:
        'Write about a specific weather record or extreme event — recent or historical. Cover the conditions that produced it, why it stands out meteorologically, and what it tells us about the atmosphere. Good topics: hottest/coldest ever recorded, biggest hail, most intense rainfall, wildest temperature swings, strongest verified tornado, longest drought, biggest snowstorm.',
    },
    {
      theme: 'climate-patterns',
      instruction:
        'Write a deep-dive on a large-scale climate pattern and its current state. Topics: El Niño/La Niña (ENSO), Arctic Oscillation, North Atlantic Oscillation, Pacific Decadal Oscillation, Madden-Julian Oscillation, monsoons, jet-stream blocking. Explain the mechanism and what the current phase means for US weather right now.',
    },
    {
      theme: 'historical-weather',
      instruction:
        'Write about a notable historical weather event — a famous storm, blizzard, heat wave, tornado outbreak, hurricane, or a weather event that changed history. Explain what made it extraordinary meteorologically, and tie it to modern-day parallels or lessons.',
    },
  ]

  // ISO week index for rotation (approximate — doesn't need to be strictly
  // ISO-8601 correct; only needs to shift topic week-over-week).
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
  const weekIndex = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return deepDiveTopics[weekIndex % deepDiveTopics.length]
}

// Curated seasonal events/festivals by month for local context
function getSeasonalEvents(): string {
  const month = new Date().getMonth()
  const events: Record<number, string[]> = {
    0: ['College Football Playoff', 'NFL Playoffs', 'CES in Las Vegas', 'ski season across the Rockies and Northeast', 'Martin Luther King Jr. Day events'],
    1: ['Super Bowl', 'Daytona 500', 'Mardi Gras in New Orleans', 'Valentine\'s Day events', 'spring training begins in Florida and Arizona'],
    2: ['March Madness', 'spring break travel season', 'St. Patrick\'s Day parades', 'SXSW in Austin', 'cherry blossom season in DC'],
    3: ['Masters Tournament in Augusta', 'Coachella in Indio CA', 'Boston Marathon', 'MLB opening week', 'Easter weekend events', 'tornado season ramps up across the Plains'],
    4: ['Kentucky Derby', 'Indianapolis 500', 'Memorial Day weekend', 'hurricane season prep begins', 'graduation ceremonies nationwide', 'Bonnaroo'],
    5: ['Atlantic hurricane season begins', 'CMA Fest in Nashville', 'US Open golf', 'Bonnaroo Music Festival', 'summer solstice', 'county fair season kicks off'],
    6: ['July 4th celebrations', 'MLB All-Star Game', 'San Diego Comic-Con', 'Tour de France', 'state fair season', 'monsoon season in the Southwest'],
    7: ['Little League World Series', 'NFL preseason', 'US Open tennis', 'back-to-school season', 'peak hurricane season', 'Iowa State Fair'],
    8: ['NFL season opener', 'Labor Day weekend', 'apple picking and fall festival season', 'Ryder Cup', 'peak Atlantic hurricane season'],
    9: ['World Series', 'Halloween events', 'Albuquerque Balloon Fiesta', 'fall foliage season in New England', 'Oktoberfest events'],
    10: ['Thanksgiving travel rush', 'college football rivalry week', 'Black Friday shopping', 'early ski season openings', 'Macy\'s Thanksgiving Day Parade'],
    11: ['college football bowl season', 'New Year\'s Eve celebrations', 'holiday travel season', 'winter storm season', 'Rose Bowl prep'],
  }
  const monthEvents = events[month] || []
  return monthEvents.length > 0
    ? `## Local and Seasonal Context\nCurrent events and activities to consider tying into the post:\n${monthEvents.map(e => `- ${e}`).join('\n')}`
    : ''
}

// Fetch weather data from public sources
async function fetchWeatherContext(): Promise<string> {
  const sections: string[] = []

  // NWS active alerts summary
  try {
    const res = await fetch('https://api.weather.gov/alerts/active?status=actual&severity=Extreme,Severe&limit=10', {
      headers: { 'User-Agent': '16bitweather.co blog-generator' }
    })
    if (res.ok) {
      const data = await res.json()
      const alerts = data.features?.slice(0, 5).map((f: { properties: { event: string; headline: string; areaDesc: string } }) => 
        `- ${f.properties.event}: ${f.properties.headline} (${f.properties.areaDesc})`
      ).join('\n') || 'No extreme/severe alerts active'
      sections.push(`## Current NWS Severe Alerts\n${alerts}`)
    }
  } catch { sections.push('## NWS Alerts: unavailable') }

  // Space weather - Kp index
  try {
    const res = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json')
    if (res.ok) {
      const data = await res.json()
      const recent = data.slice(-5).map((d: string[]) => `Kp=${d[1]} at ${d[0]}`).join(', ')
      sections.push(`## Recent Kp Index\n${recent}`)
    }
  } catch { sections.push('## Kp Index: unavailable') }

  // Space weather - solar flares (3-day)
  try {
    const res = await fetch('https://services.swpc.noaa.gov/json/goes/primary/xrays-3-day.json')
    if (res.ok) {
      const data = await res.json()
      const maxFlux = Math.max(...data.slice(-100).map((d: { flux: number }) => d.flux))
      const flareClass = maxFlux >= 1e-4 ? 'X-class' : maxFlux >= 1e-5 ? 'M-class' : maxFlux >= 1e-6 ? 'C-class' : 'B-class or below'
      sections.push(`## Solar X-Ray Activity (3-day)\nPeak flux: ${maxFlux.toExponential(2)} W/m2 (${flareClass})`)
    }
  } catch { sections.push('## Solar Flares: unavailable') }

  // USGS significant earthquakes (past week)
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson')
    if (res.ok) {
      const data = await res.json()
      const quakes = data.features?.slice(0, 3).map((f: { properties: { title: string; mag: number } }) => 
        `- M${f.properties.mag}: ${f.properties.title}`
      ).join('\n') || 'No significant earthquakes this week'
      sections.push(`## Significant Earthquakes (Past Week)\n${quakes}`)
    }
  } catch { sections.push('## Earthquakes: unavailable') }

  // Current date context
  const now = new Date()
  sections.unshift(`## Date Context\nToday is ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. Season: ${getSeasonName(now)}.`)

  // Add seasonal/local event context
  const seasonalEvents = getSeasonalEvents()
  if (seasonalEvents) {
    sections.push(seasonalEvents)
  }

  return sections.join('\n\n')
}

function getSeasonName(date: Date): string {
  const month = date.getMonth()
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Fall'
  return 'Winter'
}

async function generateBlogPost(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is required')
    process.exit(1)
  }

  console.log('[generate-blog-post] Fetching weather context...')
  const weatherContext = await fetchWeatherContext()

  const { theme, instruction } = getDayTheme()
  const today = new Date().toISOString().split('T')[0]

  console.log(`[generate-blog-post] Theme: ${theme}`)
  console.log('[generate-blog-post] Calling Claude API...')

  const systemPrompt = `You are 16bitbot, the weather writer for 16bitweather.co -- a retro-styled weather education platform.

Your job is to write a weekly weather blog post. The site has a terminal/pixel aesthetic, but your writing voice should be warm, conversational, and approachable -- like a knowledgeable friend breaking down what is happening with the weather over coffee.

Voice and tone:
- Write like you are talking to a neighbor, not filing a report. Be direct and friendly.
- Use "y'all" naturally where it fits (not in every sentence -- just where it sounds right).
- Address the reader directly: "if you're heading out to the festival", "keep your radar app handy", "you will need a sturdy umbrella instead of sunglasses".
- Use vivid, colloquial language: "bone dry", "crash the party", "dragging its feet", "a completely different story". Avoid stiff or clinical phrasing.
- Tie weather to real life -- local festivals, outdoor events, sports, travel plans, farming, barbecues, whatever is happening right now.
- Mention 1-2 specific local events, festivals, or seasonal activities from the context data to ground the post in real life.
- First person plural is fine ("we are looking at", "we could see") but mix it with direct address to the reader.

Rules:
- No emojis ever
- REQUIRED: Include exactly 2 inline images to break up the text. Every post must ship with 2 images — this is a hard requirement. You MUST pick from the curated catalog below -- never invent image URLs. Match each image's topic to a section of your post; if only one catalog entry truly fits, still include 2 by picking a second that is thematically adjacent (e.g. a weather satellite view alongside a storm image). Use this exact markdown format with the URL and alt text copied verbatim from the catalog: ![alt from catalog](url from catalog). Place images between sections, not at the very top or bottom. Do not place both images next to each other — separate them with at least one section of text.

Curated image catalog (public domain / CC; pick 1-2 that match your post topic):
${buildImageCatalog()}
- Write 400-800 words
- Use markdown headers (## for main sections, ### for subsections)
- End every post with a "## Bottom Line" section with 2-3 actionable takeaways
- Reference specific cities, temperatures, wind speeds, Kp index values to feel concrete and grounded
- Tags should be lowercase, 4-6 tags mixing weather type + geography
- The author is always "16bitbot"
- Make the title catchy and specific, not generic

Output ONLY valid JSON with this exact schema (no markdown code fences, no explanation):
{
  "title": "string",
  "slug": "string (format: YYYY-MM-DD-kebab-case-title)",
  "summary": "string (1-2 sentences, under 200 chars)",
  "tags": ["string"],
  "readTime": number,
  "content": "string (markdown body, no frontmatter)"
}`

  const userPrompt = `${instruction}

Here is current weather data to incorporate (use what's relevant, skip what's unavailable):

${weatherContext}

Today's date for the slug: ${today}
Generate the blog post now.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)

  let response: Response
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      signal: controller.signal,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const error = await response.text()
    console.error(`[generate-blog-post] Claude API error: ${response.status}`, error)
    process.exit(1)
  }

  const result = await response.json()
  const text = result.content?.[0]?.text
  if (!text) {
    console.error('[generate-blog-post] No content in Claude response')
    process.exit(1)
  }

  let post: { title: string; slug: string; summary: string; tags: string[]; readTime: number; content: string }
  try {
    post = JSON.parse(text)
  } catch {
    // Try extracting JSON from the response if it has extra text
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      post = JSON.parse(match[0])
    } else {
      console.error('[generate-blog-post] Failed to parse Claude response as JSON:', text.slice(0, 500))
      process.exit(1)
    }
  }


  // Validate and sanitize model output before writing
  const safeSlug = (post.slug || '').replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 100)
  if (!safeSlug) {
    console.error('[generate-blog-post] Invalid slug in Claude response:', post.slug)
    process.exit(1)
  }
  const safeTags = Array.isArray(post.tags) ? post.tags.map(t => String(t).slice(0, 50)) : []
  const safeReadTime = typeof post.readTime === 'number' && post.readTime > 0 ? Math.min(post.readTime, 60) : Math.ceil((post.content || '').split(/\s+/).length / 200)

  // Build the markdown file
  const themeToOgType: Record<string, 'severe' | 'space' | 'education' | 'record' | 'dispatch'> = {
    'this-week-in-weather': 'dispatch',
    'space-weather-report': 'space',
    'weather-phenomena': 'education',
    'records-and-extremes': 'record',
    'climate-patterns': 'education',
    'historical-weather': 'record',
  }
  const ogType = themeToOgType[theme] ?? 'dispatch'
  const heroImage = `/api/og/blog?title=${encodeURIComponent(post.title)}&type=${ogType}`

  const frontmatter = `---
title: "${post.title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"
slug: "${safeSlug}"
date: "${new Date().toISOString()}"
author: "16bitbot"
summary: "${post.summary.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"
tags: ${JSON.stringify(safeTags)}
heroImage: "${heroImage}"
readTime: ${safeReadTime}
---`

  const validatedContent = await stripBrokenImages(post.content)
  const fileContent = `${frontmatter}\n\n${validatedContent}\n`
  const filename = `${safeSlug}.md`
  const filePath = path.join(BLOG_DIR, filename)

  // Ensure directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true })
  }

  fs.writeFileSync(filePath, fileContent, 'utf8')
  console.log(`[generate-blog-post] Blog post saved: ${filePath}`)
  console.log(`[generate-blog-post] Title: ${post.title}`)
  console.log(`[generate-blog-post] Tags: ${post.tags.join(', ')}`)
  console.log(`[generate-blog-post] URL: ${SITE_URL}/blog/${post.slug}`)
}

generateBlogPost().catch(err => {
  console.error('[generate-blog-post] Fatal error:', err)
  process.exit(1)
})
