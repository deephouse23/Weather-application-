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

'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { TerminalThemeProvider } from '@/components/terminal-theme-provider'
import { ReactNode } from 'react'

export default function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TerminalThemeProvider>
        {children}
      </TerminalThemeProvider>
    </ThemeProvider>
  )
}