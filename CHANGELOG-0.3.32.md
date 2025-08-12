# Changelog v0.3.32

## Release Date: January 2025

## 🐛 Bug Fixes

### API Integration Fixes

#### Air Quality API
- **Fixed:** Google Air Quality API now correctly marks source as 'google' (not 'openweather')
- **Fixed:** Proper conversion from Universal AQI scale to EPA scale
- **Improved:** Enhanced error handling and fallback logic
- **Added:** Comprehensive debug logging for troubleshooting
- **Added:** Timeout handling for API requests (8 seconds)

#### News API
- **Fixed:** Rate limiting errors (429) by implementing server-side rate limiting
- **Added:** Per-client rate limiting (10 requests per minute)
- **Improved:** Cache duration increased from 5 to 15 minutes
- **Added:** Graceful degradation - always returns 200 status to prevent UI breaks
- **Added:** Automatic cleanup of old rate limit entries

### Air Quality Display (EPA Standards)
- **Fixed:** Updated color chart to correctly use EPA AQI standards (0-500, lower is better)
- **Fixed:** Color mapping now matches EPA standards:
  - 0-50: Green (Good)
  - 51-100: Yellow (Moderate)  
  - 101-150: Orange (Unhealthy for Sensitive Groups)
  - 151-200: Red (Unhealthy)
  - 201-300: Purple (Very Unhealthy)
  - 301-500: Dark Red/Maroon (Hazardous)
- **Fixed:** Corrected indicator positioning on visual bar for EPA scale segments
- **Updated:** Changed legend from "Google Universal AQI" to "EPA Air Quality Index"
- **Updated:** Health recommendations now follow EPA guidelines

## 🔒 Security
- All API keys remain server-side only
- No exposure of sensitive keys to client
- Proper environment variable usage

## 📊 Performance & Standards
- Reduced API calls through improved caching
- Better error handling prevents unnecessary retries
- Stale-while-revalidate caching strategy
- Now fully compliant with EPA Air Quality Index standards
- References: https://www.airnow.gov/aqi/aqi-basics/

## Developer Notes
- Google Air Quality API: https://developers.google.com/maps/documentation/air-quality
- OpenWeather Air Pollution API used as fallback
- NewsAPI rate limits handled gracefully
- EPA AQI uses 0-500 scale where lower values are better