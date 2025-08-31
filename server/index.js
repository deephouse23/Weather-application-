/**
 * Express.js server to replace Next.js API routes
 * Handles all weather API endpoints previously in app/api/
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now to avoid conflicts
}))
app.use(compression())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://16bitweather.co', 'https://www.16bitweather.co']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Weather API endpoints (to be implemented)
app.get('/api/weather/current', async (req, res) => {
  // TODO: Implement current weather endpoint
  // Copy logic from app/api/weather/current/route.ts
  res.json({ message: 'Current weather endpoint - to be implemented' })
})

app.get('/api/weather/forecast', async (req, res) => {
  // TODO: Implement forecast endpoint
  // Copy logic from app/api/weather/forecast/route.ts
  res.json({ message: 'Forecast endpoint - to be implemented' })
})

app.get('/api/weather/geocoding', async (req, res) => {
  // TODO: Implement geocoding endpoint
  // Copy logic from app/api/weather/geocoding/route.ts
  res.json({ message: 'Geocoding endpoint - to be implemented' })
})

app.get('/api/weather/air-quality', async (req, res) => {
  // TODO: Implement air quality endpoint
  // Copy logic from app/api/weather/air-quality/route.ts
  res.json({ message: 'Air quality endpoint - to be implemented' })
})

app.get('/api/weather/pollen', async (req, res) => {
  // TODO: Implement pollen endpoint
  // Copy logic from app/api/weather/pollen/route.ts
  res.json({ message: 'Pollen endpoint - to be implemented' })
})

app.get('/api/weather/uv', async (req, res) => {
  // TODO: Implement UV index endpoint
  // Copy logic from app/api/weather/uv/route.ts
  res.json({ message: 'UV index endpoint - to be implemented' })
})

app.get('/api/extremes', async (req, res) => {
  // TODO: Implement extremes endpoint
  // Copy logic from app/api/extremes/route.ts
  res.json({ message: 'Weather extremes endpoint - to be implemented' })
})

app.get('/api/news', async (req, res) => {
  // TODO: Implement news endpoint
  // Copy logic from app/api/news/route.ts
  res.json({ message: 'News endpoint - to be implemented' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

app.listen(PORT, () => {
  console.log(`🌤️  16-Bit Weather API server running on port ${PORT}`)
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
})