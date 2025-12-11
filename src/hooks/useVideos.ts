import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useVideos(status?: string) {
  return useQuery({
    queryKey: ['videos', status],
    queryFn: async () => {
      let query = supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (username, display_name, avatar_url),
          categories:category_id (name, slug)
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

export function useVideo(id: string) {
  return useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (username, display_name, avatar_url),
          categories:category_id (name, slug),
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
      const { data, error } = await supabase
        .from('videos')
        .insert(video)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
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
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}
