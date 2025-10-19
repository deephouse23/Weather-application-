/**
 * 16-Bit Weather Platform - Leaderboard Component
 *
 * Display high scores for a game
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { Trophy, Medal, Award, User, Clock } from 'lucide-react';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/lib/types/games';
import { fetchLeaderboard } from '@/lib/services/gamesService';

interface LeaderboardProps {
  gameSlug: string;
  initialScores?: LeaderboardEntry[];
  defaultPeriod?: LeaderboardPeriod;
  className?: string;
  showPeriodToggle?: boolean;
  maxEntries?: number;
}

export default function Leaderboard({
  gameSlug,
  initialScores = [],
  defaultPeriod = 'all-time',
  className,
  showPeriodToggle = true,
  maxEntries = 10,
}: LeaderboardProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  const [scores, setScores] = useState<LeaderboardEntry[]>(initialScores);
  const [period, setPeriod] = useState<LeaderboardPeriod>(defaultPeriod);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [period, gameSlug]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard(gameSlug, period, maxEntries);
      setScores(data);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Award className="w-4 h-4 text-amber-600" />;
    return <span className={cn('text-xs font-bold font-mono', themeClasses.text)}>#{rank}</span>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className={cn('p-4 border-4', themeClasses.borderColor, themeClasses.background)}>
        <h3 className={cn('text-xl font-bold font-mono uppercase mb-4', themeClasses.headerText)}>
          LEADERBOARD
        </h3>

        {/* Period Toggle */}
        {showPeriodToggle && (
          <div className="flex gap-2 flex-wrap">
            {(['all-time', 'daily', 'weekly'] as LeaderboardPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1 border-2 text-xs font-mono font-bold uppercase transition-all',
                  period === p
                    ? `${themeClasses.accentBg} ${themeClasses.borderColor} text-black`
                    : `${themeClasses.background} ${themeClasses.borderColor} ${themeClasses.text} ${themeClasses.hoverBg}`
                )}
              >
                {p === 'all-time' ? 'ALL TIME' : p.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scores List */}
      <div className={cn('border-4 border-t-0', themeClasses.borderColor, themeClasses.background)}>
        {isLoading && (
          <div className={cn('p-8 text-center', themeClasses.text)}>
            <div className="animate-pulse">Loading scores...</div>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-500">
            {error}
          </div>
        )}

        {!isLoading && !error && scores.length === 0 && (
          <div className={cn('p-8 text-center', themeClasses.text)}>
            <p className="font-mono">No scores yet. Be the first to play!</p>
          </div>
        )}

        {!isLoading && !error && scores.length > 0 && (
          <div className="divide-y divide-current">
            {scores.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  'p-3 flex items-center justify-between gap-3 transition-colors',
                  index < 3 ? 'bg-opacity-20 bg-current' : '',
                  themeClasses.hoverBg
                )}
              >
                {/* Rank & Player */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-mono font-bold truncate',
                        index < 3 ? themeClasses.accentText : themeClasses.text
                      )}>
                        {entry.player_name}
                      </span>
                      {entry.is_guest && (
                        <span className={cn(
                          'px-1 py-0.5 text-xs border font-mono',
                          themeClasses.borderColor,
                          themeClasses.text
                        )}>
                          GUEST
                        </span>
                      )}
                    </div>
                    <div className={cn('text-xs font-mono flex items-center gap-1', themeClasses.text)}>
                      <Clock className="w-3 h-3" />
                      {formatDate(entry.created_at)}
                    </div>
                  </div>
                </div>

                {/* Score & Level */}
                <div className="text-right flex-shrink-0">
                  <div className={cn(
                    'text-lg font-bold font-mono',
                    index < 3 ? themeClasses.accentText : themeClasses.headerText
                  )}>
                    {entry.score.toLocaleString()}
                  </div>
                  {entry.level_reached !== null && entry.level_reached > 0 && (
                    <div className={cn('text-xs font-mono', themeClasses.text)}>
                      LVL {entry.level_reached}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      {!isLoading && (
        <button
          onClick={loadLeaderboard}
          className={cn(
            'w-full p-2 border-4 border-t-0 text-xs font-mono font-bold uppercase transition-colors',
            themeClasses.background,
            themeClasses.borderColor,
            themeClasses.text,
            themeClasses.hoverBg
          )}
        >
          REFRESH
        </button>
      )}
    </div>
  );
}
