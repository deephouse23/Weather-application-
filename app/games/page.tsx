"use client"

import { useState, useEffect } from "react"
import PageWrapper from "@/components/page-wrapper"
import { ExternalLink } from "lucide-react"

type ThemeType = 'dark' | 'miami' | 'tron';

export default function GamesPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('dark')

  // Theme management - sync with PageWrapper
  const getStoredTheme = (): ThemeType => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('weather-edu-theme')
        if (stored && ['dark', 'miami', 'tron'].includes(stored)) {
          return stored as ThemeType
        }
      }
    } catch (error) {
      console.warn('Failed to get stored theme:', error)
    }
    return 'dark'
  }

  // Load and sync theme
  useEffect(() => {
    const storedTheme = getStoredTheme()
    setCurrentTheme(storedTheme)
    
    // Listen for theme changes
    const handleStorageChange = () => {
      const newTheme = getStoredTheme()
      setCurrentTheme(newTheme)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Poll for theme changes
    const interval = setInterval(() => {
      const newTheme = getStoredTheme()
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme)
      }
    }, 100)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [currentTheme])

  // Theme classes to match main app
  const getThemeClasses = (theme: ThemeType) => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-[#0a0a1a]',
          cardBg: 'bg-[#16213e]',
          borderColor: 'border-[#00d4ff]',
          text: 'text-[#e0e0e0]',
          headerText: 'text-[#00d4ff]',
          secondaryText: 'text-[#a0a0a0]',
          shadowColor: '#00d4ff',
          glow: 'drop-shadow-[0_0_10px_#00d4ff]',
          hoverBg: 'hover:bg-[#1a2a4a]',
          accentBg: 'bg-[#00d4ff]'
        }
      case 'miami':
        return {
          background: 'bg-gradient-to-br from-[#2d1b69] via-[#11001c] to-[#0f0026]',
          cardBg: 'bg-gradient-to-br from-[#4a0e4e] via-[#2d1b69] to-[#1a0033]',
          borderColor: 'border-[#ff1493]',
          text: 'text-[#00ffff]',
          headerText: 'text-[#ff007f]',
          secondaryText: 'text-[#b0d4f1]',
          shadowColor: '#ff1493',
          glow: 'drop-shadow-[0_0_10px_#ff007f]',
          hoverBg: 'hover:bg-[#6a1e6e]',
          accentBg: 'bg-[#ff1493]'
        }
      case 'tron':
        return {
          background: 'bg-[#000000]',
          cardBg: 'bg-[#000000]',
          borderColor: 'border-[#00FFFF]',
          text: 'text-[#FFFFFF]',
          headerText: 'text-[#00FFFF]',
          secondaryText: 'text-[#88CCFF]',
          shadowColor: '#00FFFF',
          glow: 'drop-shadow-[0_0_15px_#00FFFF]',
          hoverBg: 'hover:bg-[#001111]',
          accentBg: 'bg-[#00FFFF]'
        }
    }
  }

  const themeClasses = getThemeClasses(currentTheme)

  const games = [
    {
      id: 'snake',
      title: 'RETRO SNAKE',
      emoji: '🐍',
      description: 'Classic Snake game with green neon graphics, WASD/arrow controls, and score tracking.',
      url: '/snake-game.html',
      color: '#00ff41'
    },
    {
      id: 'tetris',
      title: 'RETRO TETRIS',
      emoji: '🔲',
      description: 'Complete Tetris with all 7 piece types, rotation, line clearing, and level progression.',
      url: '/tetris-game.html',
      color: '#00ffff'
    },
    {
      id: 'pacman',
      title: 'PAC-MAZE',
      emoji: '👾',
      description: 'Pac-Man style maze game with ghost AI, dot collection, and power pellets.',
      url: '/pacman-game.html',
      color: '#ffff00'
    }
  ]

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 font-mono uppercase tracking-wider ${themeClasses.headerText} ${themeClasses.glow}`}>
            RETRO ARCADE
          </h1>
          <p className={`text-lg ${themeClasses.secondaryText} font-mono mb-6`}>
            🎮 Classic 16-bit style games with authentic retro feel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {games.map((game) => (
            <a
              key={game.id}
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${themeClasses.cardBg} border-4 ${themeClasses.borderColor} transition-all duration-300 ${themeClasses.hoverBg} cursor-pointer block transform hover:scale-105`}
              style={{ boxShadow: `0 0 15px ${themeClasses.shadowColor}33` }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{game.emoji}</div>
                  <ExternalLink className="w-6 h-6" style={{ color: themeClasses.shadowColor }} />
                </div>
                
                <h3 className={`font-mono font-bold text-xl uppercase tracking-wider mb-2 ${themeClasses.headerText}`}>
                  {game.title}
                </h3>
                
                <p className={`${themeClasses.text} font-mono text-sm mb-4`}>
                  {game.description}
                </p>
                
                <div className={`w-full ${themeClasses.accentBg} text-black font-mono font-bold py-2 px-4 border-2 border-current transition-all duration-200 text-center`}>
                  PLAY NOW
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className={`${themeClasses.cardBg} border-2 ${themeClasses.borderColor} p-6 max-w-2xl mx-auto`}
               style={{ boxShadow: `0 0 10px ${themeClasses.shadowColor}33` }}>
            <h3 className={`font-mono font-bold text-lg uppercase tracking-wider mb-4 ${themeClasses.headerText}`}>
              🕹️ GAME FEATURES
            </h3>
            <div className={`${themeClasses.text} font-mono text-sm space-y-2`}>
              <p>✨ Authentic 16-bit retro styling with neon effects</p>
              <p>🎨 Orbitron font for genuine retro atmosphere</p>
              <p>🎮 Fully functional gameplay mechanics</p>
              <p>🏆 Score tracking and game over screens</p>
              <p>⌨️ Responsive keyboard controls</p>
              <p>🚀 No external dependencies - pure HTML5 games</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
} 