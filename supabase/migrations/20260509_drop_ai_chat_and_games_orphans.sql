-- Drop two orphaned feature surfaces:
--
-- 1. AI chat. The /api/chat path and its dependencies are removed from the
--    application — the only remaining Anthropic usage is the GitHub Actions
--    blog generator, which does not touch these tables.
--      - chat_messages       (per-user chat history)
--      - chat_rate_limits    (per-user 30/hour quota)
--      - user_ai_memory      (per-user durable facts/locations)
--    The append_user_ai_memory_fact / add_user_ai_memory_location RPCs that
--    were declared in 20260322_user_ai_memory_atomic_rpc.sql were never
--    actually applied to this database (verified by query against pg_proc on
--    2026-05-09), so no DROP FUNCTION statement is needed.
--
-- 2. Games feature (deleted in commit f624346, "feat: remove the games
--    feature"). DB tables left in place at the time per the commit message:
--    "drop manually in Supabase when ready". This is that drop.
--      - leaderboard_all_time, leaderboard_daily, leaderboard_weekly (views)
--      - user_game_stats, game_scores, daily_challenges, games (tables)
--
-- Migration history is append-only; the original creating migrations remain in
-- supabase/migrations/ for historical reference. Do not delete them.
--
-- Verified pre-flight (2026-05-09):
--   - All seven tables exist in production.
--   - All three views exist (note: leaderboard_all_time, with underscore —
--     the original audit ask used "leaderboard_alltime" which does not exist).
--   - No external FKs into any of these tables outside the dropped set.

-- IF EXISTS on every drop so the migration is idempotent on systems where
-- some of these tables/views are already absent (fresh DBs, partial states).
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_rate_limits CASCADE;
DROP TABLE IF EXISTS public.user_ai_memory CASCADE;

DROP VIEW IF EXISTS public.leaderboard_daily CASCADE;
DROP VIEW IF EXISTS public.leaderboard_weekly CASCADE;
DROP VIEW IF EXISTS public.leaderboard_all_time CASCADE;

DROP TABLE IF EXISTS public.user_game_stats CASCADE;
DROP TABLE IF EXISTS public.game_scores CASCADE;
DROP TABLE IF EXISTS public.daily_challenges CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;
