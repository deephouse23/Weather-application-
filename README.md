# 16-bit Weather App

A retro-style weather application with pixel art graphics, comprehensive location search capabilities, and the **world's first 16-bit doppler radar**. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### 🌤️ Weather Data
- **Real-time weather** from OpenWeatherMap API
- **Timezone-accurate** sunrise/sunset times
- **Wind direction** with compass notation (N, NE, E, etc.)
- **UV Index** with intensity descriptions
- **Barometric pressure** with regional units (inHg for US, hPa internationally)
- **Dew point** calculations
- **3-day forecast** with daily highs/lows
- **Moon phase** tracking with illumination percentage

### 🔍 Enhanced Location Search
- **ZIP Codes**: US (90210), UK (SW1A 1AA), Canada (K1A 0A6)
- **City + State**: "New York, NY" | "Los Angeles, CA"
- **City + Country**: "London, UK" | "Tokyo, JP"
- **Smart format detection** with helpful error messages
- **Geolocation support** for current location weather

### 🎨 Dual Theme System
- **Dark Mode**: Classic 16-bit terminal aesthetic
- **Miami Vice Mode**: Retro 80s neon styling with hot pink and cyan
- **Persistent theme** saves user preference

### ⚡ Performance & UX
- **Rate limiting** (10 requests/hour) with user feedback
- **Location caching** for faster subsequent loads
- **Loading states** with retro-styled indicators
- **Error handling** with contextual suggestions
- **Responsive design** for all screen sizes

### 📡 16-bit Doppler Radar (NEW in v0.0.5)
- **Authentic retro gaming aesthetics** with chunky 8x8 pixel blocks
- **Real precipitation data** from OpenWeatherMap with 6-frame animation
- **Multiple color themes**: NES Classic, Game Boy, Miami Vice, Retro Dark
- **Interactive controls**: Play/pause, refresh, frame counter
- **Pixel-perfect rendering** with no anti-aliasing or gradients
- **Storm movement animation** showing weather progression over time

## 🏗️ Technical Architecture

### Dependencies (Optimized)
```json
{
  "@vercel/analytics": "^1.5.0",
  "autoprefixer": "^10.4.20", 
  "clsx": "^2.1.1",
  "lucide-react": "^0.454.0",
  "next": "15.2.4",
  "react": "^19",
  "react-dom": "^19",
  "tailwind-merge": "^2.5.5"
}
```

### Project Structure
```
├── app/
│   ├── layout.tsx           # Root layout with Analytics
│   ├── page.tsx             # Main weather app component
│   └── globals.css          # Global styles and pixel art
├── lib/
│   ├── weather-api.ts       # OpenWeatherMap integration
│   └── utils.ts             # Utility functions
├── components/
│   ├── weather-search.tsx   # Enhanced search component
│   └── forecast.tsx         # Forecast display component
└── public/                  # Static assets
```

### Key Features Implementation

#### Timezone-Accurate Times
```typescript
const formatTime = (timestamp: number, timezoneOffset?: number): string => {
  const utcTime = timestamp * 1000;
  const localTime = timezoneOffset ? utcTime + (timezoneOffset * 1000) : utcTime;
  // Use location's timezone, not browser's
}
```

#### Wind Direction System
```typescript
const getCompassDirection = (degrees: number): string => {
  // 8-point compass system: N, NE, E, SE, S, SW, W, NW
  // Returns formatted display like "SW 6 mph" or "Calm"
}
```

#### Smart Location Parsing
```typescript
const parseLocationInput = (input: string): LocationQuery => {
  // Detects and handles multiple input formats:
  // ZIP codes, City+State, City+Country, International postal codes
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- OpenWeatherMap API key

### Setup
1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd weather-application
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_api_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## 🧪 Testing Checklist

### ✅ Core Features (All Working)
- [x] Real weather data fetching
- [x] Timezone-accurate sunrise/sunset
- [x] Wind direction with compass notation
- [x] Location search (ZIP, City+State, City+Country)
- [x] Geolocation support
- [x] Dark mode / Miami Vice theme switching
- [x] UV Index display
- [x] Barometric pressure (regional units)
- [x] 3-day forecast
- [x] Moon phase calculation
- [x] Rate limiting with user feedback
- [x] Location caching
- [x] Error handling with helpful messages
- [x] Vercel Analytics tracking

### 🌍 Location Testing
- [x] **US ZIP**: 90210, 10001
- [x] **US City+State**: "New York, NY", "Los Angeles, CA"
- [x] **International**: "London, UK", "Tokyo, JP", "Sydney, AU"
- [x] **Edge Cases**: Cities with spaces, hyphens, apostrophes

### 🎨 Theme Testing
- [x] **Dark Mode**: Terminal-style with blue/cyan accents
- [x] **Miami Vice Mode**: Hot pink borders, cyan text, neon glows
- [x] **Theme Persistence**: Saves and restores user preference

## 📊 Performance Metrics

### Bundle Size (Optimized)
- **Total**: 119 kB First Load JS
- **Main Page**: 18.5 kB
- **Reduction**: ~70% from original (removed 120 unused dependencies)

### API Efficiency
- **Rate Limiting**: 10 requests/hour with local tracking
- **Caching**: Location-based caching for repeat visits
- **Error Handling**: Graceful degradation with helpful messages

## 🔄 Version History

### v0.0.5 (Current) - 16-bit Doppler Radar
- 🚀 **NEW**: World's first 16-bit style doppler radar for weather apps
- 📡 **Added**: Real-time precipitation visualization with retro aesthetics
- 🎮 **Enhanced**: Multiple radar color themes (NES, Game Boy, Miami Vice)
- ⚡ **Improved**: Canvas-based rendering with pixel-perfect graphics
- 🔧 **Integration**: OpenWeatherMap One Call API 3.0 for precipitation data

### v0.0.4 - Timezone Fix
- ✅ **Fixed**: Critical timezone bug for sunrise/sunset
- ✅ **Added**: Vercel Analytics integration
- ✅ **Improved**: Location-accurate time display

### v0.0.3 - Wind Direction Enhancement  
- ✅ **Added**: Wind direction with compass notation
- ✅ **Enhanced**: Wind display with gust information

### v0.0.2 - Location Search Enhancement
- ✅ **Added**: Multiple location format support
- ✅ **Enhanced**: Smart format detection and parsing

### v0.0.1 - Initial Release
- ✅ **Core**: Weather data integration
- ✅ **UI**: Retro 16-bit design system

## 🚧 Ready for v0.0.5

The codebase is now clean, optimized, and ready for the next major feature:
- **Performance**: 70% reduction in bundle size
- **Code Quality**: Comprehensive JSDoc documentation
- **Architecture**: Modular, maintainable structure
- **Testing**: All features verified and working
- **Analytics**: Vercel Analytics tracking active

### Next: Radar Integration 📡
The foundation is set for implementing weather radar functionality while maintaining the retro aesthetic and performance optimization.

## 🤝 Contributing

1. Ensure all existing tests pass
2. Follow the established coding patterns
3. Maintain the retro aesthetic
4. Document new features thoroughly

## 📄 License

This project is licensed under the MIT License.