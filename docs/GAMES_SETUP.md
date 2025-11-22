# Games System Setup Guide

## Database Setup Required

The games system needs the Supabase database tables to be created before it will work. Currently, the `/api/games` endpoint returns a 500 error because the tables don't exist yet.

## Steps to Set Up Database

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor tab
3. Create a new query

### 2. Run the Migration Script

Copy and paste the entire contents of `supabase/migrations/20250119_games_system.sql` into the SQL editor and run it.

The migration will create:

**Tables:**
- `games` - Game metadata (title, slug, category, difficulty, etc.)
- `game_scores` - Individual score submissions (guest and authenticated)
- `user_game_stats` - Aggregated stats per user per game
- `daily_challenges` - Daily challenge system (future feature)

**Views:**
- `leaderboard_all_time` - All-time top scores
- `leaderboard_daily` - Daily top scores
- `leaderboard_weekly` - Weekly top scores

**Functions:**
- `increment_play_count` - Increments play count for a game

**Triggers:**
- Auto-update user stats when scores are submitted

**Row-Level Security (RLS):**
- Policies for guests to submit scores (rate-limited by IP)
- Policies for authenticated users to submit and view scores
- Admin policies for managing games

### 3. Verify the Migration

The migration includes seed data for all 6 games, so you don't need to run any additional SQL.

To verify the games were created, run this query:

```sql
SELECT slug, title, category, difficulty, play_count
FROM games
ORDER BY sort_order;
```

You should see 6 games:
- tetris (RETRO TETRIS)
- asteroids (RETRO ASTEROIDS)
- pacman (MAZE RUNNER)
- snake (RETRO SNAKE)
- missile-command (DEFENSE GRID)
- weather-trivia (WEATHER TRIVIA)

### 4. Test the API

After running the migration, test that everything works:

1. Check that tables exist:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```

2. Check that games were inserted:
   ```sql
   SELECT slug, title, category FROM games ORDER BY slug;
   ```

3. Test the API endpoint by visiting: `https://your-app.vercel.app/api/games`
   - Should return a JSON array of games
   - Should NOT return a 500 error

## Architecture Overview

### Score Submission Flow

**For Guests:**
1. Game ends and calls `GameBridge.submitScore()`
2. postMessage sent to parent window
3. Parent window catches event and shows `ScoreSubmitModal`
4. Guest enters player name
5. POST to `/api/games/[slug]/scores` with `is_guest: true`
6. Rate limited: 10 scores per game per day per IP address

**For Authenticated Users:**
1. Game ends and calls `GameBridge.submitScore()`
2. postMessage sent to parent window
3. Parent window auto-submits score (no modal needed)
4. POST to `/api/games/[slug]/scores` with user_id
5. No rate limit for authenticated users

### API Routes

- `GET /api/games` - List all active games (with filters)
- `POST /api/games` - Create new game (admin only, requires auth)
- `GET /api/games/[slug]/scores` - Get leaderboard (all-time, daily, weekly)
- `POST /api/games/[slug]/scores` - Submit score (guest or authenticated)
- `POST /api/games/[slug]/play` - Increment play count

### Components

- `components/games/GameCard.tsx` - Game display card with stats
- `components/games/Leaderboard.tsx` - Leaderboard with period toggle
- `components/games/ScoreSubmitModal.tsx` - Guest score submission modal
- `app/games/page.tsx` - Games hub with search and filters
- `app/games/[slug]/page.tsx` - Game detail page with iframe and leaderboard

### Game Files

All games are standalone HTML files in `public/`:
- `snake-game.html` - Classic Snake
- `tetris-game.html` - Tetris
- `asteroids-game.html` - Asteroids
- `pacman-game.html` - Pac-Man clone
- `missile-command-game.html` - Missile Command
- `weather-trivia-game.html` - Weather Trivia Quiz

Each game includes `game-bridge.js` and calls `GameBridge.submitScore()` when the game ends.

## Testing Checklist

After database setup:

- [ ] Visit `/games` - Games page loads without errors
- [ ] Games grid displays all 6 games
- [ ] Click a game - Detail page loads
- [ ] Game loads in iframe
- [ ] Play game and get a score
- [ ] Score submission modal appears (if not logged in)
- [ ] Submit score with player name
- [ ] Leaderboard updates with new score
- [ ] Play count increments
- [ ] Rate limiting works (try submitting 11 scores as guest)

## Current Status

**Build Status:** Vercel build PASSING after fixing:
- Supabase client import issue (`createClient` → `createServerSupabaseClient`)
- Next.js 15 async params issue (route params now use `Promise<{ slug: string }>`)

**Playwright Tests:** Passing (no games-specific tests exist)

**Next Steps:**
1. Run database migration in Supabase
2. Test games functionality end-to-end
3. Consider adding more games (Phase 3)
4. Consider implementing daily challenges feature

## Files Modified in This PR

**New Files:**
- `supabase/migrations/20250119_games_system.sql` - Database schema
- `lib/types/games.ts` - TypeScript types
- `lib/services/gamesService.ts` - Client-side API service
- `components/games/GameCard.tsx` - Game card component
- `components/games/Leaderboard.tsx` - Leaderboard component
- `components/games/ScoreSubmitModal.tsx` - Score submission modal
- `app/api/games/route.ts` - Games list API
- `app/api/games/[slug]/scores/route.ts` - Scores API
- `app/api/games/[slug]/play/route.ts` - Play count API
- `app/games/[slug]/page.tsx` - Game detail page
- `public/game-bridge.js` - iframe communication bridge

**Updated Files:**
- `app/games/page.tsx` - Redesigned games hub
- `public/snake-game.html` - Added GameBridge integration
- `public/tetris-game.html` - Added GameBridge integration
- `public/asteroids-game.html` - Added GameBridge integration
- `public/pacman-game.html` - Added GameBridge integration
- `public/missile-command-game.html` - Added GameBridge integration
- `public/weather-trivia-game.html` - Added GameBridge integration

## Known Limitations

1. **No Database Tables Yet** - Must run migration manually in Supabase
2. **No Deletion of Scores** - Once submitted, scores cannot be deleted by users
3. **No Admin Panel** - Game management requires SQL queries
4. **IP-Based Rate Limiting** - Can be bypassed with VPN (acceptable for MVP)
5. **Local High Scores** - Games maintain localStorage scores separately from database

## Future Enhancements

- Daily challenges system (database structure already exists)
- User achievements and badges
- Friend leaderboards
- Score replay/verification system
- Admin panel for game management
- More games (additional 14 for a total of 20)
