"use client"

import PageWrapper from "@/components/page-wrapper"
import { useTheme } from "@/components/theme-provider"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"

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
          <NewsContent />
        </div>
      </div>
    </PageWrapper>
  )
}

function NewsContent() {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'navigation')

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

      {/* Latest Headlines - Static for reliable navigation */}
      <div className={`border-2 p-6 ${themeClasses.borderColor} ${themeClasses.background}`}>
        <h2 className={`text-xl font-bold font-mono mb-4 ${themeClasses.accentText}`}>LATEST HEADLINES</h2>
        <div className="space-y-3">
          <a
            href="https://www.weather.gov/alerts"
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} transition-colors group`}
          >
            <span className="inline-block mr-2">{`>`}</span>
            <span className="group-hover:underline">Weather alerts and warnings from National Weather Service</span>
            <span className={`ml-2 text-xs opacity-60`}>(NOAA)</span>
          </a>
          <a
            href="https://www.nhc.noaa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} transition-colors group`}
          >
            <span className="inline-block mr-2">{`>`}</span>
            <span className="group-hover:underline">Hurricane and tropical storm updates</span>
            <span className={`ml-2 text-xs opacity-60`}>(National Hurricane Center)</span>
          </a>
          <a
            href="https://www.spc.noaa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} transition-colors group`}
          >
            <span className="inline-block mr-2">{`>`}</span>
            <span className="group-hover:underline">Severe weather forecasts and outlooks</span>
            <span className={`ml-2 text-xs opacity-60`}>(Storm Prediction Center)</span>
          </a>
          <a
            href="https://www.weather.com/news"
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} transition-colors group`}
          >
            <span className="inline-block mr-2">{`>`}</span>
            <span className="group-hover:underline">Latest weather news and analysis</span>
            <span className={`ml-2 text-xs opacity-60`}>(Weather.com)</span>
          </a>
          <a
            href="https://climate.nasa.gov/news/"
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} transition-colors group`}
          >
            <span className="inline-block mr-2">{`>`}</span>
            <span className="group-hover:underline">Climate science updates and research</span>
            <span className={`ml-2 text-xs opacity-60`}>(NASA Climate)</span>
          </a>
        </div>
      </div>

      {/* News Footer */}
      <div className={`text-center text-xs font-mono ${themeClasses.text} opacity-60`}>
        NEWS UPDATES EVERY 5 MINUTES • POWERED BY 16-BIT WEATHER
      </div>
    </div>
  )
}