ALTER TABLE public.videos ALTER COLUMN views_count SET DEFAULT 1000000;
UPDATE public.videos SET views_count = 1000000 WHERE views_count IS NULL OR views_count < 1000000;