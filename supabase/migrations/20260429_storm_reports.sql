-- Community storm observations (moderated). Approved rows are public read.

CREATE TABLE IF NOT EXISTS public.storm_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('hail', 'wind', 'tornado', 'flood', 'funnel', 'other')),
  description TEXT NOT NULL CHECK (char_length(description) <= 2000),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_name TEXT CHECK (location_name IS NULL OR char_length(location_name) <= 200),
  image_url TEXT CHECK (image_url IS NULL OR char_length(image_url) <= 800),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_storm_reports_status_created
  ON public.storm_reports(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_storm_reports_user_created
  ON public.storm_reports(user_id, created_at DESC);

ALTER TABLE public.storm_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved storm reports"
  ON public.storm_reports
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated insert pending storm reports"
  ON public.storm_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );

GRANT SELECT ON public.storm_reports TO anon, authenticated;
GRANT INSERT ON public.storm_reports TO authenticated;
GRANT ALL ON public.storm_reports TO service_role;
