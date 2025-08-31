# 🔄 Next.js to React Import Conversion Guide

## Core Import Conversions

### 1. Navigation & Routing

```typescript
// ❌ Next.js (BEFORE)
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const router = useRouter()
const pathname = usePathname()
const searchParams = useSearchParams()

// ✅ React Router (AFTER)
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'

const navigate = useNavigate()
const location = useLocation()
const pathname = location.pathname
const [searchParams] = useSearchParams()
```

### 2. Dynamic Imports & Lazy Loading

```typescript
// ❌ Next.js (BEFORE)
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('./Component'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

// ✅ React (AFTER)
import { lazy, Suspense } from 'react'

const LazyComponent = lazy(() => import('./Component'))

// Usage in JSX:
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

### 3. Image Components

```typescript
// ❌ Next.js (BEFORE)
import Image from 'next/image'

<Image
  src="/weather-icon.png"
  alt="Weather"
  width={50}
  height={50}
  priority
/>

// ✅ Standard React (AFTER)
<img
  src="/weather-icon.png"
  alt="Weather"
  width={50}
  height={50}
  loading="eager"
  className="object-cover"
/>
```

### 4. Font Loading

```typescript
// ❌ Next.js (BEFORE)
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

<body className={inter.className}>

// ✅ Standard Web Fonts (AFTER)
// In index.html:
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

// In CSS:
body {
  font-family: 'Inter', sans-serif;
}
```

### 5. Metadata & SEO

```typescript
// ❌ Next.js (BEFORE)
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description'
}

// ✅ React Helmet (AFTER)
import { Helmet } from 'react-helmet-async'

function MyPage() {
  return (
    <>
      <Helmet>
        <title>Page Title</title>
        <meta name="description" content="Page description" />
      </Helmet>
      {/* Page content */}
    </>
  )
}
```

### 6. API Routes

```typescript
// ❌ Next.js API Route (BEFORE)
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')
  
  return NextResponse.json({ data: 'example' })
}

// ✅ Express.js Route (AFTER)
import express from 'express'
const app = express()

app.get('/api/weather/current', async (req, res) => {
  const { city } = req.query
  
  res.json({ data: 'example' })
})
```

### 7. Client-Side API Calls

```typescript
// ❌ Next.js (BEFORE) - Calls to internal API routes
const response = await fetch('/api/weather/current?city=austin')

// ✅ Vite + React (AFTER) - Calls to separate backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const response = await fetch(`${API_BASE_URL}/api/weather/current?city=austin`)
```

## 🔧 Specific File Conversion Patterns

### Navigation Component (`components/navigation.tsx`)

```typescript
// Key changes needed:
- import Link from "next/link" → import { Link } from "react-router-dom"
- import { usePathname } from "next/navigation" → import { useLocation } from "react-router-dom"
- const pathname = usePathname() → const location = useLocation(); const pathname = location.pathname
- href="/about" → to="/about"
```

### Weather Search Component (`components/weather-search.tsx`)

```typescript
// If using router navigation:
- import { useRouter } from 'next/navigation' → import { useNavigate } from 'react-router-dom'
- router.push('/weather/austin') → navigate('/weather/austin')
```

### City Autocomplete (`components/city-autocomplete.tsx`)

```typescript
// Key changes:
- import { useRouter } from "next/navigation" → import { useNavigate } from "react-router-dom"
- router.push(`/weather/${citySlug}`) → navigate(`/weather/${citySlug}`)
```

### Location Context (`components/location-context.tsx`)

```typescript
// Key changes:
- import { usePathname } from 'next/navigation' → import { useLocation } from 'react-router-dom'
- const pathname = usePathname() → const location = useLocation(); const pathname = location.pathname
```

## 🌐 Environment Variables

### Client-Side (Vite)
```env
# Prefix with VITE_ for client-side access
VITE_OPENWEATHER_API_KEY=your_key_here
VITE_GOOGLE_POLLEN_API_KEY=your_key_here
VITE_API_URL=http://localhost:5000
```

### Server-Side (Express)
```env
# No prefix needed for server-side
OPENWEATHER_API_KEY=your_key_here
GOOGLE_POLLEN_API_KEY=your_key_here
GOOGLE_AIR_QUALITY_API_KEY=your_key_here
PORT=5000
NODE_ENV=production
```

## 🚨 Common Pitfalls

1. **Path Imports**: Update all imports from `@/app/` to `@/` or `@/src/`
2. **API Base URLs**: Remember to prefix API calls with backend URL in production
3. **Environment Variables**: Client-side vars need `VITE_` prefix
4. **Routing**: React Router uses `to` prop instead of `href`
5. **Dynamic Imports**: Use `React.lazy` + `Suspense` instead of Next.js `dynamic`
6. **Metadata**: React Helmet needs to be wrapped in each component, not exported
7. **"use client"**: Remove all Next.js directives - they're not needed in Vite