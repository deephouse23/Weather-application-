# MRMS Tiles Not Rendering - Comprehensive Diagnostic

## Problem Summary
The WeatherMap component receives coordinates correctly (console shows `isUSLocation: true` and coordinates `37.7497, -121.9549`), but NOAA MRMS precipitation tiles are NOT rendering on the map. The map shows only a blank/white base map without any radar overlay.

## Debugging Added

### 1. WMSTileLayer.tsx - Component Level Debugging

**Added to component render:**
```typescript
console.log('🔧 WMSTileLayer render:', {
  url,
  layers,
  format,
  transparent,
  opacity,
  time,
  zIndex,
  hasMap: !!map
})
```

**Added to useEffect (layer creation):**
```typescript
console.log('🎬 Creating WMS layer with params:', {
  url,
  layers,
  time,
  opacity,
  zIndex
})
```

**Added Event Listeners:**
- `loading` event → `⏳ WMS tiles loading...`
- `load` event → `✅ WMS tiles loaded successfully`
- `tileerror` event → `❌ WMS tile error:` + error details
- `tileloadstart` event → `🔄 Tile load start:` + URL
- `tileload` event → `✅ Tile loaded:` + URL

**Added Example URL Logging:**
```typescript
console.log('📍 WMS GetMap URL example:', exampleUrl)
```

This shows the actual WMS request URL format being generated.

**Added Cleanup Logging:**
```typescript
console.log('🗑️ Removing WMS layer from map')
```

### 2. weather-map-client.tsx - State and Rendering Debugging

**Added Active Layers State Logging (top of component):**
```typescript
console.log('📊 Active Layers State:', activeLayers)
console.log('  precipitation_new:', activeLayers['precipitation_new'])
console.log('  clouds_new:', activeLayers['clouds_new'])
console.log('  wind_new:', activeLayers['wind_new'])
```

**Added mrmsBufferedTimes Generation Logging:**
```typescript
console.log('🕐 Building mrmsBufferedTimes:', {
  isUSLocation,
  frameIndex,
  MRMS_PAST_STEPS
})

// If not US:
console.log('  ⏭️ Skipping - not US location')

// If US:
console.log(`  ✅ Generated ${times.length} timestamps`)
console.log('  First:', new Date(times[0]).toISOString())
console.log('  Last:', new Date(times[times.length - 1]).toISOString())
console.log(`  📦 Buffered ${buffered.length} times (indices ${start}-${end})`)
```

**Added Pre-Render Condition Check:**
```typescript
console.log('🔍 MRMS Render Check:', {
  'activeLayers[precipitation_new]': activeLayers['precipitation_new'],
  'isUSLocation': isUSLocation,
  'mrmsBufferedTimes.length': mrmsBufferedTimes.length,
  'willRender': activeLayers['precipitation_new'] && isUSLocation && mrmsBufferedTimes.length > 0
})
```

**Added MRMS Rendering Conditions:**
```typescript
console.log('🎯 MRMS RENDERING CONDITIONS:')
console.log('  activeLayers precipitation_new:', activeLayers['precipitation_new'])
console.log('  isUSLocation:', isUSLocation)
console.log('  mrmsBufferedTimes.length:', mrmsBufferedTimes.length)
console.log('  mrmsBufferedTimes:', mrmsBufferedTimes)
console.log('  frameIndex:', frameIndex)
console.log('  Current timestamp:', mrmsBufferedTimes[...])
console.log('  mrmsOpacity:', mrmsOpacity)
```

**Added Per-Layer Rendering Logs:**
```typescript
console.log(`  🗺️ Rendering WMSTileLayer ${idx}:`, {
  time: new Date(t).toISOString(),
  isCurrentFrame,
  opacity: layerOpacity,
  key: `mrms-${tileEpoch}-${t}`
})
```

## What to Check Now

### 1. Console Output Analysis

Open the browser console (F12) and look for these specific log patterns:

#### Initial State Check
```
📊 Active Layers State: {precipitation_new: true, clouds_new: false, ...}
  precipitation_new: true
  clouds_new: false
  wind_new: false
```
**Expected:** `precipitation_new` should be `true`

