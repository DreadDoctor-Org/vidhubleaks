import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 12;

export function useVideos(status?: string) {
  return useQuery({
    queryKey: ['videos', status],
    queryFn: async () => {
      let query = supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_user_id_profiles_fkey (username, display_name, avatar_url),
          categories (name, slug)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useInfiniteVideos(status?: string) {
  return useInfiniteQuery({
    queryKey: ['videos-infinite', status],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_user_id_profiles_fkey (username, display_name, avatar_url),
          categories (name, slug)
        `)
        .order('created_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (status) {
        query = query.eq('status', status as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
}

export function useTrendingVideos() {
  return useQuery({
    queryKey: ['videos-trending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_user_id_profiles_fkey (username, display_name, avatar_url),
          categories (name, slug)
        `)
        .eq('status', 'published' as any)
        .order('views_count', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    },
  });
}

export function useLatestVideos() {
  return useQuery({
    queryKey: ['videos-latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_user_id_profiles_fkey (username, display_name, avatar_url),
          categories (name, slug)
        `)
        .eq('status', 'published' as any)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    },
  });
}

export function useRelatedVideos(videoId: string, categoryId?: string | null) {
  return useQuery({
    queryKey: ['videos-related', videoId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_user_id_profiles_fkey (username, display_name, avatar_url),
          categories (name, slug)
        `)
        .eq('status', 'published' as any)
        .neq('id', videoId)
        .order('views_count', { ascending: false })
        .limit(12);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!videoId,
  });
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_user_id_profiles_fkey (username, display_name, avatar_url),
          categories (name, slug),
          video_files (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (video: any) => {
      const { data, error } = await supabase.from('videos').insert(video).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['videos'] }); },
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from('videos').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video', data.id] });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['videos'] }); },
  });
}
