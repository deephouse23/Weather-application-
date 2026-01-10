/**
 * 16-Bit Weather Platform - Games Service
 *
 * Client-side service for interacting with games API
 */

import type {
  Game,
  GameCategory,
  GameScore,
  LeaderboardEntry,
  ScoreSubmission,
  GamesFilters,
  LeaderboardPeriod,
  UserGameStats,
} from '@/lib/types/games';

const API_BASE = '/api/games';

/**
 * Fetch all games with optional filters
 */
export async function fetchGames(filters?: GamesFilters): Promise<Game[]> {
  const params = new URLSearchParams();

  if (filters?.category) params.append('category', filters.category);
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);
  if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
  if (filters?.search) params.append('search', filters.search);

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch games');
  }

  const data = await response.json();
  return data.games;
}

/**
 * Fetch a single game by slug
 */
export async function fetchGameBySlug(slug: string): Promise<Game> {
  const response = await fetch(`${API_BASE}/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch game');
  }

  const data = await response.json();
  return data.game;
}

/**
 * Fetch leaderboard for a game
 */
export async function fetchLeaderboard(
  slug: string,
  period: LeaderboardPeriod = 'all-time',
  limit: number = 100,
  offset: number = 0
): Promise<LeaderboardEntry[]> {
  const params = new URLSearchParams({
    period,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const response = await fetch(`${API_BASE}/${slug}/scores?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  const data = await response.json();
  return data.scores;
}

/**
 * Submit a score for a game
 */
export async function submitScore(
  slug: string,
  submission: ScoreSubmission
): Promise<GameScore> {
  const response = await fetch(`${API_BASE}/${slug}/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit score');
  }

  const data = await response.json();
  return data.score;
}

/**
 * Increment play count for a game
 */
export async function incrementPlayCount(slug: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${slug}/play`, {
    method: 'POST',
  });

  if (!response.ok) {
    console.error('Failed to increment play count');
  }
}

/**
 * Fetch user's game statistics (authenticated users only)
 */
export async function fetchUserGameStats(): Promise<UserGameStats[]> {
  const response = await fetch(`${API_BASE}/user/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch user stats');
  }

  const data = await response.json();
  return data.stats;
}

/**
 * Get featured games
 */
export async function fetchFeaturedGames(): Promise<Game[]> {
  return fetchGames({ featured: true });
}

/**
 * Get games by category
 */
export async function fetchGamesByCategory(category: GameCategory): Promise<Game[]> {
  return fetchGames({ category });
}
