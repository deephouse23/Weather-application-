/**
 * 16-Bit Weather Platform - Games Arcade Hub
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Retro games arcade with leaderboards and score tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import GameCard from '@/components/games/GameCard';
import { Search, Filter, Gamepad2, Trophy, Users, Zap } from 'lucide-react';
import type { Game, GameCategory } from '@/lib/types/games';
import { fetchGames } from '@/lib/services/gamesService';

export default function GamesPage() {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all');

  const categories: Array<{ value: GameCategory | 'all'; label: string; icon: string }> = [
    { value: 'all', label: 'ALL GAMES', icon: '🎮' },
    { value: 'arcade', label: 'ARCADE', icon: '👾' },
    { value: 'puzzle', label: 'PUZZLE', icon: '🧩' },
    { value: 'shooter', label: 'SHOOTER', icon: '🚀' },
    { value: 'strategy', label: 'STRATEGY', icon: '♟️' },
    { value: 'trivia', label: 'TRIVIA', icon: '❓' },
  ];

  // Load games on mount
  useEffect(() => {
    loadGames();
  }, []);

  // Filter games when filters change
  useEffect(() => {
    filterGames();
  }, [games, searchQuery, selectedCategory, selectedDifficulty]);

  const loadGames = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGames();
      setGames(data);
    } catch (err) {
      setError('Failed to load games');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterGames = () => {
    let filtered = [...games];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((game) => game.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((game) => game.difficulty === selectedDifficulty);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.title.toLowerCase().includes(query) ||
          game.description?.toLowerCase().includes(query)
      );
    }

    setFilteredGames(filtered);
  };

  const totalPlays = games.reduce((sum, game) => sum + game.play_count, 0);
  const featuredGames = games.filter((game) => game.featured);

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className={cn(
              'text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 font-mono uppercase tracking-wider',
              themeClasses.accentText,
              themeClasses.glow
            )}
          >
            RETRO ARCADE
          </h1>
          <p className={cn('text-base sm:text-lg font-mono mb-6', themeClasses.text)}>
            Classic games with modern leaderboards. Compete for high scores!
          </p>

          {/* Stats Bar */}
          <div
            className={cn(
              'grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-6 border-4 mb-8',
              themeClasses.borderColor,
              themeClasses.background
            )}
          >
            <div className="text-center">
              <Gamepad2 className={cn('w-6 h-6 mx-auto mb-2', themeClasses.accentText)} />
              <div className={cn('text-2xl font-bold font-mono', themeClasses.accentText)}>
                {games.length}
              </div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Games</div>
            </div>
            <div className="text-center">
              <Zap className={cn('w-6 h-6 mx-auto mb-2', themeClasses.accentText)} />
              <div className={cn('text-2xl font-bold font-mono', themeClasses.accentText)}>
                {totalPlays.toLocaleString()}
              </div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Total Plays</div>
            </div>
            <div className="text-center">
              <Trophy className={cn('w-6 h-6 mx-auto mb-2', themeClasses.accentText)} />
              <div className={cn('text-2xl font-bold font-mono', themeClasses.accentText)}>
                {featuredGames.length}
              </div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>Featured</div>
            </div>
            <div className="text-center">
              <Users className={cn('w-6 h-6 mx-auto mb-2', themeClasses.accentText)} />
              <div className={cn('text-2xl font-bold font-mono', themeClasses.accentText)}>FREE</div>
              <div className={cn('text-xs font-mono uppercase', themeClasses.text)}>To Play</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={cn('mb-8 p-4 border-4', themeClasses.borderColor, themeClasses.background)}>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search
                className={cn('absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4', themeClasses.text)}
              />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2 border-2 font-mono text-sm',
                  themeClasses.background,
                  themeClasses.borderColor,
                  themeClasses.text,
                  'focus:outline-none focus:ring-2 focus:ring-current'
                )}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className={cn('w-4 h-4', themeClasses.text)} />
              <span className={cn('text-xs font-mono font-bold uppercase', themeClasses.text)}>
                Category
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    'px-3 py-1 border-2 text-xs font-mono font-bold uppercase transition-all',
                    selectedCategory === cat.value
                      ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black`
                      : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`
                  )}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className={cn('w-4 h-4', themeClasses.text)} />
              <span className={cn('text-xs font-mono font-bold uppercase', themeClasses.text)}>
                Difficulty
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff as any)}
                  className={cn(
                    'px-3 py-1 border-2 text-xs font-mono font-bold uppercase transition-all',
                    selectedDifficulty === diff
                      ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black`
                      : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`
                  )}
                >
                  {diff.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Count */}
          {(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
            <div className={cn('mt-4 pt-4 border-t-2 text-sm font-mono', themeClasses.borderColor, themeClasses.text)}>
              Showing {filteredGames.length} of {games.length} games
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className={cn('ml-4 underline', themeClasses.accentText)}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={cn('text-center py-12', themeClasses.text)}>
            <div className="animate-pulse font-mono text-lg">LOADING GAMES...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-red-500">
            <p className="font-mono text-lg">{error}</p>
            <button
              onClick={loadGames}
              className={cn(
                'mt-4 px-4 py-2 border-2 font-mono font-bold',
                themeClasses.borderColor,
                themeClasses.text
              )}
            >
              RETRY
            </button>
          </div>
        )}

        {/* Games Grid */}
        {!isLoading && !error && (
          <>
            {filteredGames.length === 0 ? (
              <div className={cn('text-center py-12', themeClasses.text)}>
                <p className="font-mono text-lg mb-4">No games found</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                  className={cn('px-4 py-2 border-2 font-mono font-bold', themeClasses.borderColor)}
                >
                  CLEAR FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Info Footer */}
        {!isLoading && !error && filteredGames.length > 0 && (
          <div className={cn('mt-12 p-6 border-4 text-center', themeClasses.borderColor, themeClasses.background)}>
            <h3 className={cn('font-mono font-bold text-lg uppercase mb-4', themeClasses.headerText)}>
              ARCADE FEATURES
            </h3>
            <div className={cn('font-mono text-sm space-y-2', themeClasses.text)}>
              <p>Authentic 16-bit retro styling with neon effects</p>
              <p>Global leaderboards - compete with players worldwide</p>
              <p>Track your high scores as guest or registered user</p>
              <p>Daily and weekly leaderboard competitions</p>
              <p>Fully functional gameplay mechanics</p>
              <p>Responsive keyboard and touch controls</p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
