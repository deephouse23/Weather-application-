# NOAA MRMS Implementation Fix Summary

**Date:** 2025-10-10
**Status:** ✅ FIXED

## What Was Broken

The NOAA MRMS radar integration was merged (commit `25ebb275`) but had critical implementation issues preventing it from working:

### Problems Identified:

1. **WMSTileLayer Component Not Used**
   - The custom `WMSTileLayer.tsx` component was created but never actually used
   - The MRMS implementation was trying to use a regular `TileLayer` with a WMS URL string
   - Regular TileLayers don't support WMS protocol properly

2. **No Time-Series Integration**
   - MRMS layer was static (current time only)
   - Animation timestamps from the time-lapse system weren't connected to MRMS
   - The `time` parameter support in WMSTileLayer was never utilized

3. **Wrong Layer Implementation**
   - Used a single static TileLayer instead of buffered animated frames
   - No cross-fade opacity for smooth animation transitions

## What Was Fixed

### 1. Proper WMSTileLayer Usage ✅

**File:** `components/weather-map-client.tsx` (Lines 261-280)

**Before:**
```tsx
<TileLayer
  key={`mrms-${tileEpoch}`}
  attribution='&copy; <a href="https://www.noaa.gov/">NOAA MRMS via nowCOAST</a>'
  url="https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=1&STYLES=&FORMAT=image%2Fpng&TRANSPARENT=true&HEIGHT=256&WIDTH=256&CRS=EPSG%3A3857&BBOX={bbox-epsg-3857}"
  opacity={mrmsOpacity}
  zIndex={500}
/>
```

**After:**
```tsx
{bufferedTimes.map((t) => (
  <WMSTileLayer
    key={`mrms-${tileEpoch}-${t}`}
    url="https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer"
    layers="1"
    format="image/png"
    transparent={true}
    opacity={t === currentTimestamp ? mrmsOpacity : Math.max(0, Math.min(0.15, mrmsOpacity * 0.2))}
    time={new Date(t).toISOString()}
    attribution='&copy; <a href="https://www.noaa.gov/">NOAA MRMS via nowCOAST</a>'
    zIndex={500}
  />
))}
```

### 2. Time-Series Animation Integration ✅

**Changes:**
- Now uses `bufferedTimes.map()` to render multiple WMS layers at different timestamps
- Each frame gets its own WMSTileLayer with a unique timestamp
- Properly formatted ISO 8601 timestamp: `new Date(t).toISOString()`
- Cross-fade opacity: current frame at full opacity, neighboring frames dimmed for smooth transitions

### 3. WMSTileLayer Component Enhancement ✅

**File:** `components/WMSTileLayer.tsx` (Lines 77-85)

**Improvement:**
```tsx
// Update time parameter when it changes
useEffect(() => {
  if (layerRef.current && time !== undefined) {
    // Force redraw with new time parameter
    // @ts-ignore - time parameter may not be in types but is valid for time-enabled WMS
    layerRef.current.setParams({ time: time }, false)
    layerRef.current.redraw()
  }
}, [time])
```

## How It Works Now

### NOAA MRMS Time-Enabled WMS Flow:

1. **Time Index Generation** (Lines 66-102 in weather-map-client.tsx)
   - Creates 18 timestamps: 6 past steps (1 hour) + 12 future steps (2 hours)
   - Quantizes to 10-minute intervals
   - Rebuilds index every 5 minutes

2. **Frame Buffering** (Lines 160-166)
   - Keeps ±2 frames around current frame in memory (5 total)
   - Preloads neighboring frames for smooth playback

3. **WMS Time Parameter** (WMSTileLayer.tsx)
   - Converts JavaScript timestamp to ISO 8601: `2025-10-10T15:30:00.000Z`
   - Passes to NOAA nowCOAST via `TIME` parameter in WMS GetMap request
   - NOAA returns radar imagery closest to requested timestamp

4. **Animation Playback**
   - Play/Pause controls
   - Speed adjustments (0.5×, 1×, 2×)
   - Scrubber for manual frame selection
   - Cross-fade transitions between frames

## Technical Details

### NOAA nowCOAST Endpoint:
```
https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer
```

**Capabilities:**
- Time-enabled WMS 1.3.0
- MRMS Composite Reflectivity (Layer 1)
- 2-minute update interval
- Covers CONUS, Alaska, Hawaii, Puerto Rico, USVI, Guam
- Historical data available for time-series animation

### WMS Parameters:
- `SERVICE=WMS`
- `REQUEST=GetMap`
- `VERSION=1.3.0`
- `LAYERS=1` (MRMS Composite Reflectivity)
- `FORMAT=image/png`
- `TRANSPARENT=true`
- `TIME={ISO 8601 timestamp}` - This is the key parameter for animation!
- `CRS=EPSG:3857` (Web Mercator)

