# Required GitHub Secrets for CI/CD

This project requires the following secrets to be configured in your GitHub repository settings for the Playwright tests and deployment to work correctly:

## Required Secrets

### Vercel Deployment
- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_PROJECT_ID` - The Vercel project ID
- `VERCEL_ORG_ID` - Your Vercel organization/team ID

### Supabase Authentication
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations)

### Weather API
- `OPENWEATHER_API_KEY` - Your OpenWeatherMap API key (required for weather data)
- `GOOGLE_POLLEN_API_KEY` - Google Pollen API key (optional, for enhanced pollen data)
- `GOOGLE_AIR_QUALITY_API_KEY` - Google Air Quality API key (optional, for enhanced air quality data)

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name listed above

## Important Notes

- The `OPENWEATHER_API_KEY` is **required** for the application to function properly
- Without this key, all weather API endpoints will return error responses
- Make sure to use the same API keys in your GitHub secrets as in your local `.env.local` file
- The Playwright tests will fail if the weather API endpoints cannot return valid data