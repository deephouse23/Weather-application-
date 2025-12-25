-- 16-Bit Weather Games System
-- Database schema for retro arcade games with leaderboards
-- Supports both authenticated users and guest players

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: games
-- Stores metadata about each game in the arcade
-- ============================================================================
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('arcade', 'puzzle', 'shooter', 'strategy', 'trivia')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  icon_emoji TEXT,
  html_file TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  play_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for active games queries
CREATE INDEX IF NOT EXISTS idx_games_active ON games(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_featured ON games(featured) WHERE featured = true;

-- ============================================================================
-- TABLE: game_scores
-- Individual score entries for both users and guests
-- ============================================================================
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  level_reached INTEGER,
  time_played_seconds INTEGER,
  is_guest BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_game_scores_game ON game_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_user ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_created ON game_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_score ON game_scores(game_id, score DESC);

-- ============================================================================
-- TABLE: daily_challenges
-- Daily game challenges with specific goals
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  challenge_date DATE UNIQUE NOT NULL,
  goal_score INTEGER,
  goal_description TEXT,
  bonus_multiplier DECIMAL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date DESC);

-- ============================================================================
-- TABLE: user_game_stats
-- Aggregate statistics for each user per game
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  total_plays INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  average_score DECIMAL(10, 2),
  total_time_played_seconds INTEGER DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_user_game_stats_user ON user_game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_stats_game ON user_game_stats(game_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Games: Public read, admin write
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active games"
  ON games FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage games"
  ON games FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Game Scores: Public read, authenticated and guest write
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scores"
  ON game_scores FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert scores"
  ON game_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_guest = false);

CREATE POLICY "Guests can insert scores"
  ON game_scores FOR INSERT
  TO anon
  WITH CHECK (is_guest = true AND user_id IS NULL);

-- Daily Challenges: Public read, admin write
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage daily challenges"
  ON daily_challenges FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- User Game Stats: Users can only see/modify their own
ALTER TABLE user_game_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON user_game_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own stats"
  ON user_game_stats FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update user_game_stats after score submission
CREATE OR REPLACE FUNCTION update_user_game_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update stats for authenticated users
  IF NEW.user_id IS NOT NULL AND NEW.is_guest = false THEN
    INSERT INTO user_game_stats (
      user_id,
      game_id,
      total_plays,
      highest_score,
      average_score,
      total_time_played_seconds,
      last_played_at
    )
    VALUES (
      NEW.user_id,
      NEW.game_id,
      1,
      NEW.score,
      NEW.score,
      COALESCE(NEW.time_played_seconds, 0),
      NOW()
    )
    ON CONFLICT (user_id, game_id)
    DO UPDATE SET
      total_plays = user_game_stats.total_plays + 1,
      highest_score = GREATEST(user_game_stats.highest_score, NEW.score),
      average_score = (user_game_stats.average_score * user_game_stats.total_plays + NEW.score) / (user_game_stats.total_plays + 1),
      total_time_played_seconds = user_game_stats.total_time_played_seconds + COALESCE(NEW.time_played_seconds, 0),
      last_played_at = NOW(),
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats after score insertion
CREATE TRIGGER trigger_update_user_game_stats
  AFTER INSERT ON game_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_user_game_stats();

-- Function to increment game play count
CREATE OR REPLACE FUNCTION increment_play_count(game_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE games
  SET play_count = play_count + 1
  WHERE slug = game_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA: Insert existing games
-- ============================================================================

INSERT INTO games (slug, title, description, category, difficulty, icon_emoji, html_file, featured, sort_order) VALUES
  ('tetris', 'RETRO TETRIS', 'Complete Tetris with all 7 piece types, rotation, line clearing, and level progression.', 'puzzle', 'medium', '🔲', 'tetris-game.html', true, 1),
  ('asteroids', 'RETRO ASTEROIDS', 'Classic space shooter with physics-based movement, asteroid splitting, and level progression.', 'shooter', 'medium', '🚀', 'asteroids-game.html', true, 2),
  ('pacman', 'MAZE RUNNER', 'Navigate mazes, collect dots, and avoid ghosts in this classic arcade game.', 'arcade', 'medium', '👾', 'pacman-game.html', true, 3),
  ('snake', 'RETRO SNAKE', 'Grow your snake by eating food while avoiding walls and your own tail.', 'arcade', 'easy', '🐍', 'snake-game.html', false, 4),
  ('missile-command', 'DEFENSE GRID', 'Defend your cities from incoming missiles with strategic shooting.', 'shooter', 'hard', '💥', 'missile-command-game.html', false, 5),
  ('weather-trivia', 'WEATHER TRIVIA', 'Test your weather knowledge with 3 difficulty levels and timed questions.', 'trivia', 'medium', '⛈️', 'weather-trivia-game.html', false, 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- VIEWS FOR LEADERBOARDS
-- ============================================================================

-- All-time leaderboard view
CREATE OR REPLACE VIEW leaderboard_all_time AS
SELECT
  gs.id,
  gs.game_id,
  g.slug as game_slug,
  g.title as game_title,
  gs.player_name,
  gs.score,
  gs.level_reached,
  gs.is_guest,
  gs.created_at,
  ROW_NUMBER() OVER (PARTITION BY gs.game_id ORDER BY gs.score DESC, gs.created_at ASC) as rank
FROM game_scores gs
JOIN games g ON gs.game_id = g.id
WHERE g.is_active = true;

-- Daily leaderboard view
CREATE OR REPLACE VIEW leaderboard_daily AS
SELECT
  gs.id,
  gs.game_id,
  g.slug as game_slug,
  g.title as game_title,
  gs.player_name,
  gs.score,
  gs.level_reached,
  gs.is_guest,
  gs.created_at,
  ROW_NUMBER() OVER (PARTITION BY gs.game_id ORDER BY gs.score DESC, gs.created_at ASC) as rank
FROM game_scores gs
JOIN games g ON gs.game_id = g.id
WHERE g.is_active = true
  AND gs.created_at >= CURRENT_DATE
  AND gs.created_at < CURRENT_DATE + INTERVAL '1 day';

-- Weekly leaderboard view
CREATE OR REPLACE VIEW leaderboard_weekly AS
SELECT
  gs.id,
  gs.game_id,
  g.slug as game_slug,
  g.title as game_title,
  gs.player_name,
  gs.score,
  gs.level_reached,
  gs.is_guest,
  gs.created_at,
  ROW_NUMBER() OVER (PARTITION BY gs.game_id ORDER BY gs.score DESC, gs.created_at ASC) as rank
FROM game_scores gs
JOIN games g ON gs.game_id = g.id
WHERE g.is_active = true
  AND gs.created_at >= DATE_TRUNC('week', CURRENT_DATE)
  AND gs.created_at < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week';
