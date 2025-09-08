'use client'

/**
 * Premium Theme Selector - Enhanced theme selector with authentication support
 */

import { useState, useEffect } from 'react'
import { Moon, Sun, Zap, Gamepad2, Terminal, Grid3x3, Crown, Lock, Check } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { THEME_DEFINITIONS, isThemePremium, type ThemeDefinition } from '@/lib/theme-config'
import { ThemeService } from '@/lib/services/theme-service'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/lib/toast-service'

interface ThemeOptionDisplay {
  theme: ThemeDefinition
  icon: React.ComponentType<{ className?: string }>
  previewColors: {
    bg: string
    border: string
    text: string
    accent: string
  }
}

const getThemeIcon = (themeId: ThemeType): React.ComponentType<{ className?: string }> => {
  const icons: Record<ThemeType, React.ComponentType<{ className?: string }>> = {
    'dark': Moon,
    'miami': Sun,
    'tron': Zap,
    'atari2600': Gamepad2,
    'monochromeGreen': Terminal,
    '8bitClassic': Grid3x3,
    '16bitSnes': Gamepad2
  }
  return icons[themeId] || Moon
}

const getThemePreviewColors = (themeId: ThemeType) => {
  const previews: Record<ThemeType, { bg: string; border: string; text: string; accent: string }> = {
    'dark': {
      bg: 'bg-gray-900',
      border: 'border-green-400',
      text: 'text-green-400',
      accent: 'text-green-400'
    },
    'miami': {
      bg: 'bg-purple-900',
      border: 'border-pink-500',
      text: 'text-cyan-400',
      accent: 'text-pink-500'
    },
    'tron': {
      bg: 'bg-black',
      border: 'border-cyan-400',
      text: 'text-white',
      accent: 'text-cyan-400'
    },
    'atari2600': {
      bg: 'bg-black',
      border: 'border-[#702800]',
      text: 'text-white',
      accent: 'text-[#E0EC9C]'
    },
    'monochromeGreen': {
      bg: 'bg-[#0D0D0D]',
      border: 'border-[#33FF33]',
      text: 'text-[#33FF33]',
      accent: 'text-[#99FF99]'
    },
    '8bitClassic': {
      bg: 'bg-[#D3D3D3]',
      border: 'border-black',
      text: 'text-black',
      accent: 'text-[#CC0000]'
    },
    '16bitSnes': {
      bg: 'bg-[#B8B8D0]',
      border: 'border-[#5B5B8B]',
      text: 'text-[#2C2C3E]',
      accent: 'text-[#FFD700]'
    }
  }
  return previews[themeId] || previews.dark
}

