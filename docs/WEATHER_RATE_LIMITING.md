# Weather API Rate Limiting - Manual Testing Notes

## Overview
Rate limiting is now implemented for all weather API endpoints under `app/api/weather/**`.

## Default Limits
- **Hourly**: 120 requests per hour per user/IP
- **Burst**: 30 requests per 5-minute window
- **Identifier**: Supabase user ID (authenticated) or `x-forwarded-for` IP

## Endpoints Protected
All endpoints in `app/api/weather/**` now have rate limiting:
- `/api/weather/current`
- `/api/weather/onecall`
- `/api/weather/forecast`
- `/api/weather/geocoding`
- `/api/weather/air-quality`
- `/api/weather/uv`
- `/api/weather/pollen`
- `/api/weather/precipitation`
- `/api/weather/precipitation-history`
- `/api/weather/onecall/minutely`

## Manual Test Procedure

### Test 1: Verify Rate Limit Headers
```bash
# Make a request and check response headers
curl -i "http://localhost:3000/api/weather/current?lat=40&lon=-74" 2>&1 | grep -i "x-ratelimit"

# Expected output:
# x-ratelimit-limit: 120
# x-ratelimit-remaining: 119
# x-ratelimit-reset: <timestamp>
# x-ratelimit-burst-limit: 30
# x-ratelimit-burst-remaining: 29
# x-ratelimit-burst-reset: <timestamp>
```

### Test 2: Verify Burst Limit (429 Response)
```bash
# Make 31 rapid requests to trigger burst limit
for i in {1..31}; do
  curl -s "http://localhost:3000/api/weather/current?lat=40&lon=-74" -o /dev/null -w "%{http_code}\n" 2>&1
done

# Request #31 should return 429 Too Many Requests
```

### Test 3: Verify IP-Based Rate Limiting
```bash
# Test with different IPs using x-forwarded-for header
curl -H "x-forwarded-for: 1.2.3.4" \
  "http://localhost:3000/api/weather/current?lat=40&lon=-74"

# Each unique IP should have its own rate limit counter
```

### Test 4: Verify Retry-After Header on 429
```bash
# Trigger rate limit then check headers
curl -i "http://localhost:3000/api/weather/current?lat=40&lon=-74" 2>&1 | grep -i "retry-after"

# When rate limited, should see:
# retry-after: <seconds until next request allowed>
```

### Test 5: Test Different Endpoints Share Same Limit
```bash
# Requests to different endpoints count against same limit
for i in {1..10}; do
  curl -s "http://localhost:3000/api/weather/current?lat=40&lon=-74" -o /dev/null -w "%{http_code}\n"
  curl -s "http://localhost:3000/api/weather/forecast?lat=40&lon=-74" -o /dev/null -w "%{http_code}\n"
done
```

### Test 6: Verify Environment Variable Configuration
```bash
# Set custom limits
export WEATHER_RATE_LIMIT_HOURLY=60
export WEATHER_RATE_LIMIT_BURST=15
npm run dev

# Now limits should be 60/hour and 15/burst
```

## Expected 429 Response
```json
{
  "error": "Too Many Requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Rate limit exceeded. Try again in 300 seconds.",
  "retryAfter": 300,
  "limit": 120,
  "remaining": 0,
  "burstLimit": 30,
  "burstRemaining": 0
}
```

## Troubleshooting

### Issue: Rate limits not being applied
- Verify the `lib/services/weather-rate-limiter.ts` file exists
- Check that routes are importing and calling `rateLimitRequest()`
- Ensure you're not bypassing rate limits with PLAYWRIGHT_TEST_MODE

### Issue: Wrong IP detected
- Verify your proxy/load balancer is setting `x-forwarded-for` header
- Check that `x-real-ip` is set if not using `x-forwarded-for`
- For local testing, IP will show as "anonymous" without headers

### Issue: Supabase user not being identified
- Ensure user is authenticated (has valid session cookie)
- Check that Supabase URL and anon key are configured
- Verify user ID appears in rate limit identifier as `user:<uuid>`

## Configuration
Edit `.env.local` to customize limits:
```bash
WEATHER_RATE_LIMIT_HOURLY=120              # Default: 120
WEATHER_RATE_LIMIT_BURST=30                # Default: 30
WEATHER_RATE_LIMIT_BURST_WINDOW_MS=300000  # Default: 300000 (5 min)
```

## Unit Tests
Run the rate limiter tests:
```bash
npm test -- __tests__/weather-rate-limiter.test.ts
```
