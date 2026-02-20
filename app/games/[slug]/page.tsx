/**
 * 16-Bit Weather Platform - Game Detail Page
 *
 * Individual game page with iframe and leaderboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils';
import PageWrapper from '@/components/page-wrapper';
import Leaderboard from '@/components/games/Leaderboard';
import ScoreSubmitModal from '@/components/games/ScoreSubmitModal';
import { ArrowLeft, Maximize2, Minimize2, Play } from 'lucide-react';
import type { Game, ScoreSubmission } from '@/lib/types/games';
import { fetchGames, incrementPlayCount } from '@/lib/services/gamesService';
import { useAuth } from '@/lib/auth';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { theme } = useTheme();
  const themeClasses = getComponentStyles((theme || 'nord') as ThemeType, 'weather');

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showScoreModal, setShowScoreModal] = useState(false);
  const [gameScore, setGameScore] = useState<ScoreSubmission | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    loadGame();
  }, [slug]);

  // Listen for score submissions from game iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GAME_SCORE_SUBMIT') {
        setGameScore({
          score: event.data.score,
          level: event.data.level,
          timePlayed: event.data.timePlayed,
          metadata: event.data.metadata,
        });

        // Show modal for guests or auto-submit for authenticated users
        if (!user) {
          setShowScoreModal(true);
        } else {
          // Auto-submit for authenticated users
          handleAuthenticatedScoreSubmit(event.data);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user]);

  const handleAuthenticatedScoreSubmit = async (scoreData: ScoreSubmission) => {
    if (!game || !user) {
      console.error('[Game Detail] Cannot submit - game or user missing:', { game: !!game, user: !!user });
      return;
    }

    try {
      const { submitScore } = await import('@/lib/services/gamesService');
      const result = await submitScore(game.slug, {
        game_slug: game.slug,
        player_name: user.email || 'Player',
        score: scoreData.score,
        level_reached: scoreData.level,
        time_played_seconds: scoreData.timePlayed,
        metadata: scoreData.metadata,
      });

      alert(`Score ${scoreData.score} submitted successfully!`);

      // Reload to update leaderboard
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error('[Game Detail] ❌ Failed to submit score:', err);
      alert(`Failed to submit score: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const loadGame = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const games = await fetchGames();
      const foundGame = games.find((g) => g.slug === slug);

      if (!foundGame) {
        setError('Game not found');
      } else {
        setGame(foundGame);
      }
    } catch (err) {
      setError('Failed to load game');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (game) {
      setGameStarted(true);

      // Increment play count
      try {
        await incrementPlayCount(game.slug);

        // Optimistically update local state
        setGame({ ...game, play_count: game.play_count + 1 });
      } catch (err) {
        console.error('[Game Detail] ❌ Failed to increment play count:', err);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className={cn('container mx-auto px-4 py-12 text-center', themeClasses.text)}>
          <div className="animate-pulse font-mono text-xl">LOADING GAME...</div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !game) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className={cn('font-mono text-xl mb-6', themeClasses.text)}>{error || 'Game not found'}</p>
          <button
            onClick={() => router.push('/games')}
            className={cn(
              'px-6 py-3 border-4 font-mono font-bold uppercase',
              themeClasses.accentBg,
              themeClasses.borderColor
            )}
          >
            <span className="text-black">BACK TO ARCADE</span>
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/games')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border-2 font-mono font-bold uppercase mb-4 transition-colors',
              themeClasses.background,
              themeClasses.borderColor,
              themeClasses.text,
              themeClasses.hoverBg
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO ARCADE
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className={cn(
                  'text-3xl md:text-4xl font-bold font-mono uppercase mb-2',
                  themeClasses.accentText,
                  themeClasses.glow
                )}
              >
                {game.icon_emoji} {game.title}
              </h1>
              {game.description && (
                <p className={cn('font-mono text-sm', themeClasses.text)}>{game.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              <span
                className={cn(
                  'px-3 py-1 border-2 text-xs font-mono font-bold uppercase',
                  themeClasses.borderColor,
                  themeClasses.text
                )}
              >
                {game.category}
              </span>
              {game.difficulty && (
                <span
                  className={cn(
                    'px-3 py-1 border-2 text-xs font-mono font-bold uppercase',
                    game.difficulty === 'easy' ? 'text-green-500 border-green-500' :
                    game.difficulty === 'medium' ? 'text-yellow-500 border-yellow-500' :
                    'text-red-500 border-red-500'
                  )}
                >
                  {game.difficulty}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Game and Leaderboard Layout */}
        <div className={cn('grid grid-cols-1', isFullscreen ? '' : 'lg:grid-cols-3 gap-6')}>
          {/* Game Area */}
          <div className={cn(isFullscreen ? 'col-span-1' : 'lg:col-span-2')}>
            <div
              className={cn(
                'border-4 relative',
                themeClasses.borderColor,
                themeClasses.background,
                isFullscreen ? 'fixed inset-0 z-50' : 'aspect-[4/3]'
              )}
            >
              {!gameStarted ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{game.icon_emoji}</div>
                    <h2 className={cn('text-2xl font-bold font-mono mb-2', themeClasses.headerText)}>
                      {game.title}
                    </h2>
                    <p className={cn('font-mono text-sm mb-4', themeClasses.text)}>
                      {game.play_count.toLocaleString()} PLAYS
                    </p>
                  </div>

                  <button
                    onClick={handleStartGame}
                    className={cn(
                      'group flex items-center gap-3 px-8 py-4 border-4 font-mono font-bold uppercase text-lg transition-all hover:scale-105',
                      themeClasses.accentBg,
                      themeClasses.borderColor
                    )}
                  >
                    <Play className="w-6 h-6 text-black group-hover:animate-pulse" />
                    <span className="text-black">START GAME</span>
                  </button>

                  <div className={cn('text-center font-mono text-xs', themeClasses.text)}>
                    <p>Use arrow keys or WASD to move</p>
                    <p>Press SPACE or ENTER to interact</p>
                  </div>
                </div>
              ) : (
                <>
                  <iframe
                    src={`/${game.html_file}`}
                    className="w-full h-full border-none"
                    title={game.title}
                    allow="autoplay"
                  />
                  <button
                    onClick={toggleFullscreen}
                    className={cn(
                      'absolute top-4 right-4 p-2 border-2 transition-colors',
                      themeClasses.background,
                      themeClasses.borderColor,
                      themeClasses.text,
                      themeClasses.hoverBg
                    )}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </>
              )}
            </div>

            {/* Game Info */}
            {!isFullscreen && (
              <div className={cn('mt-4 p-4 border-4', themeClasses.borderColor, themeClasses.background)}>
                <h3 className={cn('font-mono font-bold uppercase mb-2', themeClasses.headerText)}>
                  HOW TO PLAY
                </h3>
                <div className={cn('font-mono text-sm space-y-1', themeClasses.text)}>
                  <p>Arrow Keys or WASD - Move</p>
                  <p>Space or Enter - Action/Confirm</p>
                  <p>ESC or P - Pause</p>
                  <p>Your score will be automatically saved at game over</p>
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          {!isFullscreen && (
            <div className="lg:col-span-1">
              <Leaderboard gameSlug={slug} maxEntries={20} />
            </div>
          )}
        </div>

        {/* Score Submit Modal */}
        {game && gameScore && (
          <ScoreSubmitModal
            isOpen={showScoreModal}
            onClose={() => setShowScoreModal(false)}
            gameSlug={game.slug}
            gameTitle={game.title}
            score={gameScore.score}
            levelReached={gameScore.level}
            timePlayed={gameScore.timePlayed}
            metadata={gameScore.metadata}
            onSuccess={() => {
              // Refresh leaderboard after successful submission
              window.location.reload();
            }}
          />
        )}
      </div>
    </PageWrapper>
  );
}
