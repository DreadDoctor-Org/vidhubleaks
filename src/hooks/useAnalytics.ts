import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Get total views
      const { count: totalViews } = await supabase
        .from('views')
        .select('*', { count: 'exact', head: true });

      // Get total likes
      const { count: totalLikes } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true });

      // Get total comments
      const { count: totalComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      // Get views by day (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentViews } = await supabase
        .from('views')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Group by day
      const viewsByDay: Record<string, number> = {};
      recentViews?.forEach((view) => {
        const day = new Date(view.created_at).toLocaleDateString();
        viewsByDay[day] = (viewsByDay[day] || 0) + 1;
      });

      // Get top videos by views
      const { data: topVideos } = await supabase
        .from('videos')
        .select('id, title, views_count, likes_count')
        .order('views_count', { ascending: false })
        .limit(10);

      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('videos')
        .select('id, title, status, created_at, profiles!videos_user_id_profiles_fkey(display_name)')
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        totalViews: totalViews ?? 0,
        totalLikes: totalLikes ?? 0,
        totalComments: totalComments ?? 0,
        viewsByDay: Object.entries(viewsByDay).map(([date, count]) => ({ date, count })),
        topVideos: topVideos ?? [],
        recentActivity: recentActivity ?? [],
      };
    },
  });
}
