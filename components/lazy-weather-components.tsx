/**
 * Lazy-loaded weather components for better performance
 * Components load only when needed, improving initial page load times
 */

import { lazy, Suspense, Component, ReactNode } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Lazy load weather components with error handling
const Forecast = lazy(() => import('./forecast').catch(err => {
  console.error('Failed to load Forecast component:', err)
  return { default: () => <div className="text-red-500">Failed to load forecast</div> }
}))

const ForecastDetails = lazy(() => import('./forecast-details').catch(err => {
  console.error('Failed to load ForecastDetails component:', err)
  return { default: () => <div className="text-red-500">Failed to load forecast details</div> }
}))

const EnvironmentalDisplay = lazy(() => import('./environmental-display').catch(err => {
  console.error('Failed to load EnvironmentalDisplay component:', err)
  return { default: () => <div className="text-red-500">Failed to load environmental data</div> }
}))

// Loading spinner component
function WeatherComponentLoader({ theme }: { theme: 'dark' | 'miami' | 'tron' }) {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader2 className={cn(
        "h-8 w-8 animate-spin",
        theme === "dark" && "text-blue-500",
        theme === "miami" && "text-pink-500",
        theme === "tron" && "text-cyan-500"
      )} />
      <span className="ml-2 text-white text-sm">Loading weather data...</span>
    </div>
  )
}

// Error fallback component
function WeatherComponentError({ theme, error }: { theme: 'dark' | 'miami' | 'tron', error?: Error }) {
  return (
    <div className="flex justify-center items-center py-8">
      <AlertTriangle className={cn(
        "h-8 w-8",
        theme === "dark" && "text-red-500",
        theme === "miami" && "text-red-400",
        theme === "tron" && "text-red-400"
      )} />
      <span className="ml-2 text-white text-sm">Error loading weather component</span>
    </div>
  )
}

// Error boundary class component
class WeatherErrorBoundary extends Component<
  { children: ReactNode; theme: 'dark' | 'miami' | 'tron' },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; theme: 'dark' | 'miami' | 'tron' }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Weather component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <WeatherComponentError theme={this.props.theme} error={this.state.error} />
    }

    return this.props.children
  }
}

// Lazy wrapper components with fallback loading states and error boundaries
export function LazyForecast(props: any) {
  return (
    <WeatherErrorBoundary theme={props.theme}>
      <Suspense fallback={<WeatherComponentLoader theme={props.theme} />}>
        <Forecast {...props} />
      </Suspense>
    </WeatherErrorBoundary>
  )
}

export function LazyForecastDetails(props: any) {
  return (
    <WeatherErrorBoundary theme={props.theme}>
      <Suspense fallback={<WeatherComponentLoader theme={props.theme} />}>
        <ForecastDetails {...props} />
      </Suspense>
    </WeatherErrorBoundary>
  )
}

export function LazyEnvironmentalDisplay(props: any) {
  return (
    <WeatherErrorBoundary theme={props.theme}>
      <Suspense fallback={<WeatherComponentLoader theme={props.theme} />}>
        <EnvironmentalDisplay {...props} />
      </Suspense>
    </WeatherErrorBoundary>
  )
}