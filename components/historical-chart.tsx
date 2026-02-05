"use client"

/**
 * 16-Bit Weather Platform - v1.0.0
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


import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { fetchHistoricalData, HistoricalWeatherResponse } from '@/lib/cache'
import { ThemeType, getComponentStyles } from '@/lib/theme-utils'
import { THEME_DEFINITIONS } from '@/lib/theme-config'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface HistoricalChartProps {
  currentTheme: ThemeType
  latitude: number
  longitude: number
  locationName: string
}

export default function HistoricalChart({ currentTheme, latitude, longitude, locationName }: HistoricalChartProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalWeatherResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Use centralized theme classes
  const themeClasses = getComponentStyles(currentTheme, 'weather')

  // Get theme colors from definitions
  const themeColors = THEME_DEFINITIONS[currentTheme]?.colors || THEME_DEFINITIONS.dark.colors

  // Fetch historical data for the last 30 years
  useEffect(() => {
    const loadHistoricalData = async () => {
      if (!latitude || !longitude) return

      setLoading(true)
      setError("")

      try {
        const data = await fetchHistoricalData(latitude, longitude)
        setHistoricalData(data)
      } catch (err) {
        setError('Historical data unavailable')
        console.warn('Historical data fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHistoricalData()
  }, [latitude, longitude])

  if (loading) {
    return (
      <div className={`p-4 ${themeClasses.cardBg} border-0 rounded-lg ${themeClasses.glow}`}>
        <div className={`text-center ${themeClasses.text}`}>Loading historical data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 ${themeClasses.cardBg} border-0 rounded-lg ${themeClasses.glow}`}>
        <div className={`text-center ${themeClasses.warningText}`}>{error}</div>
      </div>
    )
  }

  if (!historicalData || !historicalData.daily || !historicalData.daily.time || !historicalData.daily.temperature_2m_max || !historicalData.daily.temperature_2m_min) {
    return null
  }

  // Prepare chart data
  const years = historicalData.daily.time.map(date => new Date(date).getFullYear())
  const maxTemps = historicalData.daily.temperature_2m_max
  const minTemps = historicalData.daily.temperature_2m_min

  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'High Temperature',
        data: maxTemps,
        borderColor: themeColors.primary,
        backgroundColor: `${themeColors.primary}1A`,
        tension: 0.4
      },
      {
        label: 'Low Temperature',
        data: minTemps,
        borderColor: themeColors.accent,
        backgroundColor: `${themeColors.accent}1A`,
        tension: 0.4
      }
    ]
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: themeColors.text,
          font: {
            family: 'monospace'
          }
        }
      },
      title: {
        display: true,
        text: `30-Year Temperature History for ${locationName}`,
        color: themeColors.primary,
        font: {
          family: 'monospace',
          size: 16
        }
      },
      tooltip: {
        backgroundColor: themeColors.backgroundSecondary,
        titleColor: themeColors.text,
        bodyColor: themeColors.text,
        borderColor: themeColors.primary,
        borderWidth: 1,
        padding: 10,
        titleFont: {
          family: 'monospace'
        },
        bodyFont: {
          family: 'monospace'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: `${themeColors.primary}1A`
        },
        ticks: {
          color: themeColors.text,
          font: {
            family: 'monospace'
          }
        }
      },
      y: {
        grid: {
          color: `${themeColors.primary}1A`
        },
        ticks: {
          color: themeColors.text,
          font: {
            family: 'monospace'
          }
        }
      }
    }
  }

  return (
    <div className={`p-4 ${themeClasses.cardBg} border-0 rounded-lg ${themeClasses.glow}`}>
      <div className="h-[400px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}