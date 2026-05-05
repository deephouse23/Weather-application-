-- Weather API Rate Limits Table
-- Persistent rate limiting for weather API endpoints (survives cold starts on serverless)
-- Keys on identifier (user:<id> or ip:<address>) instead of just user_id,
-- since weather endpoints serve both authenticated and anonymous users.

CREATE TABLE IF NOT EXISTS weather_rate_limits (
  identifier TEXT PRIMARY KEY,
  hourly_window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hourly_count INTEGER NOT NULL DEFAULT 0,
  burst_window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  burst_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS — the service role (used by API routes) bypasses RLS,
-- but we enable it as defense-in-depth for any accidental client-side queries.
ALTER TABLE weather_rate_limits ENABLE ROW LEVEL SECURITY;

-- No user-level SELECT policy: all reads/writes go through the service role.
-- Direct user access is not needed since rate limit checks are server-side only.

-- Grant service role full access (for the API routes)
GRANT ALL ON weather_rate_limits TO service_role;

-- Auto-cleanup: delete entries older than 2 hours via a periodic function.
-- This prevents unbounded growth. TTL-based cleanup replaces the old
-- in-memory setInterval that was lost on serverless cold starts.
CREATE OR REPLACE FUNCTION cleanup_weather_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM weather_rate_limits
  WHERE hourly_window_start < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_weather_rate_limits_hourly_window
  ON weather_rate_limits(hourly_window_start);

-- Schedule periodic cleanup via pg_cron (if available on the Supabase plan).
-- Runs every 10 minutes, deleting entries with hourly windows older than 2 hours.
-- This replaces the old in-memory setInterval that was lost on serverless cold starts.
-- If pg_cron is not available, the function can be called manually or via a cron
-- webhook from an external scheduler.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup_weather_rate_limits_job',
      '*/10 * * * *',
      $$ SELECT cleanup_weather_rate_limits(); $$
    );
    RAISE NOTICE 'Scheduled pg_cron job for weather_rate_limits cleanup';
  ELSE
    RAISE NOTICE 'pg_cron not available; cleanup_weather_rate_limits() function created but not scheduled. Call it manually or set up a webhook cron.';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not schedule pg_cron job: %', SQLERRM;
END;
$$;