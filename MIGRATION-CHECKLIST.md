# 🚀 Next.js to Vite + React Migration Checklist

## Phase 1: Project Setup (1-2 hours)

### ✅ Configuration Files
- [ ] Replace `package.json` with `package-vite.json` (created)
- [ ] Replace `tsconfig.json` with `tsconfig-vite.json` (created)  
- [ ] Add `tsconfig.node.json` for server config (created)
- [ ] Replace `next.config.mjs` with `vite.config.ts` (created)
- [ ] Create `index.html` root file (created)
- [ ] Create `src/main.tsx` entry point (created)

### ✅ New Dependencies Installation
```bash
# Remove Next.js dependencies
npm uninstall next @next/font eslint-config-next

# Install Vite + React Router dependencies  
npm install vite @vitejs/plugin-react react-router-dom react-helmet-async
npm install express cors helmet compression dotenv
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh nodemon
```

## Phase 2: File Structure Migration (2-3 hours)

### 📁 Directory Restructuring
- [ ] Create `src/` directory as new source root
- [ ] Move `components/` → `src/components/`
- [ ] Move `lib/` → `src/lib/` 
- [ ] Convert `app/globals.css` → `src/index.css`
- [ ] Create `src/pages/` directory for page components
- [ ] Create `server/` directory for API server

### 🔄 App Router → React Router Conversion

#### Root Layout Conversion
- [ ] Convert `app/layout.tsx` → Remove (metadata moves to individual pages)
- [ ] Convert `app/providers/ThemeProvider.tsx` → `src/providers/ThemeProvider.tsx`

#### Page Conversions
- [ ] `app/page.tsx` → `src/pages/HomePage.tsx` (template created)
- [ ] `app/about/page.tsx` → `src/pages/AboutPage.tsx`
- [ ] `app/cloud-types/page.tsx` → `src/pages/CloudTypesPage.tsx`
- [ ] `app/extremes/page.tsx` → `src/pages/ExtremesPage.tsx`
- [ ] `app/fun-facts/page.tsx` → `src/pages/FunFactsPage.tsx`
- [ ] `app/games/page.tsx` → `src/pages/GamesPage.tsx`
- [ ] `app/news/page.tsx` → `src/pages/NewsPage.tsx`
- [ ] `app/weather-systems/page.tsx` → `src/pages/WeatherSystemsPage.tsx`
- [ ] `app/weather/[city]/page.tsx` → `src/pages/CityWeatherPage.tsx`
- [ ] `app/not-found.tsx` → `src/pages/NotFoundPage.tsx`

#### Error Boundary Conversion
- [ ] `app/error.tsx` → Integrate into React error boundaries
- [ ] `app/global-error.tsx` → Root level error boundary

## Phase 3: API Routes Migration (3-4 hours)

### 🌐 Next.js API → Express.js Server
**Convert these 8 API routes to Express endpoints:**

- [ ] `app/api/weather/current/route.ts` → `server/routes/weather.js`
- [ ] `app/api/weather/forecast/route.ts` → `server/routes/weather.js`
- [ ] `app/api/weather/geocoding/route.ts` → `server/routes/weather.js`
- [ ] `app/api/weather/air-quality/route.ts` → `server/routes/weather.js`
- [ ] `app/api/weather/pollen/route.ts` → `server/routes/weather.js`
- [ ] `app/api/weather/uv/route.ts` → `server/routes/weather.js`
- [ ] `app/api/extremes/route.ts` → `server/routes/extremes.js`
- [ ] `app/api/news/route.ts` → `server/routes/news.js`

### 🔧 API Conversion Steps
For each API route:
1. Remove `NextRequest, NextResponse` imports
2. Convert `export async function GET(request: NextRequest)` → `app.get('/api/endpoint', async (req, res))`
3. Replace `NextResponse.json()` → `res.json()`
4. Update error handling to use Express patterns
5. Test each endpoint with Postman/curl

## Phase 4: Import Conversions (2-3 hours)

### 🔗 Navigation & Routing
**Files requiring `useRouter` → `useNavigate` conversion:**
- [ ] `app/weather/[city]/client.tsx`
- [ ] `components/city-autocomplete.tsx`

**Files requiring `usePathname` → `useLocation` conversion:**
- [ ] `components/location-context.tsx`
- [ ] `components/navigation.tsx`

**Files requiring `Link` component conversion:**
- [ ] `components/navigation.tsx` (template created)
- [ ] `components/random-city-links.tsx`

### 🖼️ Image & Font Conversions
**Files requiring `next/image` → standard `<img>` conversion:**
- [ ] `components/optimized-image.tsx`

