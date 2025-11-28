# 16-Bit Weather Platform - API Reference

**Version:** 0.6.0
**Last Updated:** January 2025

---

## Overview

All API routes are internal Next.js routes that proxy external APIs to keep API keys secure (server-side only). API keys are NEVER exposed to the client.

---

## Weather APIs

### `/api/weather/current`

**Method:** GET

**Description:** Get current weather data for a location

**Query Parameters:**
- `q` (string, optional) - City name (e.g., "London", "San Francisco, CA")
- `lat` (number, optional) - Latitude
- `lon` (number, optional) - Longitude

**Note:** Either `q` OR (`lat` + `lon`) is required

**Response:**
```json
{
  "temperature": 72,
  "feelsLike": 70,
  "condition": "Clear",
  "description": "clear sky",
  "icon": "01d",
  "humidity": 45,
  "pressure": 1013,
  "windSpeed": 8,
  "windDirection": 180,
  "visibility": 10000,
  "sunrise": 1609459200,
  "sunset": 1609502400
}
```

**Data Source:** OpenWeatherMap Current Weather API

---

### `/api/weather/forecast`

**Method:** GET

**Description:** Get 5-day weather forecast

**Query Parameters:**
- `lat` (number, required) - Latitude
- `lon` (number, required) - Longitude

**Response:**
```json
{
  "forecast": [
    {
      "date": "2025-01-16",
      "tempHigh": 75,
      "tempLow": 58,
      "condition": "Partly Cloudy",
      "precipitation": 20,
      "icon": "02d"
    }
  ]
}
```

**Data Source:** OpenWeatherMap 5-Day Forecast API

---

### `/api/weather/onecall`

**Method:** GET

**Description:** Comprehensive weather data including current, hourly, daily, and alerts

**Query Parameters:**
- `lat` (number, required) - Latitude
- `lon` (number, required) - Longitude
- `units` (string, optional) - "imperial" or "metric" (default: "imperial")

**Response:**
```json
{
  "current": { /* current weather */ },
  "hourly": [ /* 48-hour forecast */ ],
  "daily": [ /* 8-day forecast */ ],
  "alerts": [ /* weather alerts */ ],
  "timezone": "America/Los_Angeles"
}
```

**Data Source:** OpenWeatherMap One Call API 3.0

---

### `/api/weather/uv`

**Method:** GET

**Description:** Get UV index data

**Query Parameters:**
- `lat` (number, required) - Latitude
- `lon` (number, required) - Longitude

**Response:**
```json
{
  "value": 6.5,
  "level": "High",
  "recommendation": "Seek shade, wear sunscreen SPF 30+"
}
```

**Data Source:** OpenWeatherMap UV Index API

---

### `/api/weather/air-quality`

**Method:** GET

**Description:** Get air quality index (AQI) data

**Query Parameters:**
- `lat` (number, required) - Latitude
- `lon` (number, required) - Longitude

**Response:**
```json
{
  "aqi": 42,
  "level": "Good",
  "pollutants": {
    "pm2_5": 12.5,
    "pm10": 24.3,
    "o3": 45.2,
    "no2": 18.7,
    "so2": 5.3,
    "co": 0.4
  },
  "healthRecommendation": "Air quality is satisfactory"
}
```

**Data Sources:**
- Primary: Google Air Quality API
- Fallback: OpenWeatherMap Air Pollution API

---

### `/api/weather/pollen`

**Method:** GET

**Description:** Get pollen count data

**Query Parameters:**
- `lat` (number, required) - Latitude
- `lon` (number, required) - Longitude

**Response:**
```json
{
  "tree": "Low",
  "grass": "Moderate",
  "weed": "Low",
  "overall": "Moderate"
}
```

**Data Source:** Google Pollen API (optional)

---

### `/api/weather/geocoding`

**Method:** GET

**Description:** Convert city name to coordinates

**Query Parameters:**
- `q` (string, required) - Location query (e.g., "London", "Paris, France")
- `limit` (number, optional) - Max results (default: 5)

**Response:**
```json
[
  {
    "name": "London",
    "lat": 51.5074,
    "lon": -0.1278,
    "country": "GB",
    "state": "England"
  }
]
```

**Data Source:** OpenWeatherMap Geocoding API

---

### `/api/weather/noaa-wms`

**Method:** GET

**Description:** NOAA WMS proxy for radar tiles

**Query Parameters:**
- Various WMS parameters (LAYERS, BBOX, WIDTH, HEIGHT, etc.)

