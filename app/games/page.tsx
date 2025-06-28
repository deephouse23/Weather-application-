"use client"

import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"

export default function GamesPage() {
  const [isClient, setIsClient] = useState(false)

  // Client-side mount effect
  useEffect(() => {
    setIsClient(true)
  }, [])

  const games = [
    {
      id: 'tetris',
      title: 'RETRO TETRIS',
      emoji: '🔲',
      description: 'Complete Tetris with all 7 piece types, rotation, line clearing, and level progression.',
      url: '/tetris-game.html',
      color: '#00ffff'
    },
    {
      id: 'asteroids',
      title: 'RETRO ASTEROIDS',
      emoji: '🚀',
      description: 'Classic space shooter with physics-based movement, asteroid splitting, and level progression.',
      url: '/asteroids-game.html',
      color: '#00ff41'
    },
    {
      id: 'weather-trivia',
      title: 'WEATHER TRIVIA',
      emoji: '⛈️',
      description: 'Test your weather knowledge with 3 difficulty levels and timed questions.',
      url: '/weather-trivia-game.html',
      color: '#ffff00'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-cyan-400 crt-scanlines">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-mono uppercase tracking-wider text-cyan-400">
            RETRO ARCADE
          </h1>
          <p className="text-lg text-cyan-600 font-mono mb-6">
            🎮 Classic 16-bit style games with authentic retro feel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {games.map((game) => (
            <a
              key={game.id}
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black border-4 border-cyan-500 transition-all duration-300 hover:bg-cyan-500 hover:text-black cursor-pointer block transform hover:scale-105"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)' }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{game.emoji}</div>
                  <ExternalLink className="w-6 h-6 text-cyan-400" />
                </div>
                
                <h3 className="font-mono font-bold text-xl uppercase tracking-wider mb-2 text-cyan-400">
                  {game.title}
                </h3>
                
                <p className="text-cyan-600 font-mono text-sm mb-4">
                  {game.description}
                </p>
                
                <div className="w-full bg-cyan-500 text-black font-mono font-bold py-2 px-4 border-2 border-current transition-all duration-200 text-center">
                  PLAY NOW
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-black border-2 border-cyan-500 p-6 max-w-2xl mx-auto"
               style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)' }}>
            <h3 className="font-mono font-bold text-lg uppercase tracking-wider mb-4 text-cyan-400">
              🕹️ GAME FEATURES
            </h3>
            <div className="text-cyan-600 font-mono text-sm space-y-2">
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
    </div>
  )
} 