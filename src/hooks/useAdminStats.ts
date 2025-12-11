import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [videosRes, usersRes, categoriesRes, pendingRes] = await Promise.all([
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      return {
        totalVideos: videosRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        totalCategories: categoriesRes.count ?? 0,
        pendingVideos: pendingRes.count ?? 0,
      };
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}