**Response:** Radar tile images (PNG)

**Data Source:** NOAA nowCOAST WMS service

---

### `/api/weather/iowa-nexrad`

**Method:** GET

**Description:** Iowa State NEXRAD radar metadata

**Response:**
```json
{
  "products": ["base_reflectivity"],
  "timestamps": ["2025-01-16T12:00:00Z", "2025-01-16T12:05:00Z"]
}
```

**Data Source:** Iowa State University NEXRAD archive

---

### `/api/weather/iowa-nexrad-tiles/[timestamp]/[z]/[x]/[y]`

**Method:** GET

**Description:** NEXRAD radar tiles for specific timestamp

**Path Parameters:**
- `timestamp` (string) - ISO 8601 timestamp
- `z` (number) - Zoom level
- `x` (number) - Tile X coordinate
- `y` (number) - Tile Y coordinate

**Response:** Radar tile image (PNG)

**Data Source:** Iowa State University NEXRAD tile service

---

## User APIs

### `/api/locations`

#### GET - Get saved locations

**Authentication:** Required (Supabase session)

**Response:**
```json
[
  {
    "id": "uuid",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "isDefault": true
  }
]
```

#### POST - Save a new location

**Authentication:** Required

**Request Body:**
```json
{
  "city": "San Francisco",
  "state": "CA",
  "country": "US",
  "lat": 37.7749,
  "lon": -122.4194
}
```

**Response:**
```json
{
  "id": "uuid",
  "city": "San Francisco",
  "state": "CA",
  "country": "US",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "isDefault": false
}
```

#### DELETE - Remove a saved location

**Authentication:** Required

**Query Parameters:**
- `id` (string, required) - Location UUID

**Response:**
```json
{
  "success": true,
  "message": "Location deleted"
}
```

---

### `/api/user/preferences`

#### GET - Get user preferences

**Authentication:** Required

**Response:**
```json
{
  "theme": "dark",
  "units": "imperial",
  "defaultLocationId": "uuid"
}
```

#### POST - Update user preferences

**Authentication:** Required

**Request Body:**
```json
{
  "theme": "miami",
  "units": "metric",
  "defaultLocationId": "uuid"
}
```

**Response:**
```json
{
  "theme": "miami",
  "units": "metric",
  "defaultLocationId": "uuid"
}
```

---

## Utility APIs

### `/api/geocode`

**Method:** GET

**Description:** Reverse geocode coordinates to city name

**Query Parameters:**
- `lat` (number, required) - Latitude
- `lon` (number, required) - Longitude

**Response:**
```json
{
  "city": "San Francisco",
  "state": "CA",
  "country": "United States"
}
```

**Data Source:** OpenWeatherMap Reverse Geocoding

---

### `/api/extremes`

**Method:** GET

**Description:** Get global temperature extremes (hottest/coldest places)

**Response:**
```json
{
  "hottest": [
    {
      "city": "Death Valley",
      "country": "US",
      "temperature": 134,
      "date": "2025-01-16"
    }
  ],
  "coldest": [
    {
      "city": "Oymyakon",
      "country": "Russia",
      "temperature": -67,
      "date": "2025-01-16"
    }
  ]
}
```

**Data Source:** Aggregated weather data

---

## News APIs

### `/api/news/aggregate`

**Method:** GET

**Description:** Multi-source aggregated weather news

**Query Parameters:**
- `priority` (string, optional) - Filter by priority: "high", "medium", "low"
- `category` (string, optional) - Filter by category: "breaking", "severe", "tropical", etc.
- `limit` (number, optional) - Max results (default: 20)

**Response:**
```json
[
  {
    "id": "unique-id",
    "title": "Winter Storm Warning",
    "description": "Heavy snow expected...",
    "source": "FOX Weather",
    "priority": "high",
    "category": "severe",
    "publishedAt": "2025-01-16T12:00:00Z",
    "url": "https://...",
    "imageUrl": "https://..."
  }
]
```

**Data Sources:** FOX Weather, NASA, Reddit, GFS Models, NHC

**Caching:** 5-minute response cache

---

### `/api/news/fox`

**Method:** GET

**Description:** FOX Weather RSS feed

**Response:**
```json
[
  {
    "title": "Winter Storm Warning",
    "description": "Heavy snow expected...",
    "url": "https://...",
    "publishedAt": "2025-01-16T12:00:00Z",
    "imageUrl": "https://..."
  }
]
```

