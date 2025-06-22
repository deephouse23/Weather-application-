"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export type Theme = "dark" | "miami" | "tron"

type Attribute = "class" | "data-theme"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  enableSystem?: boolean
  storageKey?: string
  themes?: string[]
  attribute?: Attribute | Attribute[]
}

const ThemeContext = React.createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>("dark")

  const toggleTheme = React.useCallback(() => {
    setTheme((prevTheme) => {
      switch (prevTheme) {
        case "dark":
          return "miami"
        case "miami":
          return "tron"
        case "tron":
          return "dark"
        default:
          return "dark"
      }
    })
  }, [])

  React.useEffect(() => {
    const storedTheme = localStorage.getItem("weather-edu-theme") as Theme
    if (storedTheme && ["dark", "miami", "tron"].includes(storedTheme)) {
      setTheme(storedTheme)
    }
  }, [])

  React.useEffect(() => {
    localStorage.setItem("weather-edu-theme", theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 