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

## 🔒 Security
- All API keys remain server-side only
- No exposure of sensitive keys to client
- Proper environment variable usage

## 📊 Performance
- Reduced API calls through improved caching
- Better error handling prevents unnecessary retries
- Stale-while-revalidate caching strategy

## Developer Notes
- Google Air Quality API: https://developers.google.com/maps/documentation/air-quality
- OpenWeather Air Pollution API used as fallback
- NewsAPI rate limits handled gracefully