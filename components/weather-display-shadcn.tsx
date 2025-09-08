"use client"

/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Thermometer, Wind, Droplets, Eye, Gauge } from "lucide-react"

type ThemeType = 'dark' | 'miami' | 'tron'

interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  feelsLike: number
  pressure: number
  visibility: number
  uvIndex?: number
  unit: string
}

interface WeatherDisplayProps {
  weatherData: WeatherData
  theme?: ThemeType
  isLoading?: boolean
}

export default function WeatherDisplayShadcn({ 
  weatherData, 
  theme = 'dark',
  isLoading = false 
}: WeatherDisplayProps) {
  
  const getThemeClasses = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          iconColor: 'text-[#00d4ff]',
          valueColor: 'text-[#4ecdc4]',
          labelColor: 'text-[#e0e0e0]',
          badgeVariant: 'default' as const
        }
      case 'miami':
        return {
          iconColor: 'text-[#ff1493]',
          valueColor: 'text-[#00ffff]',
          labelColor: 'text-[#ff69b4]',
          badgeVariant: 'secondary' as const
        }
      case 'tron':
        return {
          iconColor: 'text-[#00FFFF]',
          valueColor: 'text-[#FFFFFF]',
          labelColor: 'text-[#88CCFF]',
          badgeVariant: 'outline' as const
        }
    }
  }

  const themeClasses = getThemeClasses(theme)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Skeleton className="h-20 w-32 mx-auto" />
            <Skeleton className="h-6 w-24 mx-auto" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const tempUnit = weatherData.unit === '°C' ? '°C' : '°F'
  const windUnit = weatherData.unit === '°C' ? 'km/h' : 'mph'
  const visibilityUnit = weatherData.unit === '°C' ? 'km' : 'mi'

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b-2">
        <CardTitle className="text-center uppercase tracking-wider">
          Current Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Main Temperature Display */}
        <div className="text-center space-y-2">
          <div className={cn(
            "text-6xl font-bold font-mono",
            themeClasses.valueColor
          )}>
            {Math.round(weatherData.temperature)}{tempUnit}
          </div>
          <Badge variant={themeClasses.badgeVariant} className="text-lg px-3 py-1">
            {weatherData.condition}
          </Badge>
          <p className={cn("text-sm", themeClasses.labelColor)}>
            {weatherData.description}
          </p>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <WeatherDetailCard
            icon={<Thermometer className={cn("w-5 h-5", themeClasses.iconColor)} />}
            label="Feels Like"
            value={`${Math.round(weatherData.feelsLike)}${tempUnit}`}
            theme={theme}
          />
          <WeatherDetailCard
            icon={<Droplets className={cn("w-5 h-5", themeClasses.iconColor)} />}
            label="Humidity"
            value={`${weatherData.humidity}%`}
            theme={theme}
          />
          <WeatherDetailCard
            icon={<Wind className={cn("w-5 h-5", themeClasses.iconColor)} />}
            label="Wind Speed"
            value={`${weatherData.windSpeed} ${windUnit}`}
            theme={theme}
          />
          <WeatherDetailCard
            icon={<Gauge className={cn("w-5 h-5", themeClasses.iconColor)} />}
            label="Pressure"
            value={`${weatherData.pressure} hPa`}
            theme={theme}
          />
          <WeatherDetailCard
            icon={<Eye className={cn("w-5 h-5", themeClasses.iconColor)} />}
            label="Visibility"
            value={`${weatherData.visibility} ${visibilityUnit}`}
            theme={theme}
          />
          {weatherData.uvIndex !== undefined && (
            <WeatherDetailCard
              icon={
                <div className={cn("text-sm font-bold", themeClasses.iconColor)}>
                  UV
                </div>
              }
              label="UV Index"
              value={weatherData.uvIndex.toString()}
              theme={theme}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function WeatherDetailCard({ 
  icon, 
  label, 
  value, 
  theme 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  theme: ThemeType
}) {
  const getThemeClasses = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          valueColor: 'text-[#4ecdc4]',
          labelColor: 'text-[#a0a0a0]'
        }
      case 'miami':
        return {
          valueColor: 'text-[#00ffff]',
          labelColor: 'text-[#ff69b4]'
        }
      case 'tron':
        return {
          valueColor: 'text-[#FFFFFF]',
          labelColor: 'text-[#88CCFF]'
        }
    }
  }

  const themeClasses = getThemeClasses(theme)

  return (
    <Card className="p-3 border">
      <div className="flex items-center justify-between mb-1">
        {icon}
        <span className={cn(
          "text-xs uppercase font-mono",
          themeClasses.labelColor
        )}>
          {label}
        </span>
      </div>
      <div className={cn(
        "text-lg font-bold font-mono",
        themeClasses.valueColor
      )}>
        {value}
      </div>
    </Card>
  )
}