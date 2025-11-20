# 16-Bit Weather Platform - Deployment Guide

**Version:** 0.6.0
**Last Updated:** January 2025

---

## Environment Configuration

### Required Environment Variables

```env
# OpenWeatherMap API (Required)
OPENWEATHER_API_KEY=your_api_key_here

# Supabase Authentication (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Development Environment
NODE_ENV=development
```

### Optional Environment Variables

```env
# Google APIs (Optional - Enhanced Data)
GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here
GOOGLE_AIR_QUALITY_API_KEY=your_google_air_quality_api_key_here

# Sentry Error Monitoring (Currently Disabled)
# SENTRY_DSN=your_sentry_dsn_here
# NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_auth_token_here
SENTRY_ORG=16bitweather
SENTRY_PROJECT=javascript-nextjs
```

---

## API Key Setup

### 1. OpenWeatherMap

**Required for:** Weather data (current, forecast, One Call)

**Setup:**
1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Free tier: 1,000 calls/day
3. Get API key from dashboard
4. Add to `.env.local` as `OPENWEATHER_API_KEY`

**Note:** One Call API 3.0 requires subscription (1,000 calls/day limit)

---

### 2. Supabase

**Required for:** User authentication and database

**Setup:**
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ SECURITY WARNING:**
- Service role key is for server-side only
- NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Never use `NEXT_PUBLIC_` prefix on service role key

**Database Setup:**
1. Run SQL migrations in `lib/supabase/`:
   - `schema.sql` - Main database schema
   - `user-preferences-schema.sql` - User preferences table
   - `fix-saved-locations-schema.sql` - Location table fixes
2. Enable Row-Level Security (RLS) on all user tables
3. Verify RLS policies are in place

---

### 3. Google APIs (Optional)

**Required for:** Enhanced pollen and air quality data

**Setup:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable APIs:
   - Pollen API
   - Air Quality API
4. Create API key with restrictions
5. Add to `.env.local`:
   - `GOOGLE_POLLEN_API_KEY`
   - `GOOGLE_AIR_QUALITY_API_KEY`

**Fallback:**
- Air Quality: Falls back to OpenWeatherMap AQI if Google API unavailable
- Pollen: Shows "Data unavailable" if API unavailable

---

## Local Development

### Initial Setup

