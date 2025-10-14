"use client"

import dynamic from 'next/dynamic'
import { Loader2 } from "lucide-react"
import type { HourlyForecastData } from './hourly-forecast'
import type { ThemeType } from '@/lib/theme-utils'

const HourlyForecast = dynamic(() => import('./hourly-forecast'), {
  loading: () => (
    <div className="flex items-center justify-center p-8 bg-[#16213e] border-4 border-[#00d4ff] rounded-none">
      <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
      <span className="ml-3 text-[#00d4ff]">Loading hourly forecast...</span>
    </div>
  ),
  ssr: false
})

interface LazyHourlyForecastProps {
  hourly: HourlyForecastData[];
  theme?: ThemeType;
  tempUnit?: string;
}

export default function LazyHourlyForecast(props: LazyHourlyForecastProps) {
  return <HourlyForecast {...props} />
}
