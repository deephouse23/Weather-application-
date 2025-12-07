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

import React, { ReactNode } from "react"
import { ErrorBoundary } from "./error-boundary"

interface ErrorBoundaryWrapperProps {
  children: ReactNode
}

/**
 * Client-side wrapper for ErrorBoundary component
 * Required because ErrorBoundary must be a class component ('use client')
 * but layout.tsx is a server component
 */
export default function ErrorBoundaryWrapper({ children }: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary componentName="Application Root">
      {children}
    </ErrorBoundary>
  )
}
