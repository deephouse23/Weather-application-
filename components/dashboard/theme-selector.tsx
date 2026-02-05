'use client'

/**
 * Enhanced Theme Selector with Freemium Strategy
 * - Free themes for everyone
 * - Premium themes with preview for non-registered users
 * - Upgrade prompts and CTAs
 */

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Crown, Lock, Play, Timer, Sparkles, Star } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/components/theme-provider'
import { useThemePreview } from '@/lib/hooks/use-theme-preview'
import { 
  THEME_CONFIGS, 
  getFreeThemes, 
  getPremiumThemes, 
  getThemeConfig,
  type ThemeConfig 
} from '@/lib/theme-tiers'
import { cn } from '@/lib/utils'

interface ThemeCardProps {
  theme: ThemeConfig
  isActive: boolean
  isLocked: boolean
  isPreviewActive?: boolean
  timeRemaining?: number
  onSelect: (themeId: string) => void
  onUpgrade?: () => void
}

function ThemeCard({ 
  theme, 
  isActive, 
  isLocked, 
  isPreviewActive = false,
  timeRemaining = 0,
  onSelect, 
  onUpgrade 
}: ThemeCardProps) {
  const getCategoryIcon = () => {
    switch (theme.category) {
      case 'retro': return <Sparkles className="w-3 h-3" />
      case 'seasonal': return <Star className="w-3 h-3" />
      case 'special': return <Crown className="w-3 h-3" />
      default: return null
    }
  }

  const getCategoryColor = () => {
    switch (theme.category) {
      case 'retro': return 'from-purple-500 to-pink-500'
      case 'seasonal': return 'from-orange-500 to-red-500' 
      case 'special': return 'from-yellow-500 to-amber-500'
      default: return 'from-blue-500 to-cyan-500'
    }
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 border-0",
        isActive ? "ring-2 ring-primary ring-offset-2" : "",
        isLocked ? "opacity-75" : "",
        isPreviewActive ? "ring-2 ring-orange-500 ring-offset-2" : ""
      )}
      onClick={() => onSelect(theme.id)}
    >
      {/* Theme Preview Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
        }}
      />

      <CardContent className="p-4 relative z-10">
        {/* Header with badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getCategoryIcon()}
            <h4 className="font-bold font-mono text-sm uppercase tracking-wider">
              {theme.displayName}
            </h4>
          </div>
          
          <div className="flex gap-1">
            {isPreviewActive && (
              <Badge variant="secondary" className="text-xs px-1 py-0.5 bg-orange-100 text-orange-800">
                <Timer className="w-3 h-3 mr-1" />
                {timeRemaining}s
              </Badge>
            )}
            
            {theme.tier === 'premium' && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs px-1 py-0.5 text-white",
                  `bg-gradient-to-r ${getCategoryColor()}`
                )}
              >
                {isLocked ? <Lock className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
              </Badge>
            )}
          </div>
        </div>

        {/* Color Preview */}
        <div className="flex gap-1 mb-3 h-6">
          <div
            className="flex-1 rounded-sm border-0"
            style={{ backgroundColor: theme.colors.primary }}
          />
          <div
            className="flex-1 rounded-sm border-0"
            style={{ backgroundColor: theme.colors.background }}
          />
          <div
            className="flex-1 rounded-sm border-0"
            style={{ backgroundColor: theme.colors.accent }}
          />
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {theme.description}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2">
          {isActive && (
            <Badge variant="default" className="w-full justify-center py-1">
              ✓ Active
            </Badge>
          )}
          
          {!isActive && !isLocked && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(theme.id)
              }}
            >
              Apply Theme
            </Button>
          )}
          
          {!isActive && isLocked && (
            <div className="space-y-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(theme.id)
                }}
              >
                <Play className="w-3 h-3 mr-1" />
                Preview 30s
              </Button>
              
              <Button 
                size="sm" 
                className="w-full text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onUpgrade?.()
                }}
              >
                <Crown className="w-3 h-3 mr-1" />
                Unlock Free
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ThemeSelectorEnhanced() {
  const { user } = useAuth()
  const { theme: currentTheme } = useTheme()
  const { 
    isPreviewActive, 
    previewTheme, 
    timeRemaining, 
    startPreview, 
    upgradeAccount,
    canAccessTheme 
  } = useThemePreview()

  const freeThemes = getFreeThemes()
  const premiumThemes = getPremiumThemes()
  
  const handleThemeSelect = (themeId: string) => {
    startPreview(themeId)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-mono uppercase tracking-wider">
          Choose Your Style
        </h2>
        <p className="text-muted-foreground">
          {user 
            ? "All themes unlocked for you! 🎉" 
            : "Free themes available. Sign up to unlock premium themes!"
          }
        </p>
      </div>

      {/* Preview Status */}
      {isPreviewActive && (
        <div className="bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 p-4 rounded-lg border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                  Previewing {previewTheme ? getThemeConfig(previewTheme)?.displayName : ''}
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  {timeRemaining} seconds remaining
                </p>
              </div>
            </div>
            <Button 
              size="sm"
              onClick={upgradeAccount}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Crown className="w-4 h-4 mr-1" />
              Keep This Theme
            </Button>
          </div>
        </div>
      )}

      {/* Free Themes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-green-600">🆓</span>
          Free Themes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {freeThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme === theme.id && !isPreviewActive}
              isLocked={false}
              onSelect={handleThemeSelect}
            />
          ))}
        </div>
      </div>

      {/* Premium Themes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-purple-600">👑</span>
            Premium Themes
            {!user && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Preview Available
              </Badge>
            )}
          </h3>
          
          {!user && (
            <Button 
              variant="outline"
              size="sm" 
              onClick={upgradeAccount}
              className="text-xs"
            >
              <Crown className="w-3 h-3 mr-1" />
              Sign Up Free
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {premiumThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme === theme.id && !isPreviewActive}
              isLocked={!canAccessTheme(theme.id)}
              isPreviewActive={isPreviewActive && previewTheme === theme.id}
              timeRemaining={timeRemaining}
              onSelect={handleThemeSelect}
              onUpgrade={upgradeAccount}
            />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg text-center">
          <Crown className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Unlock All Premium Themes</h3>
          <p className="text-purple-100 mb-4">
            Get instant access to all current and future themes with a free account
          </p>
          <Button 
            size="lg" 
            onClick={upgradeAccount}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            Sign Up Free - No Credit Card Required
          </Button>
        </div>
      )}
    </div>
  )
}