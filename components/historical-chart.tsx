"use client"

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
import { fetchHistoricalData } from '@/lib/cache'
import { HistoricalData } from '@/lib/types'
import { ThemeType, themeUtils, APP_CONSTANTS } from '@/lib/utils'

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
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Use centralized theme classes
  const themeClasses = themeUtils.getThemeClasses(currentTheme)

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
      <div className={`p-4 ${themeClasses.cardBg} border ${themeClasses.borderColor} rounded-lg ${themeClasses.glow}`}>
        <div className={`text-center ${themeClasses.text}`}>Loading historical data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 ${themeClasses.cardBg} border ${themeClasses.borderColor} rounded-lg ${themeClasses.glow}`}>
        <div className={`text-center ${themeClasses.errorText}`}>{error}</div>
      </div>
    )
  }

  if (!historicalData) {
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
        borderColor: '#00d4ff',
        backgroundColor: currentTheme === APP_CONSTANTS.THEMES.MIAMI ? 'rgba(255, 20, 147, 0.1)' : currentTheme === APP_CONSTANTS.THEMES.TRON ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 212, 255, 0.1)',
        tension: 0.4
      },
      {
        label: 'Low Temperature',
        data: minTemps,
        borderColor: '#00d4ff',
        backgroundColor: currentTheme === APP_CONSTANTS.THEMES.MIAMI ? 'rgba(0, 255, 255, 0.1)' : currentTheme === APP_CONSTANTS.THEMES.TRON ? 'rgba(136, 204, 255, 0.1)' : 'rgba(78, 205, 196, 0.1)',
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
          color: currentTheme === APP_CONSTANTS.THEMES.TRON ? '#FFFFFF' : '#e0e0e0',
          font: {
            family: 'monospace'
          }
        }
      },
      title: {
        display: true,
        text: `30-Year Temperature History for ${locationName}`,
        color: '#00d4ff',
        font: {
          family: 'monospace',
          size: 16
        }
      },
      tooltip: {
        backgroundColor: currentTheme === APP_CONSTANTS.THEMES.MIAMI ? '#4a0e4e' : currentTheme === APP_CONSTANTS.THEMES.TRON ? '#000000' : '#16213e',
        titleColor: currentTheme === APP_CONSTANTS.THEMES.TRON ? '#FFFFFF' : '#e0e0e0',
        bodyColor: currentTheme === APP_CONSTANTS.THEMES.TRON ? '#FFFFFF' : '#e0e0e0',
        borderColor: '#00d4ff',
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
          color: currentTheme === APP_CONSTANTS.THEMES.MIAMI ? 'rgba(255, 20, 147, 0.1)' : currentTheme === APP_CONSTANTS.THEMES.TRON ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 212, 255, 0.1)'
        },
        ticks: {
          color: currentTheme === APP_CONSTANTS.THEMES.TRON ? '#FFFFFF' : '#e0e0e0',
          font: {
            family: 'monospace'
          }
        }
      },
      y: {
        grid: {
          color: currentTheme === APP_CONSTANTS.THEMES.MIAMI ? 'rgba(255, 20, 147, 0.1)' : currentTheme === APP_CONSTANTS.THEMES.TRON ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 212, 255, 0.1)'
        },
        ticks: {
          color: currentTheme === APP_CONSTANTS.THEMES.TRON ? '#FFFFFF' : '#e0e0e0',
          font: {
            family: 'monospace'
          }
        }
      }
    }
  }

  return (
    <div className={`p-4 ${themeClasses.cardBg} border ${themeClasses.borderColor} rounded-lg ${themeClasses.glow}`}>
      <div className="h-[400px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  )
} 