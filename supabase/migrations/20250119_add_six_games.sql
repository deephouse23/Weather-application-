-- 16-Bit Weather Games System - Add 6 New Games
-- Migration to add Pong, Breakout, Connect Four, Space Invaders, Cloud Catcher, and Minesweeper

-- Insert 6 new games into the games table
INSERT INTO games (slug, title, description, category, difficulty, icon_emoji, html_file, featured, sort_order) VALUES
  ('pong', 'RETRO PONG', 'Classic two-paddle tennis game. First to 11 wins against AI opponent.', 'arcade', 'easy', '🏓', 'pong-game.html', false, 7),
  ('breakout', 'BRICK BREAKER', 'Classic brick-breaking action with colorful layers and increasing difficulty.', 'puzzle', 'easy', '🧱', 'breakout-game.html', true, 8),
  ('connect-four', 'CONNECT GRID', 'Strategic disc-dropping game. Connect 4 in a row to outsmart the AI.', 'strategy', 'easy', '🔴', 'connect-four-game.html', false, 9),
  ('space-invaders', 'INVADER ASSAULT', 'Defend Earth from waves of descending alien invaders. Shoot to survive!', 'arcade', 'medium', '👾', 'space-invaders-game.html', true, 10),
  ('cloud-catcher', 'WEATHER RUSH', 'Catch falling weather elements like clouds and rain. Avoid storms!', 'arcade', 'medium', '☁️', 'cloud-catcher-game.html', false, 11),
  ('minesweeper', 'MINE SWEEP', 'Classic logic puzzle with 3 difficulty levels. Flag mines and reveal safe cells.', 'puzzle', 'medium', '💣', 'minesweeper-game.html', false, 12)
ON CONFLICT (slug) DO NOTHING;