#### MRMS Buffered Times Generation
```
🕐 Building mrmsBufferedTimes: {isUSLocation: true, frameIndex: 6, MRMS_PAST_STEPS: 24}
  ✅ Generated 25 timestamps
  First: 2025-10-11T15:00:00.000Z
  Last: 2025-10-11T19:00:00.000Z
  📦 Buffered 5 times (indices 4-8)
```
**Expected:** Should generate 25 timestamps and buffer 5 around current frame
**Problem if:** Shows `⏭️ Skipping - not US location` or buffered count is 0

#### Render Condition Check
```
🔍 MRMS Render Check: {
  activeLayers[precipitation_new]: true,
  isUSLocation: true,
  mrmsBufferedTimes.length: 5,
  willRender: true
}
```
**Expected:** ALL should be `true` and length > 0
**Problem if:** `willRender` is `false`

#### MRMS Rendering Conditions (only if willRender is true)
```
🎯 MRMS RENDERING CONDITIONS:
  activeLayers precipitation_new: true
  isUSLocation: true
  mrmsBufferedTimes.length: 5
  mrmsBufferedTimes: [Array of timestamps]
  frameIndex: 6
  Current timestamp: 1728673200000
  mrmsOpacity: 0.85
```
**Expected:** All conditions met, opacity should be 0.85
**Problem if:** This log doesn't appear even though willRender is true

#### WMSTileLayer Rendering (should appear 5 times for buffered frames)
```
  🗺️ Rendering WMSTileLayer 0: {
    time: "2025-10-11T17:00:00.000Z",
    isCurrentFrame: false,
    opacity: 0.15,
    key: "mrms-0-1728666000000"
  }
  🗺️ Rendering WMSTileLayer 1: {...}
  ... (more layers)
```
**Expected:** 5 logs (one per buffered time)
**Problem if:** No logs appear

#### WMSTileLayer Component Instantiation
```
🔧 WMSTileLayer render: {
  url: "https://nowcoast.noaa.gov/arcgis/services/...",
  layers: "1",
  format: "image/png",
  transparent: true,
  opacity: 0.85,
  time: "2025-10-11T19:00:00.000Z",
  zIndex: 500,
  hasMap: true
}
```
**Expected:** One log per WMSTileLayer instance (5 total)
**Problem if:** No logs appear OR `hasMap` is `false`

#### WMS Layer Creation
```
🎬 Creating WMS layer with params: {
  url: "https://nowcoast.noaa.gov/arcgis/services/...",
  layers: "1",
  time: "2025-10-11T19:00:00.000Z",
  opacity: 0.85,
  zIndex: 500
}
```
**Expected:** One log per layer being created
**Problem if:** No logs appear

#### WMS URL Example
```
📍 WMS GetMap URL example: https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=1&FORMAT=image/png&TRANSPARENT=true&TIME=2025-10-11T19:00:00.000Z&CRS=EPSG:3857&BBOX=...&WIDTH=256&HEIGHT=256
```
**Expected:** Valid WMS GetMap URL
**Action:** Copy this URL and test it in a new browser tab

#### Adding Layer to Map
```
➕ Adding WMS layer to map
```
**Expected:** One per layer
**Problem if:** No logs appear

#### Tile Loading Events (should appear many times)
```
🔄 Tile load start: https://nowcoast.noaa.gov/arcgis/services/...
⏳ WMS tiles loading...
✅ Tile loaded: https://nowcoast.noaa.gov/arcgis/services/...
✅ WMS tiles loaded successfully
```
**Expected:** Many logs as tiles load
**Problem if:** NO tile loading logs appear
**Problem if:** `❌ WMS tile error:` appears

### 2. Browser Network Tab Analysis

1. Open DevTools → Network tab
2. Filter by "nowcoast" or "WMSServer"
3. Reload the page or pan the map

#### What to Look For:

**Scenario A: No Requests at All**
- Problem: Layers aren't being created or added to map
- Check: Console logs should reveal which step is failing

**Scenario B: Requests with 404/403/500 Errors**
- Problem: NOAA service issue or wrong URL
- Action: Copy failing URL and test in browser
- Check: NOAA service status

**Scenario C: Requests with 200 Success**
- Problem: Tiles are loading but not visible
- Action: Click on a request → Preview tab → Should see radar image
- Check: Is the image transparent/blank?

**Scenario D: CORS Errors**
```
Access to fetch at 'https://nowcoast.noaa.gov/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```
- Problem: NOAA blocking cross-origin requests
- Solution: May need server-side proxy

