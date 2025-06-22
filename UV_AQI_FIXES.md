# UV Index and AQI Accuracy Fixes

## Overview
This feature branch addresses two critical data accuracy issues in the weather application:

1. **UV Index showing daily maximum instead of real-time**
2. **AQI data discrepancies with other services**

## Changes Made

### 1. UV Index Fixes

#### Problem
- App was showing UV Index 9 (daily maximum) instead of current real-time UV (~5 at 10 AM)
- Using deprecated `/uvi` endpoint which returns daily maximum UV values

#### Solution
- **Primary**: Switch to OpenWeather One Call API 3.0 for real-time hourly UV data
- **Fallback**: Enhanced daily UV endpoint with time-based estimation when One Call API fails
- **Smart Estimation**: Added `estimateCurrentUVFromDailyMax()` function that uses bell curve approximation based on time of day

#### Technical Details
```typescript
// New UV Index implementation
const fetchUVIndex = async (lat: number, lon: number, apiKey: string): Promise<number> => {
  // Use One Call API 3.0 for real-time UV data
  const oneCallUrl = `${BASE_URL_V3}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&appid=${apiKey}`;
  
  // Get current UV index from the current conditions
  const currentUV = data.current?.uvi || 0;
  
  // Fallback with time-based estimation
  const currentUV = estimateCurrentUVFromDailyMax(dailyMaxUV, hour);
}
```

#### Time-Based UV Estimation
- Peak UV around 1 PM (solar noon)
- Bell curve approximation using normal distribution
- Returns 0 for nighttime hours (before 6 AM, after 6 PM)

### 2. AQI Fixes

#### Problem
- App shows AQI 78, but Google and other services show mid-20s for San Ramon, CA
- Google Air Quality API returning different values than expected

#### Solution
- **Enhanced Debugging**: Added comprehensive logging for coordinates, timestamps, and API responses
- **Multiple Data Sources**: Google Air Quality API as primary, OpenWeather Air Pollution API as fallback
- **Proper Scale Conversion**: Convert OpenWeather AQI (1-5) to US EPA scale (0-500)
- **PM2.5/PM10 Calculations**: Use actual pollutant concentrations for more accurate AQI values

#### Technical Details
```typescript
// Enhanced AQI implementation with multiple sources
const fetchAirQualityData = async (lat: number, lon: number, cityName?: string) => {
  // Try Google Air Quality API first
  const googleResponse = await fetch(googleUrl, { method: 'POST', body: payload });
  
  // Fallback to OpenWeather Air Pollution API
  const openWeatherResponse = await fetch(airPollutionUrl);
  
  // Convert OpenWeather AQI (1-5) to EPA scale (0-500)
  const convertedAQI = convertOpenWeatherAQIToEPA(openWeatherAQI, components);
}
```

#### EPA Scale Conversion
- **PM2.5 Breakpoints**: 0-12.0 μg/m³ = AQI 0-50 (Good)
- **PM10 Breakpoints**: 0-54 μg/m³ = AQI 0-50 (Good)
- **Accurate Calculation**: Uses EPA's official breakpoint formula
- **Worst Case**: Returns higher of PM2.5 or PM10 AQI values

### 3. Enhanced Debugging

#### Console Logging Improvements
- **UV Index**: Real-time vs daily maximum detection
- **AQI**: Multiple API responses, coordinate validation, timestamp logging
- **API Keys**: Environment variable validation without exposing keys
- **Error Handling**: Detailed error messages for troubleshooting

#### Debug Information
```javascript
// UV Index debugging
console.log('=== UV INDEX REAL-TIME DEBUG ===');
console.log('Current UV Index from One Call API:', currentUV);
console.log('UV estimation: hour=10, dailyMax=9, multiplier=0.607, estimated=5.46');

// AQI debugging
console.log('=== AIR QUALITY COORDINATE DEBUG ===');
console.log('Coordinates passed to Air Quality API:', { latitude: lat, longitude: lon });
console.log('Timestamp:', new Date().toISOString());
console.log('Google AQI value extracted:', aqiValue);
console.log('PM2.5 AQI calculation:', { pm25: components.pm2_5, aqi: pm25AQI });
```

## API Key Security

### Environment Variables Only
- **No hardcoded keys** in any files
- **Vercel environment variables** for production deployment
- **Local .env.local** for development
- **Validation functions** check for proper key configuration

### Required Environment Variables
```bash
# OpenWeather API Key (Required)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Google Pollen/Air Quality API Key (Required for real pollen/AQI data)
NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here
```

## Testing

### UV Index Testing
1. **Daytime**: Should show current UV (e.g., 5 at 10 AM, not 9)
2. **Nighttime**: Should show 0
3. **Fallback**: Should estimate current UV from daily maximum when One Call API fails

### AQI Testing
1. **Google API**: Primary source with detailed logging
2. **OpenWeather Fallback**: Proper EPA scale conversion
3. **Coordinate Validation**: Ensure correct location data
4. **Multiple Sources**: Compare values from different APIs

## Deployment

### Preview Branch
- **Branch**: `feature/fix-uv-aqi-accuracy`
- **Deployment**: Vercel preview (NOT production)
- **Testing**: Verify fixes before merging to main

### Production Deployment
- **After testing**: Merge to main branch
- **Environment variables**: Ensure all API keys are set in Vercel
- **Monitoring**: Check console logs for any remaining issues

## Expected Results

### UV Index
- **Before**: Shows daily maximum (e.g., 9) regardless of time
- **After**: Shows real-time UV (e.g., 5 at 10 AM, 0 at night)

### AQI
- **Before**: Shows 78 (potentially incorrect scale)
- **After**: Shows accurate EPA scale values with proper debugging
- **Fallback**: OpenWeather data converted to EPA scale if Google API fails

## Files Modified

- `lib/weather-api.ts`: Main implementation changes
- `UV_AQI_FIXES.md`: This documentation file

## Next Steps

1. **Test on preview deployment**
2. **Verify UV Index shows real-time values**
3. **Confirm AQI values match other services**
4. **Check console logs for debugging information**
5. **Merge to main after successful testing** 