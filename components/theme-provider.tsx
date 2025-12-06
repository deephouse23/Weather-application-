"use client"

/**
 * 16-Bit Weather Platform - BETA v0.5.0
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
        .select('theme')
        .eq('user_id', userId)
        .single()

      if (data && data.theme && THEME_LIST.includes(data.theme as Theme)) {
        setThemeState(data.theme as Theme)
      }
    } catch (e) {
      console.error("Failed to fetch theme preferences", e)
    }
  }

  // Save theme
  const saveThemePreference = async (newTheme: Theme) => {
    if (!isAuthenticated || !user) return

    try {
      // Optimistic update handled by state, sync to DB
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
      })
    } catch (e) {
      console.error("Failed to save theme preference", e)
    }
  }

  // Set theme handler
  const setTheme = async (newTheme: Theme) => {
    // Prevent setting premium theme if not authenticated
    if (!isAuthenticated && !FREE_THEMES.includes(newTheme as any)) {
      return
    }

    setThemeState(newTheme)

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      safeStorage.setItem('weather-edu-theme', newTheme)
    }

    // Persist to DB if logged in
    if (isAuthenticated) {
      saveThemePreference(newTheme)
    }
  }

  // Toggle function
  const toggleTheme = () => {
    const list = availableThemes
    const currentIndex = list.indexOf(theme)
    const nextIndex = (currentIndex + 1) % list.length
    setTheme(list[nextIndex])
  }

  // Load local preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = safeStorage.getItem('weather-edu-theme') as Theme
      if (savedTheme && THEME_LIST.includes(savedTheme)) {
        // If saved theme is premium but user not logged in yet, we might render it briefly
        // matching logic will correct it once auth loads
        setThemeState(savedTheme)
      }
    }
  }, [])

  // Apply theme to DOM and inject dynamic CSS variables
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    const body = window.document.body

    // Remove all old classes
    THEME_LIST.forEach(t => {
      root.classList.remove(t)
      body.classList.remove(`theme-${t}`)
    })

    // Add new classes
    root.classList.add(theme)
    root.setAttribute('data-theme', theme)
    body.classList.add(`theme-${theme}`)

    // DYNAMIC CSS INJECTION
    // Get definition from config
    const def = getThemeDefinition(theme)

    // Set standard variables
    root.style.setProperty('--bg', def.colors.background)
    root.style.setProperty('--bg-elev', def.colors.backgroundSecondary) // Mapping secondary to elev
    root.style.setProperty('--border', def.colors.border)
    root.style.setProperty('--text', def.colors.text)
    root.style.setProperty('--text-muted', def.colors.textSecondary)
    root.style.setProperty('--primary', def.colors.primary)
    root.style.setProperty('--accent', def.colors.accent)
    root.style.setProperty('--ok', def.colors.highlight || def.colors.primary)
    root.style.setProperty('--warn', def.colors.accent)
    root.style.setProperty('--danger', 'red') // Fallback or from config if added

    // Font injection if present
    if (def.font) {
      // We assume the font family string includes fallback, e.g. '"Press Start 2P", monospace'
      // We might need to import the font in CSS or head, but here we just set the stack
      // root.style.setProperty('--font-primary', def.font) 
      // Ensuring it applies to body
      body.style.fontFamily = def.font
    } else {
      body.style.removeProperty('font-family')
    }

    // Background Gradient Effect
    if (def.effects?.backgroundGradient) {
      body.style.backgroundImage = def.effects.backgroundGradient
      body.style.backgroundAttachment = 'fixed'
    } else {
      body.style.backgroundImage = ''
    }

    // Force background color match
    body.style.backgroundColor = def.colors.background

  }, [theme, mounted])

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      availableThemes,
      isAuthenticated
    }}>
      {children}
    </ThemeContext.Provider>
  )
} 
