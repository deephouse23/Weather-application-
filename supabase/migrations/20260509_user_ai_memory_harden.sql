-- A6: harden user_ai_memory against direct-write cost amplification.
--
-- Phase 2 audit (2026-05-09) found that the live DB had user-facing INSERT/UPDATE
-- policies on user_ai_memory (added outside the original migration), letting an
-- authenticated user bypass the API's 10000-char trim by writing memory_notes
-- directly via the supabase JS client. The next chat call loads the bloated
-- notes into the system prompt verbatim and burns Anthropic input tokens
-- proportional to the bloat.
--
-- This migration:
--   1. Adds DB-level CHECK constraints so even a direct write cannot exceed
--      reasonable bounds (12000 bytes for notes, 50 entries for locations).
--      Caps are slightly above the API caps (10000 chars / 20 entries) to give
--      legitimate UTF-8 multibyte content headroom without enabling abuse.
--   2. Drops the user-facing INSERT and UPDATE policies, returning to the
--      original migration's intent: writes go through the API with the service
--      role only. SELECT and DELETE remain so users can still read and clear
--      their own memory client-side.
--
-- Pre-flight check (run before applying):
--   SELECT count(*), COALESCE(max(octet_length(memory_notes)), 0),
--          COALESCE(max(jsonb_array_length(recent_locations)), 0)
--   FROM public.user_ai_memory;
-- Expect max_notes_bytes <= 12000 and max_loc_count <= 50.
-- Verified pre-flight on 2026-05-09: 0 rows, no backfill required.
--
-- Guarded with `to_regclass` because a sibling migration in this same day
-- (20260509_drop_ai_chat_and_games_orphans.sql) drops user_ai_memory entirely.
-- On a fresh DB, supabase CLI applies migrations in lexicographic order, and
-- 'drop_*' sorts before 'user_*' — without this guard, this file's ALTER and
-- DROP POLICY statements would error against the now-missing table. The live
-- DB had this migration applied first (chronological order via Supabase MCP),
-- so the guard is purely defensive for fresh-DB rebuilds.
DO $$
BEGIN
  IF to_regclass('public.user_ai_memory') IS NOT NULL THEN
    ALTER TABLE public.user_ai_memory
      ADD CONSTRAINT memory_notes_size_check
      CHECK (octet_length(memory_notes) <= 12000);

    ALTER TABLE public.user_ai_memory
      ADD CONSTRAINT recent_locations_count_check
      CHECK (jsonb_array_length(recent_locations) <= 50);

    DROP POLICY IF EXISTS "Users can insert their own memory" ON public.user_ai_memory;
    DROP POLICY IF EXISTS "Users can update their own memory" ON public.user_ai_memory;
  END IF;
END $$;
