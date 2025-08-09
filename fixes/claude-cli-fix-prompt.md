# Claude CLI Fix Prompt for Vercel Build Issue

## Issue Summary
The Vercel build is failing with error: `ReferenceError: theme is not defined` during prerendering of the home page. This is happening because:
1. The `theme` variable from `useTheme()` might be undefined during server-side rendering
2. The `API_KEY` variable is used but not defined in the `handleSearch` function

## Fixes to Apply

Please apply the following fixes to the file `app/page.tsx`:

### Fix 1: Define API_KEY variable
In the `handleSearch` function (around line 597), add the API_KEY definition before using it:

```typescript
// BEFORE:
      if (!API_KEY) {
        throw new Error('OpenWeather API key is not configured');
      }

// AFTER:
      const API_KEY = getAPIKey();
      if (!API_KEY) {
        throw new Error('OpenWeather API key is not configured');
      }
```

### Fix 2: Add fallback for theme prop in components
Throughout the file, replace all instances of `theme={theme}` with `theme={theme || 'dark'}` and `theme === ` with `(theme || 'dark') === ` to provide a fallback value during SSR.

Specifically update these locations:

1. **ErrorBoundary component** (around line 873):
   - Change: `theme={currentTheme}` 
   - To: `theme={theme || 'dark'}`

2. **LazyEnvironmentalDisplay component** (around line 956):
   - Change: `theme={theme}`
   - To: `theme={theme || 'dark'}`

3. **LazyForecast component** (around line 972):
   - Change: `theme={theme}`
   - To: `theme={theme || 'dark'}`

4. **LazyForecastDetails component** (around line 983):
   - Change: `theme={theme}`
   - To: `theme={theme || 'dark'}`

5. **SEO City Links Section** (lines 1004-1129):
   - Replace ALL instances of `theme === "dark"` with `(theme || 'dark') === "dark"`
   - Replace ALL instances of `theme === "miami"` with `(theme || 'dark') === "miami"`
   - Replace ALL instances of `theme === "tron"` with `(theme || 'dark') === "tron"`

This applies to:
- The main container div className
- The h2 heading className
- All 10 city link anchor tags (New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, San Antonio, San Diego, Dallas, Austin)

## Commands to Run

After making the above changes:

```bash
# 1. Test the build locally
npm run build

# 2. If successful, commit the changes
git add app/page.tsx
git commit -m "Fix SSR theme undefined error and API_KEY variable issue"

# 3. Push to trigger Vercel deployment
git push origin fix/search-state-improvements

# 4. Monitor the Vercel deployment
vercel --prod
```

## Verification
After deployment, verify that:
1. The build completes successfully without the "theme is not defined" error
2. The home page renders correctly
3. Weather search functionality works as expected
4. Theme styling appears correctly (should default to dark theme)
