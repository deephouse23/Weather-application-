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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GameCardProps {
  game: Game;
  topScore?: number;
  userHighScore?: number;
  className?: string;
}

const difficultyColors = {
  easy: 'bg-green-500/10 text-green-500 border-green-500 hover:bg-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500 hover:bg-yellow-500/20',
  hard: 'bg-red-500/10 text-red-500 border-red-500 hover:bg-red-500/20',
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
    <Link href={`/games/${game.slug}`} className="block h-full">
      <Card
        className={cn(
          'h-full border-4 transition-all duration-300',
          'hover:scale-105 hover:shadow-2xl relative overflow-hidden group',
          themeClasses.background,
          themeClasses.borderColor,
          className
        )}
      >
        {/* Featured Badge */}
        {game.featured && (
          <div className={cn(
            'absolute top-0 right-0 px-3 py-1 text-xs font-bold font-mono z-10',
            'border-l-2 border-b-2',
            themeClasses.accentBg,
            themeClasses.borderColor
          )}>
            FEATURED
          </div>
        )}

        <CardHeader className="text-center pb-2">
          {/* Game Icon */}
          <div className={cn(
            'w-20 h-20 flex items-center justify-center border-4 mb-4 mx-auto rounded-md',
            'transition-all duration-300 group-hover:animate-pulse',
            themeClasses.accentBg,
            themeClasses.borderColor
          )}>
            <span className="text-4xl">{game.icon_emoji || '🎮'}</span>
          </div>

          <CardTitle className={cn(
            'text-lg font-bold font-mono uppercase transition-colors',
            themeClasses.headerText,
            'group-hover:' + themeClasses.accentText
          )}>
            {game.title}
          </CardTitle>

          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className={cn('font-mono font-bold', themeClasses.borderColor, themeClasses.text)}>
              {categoryLabels[game.category]}
            </Badge>
            {game.difficulty && (
              <Badge variant="outline" className={cn('font-mono font-bold', difficultyColors[game.difficulty])}>
                {game.difficulty.toUpperCase()}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
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
            'grid grid-cols-2 gap-2 pt-4 border-t-2',
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
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {/* User High Score (if available) */}
          {userHighScore !== undefined && userHighScore > 0 && (
            <div className={cn(
              'flex items-center justify-center gap-2 py-2 w-full',
              'border-t-2 border-dashed',
              themeClasses.borderColor
            )}>
              <Clock className="w-3 h-3" />
              <span className={cn('text-xs font-mono', themeClasses.text)}>
                YOUR BEST: <strong className={themeClasses.accentText}>{userHighScore.toLocaleString()}</strong>
              </span>
            </div>
          )}

          <Button
            className={cn(
              'w-full font-mono font-bold uppercase tracking-wider',
              'transition-all duration-200 group-hover:scale-105',
              themeClasses.accentBg,
              'text-black hover:opacity-90'
            )}
          >
            PLAY NOW
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