#### Example of Good WMS Request URL:
```
https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer
  ?SERVICE=WMS
  &REQUEST=GetMap
  &VERSION=1.3.0
  &LAYERS=1
  &FORMAT=image/png
  &TRANSPARENT=true
  &TIME=2025-10-11T19:00:00.000Z
  &CRS=EPSG:3857
  &BBOX=-13695191.92,4492777.77,-13677632.35,4510337.35
  &WIDTH=256
  &HEIGHT=256
```

Copy one of your actual request URLs and paste it here for analysis.

### 3. Visual Inspection Checks

#### Base Map Opacity Test
The base map might be obscuring the radar. Try this in DevTools console:
```javascript
document.querySelectorAll('.leaflet-tile-pane img').forEach(img => {
  if (img.src.includes('openstreetmap')) {
    img.style.opacity = '0.3'
  }
})
```
If radar appears after reducing base map opacity, that's the problem.

#### Check Layer Z-Index
In DevTools Elements tab, inspect the map layers:
- Base map should have low z-index (1)
- MRMS should have high z-index (500)

#### Check for Hidden Layers
Look for layers with `opacity: 0` or `display: none` in the styles.

## Common Failure Scenarios

### Scenario 1: mrmsBufferedTimes.length is 0
**Symptoms:**
- `🔍 MRMS Render Check` shows `willRender: false`
- `mrmsBufferedTimes.length: 0`

**Likely Cause:**
- `isUSLocation` is `false`
- `frameIndex` is out of bounds

**Fix:** Check coordinates and `isInMRMSCoverage()` function

### Scenario 2: WMSTileLayer Components Not Rendering
**Symptoms:**
- `🎯 MRMS RENDERING CONDITIONS:` logs appear
- But NO `🔧 WMSTileLayer render:` logs

**Likely Cause:**
- React not rendering child components
- LayersControl issue
- Map not ready

**Fix:** Try rendering WMSTileLayer outside LayersControl

### Scenario 3: WMS Layers Created But No Tiles Loading
**Symptoms:**
- `🎬 Creating WMS layer` logs appear
- `➕ Adding WMS layer to map` logs appear
- But NO `🔄 Tile load start:` logs

**Likely Cause:**
- Map bounds issue
- Layer not visible at current zoom
- Time parameter invalid

**Fix:** Check map zoom level (should be 5-10), verify TIME format

### Scenario 4: Tiles Loading But Not Visible
**Symptoms:**
- `✅ Tile loaded:` logs appear
- Network tab shows 200 responses
- But nothing visible on map

**Likely Cause:**
- Opacity too low
- Z-index wrong
- Base map obscuring radar
- Transparent tiles (no weather data)

**Fix:** 
- Check `mrmsOpacity` value (should be 0.85)
- Verify only current frame has high opacity
- Check if TIME is too old/future

### Scenario 5: NOAA Service Down
**Symptoms:**
- Network requests return 500/503 errors
- Or requests timeout

**Likely Cause:**
- NOAA nowcoast service temporarily unavailable
- Maintenance window

**Fix:**
- Test https://nowcoast.noaa.gov/ directly
- Check NOAA status page
- Wait and retry later

## Report Back Checklist

Please provide:

1. **Console Output:**
   - Screenshot or paste of all console logs starting with 📊, 🕐, 🔍, 🎯, 🗺️, 🔧, 🎬
   - Any ❌ error logs

2. **Network Tab:**
   - Are requests to `nowcoast.noaa.gov` showing up? (Yes/No)
   - If yes, what status codes? (200, 404, 403, 500, etc.)
   - Copy/paste ONE full WMS request URL
   - If requests are successful, does Preview tab show radar image?

3. **State Values:**
   - `activeLayers['precipitation_new']:` ?
   - `isUSLocation:` ?
   - `mrmsBufferedTimes.length:` ?
   - `mrmsOpacity:` ?
   - `frameIndex:` ?

4. **Visual Tests:**
   - Does reducing base map opacity reveal radar?
   - Are there any visible layer elements in DevTools?
   - What is the current map zoom level?

5. **Coordinates:**
   - What city are you testing? (e.g., "San Ramon, CA")
   - What are the actual lat/lon values being passed?
   - Confirm these are within US MRMS coverage

## Next Steps

Once you provide the diagnostic information above, we can pinpoint the exact failure point and implement a targeted fix. DO NOT change any code until we know exactly what's failing.

