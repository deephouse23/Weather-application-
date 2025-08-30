"use client"

import { Suspense } from "react"
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

  return (
    <div className="space-y-6">
      {/* News Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`border-2 p-4 ${themeClasses.borderColor} ${themeClasses.background}`}>
          <h2 className={`text-lg font-bold font-mono mb-3 ${themeClasses.accentText}`}>WEATHER ALERTS</h2>
          <div className="space-y-2">
            <div className={`text-sm font-mono ${themeClasses.text}`}>{`•`} Severe thunderstorm watch</div>
            <div className={`text-sm font-mono ${themeClasses.text}`}>{`•`} Heat advisory in effect</div>
            <div className={`text-sm font-mono ${themeClasses.text}`}>{`•`} Flash flood warning</div>
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
            <div className={`text-sm font-mono ${themeClasses.text}`}>{`•`} Temperature records</div>
            <div className={`text-sm font-mono ${themeClasses.text}`}>{`•`} Seasonal forecasts</div>
            <div className={`text-sm font-mono ${themeClasses.text}`}>{`•`} Research updates</div>
          </div>
        </div>
      </div>

      {/* Main News Feed */}
      <div className={`border-2 p-6 ${themeClasses.borderColor} ${themeClasses.background}`}>
        <h2 className={`text-xl font-bold font-mono mb-4 ${themeClasses.accentText}`}>LATEST HEADLINES</h2>
        <div className="space-y-3">
          <div className={`text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} cursor-pointer transition-colors`}>
            {`>`} Record-breaking heat wave sweeps across southwestern United States
          </div>
          <div className={`text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} cursor-pointer transition-colors`}>
            {`>`} Hurricane season outlook: Above-normal activity predicted
          </div>
          <div className={`text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} cursor-pointer transition-colors`}>
            {`>`} New radar technology improves tornado detection accuracy
          </div>
          <div className={`text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} cursor-pointer transition-colors`}>
            {`>`} Climate research reveals changing precipitation patterns
          </div>
          <div className={`text-sm font-mono ${themeClasses.text} hover:${themeClasses.accentText} cursor-pointer transition-colors`}>
            {`>`} Air quality improvements noted in major metropolitan areas
          </div>
        </div>
      </div>

      {/* News Footer */}
      <div className={`text-center text-xs font-mono ${themeClasses.text} opacity-60`}>
        NEWS UPDATES EVERY 5 MINUTES • POWERED BY 16-BIT WEATHER
      </div>
    </div>
  )
}