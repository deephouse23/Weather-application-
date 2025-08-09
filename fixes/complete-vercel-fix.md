# Complete Vercel Build Fix for Weather Application

## Problem Analysis
The Vercel build is failing with `ReferenceError: theme is not defined` during the prerendering/static generation phase. This happens because:

1. The `useTheme()` hook requires the ThemeProvider context which isn't available during server-side rendering (SSR)
2. There were references to `setCurrentTheme` function that doesn't exist
3. The `API_KEY` variable wasn't defined before use
4. The component needs to be client-side only to avoid SSR issues

## Complete Fix Instructions

Apply ALL of the following changes to `app/page.tsx`:

### 1. Add Dynamic Import Support
At the top of the file, update the imports:

```typescript
// Change FROM:
import React, { useState, useEffect } from "react"

// TO:
import React, { useState, useEffect, Suspense } from "react"
import dynamic from 'next/dynamic'
```

### 2. Remove Broken Theme Management Code
Find and DELETE this entire section (around lines 296-355):

```typescript
// DELETE ALL OF THIS:
  // Enhanced theme management functions
  const getStoredTheme = (): ThemeType => {
    if (!isClient) return 'dark'
    try {
      const stored = localStorage.getItem('weather-edu-theme')
      if (stored && ['dark', 'miami', 'tron'].includes(stored)) {
        return stored as ThemeType
      }
    } catch (error) {
      console.warn('Failed to get stored theme:', error)
      setError('Theme loading failed, using default')
    }
    return 'dark' // Default to dark theme
  }

  // Load theme on mount and sync with navigation
  useEffect(() => {
    if (!isClient) return
    
    try {
      const storedTheme = getStoredTheme()
      setCurrentTheme(storedTheme)
      
      // Listen for theme changes from navigation
      const handleStorageChange = () => {
        try {
          const newTheme = getStoredTheme()
          setCurrentTheme(newTheme)
        } catch (error) {
          console.error('Error handling storage change:', error)
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      
      // Poll for theme changes (in case of same-tab changes)
      const interval = setInterval(() => {
        try {
          const newTheme = getStoredTheme()
          if (newTheme !== currentTheme) {
            setCurrentTheme(newTheme)
          }
        } catch (error) {
          console.error('Error polling theme changes:', error)
        }
      }, 100)
      
      return () => {
        try {
          window.removeEventListener('storage', handleStorageChange)
          clearInterval(interval)
        } catch (error) {
          console.error('Error cleaning up theme listeners:', error)
        }
      }
    } catch (error) {
      console.error('Error initializing theme management:', error)
      setError('Theme initialization failed')
    }
  }, [isClient, currentTheme])
```

Replace it with:
```typescript
  // Theme is now managed entirely by ThemeProvider, no local management needed
```

### 3. Remove currentTheme Variable
Find and update (around line 77):

```typescript
// Change FROM:
  const [isClient, setIsClient] = useState(false)
  // Theme is now fixed to dark
  const currentTheme = 'dark' as const
  const [searchCache, setSearchCache] = useState<Map<string, { data: WeatherData; timestamp: number }>>(new Map())

// TO:
  const [isClient, setIsClient] = useState(false)
  // Theme is managed by ThemeProvider
  const [searchCache, setSearchCache] = useState<Map<string, { data: WeatherData; timestamp: number }>>(new Map())
```

### 4. Fix TronGridBackground Component
Find the TronGridBackground component and update:

```typescript
// Change FROM:
  const TronGridBackground = () => {
    if (currentTheme !== 'tron') return null;

// TO:
  const TronGridBackground = () => {
    if ((theme || 'dark') !== 'tron') return null;
```

### 5. Fix API_KEY Usage
In the `handleSearch` function (around line 540), add the API_KEY definition:

```typescript
// Change FROM:
      if (!API_KEY) {
        throw new Error('OpenWeather API key is not configured');
      }

// TO:
      const API_KEY = getAPIKey();
      if (!API_KEY) {
        throw new Error('OpenWeather API key is not configured');
      }
```

### 6. Fix All Theme Props
Throughout the file, update ALL instances where theme is passed as a prop:

- Change `theme={theme}` to `theme={theme || 'dark'}`
- Change `theme={currentTheme}` to `theme={theme || 'dark'}`
- Change `theme === "dark"` to `(theme || 'dark') === "dark"`
- Change `theme === "miami"` to `(theme || 'dark') === "miami"`
- Change `theme === "tron"` to `(theme || 'dark') === "tron"`

This includes:
- ErrorBoundary component
- LazyEnvironmentalDisplay component  
- LazyForecast component
- LazyForecastDetails component
- All city links in the SEO section

### 7. Most Important: Disable SSR for the Component
At the END of the file, replace the HomePage export:

```typescript
// Change FROM:
export default function HomePage() {
  return (
    <WeatherApp />
  )
}

// TO:
// Create a dynamic import for the WeatherApp to avoid SSR issues
const DynamicWeatherApp = dynamic(
  () => Promise.resolve(WeatherApp),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }
)

export default function HomePage() {
  return <DynamicWeatherApp />
}
```

## Testing Commands

After making ALL changes above:

```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Test build locally
npm run build

# 3. If successful, test production build
npm run start

# 4. Commit changes
git add app/page.tsx
git commit -m "Fix SSR issues: disable SSR for WeatherApp, remove broken theme code"

# 5. Push to trigger Vercel deployment
git push origin fix/search-state-improvements

# 6. Monitor Vercel deployment
vercel logs --follow
```

## Key Points
- The main fix is disabling SSR for the WeatherApp component using `dynamic` with `ssr: false`
- This prevents the theme context error during static generation
- All the theme fallbacks (`theme || 'dark'`) provide additional safety
- Removing the broken `setCurrentTheme` code eliminates undefined function errors

This should completely resolve the Vercel build issue!
