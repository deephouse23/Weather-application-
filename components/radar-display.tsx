"use client"

import { useState, useEffect, useRef } from "react"
import { RotateCcw, Plus, Minus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { themeUtils } from '@/lib/utils'

// Theme types
type ThemeType = 'dark' | 'miami' | 'tron';

interface RadarProps {
  lat: number
  lon: number
  apiKey: string
  theme: ThemeType
  locationName?: string
}

interface PrecipitationData {
  timestamp: number
  intensity: number // 0-10 scale for precipitation intensity
  type: 'rain' | 'snow' | 'mixed' | 'none'
  realIntensity?: number // Store actual mm/h for realistic rendering
}

interface RadarFrame {
  timestamp: number
  precipitationData: PrecipitationData[][]
  isLoading: boolean
  hasRealData: boolean
  url?: string // RainViewer radar tile URL
}

// City landmark data for 16-bit icons
interface CityLandmark {
  name: string
  lat: number
  lon: number
  icon: string // Pixel art representation
  type: 'major' | 'nearby' | 'current'
  landmark?: string // Optional landmark description
}

// Enhanced color palettes for all three themes
const colorPalettes = {
  // Dark theme colors - EXACT MATCH with main app
  dark: {
    name: 'DARK MODE',
    background: '#0f0f0f',
    grid: '#1a4a4a',
    scanline: '#2a5a5a',
    border: '#00d4ff',      // EXACT MATCH: Same as main app dark theme border
    text: '#e0e0e0',
    accent: '#00d4ff',      // EXACT MATCH: Same as main app dark theme accent
    // Precipitation intensity colors
    none: '#001122',
    lightRain: '#336699',    // Light blue
    moderateRain: '#5599bb', // Medium blue  
    heavyRain: '#77bbdd',    // Bright blue
    severeRain: '#99ddff',   // Very bright blue
    extremeRain: '#bbffff',  // Near white blue
    lightSnow: '#6a7a7a',    // Light gray
    moderateSnow: '#8a9a9a', // Medium gray
    heavySnow: '#aababa',    // Bright gray
    severeSnow: '#ccdddd',   // Very bright gray
    mixed: '#7ab0ba'         // Blue-gray mix
  },
  // Miami Vice theme colors - EXACT MATCH with main app
  miami: {
    name: 'MIAMI VICE',
    background: '#0a0025',
    grid: '#1a0040',
    scanline: '#2a0055', 
    border: '#ff1493',      // EXACT MATCH: Same as main app Miami Vice border  
    text: '#00ffff',
    accent: '#ff1493',      // EXACT MATCH: Same as main app Miami Vice accent
    none: '#0f0033',
    lightRain: '#ff69b4',    // Light pink
    moderateRain: '#ff1493', // Hot pink - EXACT MATCH
    heavyRain: '#ff007f',    // Deep pink
    severeRain: '#ff0066',   // Bright magenta
    extremeRain: '#ff3399',  // Neon pink
    lightSnow: '#40e0d0',    // Light cyan
    moderateSnow: '#00ffff', // Bright cyan
    heavySnow: '#00f5ff',    // Deep cyan
    severeSnow: '#87ceeb',   // Sky blue
    mixed: '#9370db'         // Purple mix
  },
  // NEW: Tron theme colors - Electric cyan and bright neon red inspired by 1982 movie
  tron: {
    name: 'TRON SYSTEM',
    background: '#000000',   // Pure black like Tron's digital world
    grid: '#001111',         // Dark cyan grid lines
    scanline: '#002222',     // Brighter cyan scanlines
    border: '#00FFFF',       // Electric cyan blue border - authentic 80s
    text: '#FFFFFF',         // Pure white text
    accent: '#00FFFF',       // Electric cyan accent
    // Precipitation intensity colors with authentic Tron aesthetic
    none: '#000000',         // Pure black for no precipitation
    lightRain: '#0088CC',    // Light electric cyan
    moderateRain: '#00AADD', // Medium electric cyan
    heavyRain: '#00FFFF',    // Bright electric cyan
    severeRain: '#66FFFF',   // Very bright electric cyan
    extremeRain: '#AAFFFF',  // Glowing electric cyan
    lightSnow: '#FF6644',    // Neon red for snow (MCP programs)
    moderateSnow: '#FF8844', // Brighter neon red
    heavySnow: '#FFAA44',    // Full neon red/orange
    severeSnow: '#FFCC44',   // Glowing neon red/orange
    mixed: '#FF1744'         // Bright neon red for mixed/warnings
  }
}

/**
 * Advanced 16-bit Doppler Radar Component - Enhanced with City Markers
 * 
 * FEATURES:
 * - Advanced precipitation intensity rendering with authentic 16-bit colors
 * - Multi-zoom radar with city/regional/wide area views
 * - Dynamic centering on selected location
 * - Pan controls for exploring nearby areas  
 * - Auto-matched themes (Dark/Miami Vice)
 * - Retro-style zoom and pan controls
 * - Realistic precipitation intensity scaling
 * - City location markers with 8-bit landmarks
 * - Geographic context with nearby cities
 * - 24-hour rainfall totals
 */
export default function RadarDisplay({ lat, lon, apiKey, theme, locationName }: RadarProps) {
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [hasPrecipitation, setHasPrecipitation] = useState(false)
  const [zoomLevel, setZoomLevel] = useState<'city' | 'regional' | 'wide'>(('regional'))
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [cityMarkerBlink, setCityMarkerBlink] = useState(true)
  const [rainfall24h, setRainfall24h] = useState<number>(0)
  const [isHydrated, setIsHydrated] = useState(false)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [radarType, setRadarType] = useState<'reflectivity' | 'velocity' | 'precipitation'>('reflectivity')
  const themeClasses = themeUtils.getThemeClasses(theme)

  // Enhanced grid size with zoom support - LARGER for full-width layout
  const GRID_SIZE = 20 // 20x20 grid for enhanced detail
  const PIXEL_SIZE = 15 // 15x15 pixel blocks for bigger, more prominent radar

  // Zoom ranges in kilometers
  const ZOOM_RANGES = {
    city: 15,      // 15km - city level detail
    regional: 35,  // 35km - regional weather patterns  
    wide: 75       // 75km - wide area view
  }

  // Auto-select theme based on app theme
  const currentPalette = theme === 'dark' ? colorPalettes.dark : 
                         theme === 'miami' ? colorPalettes.miami : 
                         colorPalettes.tron

  // Major cities with 8-bit landmark data
  const getCityLandmarks = (): CityLandmark[] => {
    const cities: CityLandmark[] = [
      // Major world cities with iconic landmarks
      { name: 'NEW YORK', lat: 40.7128, lon: -74.0060, icon: '🏢', type: 'major', landmark: 'EMPIRE STATE' },
      { name: 'LOS ANGELES', lat: 34.0522, lon: -118.2437, icon: '🌴', type: 'major', landmark: 'HOLLYWOOD' },
      { name: 'SAN FRANCISCO', lat: 37.7749, lon: -122.4194, icon: '🌉', type: 'major', landmark: 'GOLDEN GATE' },
      { name: 'CHICAGO', lat: 41.8781, lon: -87.6298, icon: '🏗️', type: 'major', landmark: 'SEARS TOWER' },
      { name: 'MIAMI', lat: 25.7617, lon: -80.1918, icon: '🏖️', type: 'major', landmark: 'SOUTH BEACH' },
      { name: 'SEATTLE', lat: 47.6062, lon: -122.3321, icon: '⛰️', type: 'major', landmark: 'SPACE NEEDLE' },
      { name: 'MEXICO CITY', lat: 19.4326, lon: -99.1332, icon: '🏛️', type: 'major', landmark: 'TEOTIHUACAN' },
      { name: 'LONDON', lat: 51.5074, lon: -0.1278, icon: '🏰', type: 'major', landmark: 'BIG BEN' },
      { name: 'PARIS', lat: 48.8566, lon: 2.3522, icon: '🗼', type: 'major', landmark: 'EIFFEL TOWER' },
      { name: 'TOKYO', lat: 35.6762, lon: 139.6503, icon: '🏯', type: 'major', landmark: 'TOKYO TOWER' },
      { name: 'SYDNEY', lat: -33.8688, lon: 151.2093, icon: '🌉', type: 'major', landmark: 'HARBOUR BRIDGE' },
      { name: 'MOSCOW', lat: 55.7558, lon: 37.6176, icon: '🏛️', type: 'major', landmark: 'RED SQUARE' },
      { name: 'BERLIN', lat: 52.5200, lon: 13.4050, icon: '🏛️', type: 'major', landmark: 'BRANDENBURG' },
      { name: 'ROME', lat: 41.9028, lon: 12.4964, icon: '🏟️', type: 'major', landmark: 'COLOSSEUM' },
      { name: 'RIO DE JANEIRO', lat: -22.9068, lon: -43.1729, icon: '⛰️', type: 'major', landmark: 'CHRIST STATUE' },
      { name: 'CAIRO', lat: 30.0444, lon: 31.2357, icon: '🔺', type: 'major', landmark: 'PYRAMIDS' },
      { name: 'MUMBAI', lat: 19.0760, lon: 72.8777, icon: '🏛️', type: 'major', landmark: 'GATEWAY' },
      { name: 'SHANGHAI', lat: 31.2304, lon: 121.4737, icon: '🏗️', type: 'major', landmark: 'PEARL TOWER' },
      { name: 'DUBAI', lat: 25.2048, lon: 55.2708, icon: '🏗️', type: 'major', landmark: 'BURJ KHALIFA' }
    ]

    // Find nearby cities based on current location and zoom level
    const range = ZOOM_RANGES[zoomLevel] * 1.5 // Extended range for city visibility
    const nearbyCities = cities.filter(city => {
      const distance = Math.sqrt(
        Math.pow((city.lat - lat) * 111, 2) + // Rough km conversion
        Math.pow((city.lon - lon) * 111 * Math.cos(lat * Math.PI / 180), 2)
      )
      return distance <= range && distance > 0
    }).map(city => ({ ...city, type: 'nearby' as const }))

    // Add current location as special marker
    const currentLocation: CityLandmark = {
      name: locationName?.toUpperCase() || 'CURRENT LOCATION',
      lat,
      lon,
      icon: '📍',
      type: 'current',
      landmark: 'YOUR LOCATION'
    }

    return [currentLocation, ...nearbyCities]
  }

  // Convert lat/lon to radar grid coordinates
  const latLonToGridCoords = (cityLat: number, cityLon: number) => {
    const range = ZOOM_RANGES[zoomLevel]
    const centerLat = lat
    const centerLon = lon
    
    // Calculate relative position in kilometers
    const deltaLat = (cityLat - centerLat) * 111 // Rough km per degree
    const deltaLon = (cityLon - centerLon) * 111 * Math.cos(centerLat * Math.PI / 180)
    
    // Convert to grid coordinates with pan offset
    const gridX = (GRID_SIZE / 2) + (deltaLon / range) * GRID_SIZE + panOffset.x
    const gridY = (GRID_SIZE / 2) - (deltaLat / range) * GRID_SIZE + panOffset.y // Y is inverted
    
    return { x: gridX, y: gridY }
  }

  // Render 8-bit pixel text
  const renderPixelText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, size: number = 1) => {
    ctx.fillStyle = color
    ctx.font = `${6 * size}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText(text, x, y)
  }

  // Render 8-bit landmark icons as pixel art
  const renderLandmarkIcon = (ctx: CanvasRenderingContext2D, landmark: CityLandmark, x: number, y: number) => {
    const pixelX = Math.floor(x) * PIXEL_SIZE
    const pixelY = Math.floor(y) * PIXEL_SIZE
    
    ctx.fillStyle = landmark.type === 'current' ? currentPalette.accent : currentPalette.text
    
    // Different landmark pixel art based on icon
    switch (landmark.icon) {
      case '🏢': // NYC - Empire State Building
        ctx.fillRect(pixelX - 1, pixelY - 4, 2, 8)
        ctx.fillRect(pixelX - 2, pixelY - 2, 4, 4)
        break
      
      case '🌉': // SF - Golden Gate Bridge
        ctx.fillRect(pixelX - 3, pixelY, 6, 1)
        ctx.fillRect(pixelX - 3, pixelY - 3, 1, 4)
        ctx.fillRect(pixelX + 2, pixelY - 3, 1, 4)
        break
      
      case '🏛️': // Mexico City - Pyramid
        ctx.fillRect(pixelX - 2, pixelY, 4, 1)
        ctx.fillRect(pixelX - 1, pixelY - 1, 2, 1)
        ctx.fillRect(pixelX, pixelY - 2, 1, 1)
        break
      
      case '🗼': // Paris - Eiffel Tower
        ctx.fillRect(pixelX, pixelY - 4, 1, 8)
        ctx.fillRect(pixelX - 1, pixelY - 2, 3, 1)
        ctx.fillRect(pixelX - 2, pixelY + 1, 5, 1)
        break
      
      case '🏯': // Tokyo - Pagoda
        ctx.fillRect(pixelX - 1, pixelY - 3, 2, 1)
        ctx.fillRect(pixelX, pixelY - 2, 1, 1)
        ctx.fillRect(pixelX - 1, pixelY - 1, 2, 1)
        ctx.fillRect(pixelX, pixelY, 1, 3)
        break
      
      case '🔺': // Cairo - Pyramid
        ctx.fillRect(pixelX - 2, pixelY + 1, 4, 1)
        ctx.fillRect(pixelX - 1, pixelY, 2, 1)
        ctx.fillRect(pixelX, pixelY - 1, 1, 1)
        break
      
      case '📍': // Current location - Special pulsing marker
        if (cityMarkerBlink) {
          ctx.fillStyle = currentPalette.accent
          ctx.fillRect(pixelX - 2, pixelY - 2, 4, 4)
          ctx.fillStyle = currentPalette.background
          ctx.fillRect(pixelX - 1, pixelY - 1, 2, 2)
          // Add crosshair
          ctx.fillStyle = currentPalette.accent
          ctx.fillRect(pixelX - 3, pixelY, 1, 1)
          ctx.fillRect(pixelX + 2, pixelY, 1, 1)
          ctx.fillRect(pixelX, pixelY - 3, 1, 1)
          ctx.fillRect(pixelX, pixelY + 2, 1, 1)
        }
        break
      
      default: // Generic city dot
        ctx.fillRect(pixelX - 1, pixelY - 1, 2, 2)
        break
    }
  }

  // Fetch real radar data from RainViewer API
  const fetchRadarData = async () => {
    if (!isHydrated) return // Don't fetch until client-side hydration is complete
    
    setIsLoading(true)
    setError("")
    
    try {
      // Get current weather conditions to check for precipitation
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
      )

      if (!currentResponse.ok) {
        throw new Error('Failed to fetch current weather data')
      }

      const currentData = await currentResponse.json()
      
      // Check if there's currently any precipitation
      const currentRain = currentData.rain?.['1h'] || 0
      const currentSnow = currentData.snow?.['1h'] || 0
      const hasPrecip = currentRain > 0 || currentSnow > 0

      setHasPrecipitation(hasPrecip)

      // Fetch RainViewer radar data
      const rainViewerResponse = await fetch(
        `https://api.rainviewer.com/public/weather-maps.json?lat=${lat}&lon=${lon}&zoom=${zoomLevel === 'city' ? 8 : zoomLevel === 'regional' ? 6 : 4}`
      )

      if (!rainViewerResponse.ok) {
        throw new Error('Failed to fetch radar data')
      }

      const rainViewerData = await rainViewerResponse.json()
      
      // Process radar frames
      const frames: RadarFrame[] = rainViewerData.radar.past.map((frame: any) => ({
        timestamp: frame.time,
        precipitationData: [], // We'll use the tile URL instead
        isLoading: false,
        hasRealData: true,
        url: frame.path
      }))

      // Add current frame
      frames.push({
        timestamp: rainViewerData.radar.nowcast,
        precipitationData: [],
        isLoading: false,
        hasRealData: true,
        url: rainViewerData.radar.nowcast
      })

      setRadarFrames(frames)
      setCurrentFrame(frames.length - 1) // Start with most recent frame

      // Calculate 24-hour rainfall total
      let rainfall24hTotal = 0
      if (currentRain > 0) {
        // Estimate 24h rainfall based on current hourly rate and weather conditions
        const intensity = currentData.weather?.[0]?.main || 'Clear'
        switch (intensity.toLowerCase()) {
          case 'drizzle':
            rainfall24hTotal = currentRain * 8 // Light extended rain
            break
          case 'rain':
            rainfall24hTotal = currentRain * 12 // Moderate rain periods
            break
          case 'thunderstorm':
            rainfall24hTotal = currentRain * 6 // Heavy but brief
            break
          default:
            rainfall24hTotal = currentRain * 10 // Average estimate
        }
      }
      
      // Convert mm to inches and cap at reasonable values
      rainfall24hTotal = Math.min(rainfall24hTotal * 0.0394, 10) // Cap at 10 inches max
      setRainfall24h(rainfall24hTotal)

    } catch (error) {
      console.error('Radar data fetch error:', error)
      setError('Failed to load radar data. Using simulated data instead.')
      
      // Fallback to simulated data
      const fallbackFrames = generateClearRadarFallback()
      setRadarFrames(fallbackFrames)
      setCurrentFrame(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate clear radar as fallback
  const generateClearRadarFallback = () => {
    const now = isHydrated ? Math.floor(Date.now() / 1000) : 1700000000
    const frames: RadarFrame[] = []
    
    for (let i = 7; i >= 0; i--) {
      const timestamp = now - (i * 450)
      frames.push({
        timestamp,
        precipitationData: [],
        isLoading: false,
        hasRealData: false
      })
    }
    
    return frames
  }

  // Render radar frame with real data
  const renderRadarFrame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = currentPalette.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = currentPalette.grid
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(i * PIXEL_SIZE, 0)
      ctx.lineTo(i * PIXEL_SIZE, canvas.height)
      ctx.stroke()

      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(0, i * PIXEL_SIZE)
      ctx.lineTo(canvas.width, i * PIXEL_SIZE)
      ctx.stroke()
    }

    // Draw radar data
    const currentRadarFrame = radarFrames[currentFrame]
    if (currentRadarFrame?.url) {
      // Load and draw radar tile
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = `https://tilecache.rainviewer.com/v2/radar/${currentRadarFrame.timestamp}/256/${zoomLevel === 'city' ? 8 : zoomLevel === 'regional' ? 6 : 4}/${lat}/${lon}/2/1_1.png`
      
      img.onload = () => {
        // Calculate position to center the radar image
        const x = (canvas.width - img.width) / 2
        const y = (canvas.height - img.height) / 2
        
        // Draw radar image with transparency
        ctx.globalAlpha = 0.7
        ctx.drawImage(img, x, y)
        ctx.globalAlpha = 1.0
      }
    }

    // Draw city markers
    const landmarks = getCityLandmarks()
    landmarks.forEach(landmark => {
      const coords = latLonToGridCoords(landmark.lat, landmark.lon)
      renderLandmarkIcon(ctx, landmark, coords.x, coords.y)
    })

    // Draw radar info
    renderPixelText(ctx, `ZOOM: ${zoomLevel.toUpperCase()}`, canvas.width / 2, 20, currentPalette.text, 1.5)
    renderPixelText(ctx, `TIME: ${formatTime(currentRadarFrame?.timestamp || Date.now() / 1000)}`, canvas.width / 2, 40, currentPalette.text, 1.5)
    
    // Draw precipitation legend
    const legendY = canvas.height - 60
    renderPixelText(ctx, 'PRECIPITATION INTENSITY', canvas.width / 2, legendY, currentPalette.text, 1.2)
    
    // Draw color scale
    const scaleWidth = 200
    const scaleX = (canvas.width - scaleWidth) / 2
    const scaleHeight = 10
    const gradient = ctx.createLinearGradient(scaleX, 0, scaleX + scaleWidth, 0)
    
    gradient.addColorStop(0, currentPalette.lightRain)
    gradient.addColorStop(0.25, currentPalette.moderateRain)
    gradient.addColorStop(0.5, currentPalette.heavyRain)
    gradient.addColorStop(0.75, currentPalette.severeRain)
    gradient.addColorStop(1, currentPalette.extremeRain)
    
    ctx.fillStyle = gradient
    ctx.fillRect(scaleX, legendY + 10, scaleWidth, scaleHeight)
    
    // Draw scale labels
    renderPixelText(ctx, 'LIGHT', scaleX, legendY + 30, currentPalette.text, 1)
    renderPixelText(ctx, 'HEAVY', scaleX + scaleWidth, legendY + 30, currentPalette.text, 1)
  }

  // Enhanced zoom controls
  const handleZoomIn = () => {
    if (zoomLevel === 'wide') setZoomLevel('regional')
    else if (zoomLevel === 'regional') setZoomLevel('city')
  }

  const handleZoomOut = () => {
    if (zoomLevel === 'city') setZoomLevel('regional')
    else if (zoomLevel === 'regional') setZoomLevel('wide')
  }

  // Pan controls for exploring nearby areas
  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const panStep = 2
    setPanOffset(prev => {
      const newOffset = { ...prev }
      switch (direction) {
        case 'up': newOffset.y = Math.max(-8, prev.y - panStep); break
        case 'down': newOffset.y = Math.min(8, prev.y + panStep); break
        case 'left': newOffset.x = Math.max(-8, prev.x - panStep); break
        case 'right': newOffset.x = Math.min(8, prev.x + panStep); break
      }
      return newOffset
    })
  }

  // Reset to center location
  const handleRecenter = () => {
    setPanOffset({ x: 0, y: 0 })
  }

  // Client-side hydration check
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Fetch data only after hydration and when dependencies change
  useEffect(() => {
    if (isHydrated && apiKey && lat && lon) {
      fetchRadarData()
    }
  }, [lat, lon, apiKey, zoomLevel, isHydrated])

  // Render frame whenever current frame changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      renderRadarFrame()
    }
  }, [currentFrame, radarFrames, theme, zoomLevel, panOffset, isHydrated])

  // Blinking animation for city marker (only after hydration)
  useEffect(() => {
    if (!isHydrated) return
    
    const blinkInterval = setInterval(() => {
      setCityMarkerBlink(prev => !prev)
    }, 1000) // Blink every second
    
    return () => clearInterval(blinkInterval)
  }, [isHydrated])

  // Animation loop for radar playback (only after hydration)
  useEffect(() => {
    if (!isHydrated) return
    
    if (isPlaying && radarFrames.length > 0 && hasPrecipitation) {
      animationRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % radarFrames.length)
      }, 750) // 750ms per frame for smooth animation
    } else if (animationRef.current) {
      clearInterval(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [isPlaying, radarFrames.length, hasPrecipitation, isHydrated])

  const formatTime = (timestamp: number): string => {
    if (!isHydrated) return '00:00' // Consistent server-side render
    const date = new Date(timestamp * 1000)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Show loading state until hydrated
  if (!isHydrated) {
    return (
      <div className={`${themeClasses.cardBg} p-6 border-4 pixel-border relative`}
           style={{ 
             borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
             boxShadow: `0 0 20px ${theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF'}, inset 0 0 20px rgba(${theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF'.slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.1)`,
             background: `linear-gradient(135deg, ${theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'}, ${theme === 'dark' ? '#1a4a4a' : theme === 'miami' ? '#1a0040' : '#002244'})`
           }}>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-3 border-2 overflow-hidden"
                   style={{ borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF', background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000' }}>
                <div className="h-full"
                     style={{ background: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF', width: '50%' }}></div>
              </div>
            </div>
            <div className="text-sm font-mono uppercase tracking-wider"
                 style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>
              LOADING RADAR
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className={`${themeClasses.cardBg} p-6 border-4 pixel-border relative w-full`}
           style={{ 
             borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
             boxShadow: `0 0 20px ${theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF'}, inset 0 0 20px rgba(${theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF'.slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.1)`,
             background: `linear-gradient(135deg, ${theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'}, ${theme === 'dark' ? '#1a4a4a' : theme === 'miami' ? '#1a0040' : '#002244'})`
           }}>
        
        {/* Enhanced 16-bit Header without version */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 animate-pulse" style={{ backgroundColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF' }}></div>
              <h3 className="text-lg font-bold uppercase tracking-wider font-mono"
                  style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF', textShadow: `0 0 8px ${theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF'}` }}>
                DOPPLER RADAR
              </h3>
            </div>
            
            {/* Removed theme selector - auto-matches app theme */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchRadarData()}
                disabled={isLoading}
                className="flex items-center space-x-1 px-2 py-1 text-xs font-mono border-2"
                style={{ 
                  borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                  color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF',
                  background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                }}
              >
                <RotateCcw className="w-3 h-3" />
                <span>SCAN</span>
              </button>
            </div>
          </div>
          
          {/* Enhanced Location and Zoom Info - Centered with 24hr Rainfall */}
          <div className="flex items-center justify-center text-xs font-mono uppercase tracking-wider mb-2">
            <div className="text-center">
              <div style={{ color: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff007f' : '#00FFFF' }}>
                LOCATION: {locationName || `${lat.toFixed(2)}°N ${Math.abs(lon).toFixed(2)}°${lon < 0 ? 'W' : 'E'}`}
              </div>
              <div style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }} className="mt-1">
                24HR RAIN: {rainfall24h.toFixed(2)} IN • ZOOM: {zoomLevel.toUpperCase()} ({ZOOM_RANGES[zoomLevel]}KM)
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-3 border-2 overflow-hidden"
                     style={{ borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF', background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000' }}>
                  <div className="h-full animate-pulse"
                       style={{ background: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF', width: '70%' }}></div>
                </div>
              </div>
              <div className="text-sm font-mono uppercase tracking-wider"
                   style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>
                INITIALIZING RADAR
              </div>
              <div className="text-xs font-mono mt-1"
                   style={{ color: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff007f' : '#00FFFF' }}>
                ████████████▓▓░░ 75%
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center p-4 border-2"
               style={{ borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF', background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000' }}>
            <div className="text-sm font-mono font-bold" style={{ color: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff007f' : '#00FFFF' }}>
              ⚠ RADAR OFFLINE
            </div>
            <div className="text-xs font-mono mt-1" style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>
              {error}
            </div>
            <div className="flex justify-center mt-2">
              <button
                onClick={() => fetchRadarData()}
                className="px-3 py-1 border-2 text-xs font-mono"
                style={{ 
                  borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                  color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF',
                  background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                }}
              >
                RETRY SCAN
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Radar Display with Side Info Panel */}
        {!isLoading && !error && radarFrames.length > 0 && (
          <div>
            {/* No Precipitation Message */}
            {!hasPrecipitation && (
              <div className="text-center mb-4 p-3 border-2"
                   style={{ 
                     borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                     background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000',
                     color: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff007f' : '#00FFFF'
                   }}>
                <div className="text-sm font-mono font-bold uppercase tracking-wider">
                  ✓ NO PRECIPITATION DETECTED
                </div>
                <div className="text-xs font-mono mt-1" style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>
                  CLEAR CONDITIONS IN {ZOOM_RANGES[zoomLevel]}KM RANGE
                </div>
              </div>
            )}

            <div className="flex items-start justify-center space-x-6">
              {/* Left Panel - Enhanced Radar Canvas - Centered */}
              <div className="relative">
                {/* Zoom Controls */}
                <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel === 'city'}
                    className="w-8 h-8 border-2 flex items-center justify-center text-xs font-mono font-bold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                      color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF',
                      background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000',
                      opacity: zoomLevel === 'city' ? 0.5 : 1
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel === 'wide'}
                    className="w-8 h-8 border-2 flex items-center justify-center text-xs font-mono font-bold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                      color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF',
                      background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000',
                      opacity: zoomLevel === 'wide' ? 0.5 : 1
                    }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                {/* Pan Controls */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="grid grid-cols-3 gap-1">
                    <div></div>
                    <button
                      onClick={() => handlePan('up')}
                      className="w-6 h-6 border-2 flex items-center justify-center"
                      style={{ 
                        borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                        color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF',
                        background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                      }}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <div></div>
                    
                    <button
                      onClick={() => handlePan('left')}
                      className="w-6 h-6 border-2 flex items-center justify-center"
                      style={{ 
                        borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                        color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF',
                        background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                      }}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleRecenter}
                      className="w-6 h-6 border-2 flex items-center justify-center text-xs font-mono font-bold"
                      style={{ 
                        borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                        color: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff007f' : '#00FFFF',
                        background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                      }}
                    >
                      ●
                    </button>
                    <button
                      onClick={() => handlePan('right')}
                      className="w-6 h-6 border-2 flex items-center justify-center"
                      style={{ 
                        borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                        color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF',
                        background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                      }}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    
                    <div></div>
                    <button
                      onClick={() => handlePan('down')}
                      className="w-6 h-6 border-2 flex items-center justify-center"
                      style={{ 
                        borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                        color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF',
                        background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                      }}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <div></div>
                  </div>
                </div>

                {/* Clean Radar Canvas - Larger and more prominent */}
                <div className="border-4 p-4 relative"
                     style={{ 
                       borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                       background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000',
                       boxShadow: `inset 0 0 20px ${theme === 'dark' ? '#1a4a4a' : theme === 'miami' ? '#1a0040' : '#002244'}`
                     }}>
                  <canvas
                    ref={canvasRef}
                    width={GRID_SIZE * PIXEL_SIZE}
                    height={GRID_SIZE * PIXEL_SIZE}
                    className="block"
                    style={{ 
                      imageRendering: "pixelated",
                      width: `${GRID_SIZE * PIXEL_SIZE}px`,
                      height: `${GRID_SIZE * PIXEL_SIZE}px`,
                      filter: 'contrast(1.15) brightness(1.1)'
                    }}
                  />
                  
                  {/* Enhanced corner brackets */}
                  <div className="absolute top-1 left-1 w-6 h-6 border-l-2 border-t-2"
                       style={{ borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF' }}></div>
                  <div className="absolute top-1 right-1 w-6 h-6 border-r-2 border-t-2"
                       style={{ borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF' }}></div>
                  <div className="absolute bottom-1 left-1 w-6 h-6 border-l-2 border-b-2"
                       style={{ borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF' }}></div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 border-r-2 border-b-2"
                       style={{ borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF' }}></div>
                </div>
              </div>
              
              {/* Right Panel - Enhanced Radar Info */}
              <div className="flex flex-col space-y-3 min-w-[180px]">
                {/* Radar Status */}
                <div className="border-2 p-3"
                     style={{ 
                       borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                       background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                     }}>
                  <div className="text-sm font-mono font-bold mb-2"
                       style={{ color: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff007f' : '#00FFFF' }}>
                    RADAR STATUS
                  </div>
                  <div className="text-xs font-mono space-y-1"
                       style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>
                    <div>{hasPrecipitation ? 'PRECIPITATION DETECTED' : 'CLEAR CONDITIONS'}</div>
                    <div>SYSTEM: ONLINE</div>
                    <div>TIME: {formatTime(Date.now() / 1000)}</div>
                  </div>
                </div>

                {/* View Settings */}
                <div className="border-2 p-3"
                     style={{ 
                       borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                       background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                     }}>
                  <div className="text-sm font-mono font-bold mb-2"
                       style={{ color: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff007f' : '#00FFFF' }}>
                    VIEW SETTINGS
                  </div>
                  <div className="text-xs font-mono space-y-1"
                       style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>
                    <div>RANGE: {ZOOM_RANGES[zoomLevel]}KM</div>
                    <div>ZOOM: {zoomLevel.toUpperCase()}</div>
                    <div>PAN: {panOffset.x !== 0 || panOffset.y !== 0 ? `${panOffset.x},${panOffset.y}` : 'CENTER'}</div>
                  </div>
                </div>

                {/* Animation Control */}
                <div className="border-2 p-3"
                     style={{ 
                       borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                       background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                     }}>
                  <div className="text-sm font-mono font-bold mb-2"
                       style={{ color: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff007f' : '#00FFFF' }}>
                    ANIMATION
                  </div>
                  <div className="text-xs font-mono space-y-1"
                       style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>
                    <div>FRAME: {currentFrame + 1}/{radarFrames.length}</div>
                    <div>TIME: {formatTime(radarFrames[currentFrame]?.timestamp || 0)}</div>
                    <div>MODE: {isPlaying ? 'PLAYING' : 'PAUSED'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Intensity Scale - Under Radar */}
            <div className="flex justify-center mt-3">
              <div className="border-2 p-2 flex items-center space-x-4"
                   style={{ 
                     borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                     background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                   }}>
                <div className="text-xs font-mono font-bold mr-2"
                     style={{ color: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff007f' : '#00FFFF' }}>
                  INTENSITY:
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border" 
                       style={{ 
                         backgroundColor: theme === 'dark' ? '#336699' : theme === 'miami' ? '#ff69b4' : '#0088BB', 
                         borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF' 
                       }}></div>
                  <span className="text-xs font-mono" style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>LIGHT</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border" 
                       style={{ 
                         backgroundColor: theme === 'dark' ? '#5599bb' : theme === 'miami' ? '#ff1493' : '#00AADD', 
                         borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF' 
                       }}></div>
                  <span className="text-xs font-mono" style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>MODERATE</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border" 
                       style={{ 
                         backgroundColor: theme === 'dark' ? '#77bbdd' : theme === 'miami' ? '#ff007f' : '#00CCFF', 
                         borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF' 
                       }}></div>
                  <span className="text-xs font-mono" style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>HEAVY</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border" 
                       style={{ 
                         backgroundColor: theme === 'dark' ? '#99ddff' : theme === 'miami' ? '#ff0066' : '#00FFFF', 
                         borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF' 
                       }}></div>
                  <span className="text-xs font-mono" style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>SEVERE</span>
                </div>

                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border" 
                       style={{ 
                         backgroundColor: theme === 'dark' ? '#6a7a7a' : theme === 'miami' ? '#40e0d0' : '#FF6600', 
                         borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF' 
                       }}></div>
                  <span className="text-xs font-mono" style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>SNOW</span>
                </div>
              </div>
            </div>

            {/* Enhanced Controls - Bottom */}
            <div className="flex items-center justify-center mt-3">
              <div className="flex items-center space-x-3">
                {hasPrecipitation && (
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-3 py-1 border-2 text-xs font-mono"
                    style={{ 
                      borderColor: theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF',
                      color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF',
                      background: theme === 'dark' ? '#0f0f0f' : theme === 'miami' ? '#0a0025' : '#000000'
                    }}
                  >
                    {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                  </button>
                )}
                
                <div className="text-xs font-mono" style={{ color: theme === 'dark' ? '#e0e0e0' : theme === 'miami' ? '#00ffff' : '#FFFFFF' }}>
                  ENHANCED MODE • {radarFrames.length} FRAMES
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 