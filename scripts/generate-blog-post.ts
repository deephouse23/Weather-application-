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

// Determine which week of the month it is for topic rotation
function getWeekTheme(): { theme: string; instruction: string } {
  const now = new Date()
  const dayOfMonth = now.getDate()
  const week = Math.ceil(dayOfMonth / 7)

  switch (week) {
    case 1:
      return {
        theme: 'this-week-in-weather',
        instruction: 'Write a "This Week in Weather" recap covering the most notable weather events from the past 7 days. Include severe weather, record temperatures, significant storms, and any weather-related impacts on events or travel.',
      }
    case 2:
      return {
        theme: 'space-weather-report',
        instruction: 'Write a space weather report covering solar activity from the past week. Include solar flare activity, geomagnetic storm levels (Kp index), aurora visibility, coronal mass ejections, and how solar cycle 25 is progressing.',
      }
    case 3:
      return {
        theme: 'weather-phenomena',
        instruction: 'Write an educational deep-dive about a specific weather phenomenon. Pick something seasonal or recently relevant (supercells, derechos, bomb cyclones, atmospheric rivers, lake-effect snow, heat domes, etc.). Explain the science in accessible terms.',
      }
    case 4:
      return {
        theme: 'records-and-extremes',
        instruction: 'Write about recent weather records and extremes. Cover global temperature records broken, unusual weather events, climate milestones, and the current hottest/coldest places on Earth.',
      }
    default:
      return {
        theme: 'wildcard',
        instruction: 'Write a seasonal weather preview or cover an interesting weather topic of your choice. Could be a historical weather event anniversary, a look ahead at upcoming season patterns, or a weather science explainer.',
      }
  }
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

  const { theme, instruction } = getWeekTheme()
  const today = new Date().toISOString().split('T')[0]

  console.log(`[generate-blog-post] Theme: ${theme}`)
  console.log('[generate-blog-post] Calling Claude API...')

  const systemPrompt = `You are 16bitbot, the weather intelligence system for 16bitweather.co -- a retro-styled weather education platform.

Your job is to write a weekly weather blog post. The site has a terminal/pixel aesthetic, so your writing should feel like a dispatch from a weather monitoring station, but be warm and conversational -- like explaining weather to a curious friend at a command center.

Rules:
- No emojis ever
- Write 400-800 words
- Use markdown headers (## for main sections, ### for subsections)
- End every post with a "## Bottom Line" section with 2-3 actionable takeaways
- Tie weather to current events, sports, holidays, or pop culture when possible
- Reference specific cities, temperatures, wind speeds, Kp index values to feel concrete
- Use first person plural ("we tracked", "we're seeing")
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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
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

  // Build the markdown file
  const heroImage = `/api/og/blog?title=${encodeURIComponent(post.title)}&type=${theme.includes('space') ? 'space' : theme.includes('severe') || theme.includes('week') ? 'severe' : theme.includes('record') || theme.includes('extreme') ? 'record' : 'dispatch'}`

  const frontmatter = `---
title: "${post.title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"
slug: "${post.slug}"
date: "${new Date().toISOString()}"
author: "16bitbot"
summary: "${post.summary.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"
tags: ${JSON.stringify(post.tags)}
heroImage: "${heroImage}"
readTime: ${post.readTime}
---`

  const fileContent = `${frontmatter}\n\n${post.content}\n`
  const filename = `${post.slug}.md`
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