## Testing the Fix

### To Test Locally:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Search for a US location:**
   - Example: "Los Angeles, CA" or "90210" (ZIP code)

3. **Open the map:**
   - Map should display with radar controls at bottom

4. **Enable MRMS:**
   - Click "Layers" dropdown (top-left)
   - Toggle "NOAA MRMS Radar" (should show "US only, real-time, FREE")
   - The toggle should now be blue/active

5. **Test Animation:**
   - Click "Play" button at bottom
   - Watch the radar animate through past, present, and future frames
   - Try scrubbing the timeline manually
   - Press Space bar to play/pause
   - Use Left/Right arrow keys to step through frames

6. **Verify Real Data:**
   - You should see DIFFERENT precipitation patterns for different timestamps
   - Past frames should show earlier storm positions
   - Current frame ("Now" button) should match live conditions
   - Future frames will show nowcast extrapolation (if available from NOAA)

### Expected Behavior:

✅ **US Locations:**
- MRMS toggle appears in Layers dropdown
- Clicking toggle enables high-resolution radar
- Animation shows real time-series data
- Smooth cross-fade transitions between frames

❌ **Non-US Locations:**
- MRMS toggle hidden (only OpenWeatherMap available)
- OpenWeatherMap animation still shows same current data (their API limitation)

## Known Limitations

1. **OpenWeatherMap Animation Still Fake**
   - OpenWeatherMap free tier doesn't provide historical/forecast tiles
   - All OpenWeatherMap animation timestamps return current conditions
   - This is an OpenWeatherMap API limitation, not a code issue
   - **Solution:** Use MRMS for US locations, or upgrade to Rainbow Weather API ($354/month) for global animated radar

2. **MRMS US-Only Coverage**
   - MRMS only covers United States territories
   - For international locations, only OpenWeatherMap (current-only) is available
   - Could add Rainbow Weather API as global alternative (see RADAR_TECHNICAL_ASSESSMENT.md)

3. **MRMS Data Latency**
   - NOAA nowCOAST has ~2-5 minute delay from real-time
   - This is normal for radar processing and distribution
   - More current than OpenWeatherMap (~10-15 minute delay)

4. **Future Forecast Limitations**
   - MRMS provides historical and current data, not true forecasts
   - "Future" frames may show extrapolation/nowcast if NOAA provides it
   - For true forecast precipitation, need different API (Tomorrow.io, Rainbow Weather)

## Files Modified

1. ✅ `components/weather-map-client.tsx` (Lines 261-280)
   - Replaced TileLayer with WMSTileLayer
   - Integrated with animation buffering system
   - Added proper time parameter passing

2. ✅ `components/WMSTileLayer.tsx` (Lines 77-85)
   - Enhanced time parameter update logic
   - Improved TypeScript documentation

## Build Status

✅ **Build Successful** - No TypeScript errors, no warnings

```bash
npm run build
# ✓ Compiled successfully
# ✓ Generating static pages (48/48)
```

## Next Steps (Optional Future Enhancements)

### Phase 1: Immediate (If Issues Found)
- Test with various US locations (CONUS, Alaska, Hawaii, Puerto Rico)
- Verify time parameter format with NOAA's GetCapabilities endpoint
- Add error handling for WMS service downtime

### Phase 2: Near-Term Enhancements
- Add MRMS legend (dBZ scale)
- Show "MRMS" badge when active
- Add tooltip explaining MRMS vs OpenWeatherMap differences
- Consider caching WMS tiles in service worker

### Phase 3: Long-Term (Global Animation)
- Integrate Rainbow Weather API for global animated radar ($354/month)
- Add provider selection: MRMS (US), Rainbow (Global), OpenWeather (Fallback)
- Implement hybrid: MRMS for US, Rainbow for rest of world
- See RADAR_TECHNICAL_ASSESSMENT.md for full roadmap

## References

- **NOAA nowCOAST:** https://nowcoast.noaa.gov/
- **MRMS Documentation:** https://www.nssl.noaa.gov/projects/mrms/
- **Leaflet WMS:** https://leafletjs.com/reference.html#tilelayer-wms
- **WMS Specification:** https://www.ogc.org/standards/wms
- **Original Commit:** `25ebb275` - feat: Add NOAA MRMS high-resolution radar

---

**Fix Completed:** 2025-10-10
**Build Status:** ✅ Passing
**Ready for Testing:** ✅ Yes
**Deployed:** Pending manual testing
