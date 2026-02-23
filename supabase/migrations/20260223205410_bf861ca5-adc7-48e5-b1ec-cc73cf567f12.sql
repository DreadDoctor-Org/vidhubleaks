-- Add embed_url column for iframe-based videos
ALTER TABLE public.videos ADD COLUMN embed_url text;

-- Add index for quick lookup
CREATE INDEX idx_videos_embed_url ON public.videos (embed_url) WHERE embed_url IS NOT NULL;