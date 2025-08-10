"use client"

/**
 * 16-Bit Weather Platform - BETA v0.3.2
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */


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
      {theme === "tron" && <Zap className="h-5 w-5 text-cyan-500" />}
    </button>
  )
} 