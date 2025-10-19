/**
 * 16-Bit Weather Platform - Score Submit Modal
 *
 * Modal for submitting scores (especially for guest players)
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import { Trophy, User, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ScoreSubmission } from '@/lib/types/games';
import { submitScore } from '@/lib/services/gamesService';

interface ScoreSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameSlug: string;
  gameTitle: string;
  score: number;
  levelReached?: number;
  timePlayed?: number;
  metadata?: Record<string, any>;
  onSuccess?: () => void;
}

export default function ScoreSubmitModal({
  isOpen,
  onClose,
  gameSlug,
  gameTitle,
  score,
  levelReached,
  timePlayed,
  metadata,
  onSuccess,
}: ScoreSubmitModalProps) {
  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'dark') as ThemeType, 'weather');

  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (playerName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (playerName.trim().length > 20) {
      setError('Name must be 20 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submission: ScoreSubmission = {
        game_slug: gameSlug,
        player_name: playerName.trim(),
        score,
        level_reached: levelReached,
        time_played_seconds: timePlayed,
        metadata,
      };

      await submitScore(gameSlug, submission);
      setSuccess(true);

      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
        setPlayerName('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit score');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
    setPlayerName('');
    setError(null);
    setSuccess(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-md border-4',
          themeClasses.background,
          themeClasses.borderColor
        )}
      >
        {success ? (
          <div className="text-center py-8">
            <Trophy className={cn('w-16 h-16 mx-auto mb-4 animate-bounce', themeClasses.accentText)} />
            <h3 className={cn('text-2xl font-bold font-mono uppercase mb-2', themeClasses.headerText)}>
              SCORE SUBMITTED!
            </h3>
            <p className={cn('font-mono text-sm', themeClasses.text)}>
              Check the leaderboard to see your ranking
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle
                  className={cn('text-xl font-bold font-mono uppercase', themeClasses.headerText)}
                >
                  SUBMIT YOUR SCORE
                </DialogTitle>
                <button
                  onClick={handleSkip}
                  className={cn('p-1 transition-colors', themeClasses.text, themeClasses.hoverBg)}
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Game Info */}
              <div className={cn('p-4 border-2 text-center', themeClasses.borderColor)}>
                <p className={cn('text-xs font-mono uppercase mb-1', themeClasses.text)}>
                  {gameTitle}
                </p>
                <div className={cn('text-3xl font-bold font-mono', themeClasses.accentText)}>
                  {score.toLocaleString()}
                </div>
                {levelReached && (
                  <p className={cn('text-xs font-mono mt-1', themeClasses.text)}>
                    Level {levelReached}
                  </p>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="playerName"
                    className={cn('block text-sm font-mono font-bold uppercase mb-2', themeClasses.text)}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Your Name
                  </label>
                  <input
                    id="playerName"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name (2-20 chars)"
                    className={cn(
                      'w-full px-4 py-2 border-2 font-mono text-sm',
                      themeClasses.background,
                      themeClasses.borderColor,
                      themeClasses.text,
                      'focus:outline-none focus:ring-2 focus:ring-current',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    maxLength={20}
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <p className={cn('text-xs font-mono mt-1', themeClasses.text)}>
                    {playerName.length}/20 characters
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 border-2 border-red-500 text-red-500 text-sm font-mono text-center">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className={cn(
                      'flex-1 py-2 border-2 font-mono font-bold uppercase text-sm transition-colors',
                      themeClasses.background,
                      themeClasses.borderColor,
                      themeClasses.text,
                      themeClasses.hoverBg,
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    disabled={isSubmitting}
                  >
                    SKIP
                  </button>
                  <button
                    type="submit"
                    className={cn(
                      'flex-1 py-2 border-2 font-mono font-bold uppercase text-sm transition-all',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      themeClasses.accentBg,
                      themeClasses.borderColor
                    )}
                    disabled={isSubmitting || !playerName.trim()}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2 text-black">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        SUBMITTING...
                      </span>
                    ) : (
                      <span className="text-black">SUBMIT</span>
                    )}
                  </button>
                </div>

                {/* Info Text */}
                <p className={cn('text-xs font-mono text-center', themeClasses.text)}>
                  Sign up for an account to save your scores permanently
                </p>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
