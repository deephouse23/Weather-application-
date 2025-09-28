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

/**
 * Pollen Count Display Component
 * Displays pollen data for tree, grass, and weed categories with color coding
 */

import { cn } from '@/lib/utils'
import { getPollenColor } from '@/lib/air-quality-utils'
import { ThemeType } from '@/lib/theme-config'

interface PollenData {
  tree: Record<string, string>
  grass: Record<string, string>
  weed: Record<string, string>
}

interface PollenDisplayProps {
  pollen: PollenData
  theme: ThemeType
  className?: string
}

interface PollenCategoryProps {
  categoryName: string
  categoryData: Record<string, string>
  theme: ThemeType
}

function PollenCategory({ categoryName, categoryData, theme }: PollenCategoryProps) {
  // Theme-specific text styles
  const getTextStyles = () => {
    switch (theme) {
      case 'dark':
        return 'text-[#e0e0e0]'
      case 'miami':
        return 'text-[#00ffff]'
      case 'tron':
        return 'text-white'
      case 'atari2600':
        return 'text-[#FFFFFF]'
      case 'monochromeGreen':
        return 'text-[#33FF33]'
      case '8bitClassic':
        return 'text-[#000000]'
      case '16bitSnes':
        return 'text-[#2C2C3E]'
      default:
        return 'text-[#e0e0e0]'
    }
  }

  const textStyles = getTextStyles()

  // Filter out "No Data" entries
  const validData = Object.entries(categoryData).filter(([_, category]) => category !== 'No Data')

  const renderPollenData = () => {
    if (validData.length === 0) {
      return (
        <p className={cn("text-sm", textStyles)}>
          No Data
        </p>
      )
    } else if (validData.length === 1) {
      const [plant, category] = validData[0]
      return (
        <p className={`text-sm ${getPollenColor(category)}`}>
          {plant}: {category}
        </p>
      )
    } else {
      return validData.map(([plant, category]) => (
        <p key={plant} className={`text-sm ${getPollenColor(category)}`}>
          {plant}: {category}
        </p>
      ))
    }
  }

  return (
    <div>
      <p className={cn("text-sm font-medium mb-1", textStyles)}>
        {categoryName}
      </p>
      {renderPollenData()}
    </div>
  )
}

export function PollenDisplay({ pollen, theme, className }: PollenDisplayProps) {
  // Theme-specific styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          container: 'bg-[#0f0f0f] border-[#00d4ff]',
          header: 'text-[#00d4ff]',
          shadow: '0 0 15px #00d4ff33'
        }
      case 'miami':
        return {
          container: 'bg-[#0a0025] border-[#ff1493]',
          header: 'text-[#ff1493]',
          shadow: '0 0 15px #ff149333'
        }
      case 'tron':
        return {
          container: 'bg-black border-[#00FFFF]',
          header: 'text-[#00FFFF]',
          shadow: '0 0 15px #00FFFF33'
        }
      case 'atari2600':
        return {
          container: 'bg-[#000000] border-[#702800]',
          header: 'text-[#E0EC9C]',
          shadow: '0 0 15px #70280033'
        }
      case 'monochromeGreen':
        return {
          container: 'bg-[#0D0D0D] border-[#009900]',
          header: 'text-[#33FF33]',
          shadow: '0 0 15px #00990033'
        }
      case '8bitClassic':
        return {
          container: 'bg-[#D3D3D3] border-[#000000]',
          header: 'text-[#CC0000]',
          shadow: '0 0 15px #00000033'
        }
      case '16bitSnes':
        return {
          container: 'bg-[#B8B8D0] border-[#5B5B8B]',
          header: 'text-[#FFD700]',
          shadow: '0 0 15px #5B5B8B33'
        }
      default:
        return {
          container: 'bg-[#0f0f0f] border-[#00d4ff]',
          header: 'text-[#00d4ff]',
          shadow: '0 0 15px #00d4ff33'
        }
    }
  }

  const styles = getThemeStyles()

  return (
    <div 
      className={cn(
        "p-4 rounded-lg text-center border-2 shadow-lg",
        styles.container,
        className
      )}
      style={{ boxShadow: styles.shadow }}
    >
      {/* Header */}
      <h2 className={cn("text-xl font-semibold mb-2", styles.header)}>
        Pollen Count
      </h2>
      
      {/* Pollen Categories Grid */}
      <div className="grid grid-cols-3 gap-2">
        <PollenCategory 
          categoryName="Tree" 
          categoryData={pollen.tree} 
          theme={theme} 
        />
        <PollenCategory 
          categoryName="Grass" 
          categoryData={pollen.grass} 
          theme={theme} 
        />
        <PollenCategory 
          categoryName="Weed" 
          categoryData={pollen.weed} 
          theme={theme} 
        />
      </div>
    </div>
  )
}