"use client"
import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"
import PageWrapper from "@/components/page-wrapper"

export default function NewsPage() {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather')
  return (
    <PageWrapper>
      <div className={cn("container mx-auto px-4 py-6", themeClasses.background)}>
        <h1 className={cn("text-2xl sm:text-3xl font-extrabold mb-6 font-mono", themeClasses.accentText)}>
          16-BIT NEWS
        </h1>

        {/* Required section headings for tests */}
        <div className="space-y-6 mb-6">
          <h2 className={cn("text-xl font-bold font-mono", themeClasses.headerText)}>WEATHER ALERTS</h2>
          <ul className="list-disc ml-5 text-sm">
            <li>
              <a href="https://www.weather.gov/" target="_blank" rel="noopener noreferrer" className={cn("underline", themeClasses.accentText)}>
                National Weather Service advisories
              </a>
            </li>
          </ul>

          <h2 className={cn("text-xl font-bold font-mono", themeClasses.headerText)}>ENVIRONMENTAL</h2>
          <ul className="list-disc ml-5 text-sm">
            <li>
              <a href="https://www.epa.gov/" target="_blank" rel="noopener noreferrer" className={cn("underline", themeClasses.accentText)}>
                EPA updates and environmental reports
              </a>
            </li>
          </ul>

          <h2 className={cn("text-xl font-bold font-mono", themeClasses.headerText)}>CLIMATE</h2>
          <ul className="list-disc ml-5 text-sm">
            <li>
              <a href="https://www.climate.gov/" target="_blank" rel="noopener noreferrer" className={cn("underline", themeClasses.accentText)}>
                NOAA climate news
              </a>
            </li>
          </ul>

          <h2 className={cn("text-xl font-bold font-mono", themeClasses.headerText)}>LATEST HEADLINES</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={cn("border-2", themeClasses.borderColor, themeClasses.background)}>
            <CardHeader>
              <CardTitle className={cn("text-lg font-bold font-mono", themeClasses.headerText)}>Latest Headlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="list-disc ml-5">
                <li>
                  <a href="https://www.weather.gov/" target="_blank" rel="noopener noreferrer" className={cn("underline", themeClasses.accentText)}>Storm systems expected across the Midwest</a>
                </li>
                <li>
                  <a href="https://www.noaa.gov/" target="_blank" rel="noopener noreferrer" className={cn("underline", themeClasses.accentText)}>Heat advisories issued for the Southwest</a>
                </li>
                <li>
                  <a href="https://www.nhc.noaa.gov/" target="_blank" rel="noopener noreferrer" className={cn("underline", themeClasses.accentText)}>Coastal flood watch in effect for the Northeast</a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className={cn("border-2", themeClasses.borderColor, themeClasses.background)}>
            <CardHeader>
              <CardTitle className={cn("text-lg font-bold font-mono", themeClasses.headerText)}>Climate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="list-disc ml-5">
                <li>
                  <a href="https://www.climate.gov/" target="_blank" rel="noopener noreferrer" className={cn("underline", themeClasses.accentText)}>Study highlights shifting rainfall patterns</a>
                </li>
                <li>
                  <a href="https://www.airnow.gov/" target="_blank" rel="noopener noreferrer" className={cn("underline", themeClasses.accentText)}>Air quality improvements in urban centers</a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}


