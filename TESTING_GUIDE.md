# Testing Guide - OpenWeather Radar Removal

This guide will help you verify that the OpenWeather radar has been completely removed and NOAA MRMS is working as the only radar source.

---

## Quick Start

```bash
# Start the development server
npm run dev

# Open in browser
# http://localhost:3000
```

---

## Test Scenarios

### ✅ Test 1: US Location (MRMS Enabled)

**Steps:**
1. Go to http://localhost:3000
2. In the search bar, enter: **"San Ramon, CA"**
3. Press Enter or click Search
4. Scroll down to the "Weather Radar" section

**Expected Results:**
- ✅ Map loads with high-resolution radar tiles
- ✅ Status badge shows: **"NOAA MRMS • HIGH-RES • LIVE"** (blue)
- ✅ Radar tiles are smooth and detailed (not blocky)
- ✅ Animation controls visible at bottom-left:
  - Play/Pause button
  - Now button
  - Speed selector (0.5×, 1×, 2×)
  - Scrubber slider
- ✅ Click **Play** → Radar animates smoothly
- ✅ Use scrubber → Frame changes smoothly
- ✅ No option to switch to OpenWeather

**Open Layers Menu:**
1. Click "Layers" button (top-right)
2. Verify:
   - ✅ "Precipitation (NOAA MRMS • US only)" option exists
   - ✅ NO "Precipitation Source" section
   - ✅ NO toggle between MRMS and OpenWeather
   - ✅ Other layers available: Clouds, Wind, Pressure, Temperature
   - ✅ Opacity slider works

---

### ✅ Test 2: International Location (No MRMS)

**Steps:**
1. Go to http://localhost:3000
2. In the search bar, enter: **"London, UK"**
3. Press Enter or click Search
4. Scroll down to the "Weather Radar" section

**Expected Results:**
- ✅ Map loads with base layer only
- ✅ Status badge shows: **"US LOCATIONS ONLY"** (gray)
- ✅ Overlay message appears:
  - Title: "High-Resolution Radar Unavailable"
  - Text: "Animated NOAA MRMS radar is only available for United States locations."
  - Subtext: "Current conditions and forecasts are available in the sections above."
- ✅ NO blocky OpenWeather tiles
- ✅ NO animation controls
- ✅ Location marker still visible

**Open Layers Menu:**
1. Click "Layers" button (top-right)
2. Verify:
   - ✅ "Precipitation (NOAA MRMS • US only)" option exists (can be toggled on/off)
   - ✅ When toggled on → shows message overlay
   - ✅ When toggled off → message disappears

---

### ✅ Test 3: Other US Locations

Try these additional US locations to verify consistency:

**Major Cities:**
- **New York, NY** → MRMS should work
- **Los Angeles, CA** → MRMS should work
- **Chicago, IL** → MRMS should work
- **Miami, FL** → MRMS should work
- **Seattle, WA** → MRMS should work

**Rural/Edge Cases:**
- **Anchorage, AK** → Check if Alaska is in MRMS coverage
- **Honolulu, HI** → Check if Hawaii is in MRMS coverage
- **Guam** → Should show international message

---

### ✅ Test 4: Animation Controls (US Only)

**Location:** San Ramon, CA

**Keyboard Controls:**
1. Click on the map to focus
2. Press **Space** → Should play/pause animation
3. Press **→** (Right Arrow) → Should advance one frame
4. Press **←** (Left Arrow) → Should go back one frame

**Mouse Controls:**
1. Click **Play** → Animation should start
2. Click **Pause** → Animation should stop
3. Click **Now** → Should jump to current time
4. Change **Speed** to 0.5× → Should slow down
5. Change **Speed** to 2× → Should speed up
6. Drag **scrubber** → Should change frames smoothly

---

### ✅ Test 5: API Route (Should Reject Precipitation)

**Direct API Test:**

Open in browser or use curl:

```bash
# Should return 410 Gone
curl -i http://localhost:3000/api/weather/radar/precipitation_new/10/163/395/598
```

**Expected Response:**
```json
{
  "error": "precipitation_new removed - use NOAA MRMS via WMS",
  "message": "OpenWeather radar replaced with NOAA MRMS for higher quality"
}
```

**Status Code:** 410 Gone

**Other layers should still work:**
```bash
# Should return PNG tile
curl -i http://localhost:3000/api/weather/radar/clouds_new/10/163/395/598
curl -i http://localhost:3000/api/weather/radar/wind_new/10/163/395/598
```

---

### ✅ Test 6: Other Weather Overlays

**Location:** San Ramon, CA

**Test Clouds Layer:**
1. Open Layers menu
2. Click on **"Clouds"**
3. Verify:
   - ✅ Cloud overlay appears on map
   - ✅ Uses OpenWeather tiles (should work)
   - ✅ Opacity slider controls cloud layer