export default function PremiumThemeSelector() {
  const { theme, setTheme } = useTheme()
  const { user, isInitialized } = useAuth()
  const router = useRouter()
  const themeClasses = getComponentStyles(theme as ThemeType, 'dashboard')
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // Build theme options from definitions
  const themeOptions: ThemeOptionDisplay[] = Object.entries(THEME_DEFINITIONS).map(([id, definition]) => ({
    theme: definition,
    icon: getThemeIcon(id as ThemeType),
    previewColors: getThemePreviewColors(id as ThemeType)
  }))

  // Group themes by premium status
  const freeThemes = themeOptions.filter(option => !option.theme.isPremium)
  const premiumThemes = themeOptions.filter(option => option.theme.isPremium)

  const handleThemeSelect = async (themeId: ThemeType) => {
    const isPremium = isThemePremium(themeId)
    
    // Check if user can access the theme
    if (!ThemeService.canAccessTheme(themeId, !!user)) {
      setShowLoginPrompt(true)
      toast.info('Register for free to unlock premium themes!')
      return
    }

    setIsLoading(true)
    
    try {
      // Apply theme
      setTheme(themeId)
      ThemeService.applyThemeToDocument(themeId)
      
      // Save to local storage
      ThemeService.saveThemeToLocalStorage(themeId)
      
      // Save to database if user is logged in
      if (user) {
        await ThemeService.saveThemeToDatabase(supabase, user.id, themeId)
      }
      
      toast.success(`Theme changed to ${THEME_DEFINITIONS[themeId].displayName}`)
    } catch (error) {
      console.error('Error changing theme:', error)
      toast.error('Failed to change theme')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginClick = () => {
    router.push('/auth/login?next=/dashboard')
  }

  const renderThemeOption = (option: ThemeOptionDisplay) => {
    const themeId = option.theme.name as ThemeType
    const isActive = theme === themeId
    const canAccess = ThemeService.canAccessTheme(themeId, !!user)
    const isPremium = option.theme.isPremium
    const IconComponent = option.icon
    
    return (
      <button
        key={themeId}
        onClick={() => handleThemeSelect(themeId)}
        disabled={isLoading}
        className={`relative p-4 border-2 transition-all duration-200 text-left group ${
          isActive
            ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black`
            : canAccess
            ? `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg} hover:scale-[1.02]`
            : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.mutedText} hover:opacity-80 cursor-pointer`
        }`}
        title={!canAccess ? 'Login to unlock this theme' : undefined}
      >
        {/* Active Indicator */}
        {isActive && (
          <Check className="absolute top-2 right-2 w-5 h-5 text-black" />
        )}
        
        {/* Premium/Lock Indicator */}
        {isPremium && (
          <div className="absolute top-2 right-2">
            {canAccess ? (
              <Crown className="w-5 h-5 text-yellow-500" />
            ) : (
              <Lock className="w-5 h-5 text-gray-500" />
            )}
          </div>
        )}
        
        <div className="flex items-start space-x-4">
          {/* Theme Preview Card */}
          <div className={`w-16 h-12 border-2 ${option.previewColors.bg} ${option.previewColors.border} flex items-center justify-center relative overflow-hidden`}>
            <IconComponent className={`w-4 h-4 ${option.previewColors.accent} ${!canAccess ? 'opacity-50' : ''}`} />
            {!canAccess && (
              <div className="absolute inset-0 bg-black bg-opacity-50" />
            )}
          </div>
          
          {/* Theme Info */}
          <div className="flex-1">
            <h4 className={`font-mono font-bold text-sm uppercase tracking-wider mb-1 ${!canAccess ? 'opacity-70' : ''}`}>
              {option.theme.displayName}
            </h4>
            <p className={`text-xs font-mono ${isActive ? 'text-black' : themeClasses.mutedText} ${!canAccess ? 'opacity-70' : ''}`}>
              {option.theme.description}
            </p>
            
            {/* Status */}
            <div className="mt-2 flex items-center space-x-2">
              {isActive && (
                <span className="px-2 py-1 bg-black text-white text-xs font-mono uppercase">
                  Active
                </span>
              )}
              {!canAccess && (
                <span className="px-2 py-1 border border-gray-500 text-gray-500 text-xs font-mono uppercase group-hover:border-green-500 group-hover:text-green-500 transition-colors">
                  Login to unlock
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className={`p-6 border-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow}`}>
      <h3 className={`text-lg font-mono font-bold uppercase tracking-wider mb-4 ${themeClasses.text}`}>
        Theme Settings
      </h3>
      
      {/* Free Themes */}
      <div className="mb-6">
        <h4 className={`text-sm font-mono uppercase mb-3 ${themeClasses.mutedText}`}>
          Free Themes
        </h4>
        <div className="grid grid-cols-1 gap-4">
          {freeThemes.map(renderThemeOption)}
        </div>
      </div>
      
      {/* Premium Themes */}
      <div className="mb-4">
        <h4 className={`text-sm font-mono uppercase mb-3 ${themeClasses.mutedText} flex items-center gap-2`}>
          Premium Themes
          <Crown className="w-4 h-4 text-yellow-500" />
        </h4>
        <div className="grid grid-cols-1 gap-4">
          {premiumThemes.map(renderThemeOption)}
        </div>
      </div>
      
      {/* Info Box */}
      {!user && (
        <div className={`mt-4 p-4 border ${themeClasses.borderColor} ${themeClasses.background}`}>
          <p className={`text-sm font-mono ${themeClasses.text} mb-3`}>
            🎮 Register for free to unlock 4 additional retro themes!
          </p>
          <button
            onClick={handleLoginClick}
            className={`w-full px-4 py-2 border-2 ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg} transition-all duration-200 font-mono uppercase text-sm hover:scale-[1.02]`}
          >
            Sign Up / Login
          </button>
        </div>
      )}
      
      {user && (
        <div className={`mt-4 p-3 border ${themeClasses.borderColor} ${themeClasses.background}`}>
          <p className={`text-xs font-mono ${themeClasses.mutedText}`}>
            <strong>Tip:</strong> Your theme preference is saved to your account and syncs across devices.
          </p>
        </div>
      )}
    </div>
  )
}