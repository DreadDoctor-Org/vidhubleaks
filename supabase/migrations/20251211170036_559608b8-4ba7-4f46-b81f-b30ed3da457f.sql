-- Add foreign key from videos.user_id to profiles.user_id
ALTER TABLE public.videos
ADD CONSTRAINT videos_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;