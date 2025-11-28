/**
 * 16-Bit Weather Platform - Games Type Definitions
 *
 * TypeScript types for the retro games arcade system
 */

export type GameCategory = 'arcade' | 'puzzle' | 'shooter' | 'strategy' | 'trivia';
export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type LeaderboardPeriod = 'all-time' | 'daily' | 'weekly';

export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: GameCategory;
  difficulty: GameDifficulty | null;
  icon_emoji: string | null;
  html_file: string;
  is_active: boolean;
  play_count: number;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GameScore {
  id: string;
  game_id: string;
  user_id: string | null;
  player_name: string;
  score: number;
  level_reached: number | null;
  time_played_seconds: number | null;
  is_guest: boolean;
  metadata: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

export interface LeaderboardEntry extends GameScore {
  game_slug: string;
  game_title: string;
  rank: number;
}

export interface UserGameStats {
  id: string;
  user_id: string;
  game_id: string;
  total_plays: number;
  highest_score: number;
  average_score: number;
  total_time_played_seconds: number;
  last_played_at: string | null;
  achievements: string[];
  created_at: string;
  updated_at: string;
}

export interface DailyChallenge {
  id: string;
  game_id: string;
  challenge_date: string;
  goal_score: number | null;
  goal_description: string | null;
  bonus_multiplier: number;
  created_at: string;
}

export interface ScoreSubmission {
  game_slug?: string;
  player_name?: string;
  score: number;
  level?: number;
  level_reached?: number;
  timePlayed?: number;
  time_played_seconds?: number;
  metadata?: Record<string, any>;
}

export interface LeaderboardFilters {
  period?: LeaderboardPeriod;
  limit?: number;
  offset?: number;
}

export interface GamesFilters {
  category?: GameCategory;
  difficulty?: GameDifficulty;
  featured?: boolean;
  search?: string;
}

export interface GameWithStats extends Game {
  user_stats?: UserGameStats;
  top_score?: number;
  recent_scores_count?: number;
}
