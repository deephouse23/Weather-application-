"use client"

import { Suspense } from "react"
import PageWrapper from "@/components/page-wrapper"
import { useTheme } from "@/components/theme-provider"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"
import { useNewsFeed } from "@/lib/hooks/useNewsFeed"

export default function NewsPage() {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'navigation')

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className={`border-4 p-6 ${themeClasses.borderColor} ${themeClasses.background}`}>
          {/* News Page Header */}
          <div className="mb-8 text-center">
            <h1 className={`text-3xl font-bold font-mono uppercase tracking-wider mb-2 ${themeClasses.text} ${themeClasses.glow}`}>
              16-BIT NEWS
            </h1>
            <p className={`text-sm font-mono ${themeClasses.text} opacity-80`}>
              LATEST WEATHER & ENVIRONMENTAL UPDATES
            </p>
          </div>

          {/* News Content */}
          <Suspense 
            fallback={
              <div className={`text-center py-8 ${themeClasses.text}`}>
                <div className="animate-pulse">LOADING NEWS...</div>
              </div>
            }
          >
            <NewsContent />
          </Suspense>
        </div>
      </div>
    </PageWrapper>
  )
}

function NewsContent() {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'navigation')
  
  // Fetch real news data
  const { news, loading, error, refresh } = useNewsFeed({
    categories: ['weather'],
    maxItems: 10,
    priority: 'all',
    autoRefresh: 300000,
    enabled: true
  })

  return (
    <div className="space-y-6">
      {/* News Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`border-2 p-4 ${themeClasses.borderColor} ${themeClasses.background}`}>
          <h2 className={`text-lg font-bold font-mono mb-3 ${themeClasses.accentText}`}>WEATHER ALERTS</h2>
          <div className="space-y-2">
            <a 
              href="https://www.weather.gov/alerts"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} block transition-colors`}
            >
              {`•`} Severe thunderstorm watch
            </a>
            <a 
              href="https://www.weather.gov/safety/heat"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} block transition-colors`}
            >
              {`•`} Heat advisory in effect
            </a>
            <a 
              href="https://www.weather.gov/safety/flood"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} block transition-colors`}
            >
              {`•`} Flash flood warning
            </a>
          </div>
        </div>

        <div className={`border-2 p-4 ${themeClasses.borderColor} ${themeClasses.background}`}>
          <h2 className={`text-lg font-bold font-mono mb-3 ${themeClasses.accentText}`}>ENVIRONMENTAL</h2>
          <div className="space-y-2">
            <div className={`text-sm font-mono ${themeClasses.text}`}>{`•`} Air quality updates</div>
            <div className={`text-sm font-mono ${themeClasses.text}`}>{`•`} Pollen forecasts</div>
            <div className={`text-sm font-mono ${themeClasses.text}`}>{`•`} UV index warnings</div>
          </div>
        </div>

        <div className={`border-2 p-4 ${themeClasses.borderColor} ${themeClasses.background}`}>
          <h2 className={`text-lg font-bold font-mono mb-3 ${themeClasses.accentText}`}>CLIMATE</h2>
          <div className="space-y-2">
            <a 
              href="https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} block transition-colors`}
            >
              {`•`} Temperature records
            </a>
            <a 
              href="https://www.cpc.ncep.noaa.gov/products/predictions/long_range/"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} block transition-colors`}
            >
              {`•`} Seasonal forecasts
            </a>
            <a 
              href="https://climate.nasa.gov/news/"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} block transition-colors`}
            >
              {`•`} Research updates
            </a>
          </div>
        </div>
      </div>

      {/* Main News Feed */}
      <div className={`border-2 p-6 ${themeClasses.borderColor} ${themeClasses.background}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold font-mono ${themeClasses.accentText}`}>LATEST HEADLINES</h2>
          <button
            onClick={refresh}
            disabled={loading}
            className={`text-xs font-mono px-2 py-1 border ${themeClasses.borderColor} ${themeClasses.text} hover:${themeClasses.accentText} transition-colors`}
          >
            {loading ? 'LOADING...' : 'REFRESH'}
          </button>
        </div>
        
        <div className="space-y-3">
          {loading && news.length === 0 ? (
            <div className={`text-center py-4 ${themeClasses.text}`}>
              Loading weather news...
            </div>
          ) : error ? (
            <div className={`text-center py-4 ${themeClasses.text} opacity-60`}>
              Unable to load news. Please try again later.
            </div>
          ) : news.length === 0 ? (
            <div className={`text-center py-4 ${themeClasses.text} opacity-60`}>
              No weather news available at this time.
            </div>
          ) : (
            news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} transition-colors group`}
              >
                <span className="inline-block mr-2">{`>`}</span>
                <span className="group-hover:underline">{item.title}</span>
                <span className={`ml-2 text-xs opacity-60`}>({item.source})</span>
              </a>
            ))
          )}
        </div>
      </div>

      {/* News Footer */}
      <div className={`text-center text-xs font-mono ${themeClasses.text} opacity-60`}>
        NEWS UPDATES EVERY 5 MINUTES • POWERED BY 16-BIT WEATHER
      </div>
    </div>
  )
}