**Data Source:** FOX Weather RSS

---

### `/api/news/nasa`

**Method:** GET

**Description:** NASA Earth Observatory feed

**Response:**
```json
[
  {
    "title": "Satellite View of Hurricane",
    "description": "NASA satellite captures...",
    "url": "https://...",
    "publishedAt": "2025-01-16T12:00:00Z",
    "imageUrl": "https://..."
  }
]
```

**Data Source:** NASA Earth Observatory

---

### `/api/news/reddit`

**Method:** GET

**Description:** Reddit weather community posts

**Response:**
```json
[
  {
    "title": "Amazing cloud formation",
    "description": "Check out this...",
    "url": "https://reddit.com/...",
    "author": "username",
    "score": 1234,
    "comments": 56,
    "publishedAt": "2025-01-16T12:00:00Z"
  }
]
```

**Data Source:** r/weather, r/tropicalweather

---

### `/api/gfs-image`

**Method:** GET

**Description:** Proxy for GFS model images

**Query Parameters:**
- `region` (string, required) - Region code (e.g., "conus", "namer")
- `run` (string, required) - Model run (e.g., "00", "06", "12", "18")
- `forecast` (string, required) - Forecast hour (e.g., "000", "006", "012")

**Response:** GFS model graphic image (PNG)

**Data Source:** NOAA NCEP server

**Note:** See [GFS_MODEL_INTEGRATION.md](./GFS_MODEL_INTEGRATION.md) for details

---

## Games APIs

### `/api/games`

**Method:** GET

**Description:** List all games with metadata

**Response:**
```json
[
  {
    "id": "uuid",
    "slug": "weather-runner",
    "title": "Weather Runner",
    "description": "Run through weather hazards",
    "category": "Action",
    "difficulty": "Medium",
    "playCount": 1234,
    "highScore": 9876
  }
]
```

---

### `/api/games/[slug]/play`

**Method:** POST

**Description:** Increment play counter for a game

**Path Parameters:**
- `slug` (string) - Game identifier

**Response:**
```json
{
  "playCount": 1235
}
```

---

### `/api/games/[slug]/scores`

#### GET - Get leaderboard

**Path Parameters:**
- `slug` (string) - Game identifier

**Response:**
```json
[
  {
    "id": "uuid",
    "playerName": "Player1",
    "score": 9876,
    "createdAt": "2025-01-16T12:00:00Z"
  }
]
```

#### POST - Submit a score

**Path Parameters:**
- `slug` (string) - Game identifier

**Request Body:**
```json
{
  "score": 9876,
  "playerName": "Player1"
}
```

**Response:**
```json
{
  "id": "uuid",
  "playerName": "Player1",
  "score": 9876,
  "rank": 3,
  "createdAt": "2025-01-16T12:00:00Z"
}
```

---

## Rate Limits

### OpenWeatherMap Free Tier
- **Current Weather API**: 60 calls/minute, 1,000,000 calls/month
- **5-Day Forecast API**: 60 calls/minute, 1,000,000 calls/month
- **One Call API 3.0**: 1,000 calls/day (requires subscription)
- **Geocoding API**: 60 calls/minute

### Rate Limit Handling
- Client-side throttling (max 1 request per second per endpoint)
- Response caching (10 minutes for weather data)
- User search rate limiting (10 searches per hour)
- Automatic retry with exponential backoff

### Google APIs (Optional)
- **Pollen API**: Free tier limits vary
- **Air Quality API**: Free tier limits vary

**Fallbacks:**
- Air Quality: Falls back to OpenWeatherMap AQI if Google API fails
- Pollen: Shows "Data unavailable" if API fails

### Iowa State NEXRAD
- No official rate limit
- Tile-based caching reduces server load
- Pre-load only 3 frames ahead

---

## Error Responses

All API routes return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

**Common Error Codes:**
- `MISSING_PARAMETER` - Required parameter not provided
- `INVALID_PARAMETER` - Parameter value is invalid
- `AUTHENTICATION_REQUIRED` - User must be logged in
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `EXTERNAL_API_ERROR` - Upstream API failure
- `INTERNAL_ERROR` - Server error

---

**For more details:**
- [Architecture Documentation](./ARCHITECTURE.md)
- [Features Documentation](./FEATURES.md)
- [GFS Model Integration](./GFS_MODEL_INTEGRATION.md)
- [Games Setup Guide](../GAMES_SETUP.md)
