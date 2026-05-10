CREATE OR REPLACE FUNCTION public.increment_video_view(
  _video_id uuid,
  _user_agent text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _new_count bigint;
  _recent_exists boolean := false;
BEGIN
  IF _video_id IS NULL THEN
    RAISE EXCEPTION 'video_id required';
  END IF;

  -- Dedupe: if signed-in user viewed within last 30 minutes, don't increment counter
  IF _uid IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.views
      WHERE video_id = _video_id
        AND user_id = _uid
        AND created_at > now() - interval '30 minutes'
    ) INTO _recent_exists;
  END IF;

  -- Always log the raw view event
  INSERT INTO public.views (video_id, user_id, user_agent)
  VALUES (_video_id, _uid, _user_agent);

  IF _recent_exists THEN
    SELECT views_count INTO _new_count FROM public.videos WHERE id = _video_id;
    RETURN _new_count;
  END IF;

  -- Atomic increment using row-level UPDATE (postgres locks the row)
  UPDATE public.videos
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = _video_id
  RETURNING views_count INTO _new_count;

  RETURN _new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_video_view(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_video_view(uuid, text) TO anon, authenticated;