# Product Requirements Document: Shareable Weather Cards

**Product:** 16bitweather.co
**Feature:** Shareable Weather Cards
**Author:** Logan (AI) + Justin Elrod
**Date:** January 30, 2026
**Status:** Draft

---

## Executive Summary

Add the ability for users to generate and share visually appealing weather cards to social media platforms (X, Facebook, LinkedIn). This feature turns every share into organic marketing while giving users a delightful way to share weather updates with their network.

---

## Problem Statement

Users who enjoy 16bitweather's unique terminal aesthetic have no easy way to share their weather with friends or followers. Current options require screenshots, which:
- Look inconsistent across devices
- Don't include proper attribution/links
- Miss the opportunity for viral, branded content

---

## Goals & Success Metrics

### Goals
- Enable frictionless weather sharing to major social platforms
- Drive organic traffic through shared cards linking back to 16bitweather.co
- Reinforce brand identity through consistent, shareable visual assets

### Success Metrics
- Share button clicks: 100/week within 30 days
- Completed shares: 25% of clicks result in share
- Referral traffic: 10% increase in social referrals
- User feedback: Positive sentiment

---

## User Stories

### Primary User Story
As a 16bitweather user, I want to share today's weather to my social media so my friends can see the forecast in a cool, retro-styled card.

### Secondary User Stories
- As a user, I want the share process to be fast (< 3 seconds) so I don't lose interest.
- As a user, I want the card to look good in Twitter/Facebook/LinkedIn feeds so I'm proud to share it.
- As a user, I want the shared post to link back to 16bitweather so my friends can check it out.

---

## Feature Specification

### Weather Card Content

The generated card includes:
- **Location** — City/region name (e.g., "San Ramon, CA")
- **Current Temp** — Large, prominent (e.g., "72°F")
- **Conditions** — Weather state + icon (e.g., "Partly Cloudy ⛅")
- **Today's High/Low** — Forecast range (e.g., "High 78° / Low 55°")
- **Precipitation** — Chance of rain/snow (e.g., "10% chance of rain")
- **Timestamp** — When generated (e.g., "Jan 30, 2026 · 8:45 PM")

### Visual Design
- **Style:** Terminal-inspired but polished for social readability
- **Dimensions:** 1200 x 630 px (optimal for social OG images)
- **Background:** Dark (#0d1117 or similar terminal dark)
- **Typography:** Monospace for data, clean sans-serif for labels
- **Colors:** Terminal palette — teals, magentas, warm yellows on dark
- **Layout:** Clean grid, generous whitespace, readable at thumbnail size
- **Aesthetic:** Modern terminal (htop/lazygit style), NOT CRT/scanlines

### Share Flow UX
1. User clicks [SHARE] button on weather display
2. Share modal opens with platform options (X, Facebook, LinkedIn)
3. User clicks platform
4. Loading: "Generating your weather card..." (1-2 seconds)
5. Platform share dialog opens with pre-attached image + pre-filled text + link

---

## Technical Architecture

### Image Generation API
`GET /api/og/weather-card`

### Technology
`next/og` (Next.js built-in Edge Functions - same as @vercel/og)

### Platform Share URLs
- **X (Twitter):** `https://twitter.com/intent/tweet?text={text}&url={url}`
- **Facebook:** `https://www.facebook.com/sharer/sharer.php?u={url}&quote={text}`
- **LinkedIn:** `https://www.linkedin.com/sharing/share-offsite/?url={url}`

### Mobile Enhancement
Use native `navigator.share` API when available

---

## Open Questions (To Address During Implementation)

### 1. Share Button Placement
Where should the share button appear? Options:
- `components/forecast.tsx` - In the CardHeader area
- `components/dashboard/location-card.tsx` - With existing action buttons (star, refresh, delete)
- `app/weather/[city]/client.tsx` - Main weather display header
- All of the above?

### 2. Default Share Text Template
What text should pre-fill when sharing? Suggested format:
```
It's 72°F and Partly Cloudy in San Ramon, CA ⛅
Check your forecast at 16bitweather.co
```

### 3. Shareable URL Structure
What URL should the shared post link to?
- **Option A:** `16bitweather.co/weather/san-ramon-ca` (existing city page)
- **Option B:** `16bitweather.co/share/{id}` (dedicated share landing page with card as OG image)

### 4. Cache Strategy
Recommended cache headers for the OG endpoint:
```
Cache-Control: public, s-maxage=300, stale-while-revalidate=3600
```

### 5. Analytics Tracking
How to track share button clicks and completed shares for success metrics?
