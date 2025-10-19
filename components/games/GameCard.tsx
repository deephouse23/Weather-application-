/**
 * 16-Bit Weather Platform - Game Card Component
 *
 * Display card for a game in the arcade hub
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { Gamepad2, Trophy, Clock } from 'lucide-react';
import type { Game } from '@/lib/types/games';

interface GameCardProps {
  game: Game;
  topScore?: number;
  userHighScore?: number;
  className?: string;
}

const difficultyColors = {
  easy: 'text-green-500 border-green-500',
  medium: 'text-yellow-500 border-yellow-500',
  hard: 'text-red-500 border-red-500',
};

const categoryLabels = {
  arcade: 'ARCADE',
  puzzle: 'PUZZLE',
  shooter: 'SHOOTER',
  strategy: 'STRATEGY',
  trivia: 'TRIVIA',
};

export default function GameCard({ game, topScore, userHighScore, className }: GameCardProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn(
        'group block p-6 border-4 transition-all duration-300',
        'hover:scale-105 hover:shadow-2xl relative overflow-hidden',
        themeClasses.background,
        themeClasses.borderColor,
        className
      )}
    >
      {/* Featured Badge */}
      {game.featured && (
        <div className={cn(
          'absolute top-0 right-0 px-3 py-1 text-xs font-bold font-mono',
          'border-l-2 border-b-2',
          themeClasses.accentBg,
          themeClasses.borderColor
        )}>
          FEATURED
        </div>
      )}

      {/* Game Icon */}
      <div className={cn(
        'w-20 h-20 flex items-center justify-center border-4 mb-4 mx-auto',
        'transition-all duration-300 group-hover:animate-pulse',
        themeClasses.accentBg,
        themeClasses.borderColor
      )}>
        <span className="text-4xl">{game.icon_emoji || '🎮'}</span>
      </div>

      {/* Game Title */}
      <h3 className={cn(
        'text-lg font-bold font-mono uppercase text-center mb-2 transition-colors',
        themeClasses.headerText,
        'group-hover:' + themeClasses.accentText
      )}>
        {game.title}
      </h3>

      {/* Category & Difficulty Tags */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className={cn(
          'px-2 py-1 border-2 text-xs font-mono font-bold',
          themeClasses.borderColor,
          themeClasses.text
        )}>
          {categoryLabels[game.category]}
        </span>
        {game.difficulty && (
          <span className={cn(
            'px-2 py-1 border-2 text-xs font-mono font-bold',
            difficultyColors[game.difficulty]
          )}>
            {game.difficulty.toUpperCase()}
          </span>
        )}
      </div>

      {/* Description */}
      {game.description && (
        <p className={cn(
          'text-sm font-mono text-center mb-4 line-clamp-2',
          themeClasses.text
        )}>
          {game.description}
        </p>
      )}

      {/* Stats */}
      <div className={cn(
        'grid grid-cols-2 gap-2 mb-4 pt-4 border-t-2',
        themeClasses.borderColor
      )}>
        {/* Play Count */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Gamepad2 className="w-3 h-3" />
            <span className={cn('text-xs font-mono font-bold', themeClasses.text)}>
              PLAYS
            </span>
          </div>
          <div className={cn('text-lg font-bold font-mono', themeClasses.accentText)}>
            {game.play_count.toLocaleString()}
          </div>
        </div>

        {/* Top Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-3 h-3" />
            <span className={cn('text-xs font-mono font-bold', themeClasses.text)}>
              TOP
            </span>
          </div>
          <div className={cn('text-lg font-bold font-mono', themeClasses.accentText)}>
            {topScore ? topScore.toLocaleString() : '-'}
          </div>
        </div>
      </div>

      {/* User High Score (if available) */}
      {userHighScore !== undefined && userHighScore > 0 && (
        <div className={cn(
          'flex items-center justify-center gap-2 py-2 border-t-2 mb-4',
          themeClasses.borderColor
        )}>
          <Clock className="w-3 h-3" />
          <span className={cn('text-xs font-mono', themeClasses.text)}>
            YOUR BEST: <strong className={themeClasses.accentText}>{userHighScore.toLocaleString()}</strong>
          </span>
        </div>
      )}

      {/* Play Button */}
      <div className={cn(
        'w-full py-3 text-center border-4 font-mono font-bold uppercase',
        'transition-all duration-200',
        'group-hover:scale-105',
        themeClasses.accentBg,
        themeClasses.borderColor
      )}>
        <span className="text-black">PLAY NOW</span>
      </div>
    </Link>
  );
}
