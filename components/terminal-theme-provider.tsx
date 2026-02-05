"use client"

/**
 * 16-Bit Weather Platform - v1.0.0
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

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { safeStorage } from "@/lib/safe-storage"

// Types
export type TerminalPalette =
  | "terminal"
  | "dracula"
  | "nord"
  | "catppuccin"

// Storage keys
const PALETTE_STORAGE_KEY = "terminal-palette"

// Default values
const DEFAULT_PALETTE: TerminalPalette = "nord"

// Context type
interface TerminalThemeContextType {
  palette: TerminalPalette
  setPalette: (palette: TerminalPalette) => void
  isTerminalDesignEnabled: boolean
}

// Create context with undefined default
const TerminalThemeContext = createContext<TerminalThemeContextType | undefined>(
  undefined
)

// Valid palette values for type guard
const VALID_PALETTES: TerminalPalette[] = [
  "terminal",
  "dracula",
  "nord",
  "catppuccin",
]

function isValidPalette(value: string | null): value is TerminalPalette {
  return value !== null && VALID_PALETTES.includes(value as TerminalPalette)
}

interface TerminalThemeProviderProps {
  children: React.ReactNode
}

export function TerminalThemeProvider({ children }: TerminalThemeProviderProps) {
  // Check if terminal design is enabled via environment variable
  const isTerminalDesignEnabled =
    process.env.NEXT_PUBLIC_TERMINAL_DESIGN === "true"

  // Initialize state with defaults (will be updated from storage in useEffect)
  const [palette, setPaletteState] = useState<TerminalPalette>(DEFAULT_PALETTE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load persisted values from storage on mount
  useEffect(() => {
    const storedPalette = safeStorage.getItem(PALETTE_STORAGE_KEY)

    if (isValidPalette(storedPalette)) {
      setPaletteState(storedPalette)
    }

    setIsHydrated(true)
  }, [])

  // Apply data attributes to document root
  useEffect(() => {
    if (typeof document === "undefined" || !isHydrated) {
      return
    }

    if (isTerminalDesignEnabled) {
      document.documentElement.setAttribute("data-palette", palette)
      // Always dark mode
      document.documentElement.setAttribute("data-mode", "dark")
    }

    return () => {
      // Clean up attributes on unmount
      if (typeof document !== "undefined") {
        document.documentElement.removeAttribute("data-palette")
        document.documentElement.removeAttribute("data-mode")
      }
    }
  }, [palette, isTerminalDesignEnabled, isHydrated])

  // Setter for palette with persistence
  const setPalette = useCallback((newPalette: TerminalPalette) => {
    setPaletteState(newPalette)
    safeStorage.setItem(PALETTE_STORAGE_KEY, newPalette)
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<TerminalThemeContextType>(
    () => ({
      palette,
      setPalette,
      isTerminalDesignEnabled,
    }),
    [palette, setPalette, isTerminalDesignEnabled]
  )

  return (
    <TerminalThemeContext.Provider value={contextValue}>
      {children}
    </TerminalThemeContext.Provider>
  )
}

// Hook to access terminal theme context
export function useTerminalTheme(): TerminalThemeContextType {
  const context = useContext(TerminalThemeContext)

  if (context === undefined) {
    throw new Error(
      "useTerminalTheme must be used within a TerminalThemeProvider"
    )
  }

  return context
}
