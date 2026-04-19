"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import WeatherIconModern from "@/components/weather-icon-modern"
import { ShareButton } from "@/components/share-weather-modal"
import { getHeroAccent } from "@/lib/weather/hero-utils"
import { ArrowDown, ArrowUp, Thermometer } from "lucide-react"

const HERO_CARD_BASE =
  "weather-card-enter border-0 border-l-4 border-l-primary shadow-md weather-metric-glow weather-card-gradient hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"

interface HeroWeatherCardProps {
  location: string
  temperature: number | null | undefined
  unit: string
  condition: string
  description: string
  highTemp?: number
  lowTemp?: number
  feelsLike: number | null
  feelsLikeDelta: number
  glowClass?: string
}

export function HeroWeatherCard({
  location,
  temperature,
  unit,
  condition,
  description,
  highTemp,
  lowTemp,
  feelsLike,
  feelsLikeDelta,
  glowClass,
}: HeroWeatherCardProps) {
  const accent = getHeroAccent(condition)
  const unitSymbol = unit === '°F' || unit === '°C' ? unit : `°${unit || 'F'}`
  const tempSuffix = unitSymbol.startsWith('°') ? unitSymbol : `°${unitSymbol}`

  return (
    <Card className={cn(HERO_CARD_BASE, accent, "relative overflow-hidden")}>
      <CardContent className="p-5 sm:p-7">
        <div className="grid gap-5 sm:gap-6 sm:grid-cols-[1fr_auto] items-center">
          {/* Left: identity + temperature */}
          <div className="min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-1.5">
              <h1
                className={cn(
                  "font-extrabold tracking-wider uppercase text-primary font-sans",
                  glowClass,
                )}
                style={{ fontSize: "clamp(18px, 3.2vw, 26px)" }}
              >
                {location} Weather
              </h1>
              {(highTemp !== undefined && lowTemp !== undefined) && (
                <ShareButton
                  weatherData={{
                    location,
                    temperature: temperature ?? 0,
                    unit,
                    condition,
                    highTemp: Math.round(highTemp),
                    lowTemp: Math.round(lowTemp),
                  }}
                  variant="button"
                />
              )}
            </div>

            <p
              data-testid="temperature-value"
              className="text-6xl sm:text-8xl font-bold tabular-nums tracking-tight font-mono leading-none text-foreground"
              style={{ fontSize: "clamp(56px, 11vw, 104px)" }}
            >
              {temperature ?? 'N/A'}
              {temperature != null ? tempSuffix.charAt(0) : ''}
            </p>

            <p className="mt-2 text-base sm:text-lg text-muted-foreground/90 leading-snug">
              <span className="capitalize">{condition || 'Unknown'}</span>
              {description ? <span className="text-muted-foreground/70"> — {description}</span> : null}
            </p>
          </div>

          {/* Right: icon + hi/lo/feels chips */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 sm:pr-2">
            <div className="drop-shadow-[0_4px_20px_rgba(var(--theme-accent-rgb),0.25)]">
              <WeatherIconModern condition={condition} size={88} className="sm:scale-110" />
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono">
              {highTemp !== undefined && (
                <HeroChip icon={<ArrowUp size={12} className="text-rose-300/90" />} label="HI" value={`${Math.round(highTemp)}°`} />
              )}
              {lowTemp !== undefined && (
                <HeroChip icon={<ArrowDown size={12} className="text-sky-300/90" />} label="LO" value={`${Math.round(lowTemp)}°`} />
              )}
              {feelsLike != null && (
                <HeroChip
                  icon={<Thermometer size={12} className="text-amber-300/90" />}
                  label="FEELS"
                  value={`${feelsLike}°${feelsLikeDelta !== 0 ? (feelsLikeDelta > 0 ? ' ↑' : ' ↓') : ''}`}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HeroChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md px-2 py-1 bg-card/60 border border-[var(--border-invisible)] backdrop-blur-sm">
      {icon}
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  )
}
