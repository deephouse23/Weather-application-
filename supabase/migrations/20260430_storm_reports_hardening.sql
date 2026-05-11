-- Tighten storm_reports integrity and limit SELECT columns exposed to API roles (no user_id / status via broad SELECT *).

ALTER TABLE public.storm_reports DROP CONSTRAINT IF EXISTS storm_reports_description_check;
ALTER TABLE public.storm_reports ADD CONSTRAINT storm_reports_description_check
  CHECK (char_length(description) >= 10 AND char_length(description) <= 2000);

ALTER TABLE public.storm_reports DROP CONSTRAINT IF EXISTS storm_reports_lat_lon_check;
ALTER TABLE public.storm_reports ADD CONSTRAINT storm_reports_lat_lon_check
  CHECK (latitude >= -90 AND latitude <= 90 AND longitude >= -180 AND longitude <= 180);

REVOKE SELECT ON TABLE public.storm_reports FROM PUBLIC;
REVOKE SELECT ON TABLE public.storm_reports FROM anon;
REVOKE SELECT ON TABLE public.storm_reports FROM authenticated;

GRANT SELECT (
  id,
  report_type,
  description,
  latitude,
  longitude,
  location_name,
  image_url,
  occurred_at,
  created_at
) ON TABLE public.storm_reports TO anon, authenticated;
