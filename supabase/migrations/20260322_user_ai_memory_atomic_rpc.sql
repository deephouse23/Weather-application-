-- Atomic updates for AI memory (avoids lost concurrent appends / location merges).
-- Run after 20260321_user_ai_memory.sql. Called only from the API via service_role.

CREATE OR REPLACE FUNCTION append_user_ai_memory_fact(p_user_id uuid, p_fact text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  line text := left(trim(p_fact), 400);
BEGIN
  IF line = '' THEN
    RETURN;
  END IF;

  INSERT INTO user_ai_memory (user_id, memory_notes, recent_locations)
  VALUES (p_user_id, '- ' || line, '[]'::jsonb)
  ON CONFLICT (user_id) DO UPDATE SET
    memory_notes = right(
      CASE
        WHEN trim(user_ai_memory.memory_notes) = '' THEN '- ' || line
        ELSE trim(user_ai_memory.memory_notes) || E'\n- ' || line
      END,
      10000
    ),
    updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION add_user_ai_memory_location(p_user_id uuid, p_location text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  norm text := left(trim(p_location), 200);
  existing jsonb;
  merged text[] := ARRAY[]::text[];
  i int;
  item text;
  out_json jsonb;
BEGIN
  IF norm = '' THEN
    RETURN;
  END IF;

  INSERT INTO user_ai_memory (user_id, memory_notes, recent_locations)
  VALUES (p_user_id, '', '[]'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT recent_locations INTO existing
  FROM user_ai_memory
  WHERE user_id = p_user_id
  FOR UPDATE;

  merged := array_append(merged, norm);

  IF existing IS NOT NULL AND jsonb_typeof(existing) = 'array' THEN
    FOR i IN 0..COALESCE(jsonb_array_length(existing), 0) - 1 LOOP
      item := existing->>i;
      IF item IS NOT NULL AND lower(item) IS DISTINCT FROM lower(norm) THEN
        merged := array_append(merged, item);
      END IF;
    END LOOP;
  END IF;

  SELECT COALESCE(
    (SELECT jsonb_agg(elem)
     FROM (
       SELECT unnest(merged) AS elem
       LIMIT 20
     ) sub),
    '[]'::jsonb
  ) INTO out_json;

  UPDATE user_ai_memory
  SET recent_locations = out_json,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION append_user_ai_memory_fact(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION append_user_ai_memory_fact(uuid, text) TO service_role;

REVOKE ALL ON FUNCTION add_user_ai_memory_location(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION add_user_ai_memory_location(uuid, text) TO service_role;
