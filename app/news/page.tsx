import React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useThemeClasses } from "@/components/theme-provider"

export default function NewsPage() {
  const themeClasses = useThemeClasses()
  return (
    <main className={cn("container mx-auto px-4 py-6", themeClasses.background)}>
      <h1 className={cn("text-2xl sm:text-3xl font-extrabold mb-4 font-mono", themeClasses.accentText)}>
        16-BIT NEWS
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={cn("border-2", themeClasses.borderColor, themeClasses.background)}>
          <CardHeader>
            <CardTitle className={cn("text-lg font-bold font-mono", themeClasses.headerText)}>Latest Headlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="list-disc ml-5">
              <li>
                <Link href="/news" className={cn("underline", themeClasses.accentText)}>Storm systems expected across the Midwest</Link>
              </li>
              <li>
                <Link href="/news" className={cn("underline", themeClasses.accentText)}>Heat advisories issued for the Southwest</Link>
              </li>
              <li>
                <Link href="/news" className={cn("underline", themeClasses.accentText)}>Coastal flood watch in effect for the Northeast</Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className={cn("border-2", themeClasses.borderColor, themeClasses.background)}>
          <CardHeader>
            <CardTitle className={cn("text-lg font-bold font-mono", themeClasses.headerText)}>Climate & Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="list-disc ml-5">
              <li>
                <Link href="/news" className={cn("underline", themeClasses.accentText)}>Study highlights shifting rainfall patterns</Link>
              </li>
              <li>
                <Link href="/news" className={cn("underline", themeClasses.accentText)}>Air quality improvements in urban centers</Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}


