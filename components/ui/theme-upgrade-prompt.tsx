'use client'

/**
 * Theme Upgrade Prompt - Encourages users to register for premium themes
 */

import { useState } from 'react'
import { Crown, X, Gamepad2, Terminal, Grid3x3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/enhanced-theme-provider'
import { getComponentStyles } from '@/lib/theme-utils'
import { PREMIUM_THEMES } from '@/lib/theme-config'

interface ThemeUpgradePromptProps {
  show?: boolean
  onClose?: () => void
  compact?: boolean
}

export default function ThemeUpgradePrompt({ 
  show = true, 
  onClose,
  compact = false 
}: ThemeUpgradePromptProps) {
  const { theme, isAuthenticated } = useTheme()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(show)
  const themeClasses = getComponentStyles(theme, 'modal')

  // Don't show if user is already authenticated
  if (isAuthenticated || !isVisible) {
    return null
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const handleSignUp = () => {
    router.push('/auth/signup?next=/dashboard')
  }

  const handleLogin = () => {
    router.push('/auth/login?next=/dashboard')
  }

  if (compact) {
    return (
      <div className={`p-4 border-2 ${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.glow} relative`}>
        <button
          onClick={handleClose}
          className={`absolute top-2 right-2 ${themeClasses.mutedText} hover:${themeClasses.text} transition-colors`}
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h3 className={`font-mono font-bold text-sm uppercase ${themeClasses.text}`}>
            Premium Themes
          </h3>
        </div>
        
        <p className={`text-xs font-mono mb-3 ${themeClasses.mutedText}`}>
          Unlock 4 additional retro themes inspired by classic gaming systems!
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleSignUp}
            className={`flex-1 px-3 py-2 border-2 ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg} transition-all duration-200 font-mono uppercase text-xs hover:scale-[1.02]`}
          >
            Sign Up Free
          </button>
          <button
            onClick={handleLogin}
            className={`px-3 py-2 border ${themeClasses.borderColor} ${themeClasses.mutedText} hover:${themeClasses.text} transition-colors font-mono uppercase text-xs`}
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-md w-full p-6 container-primary ${themeClasses.background} relative`}>
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 ${themeClasses.mutedText} hover:${themeClasses.text} transition-colors`}
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="text-center mb-6">
          <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h2 className={`text-xl font-mono font-bold uppercase tracking-wider ${themeClasses.text}`}>
            Unlock Premium Themes
          </h2>
          <p className={`text-sm font-mono mt-2 ${themeClasses.mutedText}`}>
            Register for free to access 4 additional retro themes
          </p>
        </div>
        
        {/* Theme Preview */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="text-center">
            <div className="w-full h-16 bg-black border-2 border-[#702800] flex items-center justify-center mb-2">
              <Gamepad2 className="w-6 h-6 text-[#E0EC9C]" />
            </div>
            <p className={`text-xs font-mono ${themeClasses.mutedText}`}>Atari 2600</p>
          </div>
          
          <div className="text-center">
            <div className="w-full h-16 bg-[#0D0D0D] border-2 border-[#33FF33] flex items-center justify-center mb-2">
              <Terminal className="w-6 h-6 text-[#33FF33]" />
            </div>
            <p className={`text-xs font-mono ${themeClasses.mutedText}`}>Terminal Green</p>
          </div>
          
          <div className="text-center">
            <div className="w-full h-16 bg-[#D3D3D3] border-2 border-black flex items-center justify-center mb-2">
              <Grid3x3 className="w-6 h-6 text-[#CC0000]" />
            </div>
            <p className={`text-xs font-mono ${themeClasses.mutedText}`}>8-Bit Classic</p>
          </div>
          
          <div className="text-center">
            <div className="w-full h-16 bg-[#B8B8D0] border-2 border-[#5B5B8B] flex items-center justify-center mb-2">
              <Gamepad2 className="w-6 h-6 text-[#FFD700]" />
            </div>
            <p className={`text-xs font-mono ${themeClasses.mutedText}`}>16-Bit SNES</p>
          </div>
        </div>
        
        {/* Features */}
        <div className={`mb-6 p-3 border ${themeClasses.borderColor} ${themeClasses.background}`}>
          <h3 className={`font-mono font-bold text-sm uppercase mb-2 ${themeClasses.text}`}>
            What you get:
          </h3>
          <ul className={`text-xs font-mono space-y-1 ${themeClasses.mutedText}`}>
            <li>• 4 premium retro gaming themes</li>
            <li>• Theme preferences sync across devices</li>
            <li>• Exclusive pixel fonts & styling</li>
            <li>• No ads, completely free</li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSignUp}
            className={`flex-1 px-4 py-3 border-2 ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg} transition-all duration-200 font-mono uppercase text-sm hover:scale-[1.02]`}
          >
            Sign Up Free
          </button>
          <button
            onClick={handleLogin}
            className={`px-4 py-3 border ${themeClasses.borderColor} ${themeClasses.mutedText} hover:${themeClasses.text} transition-colors font-mono uppercase text-sm`}
          >
            Login
          </button>
        </div>
        
        <p className={`text-center text-xs font-mono mt-4 ${themeClasses.mutedText}`}>
          Already have an account? Just login to access your themes.
        </p>
      </div>
    </div>
  )
}