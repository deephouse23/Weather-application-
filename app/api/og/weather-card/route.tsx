/**
 * 16-Bit Weather Platform - Weather Card OG Image Generator
 *
 * Generates shareable weather card images for social media.
 * Modern terminal aesthetic inspired by htop/lazygit.
 *
 * Usage: /api/og/weather-card?city=Portland&temp=72&condition=Partly+Cloudy&high=78&low=65&precip=20&unit=F
 */

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Weather condition to emoji mapping
function getWeatherEmoji(condition: string): string {
  const conditionLower = condition.toLowerCase()

  if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return '⛈️'
  }
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return '🌧️'
  }
  if (conditionLower.includes('snow') || conditionLower.includes('flurr')) {
    return '❄️'
  }
  if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
    return '🌫️'
  }
  if (conditionLower.includes('cloud') && conditionLower.includes('part')) {
    return '⛅'
  }
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return '☁️'
  }
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return '☀️'
  }
  if (conditionLower.includes('wind')) {
    return '💨'
  }

  return '🌤️'
}

// Format timestamp for display
function formatTimestamp(): string {
  const now = new Date()
  return now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Extract query parameters with defaults
  const city = searchParams.get('city') || 'Unknown Location'
  const temp = searchParams.get('temp') || '--'
  const condition = searchParams.get('condition') || 'Unknown'
  const high = searchParams.get('high') || '--'
  const low = searchParams.get('low') || '--'
  const precip = searchParams.get('precip') || '0'
  const unit = searchParams.get('unit')?.toUpperCase() === 'C' ? 'C' : 'F'

  const emoji = getWeatherEmoji(condition)
  const timestamp = formatTimestamp()

  // Modern terminal color palette (htop/lazygit style)
  const colors = {
    bg: '#0d1117', // GitHub dark background
    bgPanel: '#161b22', // Slightly lighter panel
    border: '#30363d', // Subtle border
    teal: '#58a6ff', // Primary accent (teal/blue)
    magenta: '#f778ba', // Secondary accent
    yellow: '#d29922', // Warm highlight
    green: '#3fb950', // Success/positive
    red: '#f85149', // Alert/negative
    text: '#e6edf3', // Primary text
    textMuted: '#8b949e', // Muted text
    textDim: '#484f58', // Dim text
  }

  const response = new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colors.bg,
          fontFamily: 'monospace',
          padding: '32px',
        }}
      >
        {/* Main container with border */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Header bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.bgPanel,
              borderBottom: `1px solid ${colors.border}`,
              padding: '16px 24px',
            }}
          >
            {/* Left: Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                style={{
                  color: colors.teal,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                }}
              >
                16bitweather.co
              </span>
              <span
                style={{
                  color: colors.textDim,
                  fontSize: '16px',
                }}
              >
                |
              </span>
              <span
                style={{
                  color: colors.textMuted,
                  fontSize: '16px',
                }}
              >
                Weather Report
              </span>
            </div>

            {/* Right: Timestamp */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  color: colors.textDim,
                  fontSize: '14px',
                }}
              >
                Generated:
              </span>
              <span
                style={{
                  color: colors.yellow,
                  fontSize: '14px',
                }}
              >
                {timestamp}
              </span>
            </div>
          </div>

          {/* Main content area */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              padding: '40px',
            }}
          >
            {/* Left column: Temperature and condition */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              {/* Location */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    color: colors.magenta,
                    fontSize: '18px',
                  }}
                >
                  [location]
                </span>
                <span
                  style={{
                    color: colors.text,
                    fontSize: '32px',
                    fontWeight: 'bold',
                  }}
                >
                  {city}
                </span>
              </div>

              {/* Large temperature display */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{
                    color: colors.text,
                    fontSize: '180px',
                    fontWeight: 'bold',
                    lineHeight: 1,
                    letterSpacing: '-8px',
                  }}
                >
                  {temp}
                </span>
                <span
                  style={{
                    color: colors.teal,
                    fontSize: '64px',
                    fontWeight: 'bold',
                    marginLeft: '8px',
                  }}
                >
                  °{unit}
                </span>
              </div>

              {/* Condition with emoji */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <span
                  style={{
                    fontSize: '48px',
                  }}
                >
                  {emoji}
                </span>
                <span
                  style={{
                    color: colors.textMuted,
                    fontSize: '28px',
                  }}
                >
                  {condition}
                </span>
              </div>
            </div>

            {/* Right column: Stats panel */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '320px',
                backgroundColor: colors.bgPanel,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                padding: '24px',
                justifyContent: 'center',
                gap: '24px',
              }}
            >
              {/* High/Low row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                {/* High */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      color: colors.textDim,
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginBottom: '4px',
                    }}
                  >
                    High
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                    }}
                  >
                    <span
                      style={{
                        color: colors.red,
                        fontSize: '36px',
                        fontWeight: 'bold',
                      }}
                    >
                      {high}
                    </span>
                    <span
                      style={{
                        color: colors.textMuted,
                        fontSize: '18px',
                      }}
                    >
                      °
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    width: '1px',
                    backgroundColor: colors.border,
                    margin: '0 16px',
                  }}
                />

                {/* Low */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      color: colors.textDim,
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginBottom: '4px',
                    }}
                  >
                    Low
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                    }}
                  >
                    <span
                      style={{
                        color: colors.teal,
                        fontSize: '36px',
                        fontWeight: 'bold',
                      }}
                    >
                      {low}
                    </span>
                    <span
                      style={{
                        color: colors.textMuted,
                        fontSize: '18px',
                      }}
                    >
                      °
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  backgroundColor: colors.border,
                }}
              />

              {/* Precipitation */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    color: colors.textDim,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '8px',
                  }}
                >
                  Precipitation
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '24px',
                    }}
                  >
                    💧
                  </span>
                  <span
                    style={{
                      color: colors.green,
                      fontSize: '36px',
                      fontWeight: 'bold',
                    }}
                  >
                    {precip}%
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  backgroundColor: colors.border,
                }}
              />

              {/* Unit indicator */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                }}
              >
                <span
                  style={{
                    color: unit === 'F' ? colors.yellow : colors.textDim,
                    fontSize: '18px',
                    fontWeight: unit === 'F' ? 'bold' : 'normal',
                    padding: '4px 12px',
                    backgroundColor: unit === 'F' ? `${colors.yellow}20` : 'transparent',
                    borderRadius: '4px',
                  }}
                >
                  °F
                </span>
                <span
                  style={{
                    color: unit === 'C' ? colors.yellow : colors.textDim,
                    fontSize: '18px',
                    fontWeight: unit === 'C' ? 'bold' : 'normal',
                    padding: '4px 12px',
                    backgroundColor: unit === 'C' ? `${colors.yellow}20` : 'transparent',
                    borderRadius: '4px',
                  }}
                >
                  °C
                </span>
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.bgPanel,
              borderTop: `1px solid ${colors.border}`,
              padding: '12px 24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <span
                style={{
                  color: colors.textDim,
                  fontSize: '14px',
                }}
              >
                Retro Terminal Weather
              </span>
              <span
                style={{
                  color: colors.textDim,
                  fontSize: '14px',
                }}
              >
                •
              </span>
              <span
                style={{
                  color: colors.textDim,
                  fontSize: '14px',
                }}
              >
                Powered by OpenWeatherMap
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  color: colors.green,
                  fontSize: '14px',
                }}
              >
                ●
              </span>
              <span
                style={{
                  color: colors.textMuted,
                  fontSize: '14px',
                }}
              >
                LIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )

  // Add cache headers for CDN caching
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=3600'
  )

  return response
}
