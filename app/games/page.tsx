"use client"

import { useState } from 'react'
import Link from 'next/link'
import NavBar from '@/components/nav-bar'

interface Game {
  id: string
  name: string
  description: string
  difficulty: string
  weatherTheme: string
  emoji: string
  color: string
  externalUrl?: string
}

const games: Game[] = [
  {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game with weather-themed power-ups and obstacles',
    difficulty: 'Easy',
    weatherTheme: 'Lightning storms provide speed boosts',
    emoji: '🐍',
    color: 'text-green-400',
    externalUrl: '/snake-game.html'
  },
  {
    id: 'tetris',
    name: 'Tetris',
    description: 'Block-stacking puzzle with weather-themed pieces and effects',
    difficulty: 'Medium',
    weatherTheme: 'Rain blocks fall faster, snow blocks slow down',
    emoji: '🧩',
    color: 'text-blue-400',
    externalUrl: '/tetris-game.html'
  },
  {
    id: 'pacman',
    name: 'Pac-Man',
    description: 'Navigate through weather patterns while collecting power pellets',
    difficulty: 'Medium',
    weatherTheme: 'Ghosts represent different weather conditions',
    emoji: '👻',
    color: 'text-yellow-400',
    externalUrl: '/pacman-game.html'
  },
  {
    id: 'asteroids',
    name: 'Asteroids',
    description: 'Space shooter with meteor showers and weather phenomena',
    difficulty: 'Hard',
    weatherTheme: 'Meteors represent incoming weather systems',
    emoji: '☄️',
    color: 'text-red-400',
    externalUrl: '/asteroids-game.html'
  },
  {
    id: 'missile-command',
    name: 'Missile Command',
    description: 'Defend cities from incoming weather disasters',
    difficulty: 'Hard',
    weatherTheme: 'Missiles represent extreme weather events',
    emoji: '🚀',
    color: 'text-orange-400',
    externalUrl: '/missile-command-game.html'
  },
  {
    id: 'weather-trivia',
    name: 'Weather Trivia',
    description: 'Test your knowledge of weather science and phenomena',
    difficulty: 'Variable',
    weatherTheme: 'Questions cover all aspects of meteorology',
    emoji: '❓',
    color: 'text-purple-400',
    externalUrl: '/weather-trivia-game.html'
  }
]

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const filteredGames = filter === 'all' 
    ? games 
    : games.filter(game => {
        if (filter === 'easy') return game.difficulty === 'Easy'
        if (filter === 'medium') return game.difficulty === 'Medium'
        if (filter === 'hard') return game.difficulty === 'Hard'
        return true
      })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400'
      case 'Medium': return 'text-yellow-400'
      case 'Hard': return 'text-red-400'
      default: return 'text-cyan-400'
    }
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400">
      <NavBar />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 font-mono border-b-2 border-cyan-500 pb-4">
              RETRO ARCADE
            </h1>
            <p className="text-lg text-cyan-300 max-w-3xl mx-auto">
              Experience classic arcade games with a weather education twist!
              Each game teaches you about different weather phenomena while you play.
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2 bg-gray-900 p-2 rounded-lg border border-cyan-500">
              {[
                { key: 'all', label: 'All Games' },
                { key: 'easy', label: 'Easy' },
                { key: 'medium', label: 'Medium' },
                { key: 'hard', label: 'Hard' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-4 py-2 rounded font-mono text-sm transition-all duration-200 ${
                    filter === filterOption.key
                      ? 'bg-cyan-500 text-black'
                      : 'text-cyan-400 hover:text-cyan-300 hover:bg-gray-800'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className={`bg-gray-900 border-2 border-cyan-500 p-6 rounded-lg cursor-pointer transition-all duration-300 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20 ${
                  selectedGame === game.id ? 'border-cyan-300 shadow-lg shadow-cyan-500/20' : ''
                }`}
                onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-3xl">{game.emoji}</div>
                  <span className={`text-xs font-mono ${getDifficultyColor(game.difficulty)} bg-cyan-500/10 px-2 py-1 rounded`}>
                    {game.difficulty}
                  </span>
                </div>
                
                <h3 className={`text-xl font-bold mb-3 font-mono ${game.color}`}>
                  {game.name}
                </h3>
                
                <p className="text-sm text-cyan-300 mb-4">
                  {game.description}
                </p>
                
                <div className="text-xs text-cyan-500">
                  Click for details →
                </div>
              </div>
            ))}
          </div>

          {/* Detailed View */}
          {selectedGame && (
            <div className="bg-gray-900 border-2 border-cyan-500 p-8 rounded-lg mb-8">
              {(() => {
                const game = games.find(g => g.id === selectedGame)
                if (!game) return null
                
                return (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className={`text-3xl font-bold font-mono ${game.color}`}>
                          {game.emoji} {game.name}
                        </h2>
                        <p className="text-sm text-cyan-500 font-mono mt-1">
                          Difficulty: <span className={getDifficultyColor(game.difficulty)}>{game.difficulty}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedGame(null)}
                        className="text-cyan-400 hover:text-cyan-300 font-mono text-sm border border-cyan-500 px-4 py-2 rounded hover:bg-cyan-500 hover:text-black transition-all duration-200"
                      >
                        CLOSE
                      </button>
                    </div>
                    
                    <p className="text-lg text-cyan-300 mb-6">
                      {game.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      {/* Weather Theme */}
                      <div>
                        <h3 className="text-xl font-bold mb-4 font-mono text-cyan-400 border-b border-cyan-500 pb-2">
                          Weather Theme
                        </h3>
                        <p className="text-cyan-300">
                          {game.weatherTheme}
                        </p>
                      </div>
                      
                      {/* Game Features */}
                      <div>
                        <h3 className="text-xl font-bold mb-4 font-mono text-cyan-400 border-b border-cyan-500 pb-2">
                          Game Features
                        </h3>
                        <ul className="space-y-2 text-cyan-300">
                          <li>• Classic arcade gameplay</li>
                          <li>• Weather education integration</li>
                          <li>• Retro 16-bit graphics</li>
                          <li>• High score tracking</li>
                        </ul>
                      </div>
                    </div>

                    {/* Play Button */}
                    {game.externalUrl && (
                      <div className="text-center">
                        <Link
                          href={game.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-cyan-500 text-black hover:bg-cyan-400 px-8 py-3 font-mono text-lg font-bold transition-all duration-200 border-2 border-cyan-500 hover:border-cyan-400"
                        >
                          PLAY {game.name.toUpperCase()}
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Educational Footer */}
          <div className="bg-gray-900 border border-cyan-500 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 font-mono text-cyan-400">
              Learning Through Play
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-cyan-300">
              <div>
                <h4 className="font-bold mb-2 text-cyan-400">Educational Integration</h4>
                <p>
                  Each game incorporates real weather science and phenomena, making learning fun and interactive.
                  Players discover weather concepts through gameplay mechanics and visual effects.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-cyan-400">Retro Gaming Experience</h4>
                <p>
                  Experience the authentic 16-bit arcade feel with modern educational content.
                  Classic gameplay mechanics combined with weather education create a unique learning experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 