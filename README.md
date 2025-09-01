# 16-Bit Weather v0.4.5 - BETA

[![License: Fair Source](https://img.shields.io/badge/License-Fair%20Source%200.9-yellow)](LICENSE)
[![Beta Version](https://img.shields.io/badge/Status-BETA-orange)](https://github.com/deephouse23/Weather-application-/releases)
[![Version](https://img.shields.io/badge/Version-0.4.5--beta-blue)](https://github.com/deephouse23/Weather-application-/releases)

**Experience weather data like it's 1985!**

> ⚠️ **BETA SOFTWARE**: This project is currently in beta. Features may change, and bugs may exist. Use in production at your own risk.

A retro-styled weather application that combines modern meteorological data with authentic 16-bit gaming aesthetics. Get comprehensive weather information displayed through a nostalgic terminal interface with pixel-perfect styling.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-16bitweather.co-brightgreen)](https://www.16bitweather.co/)
[![Version](https://img.shields.io/badge/Version-0.3.0-blue)](https://github.com/deephouse23/Weather-application-/releases)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org/)
[![Security](https://img.shields.io/badge/Security-Hardened-green)](https://github.com/deephouse23/Weather-application-/releases/tag/v0.3.0)

## 🌐 Live Application

**🚀 Visit:** [16bitweather.co](https://www.16bitweather.co/)

## ✨ Features Overview

### 🎨 Visual Experience
- **🖥️ Authentic 16-Bit Terminal Interface** - Complete with ASCII art branding
- **🌈 Dynamic Theme System** - Seamless switching between light and dark modes
- **🎮 Retro Gaming Aesthetics** - Pixel-perfect design inspired by 1985 terminals
- **📱 Fully Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **💫 Smooth Animations** - Retro-style transitions and hover effects

### 🌤️ Comprehensive Weather Data

#### Current Conditions
- **🌡️ Real-Time Temperature** - Precise current temperature with "feels like" data
- **☁️ Weather Conditions** - Current sky conditions with descriptive text
- **💨 Wind Information** - Speed, direction, and gust data
- **💧 Humidity Levels** - Current atmospheric moisture content
- **👁️ Visibility Range** - Current visibility distance
- **🌪️ Atmospheric Pressure** - Current barometric pressure readings

#### Environmental Metrics
- **☀️ UV Index** - Real-time ultraviolet radiation levels with safety recommendations
- **🌬️ Air Quality Index** - Current air pollution levels with health advisories
- **🌸 Pollen Count** - Tree, grass, and weed pollen levels for allergy sufferers
- **🌅 Sunrise/Sunset Times** - Daily solar schedule with custom sunrise/sunset icons
- **🌙 Moon Phase Information** - Current lunar cycle with illumination percentage

#### Enhanced 5-Day Forecasting
- **📅 Interactive 5-Day Forecast** - Click any day tile for detailed metrics
- **🌡️ High/Low Temperatures** - Daily temperature ranges with accurate future data
- **📊 Detailed Weather Metrics** - Real humidity, wind, pressure, UV data for all days
- **📅 Date Context** - Each tile shows actual date (M.DD.YY format)
- **🎯 Smart UI Design** - Details hidden by default, revealed on demand
- **🌦️ Precipitation Probability** - Rain and snow likelihood with visual indicators
- **☁️ Daily Conditions** - Comprehensive weather pattern predictions
- **📱 Mobile-Optimized** - Touch-friendly tiles with responsive design

### 📍 Advanced Location Features

#### Smart Search System
- **🏙️ City Names** - Search by city: "Paris", "Tokyo", "New York"
- **🗺️ City + State** - US format: "Austin, TX", "Miami, FL", "Seattle, WA"
- **🌍 City + Country** - International: "Toronto, Canada", "Sydney, Australia"
- **📮 ZIP/Postal Codes** - US/International: "90210", "10001", "M5V 3L9"
- **🎯 GPS Coordinates** - Precise location: "40.7128,-74.0060"
- **🔍 Intelligent Auto-Complete** - Suggests locations as you type

#### Location Management
- **📍 One-Click Geolocation** - Automatic location detection with user permission
- **💾 Location Memory** - Automatically saves and recalls your last searched location
- **🔄 Quick Location Switching** - Easy switching between favorite locations
- **🌐 Global Coverage** - Worldwide weather data support

### ⚡ Performance & Technical Features

#### Optimized Performance
- **🚀 Fast Loading** - Optimized bundle size and lazy loading
- **⏱️ Smart API Management** - Debounced search prevents rate limiting
- **📱 Progressive Web App** - Install as native app on any device
- **💾 Intelligent Caching** - Reduces API calls and improves speed
- **🔄 Real-Time Updates** - Live weather data refresh

#### User Experience
- **⌨️ Keyboard Navigation** - Full keyboard accessibility support
- **🎯 Search Optimization** - Prevents excessive API calls during typing
- **📱 Touch-Friendly** - Optimized for mobile touch interactions
- **🔗 Deep Linking** - Shareable URLs for specific locations
- **⚠️ Error Handling** - Graceful fallbacks for network issues

## 🛠️ Technology Stack

### Frontend Framework
- **⚛️ React 19** - Latest React with modern features and improved performance
- **🚀 Next.js 14** - Full-stack React framework with App Router
- **🎨 Tailwind CSS** - utility-first CSS framework
- **📱 Responsive Design** - Mobile-first design approach
- **🎮 Custom Fonts** - Retro gaming typography
- **🔧 TypeScript** - Type-safe development experience

### APIs & Data Sources
- **🌦️ OpenWeatherMap API** - Primary weather data provider
- **🌍 Geolocation API** - Browser-based location detection
- **☀️ UV Index API** - Real-time ultraviolet radiation data
- **🌬️ Air Quality API** - Environmental pollution monitoring
- **🌸 Pollen Data API** - Allergen level tracking

### Development Tools
- **🚀 Next.js 14** - Modern full-stack React framework
- **🔧 TypeScript** - Type-safe JavaScript development
- **📱 Progressive Web App** - Enhanced PWA capabilities
- **🚀 Vercel Deployment** - Serverless hosting platform
- **⚡ App Router** - Next.js modern routing system

## 🚀 Getting Started

### Prerequisites
- **Node.js 16+** and npm/yarn
- **OpenWeatherMap API Key** (free tier available)
- **Modern web browser** with JavaScript enabled

### Installation Steps

1. **📥 Clone Repository**
   ```bash
   git clone https://github.com/deephouse23/Weather-application-.git
   cd Weather-application-
   ```

2. **📦 Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **🔑 Configure Environment**
   ```bash
   # Create .env.local file in root directory
   cp .env.example .env.local
   
   # Add your API keys (Note: Next.js uses NEXT_PUBLIC_ prefix)
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
   NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here
   NEXT_PUBLIC_GOOGLE_AIR_QUALITY_API_KEY=your_google_air_quality_key_here
   ```

4. **🏃 Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **🌐 Open Application**
   ```
   http://localhost:3000
   ```

### Production Build

```bash
# Build for production
npm run build

# Start production server locally
npm start

# Deploy to Vercel (optional)
vercel --prod
```

## 🎮 How to Use

### Basic Weather Lookup
1. **🔍 Enter Location** - Type city, ZIP code, or coordinates in search bar
2. **⏎ Search** - Press Enter or click search button
3. **📊 View Data** - Comprehensive weather information displays instantly
4. **🔄 Refresh** - Data updates automatically for real-time accuracy

### Advanced Features
1. **🎨 Theme Switching** - Toggle between light and dark modes using theme button
2. **📍 Geolocation** - Click "Use My Location" for instant local weather
3. **📱 Mobile Usage** - Pinch to zoom, swipe-friendly interface
4. **💾 Bookmark Locations** - App remembers your frequently searched places

### Navigation Tips
- **⌨️ Keyboard Shortcuts** - Tab navigation, Enter to search
- **🖱️ Mouse Interactions** - Hover effects reveal additional information
- **📱 Touch Gestures** - Optimized for mobile swiping and tapping

## ⚙️ Configuration Options

### Environment Variables
```env
# Required - OpenWeatherMap API key
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Optional - Enhanced pollen data
NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here

# Optional - Enhanced air quality data
NEXT_PUBLIC_GOOGLE_AIR_QUALITY_API_KEY=your_google_air_quality_key_here

# Development Environment
NODE_ENV=development
```

**API Key Setup:**
- **OpenWeatherMap API**: Get your free API key from [OpenWeatherMap](https://openweathermap.org/api)
- **Google Pollen API**: Get your API key from [Google Maps Platform](https://developers.google.com/maps/documentation/pollen) (optional, for accurate pollen data)

### Theme Customization
Modify `src/styles/themes.css` to customize colors:
```css
/* Dark Mode (default) */
:root {
  --primary-bg: #1a1a2e;
  --secondary-bg: #16213e;
  --accent-color: #0f3460;
  --text-primary: #e94560;
}

/* Light Mode */
.light-theme {
  --primary-bg: #f8f9fa;
  --secondary-bg: #ffffff;
  --accent-color: #007bff;
  --text-primary: #333333;
}
```

## 📱 Progressive Web App Features

- **🏠 Add to Home Screen** - Install as native app
- **📶 Offline Support** - Cached data when connection is poor
- **🔔 Push Notifications** - Weather alerts and updates (future feature)
- **⚡ Fast Loading** - Service worker caching
- **📱 Native Experience** - App-like behavior on mobile devices

## 🐛 Known Issues & Limitations

### Current Limitations
- **⏰ UV Index** - May show cached data during nighttime hours
- **🌸 Pollen Data** - Limited availability in some international regions
- **📱 ASCII Art** - May not display perfectly on very small screens (< 320px)
- **🌐 Offline Mode** - Limited functionality without internet connection

### Planned Improvements
- **🔔 Weather Alerts** - Severe weather notifications
- **📈 Historical Data** - Weather trends and comparisons
- **🗺️ Weather Maps** - Interactive satellite imagery
- **👥 Multi-Location** - Save and compare multiple cities

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Development Workflow
1. **🍴 Fork** the repository
2. **🌿 Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **✅ Commit** changes (`git commit -m 'Add amazing feature'`)
4. **📤 Push** to branch (`git push origin feature/amazing-feature`)
5. **🔄 Open** a Pull Request

### Contribution Guidelines
- **📝 Code Style** - Follow existing formatting and conventions
- **🧪 Testing** - Include tests for new features
- **📖 Documentation** - Update README for new features
- **🐛 Bug Reports** - Use GitHub issues with detailed descriptions

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **🌦️ OpenWeatherMap** - Comprehensive weather data API
- **🎮 Retro Gaming Community** - Design inspiration and aesthetic guidance
- **💻 React Community** - Framework support and best practices
- **🎨 16-Bit Era** - Graphics and interface design inspiration

## 📞 Support & Contact

### Getting Help
- **🐛 Bug Reports** - [Create an Issue](https://github.com/deephouse23/Weather-application-/issues)
- **💡 Feature Requests** - [GitHub Discussions](https://github.com/deephouse23/Weather-application-/discussions)
- **📧 Direct Contact** - Open an issue for support questions

### Resources
- **📖 Documentation** - Complete guide in this README
- **🌐 Live Demo** - [16bitweather.co](https://www.16bitweather.co/)
- **📱 Mobile Testing** - Works on all modern devices

---

## Version 0.4.5 Highlights - Animated Weather Radar Map

### NEW: Interactive Weather Radar Animation

Experience real-time precipitation tracking with our new animated weather radar system.

#### Features:
- **Animated Weather Radar Map**: Interactive map with timeline controls for precipitation visualization
- **Timeline Navigation**: Current and forecast precipitation data (Now, +1h, +2h, +3h, +4h)
- **Play/Pause Animation**: Cycle through precipitation timeframes automatically
- **Radar Controls**: Skip to beginning/end, opacity slider, and timeline clicking
- **Enhanced Layout**: 5-day forecast repositioned above weather radar for better user flow
- **Theme Integration**: Full support for dark, miami, and tron themes with animated controls
- **Mobile Optimized**: Responsive design with touch-friendly controls

#### Technical Improvements:
- **Fixed Precipitation API**: Resolved radar tile loading issues with proper API key handling
- **Enhanced Error Handling**: Graceful fallbacks for API limitations and network issues
- **Performance Optimized**: Efficient tile caching and smooth animation transitions
- **Free Plan Compatible**: Works with OpenWeatherMap free tier for current precipitation data

---

## Version 0.3.2 Highlights - Planet Extremes Feature

### 🌍 **NEW: Global Temperature Extremes Tracker**

Track Earth's hottest and coldest places in real-time with our new Planet Extremes feature!

#### Features:
- **🔥 Hottest Place on Earth**: Live temperature monitoring from Death Valley, Kuwait City, and more
- **🧊 Coldest Place on Earth**: Real-time data from Antarctica, Siberia, and Arctic regions
- **📊 Temperature Leaderboards**: Top 5 hottest and coldest locations globally
- **📍 Your Location Ranking**: See where you rank among Earth's temperature extremes
- **🎮 Retro Visualizations**: Animated thermometers with pixel-perfect 16-bit styling
- **💡 Educational Facts**: Learn about extreme weather phenomena and records

---

## 🚀 Version 0.3.0 Highlights - Major Architecture Upgrade 🌟

### 🎯 **Major Release - Next.js 14 Migration & Modern Architecture**

This groundbreaking release represents a **complete architectural transformation** with migration to Next.js 14, React 19, and modern development practices while preserving the beloved 16-bit retro aesthetic.

#### 🚀 **Core Architecture Overhaul**
- **🚀 Next.js 14 Migration**: Complete transition from Create React App to Next.js 14 with App Router
- **⚛️ React 19 Upgrade**: Latest React version with improved performance and features
- **🎨 Tailwind CSS Integration**: Modern utility-first styling framework
- **🔧 TypeScript Enhancement**: Full type safety across the application
- **📱 Enhanced SEO**: Server-side rendering and dynamic metadata generation

#### 🏗️ **Technical Improvements**
- **⚡ App Router Architecture**: Modern Next.js routing with improved performance
- **🎯 Dynamic City Pages**: SEO-friendly URL structure for weather locations
- **🔄 Enhanced State Management**: Improved data flow and component architecture
- **📱 Progressive Web App**: Enhanced PWA capabilities with better caching
- **🚀 Build Optimization**: Faster builds and improved bundle size

#### 🎮 **User Experience Enhancements**
- **🎨 Theme System Upgrade**: Enhanced theme switching with better persistence
- **📍 Improved Location Handling**: Better geolocation and search functionality
- **💾 Enhanced Caching**: Smarter data caching and performance optimization
- **🌍 SEO Optimization**: Better search engine visibility and social sharing
- **📱 Mobile Performance**: Improved mobile experience and touch interactions

#### 🛠️ **Development Experience**
- **🔧 Modern Tooling**: Next.js 14 development server and build tools
- **📝 Type Safety**: Comprehensive TypeScript implementation
- **🧹 Code Quality**: Cleaner component structure and better organization
- **⚡ Hot Reloading**: Faster development with improved hot module replacement
- **🔍 Better Debugging**: Enhanced error handling and development tools

---

## 🚀 Version 0.2.74 Highlights

### 🔒 Security & Performance Improvements
- **CRITICAL SECURITY FIX**: Removed hardcoded API keys from debug files
- **Enhanced Navigation**: Location display now shows state abbreviations ("Dublin, CA" format)
- **Dead Code Cleanup**: Removed 259 lines of unused code for better performance
- **Bundle Optimization**: Cleaner imports and reduced build size
- **Production Ready**: Eliminated all development-only files with security risks

### ✨ New Features
- **📍 Enhanced Location Display**: Headers now show "16 BIT WEATHER Dublin, CA 61°F" format
- **🧹 Code Quality**: Comprehensive cleanup of unused imports and functions
- **⚡ Performance**: Faster loading with optimized bundle size
- **🔧 Maintainability**: Cleaner codebase with removed dead code

### 🛡️ Security Enhancements
- **🔐 Credential Safety**: Removed `local-dev-config.ts` with exposed API keys
- **🗑️ Debug Cleanup**: Eliminated `lib/weather-api-debug.ts` development files
- **📝 Code Hygiene**: Removed commented code blocks and unused imports
- **✅ Build Verification**: All changes tested and verified working

---

## 🚀 Version 0.2.73 Highlights

### ✨ Navigation Enhancements
- **📍 State Abbreviations**: Location display now includes proper state formatting
- **🏙️ Smart City Mapping**: Comprehensive city-to-state mapping for major US cities
- **🌍 International Support**: Proper handling of international locations
- **💫 Visual Consistency**: Maintains 16-bit terminal aesthetics

---

## 🚀 Version 0.2.72 Highlights

### ✨ Enhanced User Experience
- **🎮 Navigation Integration**: Weather data now displays in top navigation bar
- **🌈 AQI Visualization**: Restored horizontal color bar with current reading indicator
- **📱 Enhanced Visibility**: Larger fonts, bold styling, and theme-appropriate glow effects
- **💭 Welcome Message**: Updated to "► PRESS START TO INITIALIZE WEATHER DATA ◄"

---

## 🚀 Version 0.2.5 Highlights

### ✨ New Features
- **📍 Prominent location display** - Added city/state or city/country display with 16-bit terminal styling
- **🌙 Moon phase artwork** - Dynamic moon phase icons (New Moon, Waxing Crescent, First Quarter, etc.)
- **🎯 Improved location visibility** - Better user orientation with prominent location indicators
- **🎨 Enhanced visual consistency** - Moon phase icons match sunrise/sunset styling

### 🔧 Technical Improvements
- **📱 Better mobile layout** - Improved spacing and alignment for location display
- **🎮 Authentic 16-bit styling** - Location pin icon and terminal-style formatting
- **⚡ Dynamic updates** - Location display updates automatically with search changes

---

## 🚀 Version 0.2.4 Highlights

### ✨ New Features
- **🎨 Enhanced theme switching** - Seamless light/dark mode transitions
- **☀️ Real-time UV Index** - Accurate solar radiation monitoring
- **🌸 Pollen count integration** - Allergy information for outdoor planning
- **📱 Improved mobile responsiveness** - Better touch interactions

### 🔧 Bug Fixes
- **⏱️ Fixed API rate limiting** - Smart debouncing prevents excessive calls
- **🌙 Corrected nighttime UV readings** - Now shows accurate 0 values at night
- **🎨 Theme consistency** - Navigation bar properly follows theme changes
- **📱 Mobile layout improvements** - Better text contrast and readability

### 🚀 Performance Improvements
- **⚡ Faster initial load** - Optimized bundle size and lazy loading
- **💾 Better caching** - Improved location memory and data persistence
- **🔄 Smoother animations** - Enhanced user interface transitions

---

## 📜 License

### Fair Source License 0.9

This project is licensed under the **Fair Source License, Version 0.9**.

- **Use Limitation**: 5 users
- **Change Date**: January 2029 (4 years from release)
- **Change License**: MIT License after Change Date
- **Commercial Use**: Allowed for up to 5 users

#### What this means:
- ✅ **Free for small teams** (up to 5 users)
- ✅ **Commercial use allowed** within user limit
- ✅ **Modification and distribution permitted**
- ✅ **Becomes MIT licensed** in 2029
- ❌ **Requires license** for more than 5 users

For the full license terms, see the [LICENSE](LICENSE) file.

### 🚧 Beta Status

This software is currently in **BETA** (v0.4.5). This means:
- Features may change without notice
- Bugs and issues are expected  
- API interfaces may be modified
- Performance optimizations are ongoing
- Production use is at your own risk

---

**Built with ❤️ and nostalgia for the golden age of computing** 🎮

*"Experience tomorrow's weather with yesterday's style"* ✨