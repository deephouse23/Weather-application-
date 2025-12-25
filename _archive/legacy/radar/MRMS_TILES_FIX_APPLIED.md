# MRMS Tiles Fix Applied - WMS TIME Parameter Issue

## Problem Identified

The console logs revealed the exact issue:

### ❌ Symptoms:
- `🔄 Tile load start: no url` - WMS GetMap URLs were not being generated
- `TypeError: t.scaleBy is not a function` - Leaflet's tile URL generation was completely failing
- Hundreds of `❌ WMS tile error` messages
- Despite all conditions being met (isUSLocation: true, precipitation_new: true, mrmsBufferedTimes: 5)

### 🔍 Root Cause:
The `time` parameter was being passed to `L.tileLayer.wms()` with **lowercase** `time`, but WMS services require **uppercase** `TIME` as the parameter name. Additionally, Leaflet's WMS implementation wasn't properly handling the time parameter, causing the entire URL generation to fail.

```typescript
// ❌ BEFORE (BROKEN):
const wmsLayer = L.tileLayer.wms(url, {
  layers,
  format,
  transparent,
  opacity,
  time: time || undefined,  // ← Wrong! Should be uppercase TIME
  version: '1.3.0',
  // ...
})
```

The WMS standard (OGC WMS specification) uses **uppercase** parameter names:
- `LAYERS` (not `layers`)
- `FORMAT` (not `format`)
- `TIME` (not `time`)
- `VERSION` (not `version`)
- etc.

## ✅ Fix Applied

### Changes to `components/WMSTileLayer.tsx`:

**1. Fixed WMS Layer Creation (lines 61-86):**
```typescript
// ✅ AFTER (FIXED):
const wmsOptions: any = {
  layers,
  format,
  transparent,
  opacity,
  attribution,
  version: '1.3.0',
  crs: L.CRS.EPSG3857,
  updateWhenIdle: true,
  updateWhenZooming: false,
  keepBuffer: 2,
  maxNativeZoom: 10,
  maxZoom: 18,
  tileSize: 256,
  zIndex
}

// Add TIME parameter with uppercase key for WMS compatibility
if (time) {
  wmsOptions.TIME = typeof time === 'string' ? time : new Date(time).toISOString()
  console.log('  📅 TIME parameter set to:', wmsOptions.TIME)
}

const wmsLayer = L.tileLayer.wms(url, wmsOptions)
```

**2. Fixed Dynamic Time Updates (lines 137-147):**
```typescript
// ✅ AFTER (FIXED):
useEffect(() => {
  if (layerRef.current && time !== undefined) {
    const timeValue = typeof time === 'string' ? time : new Date(time).toISOString()
    console.log('⏰ Updating TIME parameter to:', timeValue)
    // Use uppercase TIME for WMS standard
    layerRef.current.setParams({ TIME: timeValue }, false)
    layerRef.current.redraw()
  }
}, [time])
```

### Key Changes:
1. **Uppercase TIME Parameter:** Changed `time:` to `TIME:` to match WMS standard
2. **Proper ISO String Conversion:** Ensure time is always converted to ISO string format
3. **Added Logging:** Log the TIME value being set for debugging
4. **Consistent Naming:** Use `TIME` (uppercase) in both layer creation and updates

## Expected Results

With this fix applied, you should now see:

### ✅ In Console:
```
📅 TIME parameter set to: 2025-10-11T19:00:00.000Z
🎬 Creating WMS layer with params: {...}
➕ Adding WMS layer to map
📍 WMS GetMap URL example: https://nowcoast.noaa.gov/arcgis/services/.../WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=1&FORMAT=image/png&TRANSPARENT=true&TIME=2025-10-11T19:00:00.000Z&...
🔄 Tile load start: https://nowcoast.noaa.gov/... (WITH ACTUAL URL!)
✅ Tile loaded: https://nowcoast.noaa.gov/...
✅ WMS tiles loaded successfully
```

### ✅ On the Map:
- NOAA MRMS radar tiles should render with blue/green precipitation patterns
- Storm structures should be clearly visible
- Animation controls should work to scrub through time
- No more "no url" errors
- No more `scaleBy is not a function` errors

## Testing

### To Test Locally (http://localhost:3000):
1. **Hard refresh** your browser (Ctrl+Shift+R)
2. **Search for "San Ramon, CA"** or another US city
3. **Scroll to Weather Radar section**
4. **Open DevTools Console** and look for:
   - `📅 TIME parameter set to:` logs (should show ISO timestamps)
   - `🔄 Tile load start:` with ACTUAL URLs (not "no url")
   - Reduced or NO `❌ WMS tile error` messages
5. **Visually verify** radar tiles are loading with precipitation data

### To Test on Vercel Preview:
- Wait for new Vercel preview build to complete (~2-3 minutes)
- Check PR for Vercel bot comment with preview URL
- Perform same tests as above

## Technical Background

### Why WMS Requires Uppercase Parameter Names:

The OGC Web Map Service (WMS) specification defines parameter names as **case-insensitive** in the URL query string, but many WMS servers and Leaflet's implementation expect them to be uppercase by convention.

From WMS 1.3.0 spec:
- Parameter names are typically uppercase (LAYERS, FORMAT, TIME, BBOX, etc.)
- Some servers are strict and only accept uppercase
- Leaflet's `setParams()` passes parameters directly to the WMS URL

### WMS GetMap Request Format:

A proper NOAA MRMS WMS GetMap request looks like:
```
https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer
  ?SERVICE=WMS
  &REQUEST=GetMap
  &VERSION=1.3.0
  &LAYERS=1
  &FORMAT=image/png
  &TRANSPARENT=true
  &TIME=2025-10-11T19:00:00.000Z  ← Uppercase TIME with ISO 8601 format
  &CRS=EPSG:3857
  &BBOX=-13695191.92,4492777.77,-13677632.35,4510337.35
  &WIDTH=256
  &HEIGHT=256
```

The TIME parameter follows ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

## Commit Details

**Commit:** `667135cf`  
**Branch:** `fix/auto-enable-mrms-radar`  
**Message:** "fix: correct WMS TIME parameter handling for NOAA MRMS tiles"

**Changes:**
- 1 file changed
- 16 insertions(+), 8 deletions(-)
- Fixed uppercase TIME parameter
- Added proper ISO string conversion
- Enhanced logging for debugging

## Next Steps

1. ✅ Changes pushed to GitHub (triggers Vercel preview)
2. ⏳ Wait for Vercel preview deployment (~2-3 min)
3. 🧪 Test on Vercel preview URL
4. ✅ If working, remove debug logging and merge PR
5. 🚀 Deploy to production

## Success Criteria

- [ ] Console shows `📅 TIME parameter set to:` with valid ISO timestamps
- [ ] Console shows `🔄 Tile load start:` with full WMS GetMap URLs (not "no url")
- [ ] No or minimal `❌ WMS tile error` messages
- [ ] Radar tiles visually render with precipitation data (blue/green patterns)
- [ ] Animation controls work smoothly
- [ ] Different timestamps show different radar images

## Debugging Still Available

All debugging logs remain in place, so you can still monitor:
- Active layer states (📊)
- MRMS buffered times generation (🕐)
- Render conditions (🔍, 🎯)
- WMSTileLayer instantiation (🔧)
- WMS layer creation (🎬)
- TIME parameter values (📅, ⏰)
- Tile loading events (🔄, ✅)
- Any errors (❌)

Once confirmed working, we can remove the debug logging in a cleanup commit.