**Files requiring `next/font` → manual font loading:**
- [ ] Remove `Inter` import from layout
- [ ] Add Google Fonts to `index.html` (already done)

### 🎯 Dynamic Import Conversions
**Files using `next/dynamic` → `React.lazy` conversion:**
- [ ] `app/page.tsx` - Convert dynamic imports
- [ ] Any other files using dynamic imports

### 📊 Metadata Conversions
**Files with `export const metadata` → React Helmet:**
- [ ] Convert root layout metadata to Helmet in App.tsx
- [ ] Convert page-specific metadata to individual Helmet tags

## Phase 5: Component Updates (2-3 hours)

### 🧩 Remove Next.js Directives
**Remove "use client" from all files:**
- [ ] `app/page.tsx`
- [ ] `app/about/page.tsx`
- [ ] `app/cloud-types/page.tsx`
- [ ] `app/error.tsx`
- [ ] `app/extremes/page.tsx`
- [ ] `app/fun-facts/page.tsx`
- [ ] `app/games/page.tsx`
- [ ] `app/news/page.tsx`
- [ ] `app/not-found.tsx`
- [ ] `app/weather/[city]/client.tsx`
- [ ] `components/navigation.tsx`
- [ ] `components/location-context.tsx`

### 🎨 Style System Updates
- [ ] Update Tailwind config paths to point to `src/`
- [ ] Update import paths in all files to use `src/` structure
- [ ] Test all 3 themes (dark, miami, tron) work correctly

## Phase 6: Backend Setup (1-2 hours)

### 🗄️ Express Server Implementation
- [ ] Implement Express server skeleton (created)
- [ ] Copy API logic from Next.js routes to Express endpoints
- [ ] Set up CORS for frontend-backend communication
- [ ] Add environment variable handling
- [ ] Test all API endpoints work correctly

### 🔐 Environment Variables
- [ ] Update `.env` variables for Vite (prefix with `VITE_` for client-side)
- [ ] Separate server-side environment variables (no prefix needed)
- [ ] Update weather API calls to use new backend URLs

## Phase 7: Deployment Setup (1 hour)

### ⚡ Vercel Configuration
- [ ] Create `vercel.json` for Vite deployment (template below)
- [ ] Update build commands in Vercel dashboard
- [ ] Set up separate deployment for Express API (Railway/Render/Vercel Functions)

### 🧪 Testing & Verification
- [ ] Test development server: `npm run dev`
- [ ] Test production build: `npm run build && npm run preview`  
- [ ] Test all routes and navigation
- [ ] Test all weather functionality
- [ ] Test all themes
- [ ] Test mobile responsiveness
- [ ] Verify PWA functionality still works

## Phase 8: Final Cleanup (30 minutes)

### 🧹 File Cleanup
- [ ] Remove `next.config.mjs`
- [ ] Remove `next-env.d.ts`
- [ ] Remove original `app/` directory after verification
- [ ] Remove Next.js specific dependencies
- [ ] Update README.md with new setup instructions

---

## 🔧 Migration Commands

### Initial Setup
```bash
# 1. Install new dependencies
npm install -f # Use package-vite.json as package.json

# 2. Start development
npm run dev    # Vite dev server (port 3000)
npm run server:dev  # Express API server (port 5000)

# 3. Build for production  
npm run build  # Vite build
npm run preview # Preview production build
```

### Testing Migration
```bash
# Test API endpoints
curl http://localhost:5000/api/weather/current?city=austin
curl http://localhost:5000/api/health

# Test frontend
open http://localhost:3000
```

---

## ⚠️ Critical Migration Notes

1. **API Endpoints**: Your frontend will need to update all API calls from `/api/weather/current` to `http://localhost:5000/api/weather/current` (or your deployed API URL)

2. **Dynamic Routes**: The `[city]` dynamic route will become `/weather/:city` in React Router

3. **SSR Loss**: You'll lose server-side rendering, but gain faster development and simpler deployment

4. **Image Optimization**: Next.js image optimization will be lost - consider using a CDN or manual optimization

5. **Font Loading**: Google Fonts will load via standard web fonts instead of Next.js optimization

6. **SEO**: React Helmet replaces Next.js metadata, but you may lose some advanced SEO features

---

## 📈 Estimated Timeline
- **Experienced Developer**: 8-12 hours
- **Moderate Experience**: 12-16 hours  
- **Beginner**: 16-24 hours

## 🎯 Success Criteria
- [ ] All pages load correctly with React Router
- [ ] All weather functionality works (search, display, themes)
- [ ] All API endpoints respond correctly
- [ ] PWA features maintained
- [ ] Performance equivalent or better than Next.js version
- [ ] Successfully deployed to Vercel