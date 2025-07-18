"use client"

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface TooltipProps {
  content: string
  children: React.ReactNode
  theme?: 'dark' | 'miami' | 'tron'
  className?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ 
  content, 
  children, 
  theme = 'dark', 
  className = '', 
  position = 'top' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsVisible(true)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setIsVisible(false), 100)
  }

  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-[#1a1a2e]',
          border: 'border-[#00d4ff]',
          text: 'text-[#e0e0e0]',
          shadow: 'shadow-[0_0_10px_rgba(0,212,255,0.3)]'
        }
      case 'miami':
        return {
          background: 'bg-[#4a0e4e]',
          border: 'border-[#ff1493]',
          text: 'text-[#00ffff]',
          shadow: 'shadow-[0_0_10px_rgba(255,20,147,0.3)]'
        }
      case 'tron':
        return {
          background: 'bg-black',
          border: 'border-[#00FFFF]',
          text: 'text-white',
          shadow: 'shadow-[0_0_10px_rgba(0,255,255,0.3)]'
        }
    }
  }

  const getPositionStyles = () => {
    const baseStyles = isMobile ? 'left-1/2 transform -translate-x-1/2' : '';
    
    switch (position) {
      case 'top':
        return isMobile 
          ? `bottom-full ${baseStyles} mb-2`
          : 'bottom-full left-1/2 transform -translate-x-1/2 mb-3'
      case 'bottom':
        return isMobile 
          ? `top-full ${baseStyles} mt-2`
          : 'top-full left-1/2 transform -translate-x-1/2 mt-3'
      case 'left':
        return isMobile 
          ? `bottom-full ${baseStyles} mb-2`
          : 'right-full top-1/2 transform -translate-y-1/2 mr-3'
      case 'right':
        return isMobile 
          ? `bottom-full ${baseStyles} mb-2`
          : 'left-full top-1/2 transform -translate-y-1/2 ml-3'
    }
  }

  const getArrowStyles = () => {
    const baseArrow = 'absolute w-2 h-2 transform rotate-45'
    const themeStyles = getThemeStyles()
    
    switch (position) {
      case 'top':
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -translate-y-1/2 ${themeStyles.background} ${themeStyles.border} border-b border-r`
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 ${themeStyles.background} ${themeStyles.border} border-t border-l`
      case 'left':
        return `${baseArrow} left-full top-1/2 -translate-y-1/2 -translate-x-1/2 ${themeStyles.background} ${themeStyles.border} border-r border-b`
      case 'right':
        return `${baseArrow} right-full top-1/2 -translate-y-1/2 translate-x-1/2 ${themeStyles.background} ${themeStyles.border} border-l border-t`
    }
  }

  const themeStyles = getThemeStyles()

  return (
    <div 
      className={cn("relative inline-block", className)}
      onMouseEnter={!isMobile ? showTooltip : undefined}
      onMouseLeave={!isMobile ? hideTooltip : undefined}
      onClick={isMobile ? () => setIsVisible(!isVisible) : undefined}
    >
      {children}
      
      {isVisible && (
        <div 
          className={cn(
            "absolute z-50 px-5 py-4 text-sm font-mono rounded-lg border-2",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            "w-72 sm:w-80 md:w-96 lg:w-[420px]",
            "max-w-[95vw] sm:max-w-[85vw]",
            "whitespace-normal break-words",
            themeStyles.background,
            themeStyles.border,
            themeStyles.text,
            themeStyles.shadow,
            getPositionStyles()
          )}
          style={{ 
            boxShadow: `0 0 15px ${theme === 'dark' ? '#00d4ff' : theme === 'miami' ? '#ff1493' : '#00FFFF'}33`,
            backdropFilter: 'blur(8px)',
            lineHeight: '1.7'
          }}
        >
          <div className="space-y-3">
            {content.split(/(?<=[.!?])\s+/).filter(sentence => sentence.trim()).map((sentence, index) => (
              <div 
                key={index} 
                className="text-sm leading-relaxed"
                style={{ lineHeight: '1.6' }}
              >
                {sentence.trim()}
              </div>
            ))}
          </div>
          <div className={getArrowStyles()} />
        </div>
      )}
    </div>
  )
}

export default Tooltip