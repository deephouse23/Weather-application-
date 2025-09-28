# 16-Bit Weather Platform

[![License: Fair Source](https://img.shields.io/badge/License-Fair%20Source%200.9-yellow)](LICENSE)
[![Version](https://img.shields.io/badge/Version-v0.5.0-blue)](https://github.com/deephouse23/Weather-application-/releases)
[![React](https://img.shields.io/badge/React-19+-61dafb)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

A professional weather application that combines modern meteorological data with retro terminal aesthetics. Built with Next.js 15, React 19, and TypeScript, featuring comprehensive weather monitoring and user authentication.

**Live Application:** [16bitweather.co](https://www.16bitweather.co/)

## Core Features

### Weather Data
- Real-time temperature monitoring with "feels like" calculations
- Current atmospheric conditions with detailed descriptions
- Wind speed, direction, and gust measurements
- Humidity levels and visibility range tracking
- Atmospheric pressure readings
- UV index monitoring with safety recommendations
- Air quality measurements and health advisories
- Pollen count tracking for allergy management
- Daily sunrise and sunset calculations
- Moon phase tracking with illumination percentages

### Interactive Forecasting
- 5-day weather forecast with expandable detailed views
- Daily temperature ranges with precise future predictions
- Comprehensive weather metrics for extended periods
- Date-specific weather data with M.DD.YY formatting
- Precipitation probability calculations
- Weather pattern analysis and predictions
- Touch-optimized interface for mobile devices

### Location Services
- City name search functionality
- State and country-specific location queries
- ZIP and postal code location resolution
- GPS coordinate input support
- Automatic geolocation detection
- Location memory and recall functionality
- Global weather data coverage

### User Experience
- Three distinct visual themes (Dark, Miami, Tron)
- Responsive design across all device types
- Progressive web app capabilities
- Keyboard navigation support
- Intelligent API request management
- Comprehensive error handling and recovery

## Technology Stack

### Framework
- React 19 with modern features and performance improvements
- Next.js 15 with App Router architecture
- TypeScript for type-safe development
- Tailwind CSS for responsive styling

### APIs and Data Sources
- OpenWeatherMap API for comprehensive weather data
- Geolocation API for automatic location detection
- UV Index API for radiation monitoring
- Air Quality API for pollution tracking
- Pollen Data API for allergen information

### Authentication and Database
- Supabase for user authentication and data management
- PostgreSQL database for user preferences and saved locations
- Row-level security for data protection

### Development and Deployment
- Progressive Web App capabilities
- Vercel hosting platform
- GitHub Actions for continuous integration
- Modern tooling with hot module replacement

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenWeatherMap API key (free tier available)
- Supabase account for authentication features
- Modern web browser with JavaScript support

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/deephouse23/Weather-application-.git
   cd Weather-application-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   ```
   
   Add the following variables:
   ```env
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY=your_pollen_key (optional)
   NEXT_PUBLIC_GOOGLE_AIR_QUALITY_API_KEY=your_air_quality_key (optional)
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

### Production Deployment

```bash
npm run build
npm start
```

## Usage

### Basic Weather Lookup
1. Enter location in the search bar (city, ZIP code, or coordinates)
2. Press Enter or click the search button
3. View comprehensive weather data instantly
4. Data updates automatically for real-time accuracy

### Advanced Features
1. Switch between visual themes using the theme selector
2. Use geolocation for automatic location detection
3. Create an account to save favorite locations
4. Access detailed 5-day forecasts with expandable views

### User Account Features
1. Sign up or log in using the authentication system
2. Save multiple locations to your dashboard
3. Customize theme preferences
4. Access personalized weather history

### Navigation
- Full keyboard accessibility support
- Mouse hover interactions for additional details
- Touch-optimized interface for mobile devices

## Configuration

### Environment Variables

**Required:**
```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**Optional:**
```env
NEXT_PUBLIC_GOOGLE_POLLEN_API_KEY=your_pollen_key
NEXT_PUBLIC_GOOGLE_AIR_QUALITY_API_KEY=your_air_quality_key
SENTRY_DSN=your_sentry_dsn (error monitoring)
```

### API Key Setup
- **OpenWeatherMap**: Free API key from [openweathermap.org/api](https://openweathermap.org/api)
- **Supabase**: Database and authentication from [supabase.com](https://supabase.com)
- **Google APIs**: Enhanced data from [Google Cloud Console](https://console.cloud.google.com)

### Theme Configuration
The application supports three built-in themes:
- **Dark**: Professional dark interface
- **Miami**: Retro neon styling
- **Tron**: Sci-fi inspired design

Themes can be customized in the global CSS configuration files.

## Progressive Web App Features

- Install as native application on mobile and desktop
- Offline functionality with cached weather data
- Service worker caching for improved performance
- Native app-like experience across all devices
- Fast loading with optimized resource management

## Limitations and Roadmap

### Current Limitations
- UV Index data may show cached values during nighttime
- Pollen data availability varies by geographic region
- Offline functionality requires initial data caching
- Some visual elements optimized for screens above 320px width

### Planned Improvements
- Severe weather notification system
- Historical weather data analysis
- Interactive weather mapping
- Enhanced multi-location comparison tools
- Weather trend visualization

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add new feature'`
5. Push to your fork: `git push origin feature/new-feature`
6. Submit a pull request

### Guidelines
- Follow existing code style and conventions
- Include tests for new functionality
- Update documentation for user-facing changes
- Use GitHub issues for bug reports with detailed descriptions
- Ensure all builds pass before submitting PRs

## License

This project is licensed under the Fair Source License, Version 0.9. See the [LICENSE](LICENSE) file for complete terms.

### License Summary
- Use limitation: 5 users maximum
- Change date: January 2029
- After change date: MIT License
- Commercial use permitted within user limits

## Support

- **Bug Reports**: [GitHub Issues](https://github.com/deephouse23/Weather-application-/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/deephouse23/Weather-application-/discussions)
- **Documentation**: This README provides comprehensive setup and usage information
- **Live Application**: [16bitweather.co](https://www.16bitweather.co/)

## Acknowledgments

- OpenWeatherMap for comprehensive weather data API
- Supabase for authentication and database services
- React and Next.js communities for framework support
- Contributors and beta testers for feedback and improvements

---

## Version History

### v0.5.0 - User Authentication and Dashboard
- Complete Supabase authentication system integration
- User dashboard with saved locations management
- Theme preference persistence across sessions
- Enhanced security with row-level database policies
- Improved error handling and user feedback
- Mobile-optimized authentication flows

### v0.4.5 - Interactive Weather Radar
- Animated weather radar map with timeline controls
- Real-time precipitation tracking and forecasting
- Enhanced mobile interface with touch controls
- Performance optimizations for radar data loading

### v0.3.0 - Architecture Modernization
- Migration to Next.js 15 and React 19
- Complete TypeScript implementation
- App Router architecture adoption
- Enhanced SEO and performance optimization
- Progressive Web App capabilities

### v0.2.x Series - Core Features
- Enhanced location services and geolocation
- Multi-theme system (Dark, Miami, Tron)
- Comprehensive weather data integration
- Mobile responsiveness improvements
- Security enhancements and code optimization

---

**Production Status**: Version 0.5.0 represents a stable release with comprehensive user authentication, dashboard functionality, and production-ready deployment capabilities.