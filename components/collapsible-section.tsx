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

  // Theme-specific styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          button: 'bg-[#0f0f0f] border-[#00d4ff] text-[#00d4ff] hover:bg-[#001a33]',
          content: 'bg-[#0f0f0f] border-[#00d4ff] text-[#e0e0e0]'
        }
      case 'miami':
        return {
          button: 'bg-[#0a0025] border-[#ff1493] text-[#ff1493] hover:bg-[#1a0040]',
          content: 'bg-[#0a0025] border-[#ff1493] text-[#00ffff]'
        }
      default:
        return {
          button: 'bg-[#0f0f0f] border-[#00d4ff] text-[#00d4ff] hover:bg-[#001a33]',
          content: 'bg-[#0f0f0f] border-[#00d4ff] text-[#e0e0e0]'
        }
    }
  }

  const styles = getThemeStyles()

  return (
    <div className={cn("w-full", className)}>
      {/* Collapsible Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full p-3 border-2 rounded-lg flex items-center justify-between text-sm font-mono font-bold uppercase tracking-wider transition-colors",
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
          "border-2 border-t-0 rounded-b-lg p-4 text-sm font-mono",
          styles.content
        )}>
          {children}
        </div>
      )}
    </div>
  )
}