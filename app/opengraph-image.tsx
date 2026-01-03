import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '16 Bit Weather - Retro Terminal Weather App'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Glow effect circle */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
          }}
        />

        {/* Top border accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #00d4ff, #ff00ff, #00d4ff, transparent)',
          }}
        />

        {/* Main title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Weather icons */}
          <div
            style={{
              fontSize: '60px',
              display: 'flex',
              gap: '20px',
            }}
          >
            <span>☀️</span>
            <span>🌧️</span>
            <span>⛈️</span>
            <span>❄️</span>
          </div>

          {/* Logo text */}
          <div
            style={{
              fontSize: '80px',
              fontWeight: 'bold',
              color: '#00d4ff',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              textShadow: '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.3)',
            }}
          >
            16 BIT WEATHER
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '28px',
              color: '#ffffff',
              letterSpacing: '6px',
              textTransform: 'uppercase',
            }}
          >
            Retro Terminal Weather Forecast
          </div>

          {/* Decorative line */}
          <div
            style={{
              width: '400px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #ff00ff, transparent)',
              marginTop: '10px',
            }}
          />

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginTop: '20px',
              fontSize: '18px',
              color: '#888888',
              letterSpacing: '2px',
            }}
          >
            <span>RADAR</span>
            <span>•</span>
            <span>FORECASTS</span>
            <span>•</span>
            <span>EDUCATION</span>
            <span>•</span>
            <span>GAMES</span>
          </div>
        </div>

        {/* Bottom border accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #ff00ff, #00d4ff, #ff00ff, transparent)',
          }}
        />

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: '20px',
            color: '#00d4ff',
            letterSpacing: '4px',
          }}
        >
          16BITWEATHER.CO
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
