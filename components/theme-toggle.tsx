"use client"

import * as React from "react"
import { Moon, Sun, Zap } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" && <Moon className="h-5 w-5 text-blue-500" />}
      {theme === "miami" && <Sun className="h-5 w-5 text-pink-500" />}
      {theme === "tron" && <Zap className="h-5 w-5 text-[#00FFFF]" />}
    </button>
  )
} 