**Test Wind Layer:**
1. Open Layers menu
2. Click on **"Wind"**
3. Verify:
   - ✅ Wind overlay appears on map
   - ✅ Uses OpenWeather tiles (should work)

**Test Pressure Layer:**
1. Open Layers menu
2. Click on **"Pressure"**
3. Verify:
   - ✅ Pressure overlay appears on map
   - ✅ Uses OpenWeather tiles (should work)

**Test Temperature Layer:**
1. Open Layers menu
2. Click on **"Temperature"**
3. Verify:
   - ✅ Temperature overlay appears on map
   - ✅ Uses OpenWeather tiles (should work)

---

## Browser Console

### Expected Console Output (US Location)

No errors or warnings. Should NOT see:
- ❌ "🌍 International location - using OpenWeatherMap"
- ❌ "🇺🇸 US location detected - enabling NOAA MRMS radar"

### Expected Console Output (International Location)

No errors or warnings.

---

## Visual Quality Check

### US Locations (MRMS)

**High-Quality Indicators:**
- ✅ Radar tiles are smooth and detailed
- ✅ Precipitation patterns are clear
- ✅ No blocky artifacts
- ✅ Color gradients are smooth
- ✅ Animation is fluid

### International Locations

**Expected Appearance:**
- ✅ Clean message overlay
- ✅ No radar tiles at all
- ✅ Base map visible underneath
- ✅ Location marker visible

---

## Common Issues & Solutions

### Issue: Map doesn't load
**Solution:** Check browser console for errors. Verify internet connection.

### Issue: MRMS tiles don't appear (US location)
**Solution:** 
1. Check if precipitation layer is enabled in Layers menu
2. Verify NOAA MRMS service is up: https://nowcoast.noaa.gov/
3. Check browser network tab for failed requests

### Issue: Animation controls don't work
**Solution:**
1. Verify you're on a US location
2. Verify precipitation layer is enabled
3. Check browser console for JavaScript errors

### Issue: Other layers (clouds, wind, etc.) don't work
**Solution:**
1. Verify OpenWeather API key is configured in `.env.local`
2. Check browser network tab for 401 or 429 errors

---

## Performance Check

### Load Time (US Location)
- Initial map load: < 2 seconds
- Radar tiles appear: < 3 seconds
- Animation smooth: 60fps

### Memory Usage
- Should stay stable during animation
- No memory leaks after 5 minutes of playback

### Network Requests
- MRMS tiles load from: `nowcoast.noaa.gov`
- Other layers load from: `/api/weather/radar/`
- NO requests to `/api/weather/radar/precipitation_new/`

---

## Regression Testing

### Things That Should Still Work

✅ **Basic Weather Search:**
- Search by city name works
- Current conditions display correctly
- Forecast displays correctly

✅ **Navigation:**
- All menu items work
- Page transitions work
- Back/forward navigation works

✅ **Responsive Design:**
- Mobile view works
- Tablet view works
- Desktop view works

✅ **Other Weather Layers:**
- Clouds layer works
- Wind layer works
- Pressure layer works
- Temperature layer works

---

## Success Criteria

All tests pass if:

✅ **US Locations:**
- NOAA MRMS radar loads automatically
- Animation controls work
- High-quality, smooth radar tiles
- No option to switch to OpenWeather

✅ **International Locations:**
- Clear message displayed
- No blocky tiles
- Professional appearance
- No errors

✅ **Code Quality:**
- No TypeScript errors
- No console errors
- No memory leaks
- Smooth performance

✅ **API Route:**
- Precipitation requests return 410
- Other layers still work
- Clear error messages

---

## Automated Testing (Optional)

If you have Playwright configured:

```bash
# Run E2E tests
npx playwright test

# Run specific test
npx playwright test --grep "radar"
```

If you have Jest configured:

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## Final Checklist

Before considering this complete:

- [ ] Test US location (e.g., San Ramon, CA)
- [ ] Test International location (e.g., London, UK)
- [ ] Test animation controls (Play, Pause, Speed, Scrubber)
- [ ] Test keyboard shortcuts (Space, Arrow keys)
- [ ] Test Layers menu (all options work)
- [ ] Test other weather overlays (Clouds, Wind, etc.)
- [ ] Check browser console (no errors)
- [ ] Check network tab (no failed MRMS requests)
- [ ] Verify API returns 410 for precipitation_new
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design (mobile, tablet, desktop)

---

## Report Issues

If you find any issues:

1. **Describe the issue:** What went wrong?
2. **Steps to reproduce:** How can it be replicated?
3. **Expected vs Actual:** What should happen vs what did happen?
4. **Browser/OS:** What environment?
5. **Console errors:** Any JavaScript errors?
6. **Network errors:** Any failed requests?

---

**Ready to test? Start with Test 1 (US Location)!** 🚀

