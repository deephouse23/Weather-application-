-- M6: align user_preferences DB to API + UI (Phase 2 audit, 2026-05-09).
--
-- Background. The live DB schema, the three repo .sql files, and the API route
-- all disagree:
--   - DB has columns: id, user_id, theme, temperature_unit, wind_unit,
--     visible_metrics, updated_at, notifications_enabled, created_at.
--   - DB CHECK on theme allows only ('dark','miami','tron'). None of these
--     values exist in the current code's THEME_LIST.
--   - API PUT/POST writes pressure_unit, auto_location, email_alerts,
--     severe_weather_alerts, daily_forecast_email, news_ticker_enabled,
--     animation_enabled — none of which exist in the DB.
-- Effect: every theme save fails the CHECK; every preferences write that
-- includes one of the missing columns 500s with column-does-not-exist.
--
-- Decision (Option B + one carve-out). Of the seven API-only fields, only
-- auto_location is actually consumed by UI (app/profile/page.tsx,
-- hooks/useWeatherController.ts, lib/user-cache-service.ts). The other six
-- are dead weight in the API and should be dropped from the Zod schema and
-- handlers in the same change set. visible_metrics stays in the DB —
-- harmless, possibly future-use.
--
-- Existing data: 6 rows total (theme='dark' x5, theme='miami' x1). Both
-- legacy values are absent from THEME_LIST; this migration backfills them
-- to 'nord' (the closest current default).
--
-- Statement order matters: drop the old CHECK before backfilling, since the
-- backfill values are not in the old allow-list.

-- 1. Drop the old theme CHECK so the backfill UPDATE can run.
ALTER TABLE public.user_preferences
  DROP CONSTRAINT IF EXISTS user_preferences_theme_check;

-- 2. Backfill legacy theme values to a current THEME_LIST value.
UPDATE public.user_preferences
SET theme = 'nord'
WHERE theme NOT IN ('nord','synthwave84','dracula','cyberpunk','matrix');

-- 3. Update the column default. The handle_new_user() trigger inserts a row
-- per signup with no explicit theme, so the column default must satisfy the
-- new CHECK or every signup 500s.
ALTER TABLE public.user_preferences
  ALTER COLUMN theme SET DEFAULT 'nord';

-- 4. Add the one column the UI consumes.
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS auto_location BOOLEAN NOT NULL DEFAULT FALSE;

-- 5. Re-add the theme CHECK with the current THEME_LIST values.
ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_theme_check
  CHECK (theme IN ('nord','synthwave84','dracula','cyberpunk','matrix'));
