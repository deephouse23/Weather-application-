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

/**
 * Simple Collapsible Section Component
 * For minimal SEO content that doesn't clutter the interface
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  theme: string
  className?: string
}

export function CollapsibleSection({ title, children, theme, className }: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Terminal-aware theme styles using CSS variables (borders removed)
  const styles = {
    button: 'bg-terminal-bg-primary text-terminal-accent hover:bg-terminal-bg-elevated',
    content: 'bg-terminal-bg-primary text-terminal-text-primary'
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Collapsible Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full p-3 border-0 rounded-lg flex items-center justify-between text-sm font-mono font-bold uppercase tracking-wider transition-colors",
          styles.button
        )}
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className={cn(
          "border-0 rounded-b-lg p-4 text-sm font-mono",
          styles.content
        )}>
          {children}
        </div>
      )}
    </div>
  )
}