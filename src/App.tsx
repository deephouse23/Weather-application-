import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import AppThemeProvider from './providers/ThemeProvider'
import { LocationProvider } from './components/location-context'
import Layout from './components/Layout'

// Page imports
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import CloudTypesPage from './pages/CloudTypesPage'
import ExtremesPage from './pages/ExtremesPage'
import FunFactsPage from './pages/FunFactsPage'
import GamesPage from './pages/GamesPage'
import NewsPage from './pages/NewsPage'
import WeatherSystemsPage from './pages/WeatherSystemsPage'
import CityWeatherPage from './pages/CityWeatherPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <>
      <Helmet>
        <title>16 Bit Weather - Retro Terminal Weather Forecast</title>
        <meta 
          name="description" 
          content="Real-time weather forecasts with authentic 16-bit terminal aesthetics. Check current conditions, 5-day forecasts, and weather data for any city worldwide."
        />
        <meta name="keywords" content="16-bit weather, terminal weather, retro weather forecast, pixel weather, weather app, real-time weather, 5-day forecast" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* PWA meta tags */}
        <meta name="theme-color" content="#0a0a1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Preconnect to APIs */}
        <link rel="preconnect" href="https://api.openweathermap.org" />
        <link rel="dns-prefetch" href="https://pollen.googleapis.com" />
        
        {/* Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </Helmet>

      <AppThemeProvider>
        <LocationProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cloud-types" element={<CloudTypesPage />} />
              <Route path="/extremes" element={<ExtremesPage />} />
              <Route path="/fun-facts" element={<FunFactsPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/weather-systems" element={<WeatherSystemsPage />} />
              <Route path="/weather/:city" element={<CityWeatherPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </LocationProvider>
      </AppThemeProvider>
    </>
  )
}

export default App