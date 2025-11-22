# Debugging Added for MRMS Tiles Not Rendering Issue

## Summary
Comprehensive debugging has been added to diagnose why NOAA MRMS radar tiles are not rendering on the map, even though coordinates are being passed correctly and `isUSLocation` is true.

## Files Modified

### 1. components/WMSTileLayer.tsx
Added extensive debugging to track the WMS layer lifecycle:

**Component Render Logging:**
- Logs all props received by WMSTileLayer
- Shows URL, layers, format, transparency, opacity, time, zIndex
- Confirms map instance availability

**Layer Creation Logging:**
- Logs when WMS layer is being created
- Shows all parameters being passed to L.tileLayer.wms()

**Event Listeners Added:**
- `loading` - Fires when tiles start loading
- `load` - Fires when all tiles finish loading
- `tileerror` - Fires if any tile fails to load (with error details)
- `tileloadstart` - Fires for each individual tile that starts loading (with URL)
- `tileload` - Fires for each individual tile that successfully loads (with URL)

**URL Generation:**
- Logs an example WMS GetMap URL
- Shows the actual request format being sent to NOAA

**Cleanup Logging:**
- Logs when layers are removed from map

### 2. components/weather-map-client.tsx
Added debugging to track state, conditions, and rendering flow:

**Active Layers State (Component Top):**
- Logs the entire `activeLayers` state object
- Shows status of precipitation_new, clouds_new, wind_new

**MRMS Buffered Times Generation:**
- Logs when mrmsBufferedTimes is being calculated
- Shows if location is US or not
- Displays number of timestamps generated
- Shows first and last timestamp in ISO format
- Shows number of buffered frames and their index range

**Pre-Render Condition Check:**
- Logs all three conditions needed for MRMS to render:
  - `activeLayers['precipitation_new']` (should be true)
  - `isUSLocation` (should be true)
  - `mrmsBufferedTimes.length` (should be > 0)
- Shows calculated `willRender` boolean

**MRMS Rendering Conditions (Inside Render Block):**
- Only appears if render condition is true
- Logs all state values at render time
- Shows the actual mrmsBufferedTimes array
- Shows current frameIndex
- Shows current timestamp being displayed
- Shows mrmsOpacity value

**Per-Layer Rendering:**
- Logs for each WMSTileLayer being rendered
- Shows the time parameter, opacity, and whether it's the current frame
- Shows the React key being used

## Expected Console Output Flow

When everything is working correctly, you should see this sequence:

```
1. 📊 Active Layers State: {precipitation_new: true, ...}
2. 🕐 Building mrmsBufferedTimes: {isUSLocation: true, ...}
3.   ✅ Generated 25 timestamps
4.   📦 Buffered 5 times (indices 4-8)
5. 🔍 MRMS Render Check: {willRender: true}
6. 🎯 MRMS RENDERING CONDITIONS:
7.   🗺️ Rendering WMSTileLayer 0: {...}
8.   🗺️ Rendering WMSTileLayer 1: {...}
9.   ... (more layers)
10. 🔧 WMSTileLayer render: {...} (×5)
11. 🎬 Creating WMS layer with params: {...} (×5)
12. 📍 WMS GetMap URL example: https://... (×5)
13. ➕ Adding WMS layer to map (×5)
14. 🔄 Tile load start: https://... (many)
15. ⏳ WMS tiles loading... (×5)
16. ✅ Tile loaded: https://... (many)
17. ✅ WMS tiles loaded successfully (×5)
```

## Diagnostic Points

The logs will reveal exactly where the failure occurs:

### If logs stop at step 2-4:
**Problem:** `mrmsBufferedTimes` is not being generated
**Likely Cause:** `isUSLocation` is false or `frameIndex` is invalid

### If logs stop at step 5:
**Problem:** Render condition check fails
**Likely Cause:** One of the three conditions is false

### If logs stop at step 6-9:
**Problem:** React not rendering WMSTileLayer components
**Likely Cause:** LayersControl issue or React rendering problem

### If logs stop at step 10-12:
**Problem:** WMSTileLayer component instantiates but useEffect doesn't run
**Likely Cause:** No map instance available

### If logs stop at step 13:
**Problem:** Layers created but not added to map
**Likely Cause:** Map instance issue or Leaflet error

### If logs stop at step 14:
**Problem:** Layers added but no tiles requested
**Likely Cause:** Map bounds, zoom, or TIME parameter issue

### If you see tileerror (❌):
**Problem:** NOAA service returning errors
**Likely Cause:** Service down, wrong URL, invalid TIME, or CORS issue

### If tiles load (step 16-17) but nothing visible:
**Problem:** Tiles loading successfully but not visible
**Likely Cause:** Opacity too low, z-index wrong, base map obscuring, or transparent tiles (no weather data)

## How to Use This Debugging

1. **Run the dev server:** `npm run dev`
2. **Open browser to:** http://localhost:3000
3. **Search for a US city:** e.g., "San Ramon, CA"
4. **Open browser DevTools:** Press F12
5. **Go to Console tab**
6. **Scroll down to radar section on page**
7. **Copy ALL console output** starting with 📊
8. **Also open Network tab:**
   - Filter by "nowcoast"
   - See if any requests appear
   - Check status codes
   - Copy one full request URL

## Key Questions This Will Answer

1. ✅ **Is the precipitation layer active?**
   - Look for: `precipitation_new: true`

2. ✅ **Is the location recognized as US?**
   - Look for: `isUSLocation: true`

3. ✅ **Are timestamps being generated?**
   - Look for: `Generated 25 timestamps`

4. ✅ **Is the render condition being met?**
   - Look for: `willRender: true`

5. ✅ **Are WMSTileLayer components rendering?**
   - Look for: `🔧 WMSTileLayer render:` (should appear 5 times)

6. ✅ **Are Leaflet WMS layers being created?**
   - Look for: `🎬 Creating WMS layer with params:`

7. ✅ **What is the WMS request URL format?**
   - Look for: `📍 WMS GetMap URL example:`

8. ✅ **Are tiles being requested from NOAA?**
   - Look for: `🔄 Tile load start:` (many times)

9. ✅ **Are tiles loading successfully?**
   - Look for: `✅ Tile loaded:` (many times)

10. ✅ **Are there any tile errors?**
    - Look for: `❌ WMS tile error:`

## Build Status

✅ **TypeScript Compilation:** Success
✅ **ESLint:** No errors  
✅ **Production Build:** Success
✅ **All routes compiled correctly**

The debugging code is production-safe (just console.logs) and can be removed once the issue is identified and fixed.

## Next Steps

1. Load the application in your browser
2. Search for "San Ramon, CA" or another US city
3. Open browser console (F12)
4. Scroll to the radar section
5. Copy all console output
6. Open Network tab and check for nowcoast.noaa.gov requests
7. Report back with:
   - Full console output
   - Network tab status (requests present? status codes?)
   - One example WMS request URL
   - Any visible errors or warnings

Once we see the console output and network activity, we'll know exactly where the rendering pipeline is breaking and can implement a targeted fix.