1. **Clone Repository:**
   ```bash
   git clone <repository-url>
   cd Weather-application--main
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys

4. **Start Dev Server:**
   ```bash
   npm run dev
   ```

   App runs at http://localhost:3000

### Development Features

- **Fast Refresh** - Instant component updates
- **TypeScript Type Checking** - Real-time type errors
- **ESLint Warnings** - Code quality checks in console
- **Hot Module Replacement** - No page reload for most changes
- **API Routes** - Available at `/api/*`

### Common Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm start                # Start production server

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Jest watch mode
npm run test:ci          # CI mode
npx playwright test      # E2E tests
npx playwright test --ui # Interactive E2E mode

# Code Quality
npm run lint             # Run ESLint
npm run lint --fix       # Auto-fix issues
npx tsc --noEmit         # Type checking

# Maintenance
npm update               # Update dependencies
npm outdated             # Check for newer versions
```

### Clear Cache

**Next.js Cache:**
```bash
rm -rf .next
npm run dev
```

**Node Modules:**
```bash
rm -rf node_modules
npm install
```

---

## Production Build

### Building for Production

```bash
npm run build
```

**Build Process:**
1. TypeScript compilation
2. Next.js optimization
3. Static page generation for public pages
4. API route bundling
5. Sentry source map upload (if configured)

**Output:**
- `.next/` directory with optimized build
- Static assets in `.next/static/`
- Server-side code in `.next/server/`

### Running Production Build Locally

```bash
npm run build
npm start
```

**Differences from Development:**
- No hot reloading
- Production optimizations active
- Minified JavaScript/CSS
- No source maps (unless configured)
- Runs on http://localhost:3000

---

## Vercel Deployment (Recommended)

### Automatic Deployment

1. **Connect GitHub Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel auto-detects Next.js

2. **Configure Project:**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Node.js Version: **18.x** or **20.x**

3. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.local`
   - Separate variables for Preview vs Production (optional)

4. **Deploy:**
   - Push to `main` branch
   - Vercel automatically builds and deploys
   - Preview deployments for PRs

### Environment Variable Configuration

**Production:**
- All variables from "Required Environment Variables" section
- Use production API keys and URLs

**Preview:**
- Can use same variables as production
- Or use separate test/staging keys

**Development:**
- Local `.env.local` file (not committed to git)

### Domain Configuration

**Production Domain:**
- www.16bitweather.co
- Configure in Vercel Dashboard → Domains

**Preview Domains:**
- Auto-generated for each PR
- Format: `<branch-name>-<project>.vercel.app`

---

## Manual Deployment

### Using PM2 (Process Manager)

**Install PM2:**
```bash
npm install -g pm2
```

**Start Application:**
```bash
npm run build
pm2 start npm --name "16bit-weather" -- start
pm2 save
pm2 startup
```

**Manage Application:**
```bash
pm2 list                 # List running apps
pm2 logs 16bit-weather   # View logs
pm2 restart 16bit-weather # Restart app
pm2 stop 16bit-weather   # Stop app
pm2 delete 16bit-weather # Remove from PM2
```

### Using Docker

**Dockerfile example:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build and Run:**
```bash
docker build -t 16bit-weather .
docker run -p 3000:3000 --env-file .env.local 16bit-weather
```

---

## Post-Deployment Checks

### 1. Health Check

**Manual Testing:**
- Visit homepage → Should load weather search
- Test weather search → Should return results
- Test auto-location detection → Should detect location
- Test authentication flow → Login/signup should work

**Automated Testing:**
- Run E2E tests against production URL
- Check API endpoints are responding

### 2. API Endpoints

**Test Critical Endpoints:**
```bash
# Weather API
curl https://your-domain.com/api/weather/current?q=London

# User API (requires auth)
# Test via browser after logging in

# News API
curl https://your-domain.com/api/news/aggregate
```

### 3. Database

**Verify Supabase Connection:**
- Test user registration
- Create a saved location
- Update user preferences
- Check RLS policies are working

**Check Database Tables:**
- `users` (Supabase Auth)
- `user_profiles`
- `user_locations`
- `user_preferences`
- `games`
- `game_scores`
- `user_game_stats`

### 4. Performance

**Run Lighthouse Audit:**
```bash
npx lighthouse https://your-domain.com --view
```

**Target Metrics:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

**Core Web Vitals:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

### 5. Error Monitoring

**Sentry (if enabled):**
- Verify events are being received
- Test error boundaries
- Check API error handling

**Vercel Analytics:**
- Check traffic is being recorded
- Verify Core Web Vitals tracking

---

## Continuous Integration/Continuous Deployment (CI/CD)

### GitHub Actions

**Example workflow for testing:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API keys valid and working
- [ ] Performance metrics acceptable
- [ ] Security scan passed

---

## Monitoring & Maintenance

### Vercel Analytics

**Access:**
- Vercel Dashboard → Your Project → Analytics

**Metrics:**
- Page views and unique visitors
- Core Web Vitals
- Top pages
- Traffic sources

### Database Maintenance

**Supabase Dashboard:**
- Monitor database size
- Check query performance
- Review RLS policies
- Backup database regularly

### API Rate Limits

**Monitor Usage:**
- OpenWeatherMap: Check API call count
- Google APIs: Monitor quota usage
- Adjust caching if approaching limits

**Rate Limit Handling:**
- Client-side throttling active
- 10-minute weather data cache
- User search rate limiting (10/hour)

---

## Rollback Procedure

### Vercel Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "⋯" → "Promote to Production"

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

**⚠️ WARNING:** Force push only if you're sure no one else has pulled recent changes

---

## Troubleshooting Deployment

### Build Failures

**Common Issues:**
1. **TypeScript errors** → Run `npx tsc --noEmit` locally
2. **Missing dependencies** → Check `package.json`
3. **Environment variables** → Verify all required vars are set
4. **Out of memory** → Increase Node memory: `NODE_OPTIONS=--max_old_space_size=4096`

### Runtime Errors

**Check Logs:**
```bash
# Vercel
vercel logs <deployment-url>

# PM2
pm2 logs 16bit-weather
```

**Common Issues:**
1. **API errors** → Verify API keys are correct
2. **Database errors** → Check Supabase connection
3. **404 errors** → Verify routing configuration
4. **CORS errors** → Check API route configuration

### Performance Issues

**Debugging:**
1. Check Vercel Analytics for slow pages
2. Run Lighthouse audit
3. Check API response times
4. Monitor database query performance

**Solutions:**
- Enable CDN caching
- Optimize images
- Reduce bundle size
- Add database indexes

---

**For more details:**
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Testing Guide](../TESTING_GUIDE.md)
