-- App-side monthly cap for FlightAware AeroAPI calls.
--
-- Why: AeroAPI's free tier ($5/month credit) charges the credit card on file
-- once exhausted, and FlightAware does NOT offer vendor-side spending limits
-- on the personal tier. We need an app-level fail-closed guard.
--
-- Pattern: a single-row-per-month counter with an atomic
-- increment-conditional-on-cap RPC. The conditional UPDATE either bumps the
-- counter and returns the new value, or does nothing (cap reached) and
-- returns NULL. The provider treats NULL as "fall through to mock."
--
-- Service-role-only — no user-facing policies. The provider's supabase admin
-- client is the sole writer; no need to expose any of this to authenticated
-- users.

CREATE TABLE IF NOT EXISTS public.aeroapi_usage (
  month text PRIMARY KEY,                 -- 'YYYY-MM' in UTC
  query_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.aeroapi_usage ENABLE ROW LEVEL SECURITY;
-- No CREATE POLICY statements — RLS is on but no policies means nothing
-- under any user role is permitted. Only service_role bypasses RLS.

GRANT SELECT, INSERT, UPDATE ON public.aeroapi_usage TO service_role;

-- Atomic increment-with-cap RPC. Returns the new query_count if the row was
-- inserted or the conditional UPDATE fired (i.e. count was strictly less
-- than the cap before the bump), NULL otherwise. The single-statement form
-- means the read, compare, and write happen inside one MVCC snapshot — no
-- TOCTOU window between the cap check and the increment.
CREATE OR REPLACE FUNCTION public.increment_aeroapi_usage(p_cap integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month text := to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM');
  v_count integer;
BEGIN
  INSERT INTO public.aeroapi_usage (month, query_count)
  VALUES (v_month, 1)
  ON CONFLICT (month) DO UPDATE
  SET query_count = aeroapi_usage.query_count + 1,
      updated_at = now()
  WHERE aeroapi_usage.query_count < p_cap
  RETURNING query_count INTO v_count;

  RETURN v_count;  -- NULL means the conditional UPDATE didn't fire (cap hit)
END;
$$;

-- Supabase auto-grants EXECUTE on new functions to anon, authenticated, and
-- service_role. `REVOKE ... FROM PUBLIC` is necessary but NOT sufficient — the
-- explicit grants to anon/authenticated have to be stripped too. Without this,
-- an authenticated user could call the RPC with p_cap=0 to inflate the
-- counter and DoS the AeroAPI feature for everyone.
REVOKE ALL ON FUNCTION public.increment_aeroapi_usage(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_aeroapi_usage(integer) TO service_role;
