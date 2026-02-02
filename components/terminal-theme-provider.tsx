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
  | "gruvbox"
export type TerminalMode = "dark" | "light" | "system"

// Storage keys
const PALETTE_STORAGE_KEY = "terminal-palette"
const MODE_STORAGE_KEY = "terminal-mode"

// Default values
const DEFAULT_PALETTE: TerminalPalette = "terminal"
const DEFAULT_MODE: TerminalMode = "dark"

// Context type
interface TerminalThemeContextType {
  palette: TerminalPalette
  mode: TerminalMode
  resolvedMode: "dark" | "light"
  setPalette: (palette: TerminalPalette) => void
  setMode: (mode: TerminalMode) => void
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
  "gruvbox",
]

// Valid mode values for type guard
const VALID_MODES: TerminalMode[] = ["dark", "light", "system"]

function isValidPalette(value: string | null): value is TerminalPalette {
  return value !== null && VALID_PALETTES.includes(value as TerminalPalette)
}

function isValidMode(value: string | null): value is TerminalMode {
  return value !== null && VALID_MODES.includes(value as TerminalMode)
}

function getSystemColorScheme(): "dark" | "light" {
  if (typeof window === "undefined") {
    return "dark"
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
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
  const [mode, setModeState] = useState<TerminalMode>(DEFAULT_MODE)
  const [systemColorScheme, setSystemColorScheme] = useState<"dark" | "light">(
    "dark"
  )
  const [isHydrated, setIsHydrated] = useState(false)

  // Calculate resolved mode
  const resolvedMode: "dark" | "light" = useMemo(() => {
    if (mode === "system") {
      return systemColorScheme
    }
    return mode
  }, [mode, systemColorScheme])

  // Load persisted values from storage on mount
  useEffect(() => {
    const storedPalette = safeStorage.getItem(PALETTE_STORAGE_KEY)
    const storedMode = safeStorage.getItem(MODE_STORAGE_KEY)

    if (isValidPalette(storedPalette)) {
      setPaletteState(storedPalette)
    }

    if (isValidMode(storedMode)) {
      setModeState(storedMode)
    }

    // Get initial system color scheme
    setSystemColorScheme(getSystemColorScheme())
    setIsHydrated(true)
  }, [])

  // Listen for system color scheme changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemColorScheme(event.matches ? "dark" : "light")
    }

    // Modern browsers
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  // Apply data attributes to document root
  useEffect(() => {
    if (typeof document === "undefined" || !isHydrated) {
      return
    }

    if (isTerminalDesignEnabled) {
      document.documentElement.setAttribute("data-palette", palette)
      document.documentElement.setAttribute("data-mode", resolvedMode)
    }

    return () => {
      // Clean up attributes on unmount
      if (typeof document !== "undefined") {
        document.documentElement.removeAttribute("data-palette")
        document.documentElement.removeAttribute("data-mode")
      }
    }
  }, [palette, resolvedMode, isTerminalDesignEnabled, isHydrated])

  // Setter for palette with persistence
  const setPalette = useCallback((newPalette: TerminalPalette) => {
    setPaletteState(newPalette)
    safeStorage.setItem(PALETTE_STORAGE_KEY, newPalette)
  }, [])

  // Setter for mode with persistence
  const setMode = useCallback((newMode: TerminalMode) => {
    setModeState(newMode)
    safeStorage.setItem(MODE_STORAGE_KEY, newMode)
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<TerminalThemeContextType>(
    () => ({
      palette,
      mode,
      resolvedMode,
      setPalette,
      setMode,
      isTerminalDesignEnabled,
    }),
    [palette, mode, resolvedMode, setPalette, setMode, isTerminalDesignEnabled]
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
