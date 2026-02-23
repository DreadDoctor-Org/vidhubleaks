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

      // Get total videos
      const { count: totalVideos } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get published videos count
      const { count: publishedVideos } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      // Get pending videos count
      const { count: pendingVideos } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Today's stats
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count: todayViews } = await supabase
        .from('views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());

      const { count: todayLikes } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());

      const { count: todayComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());

      const { count: todaySignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());

      // Views by day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentViews } = await supabase
        .from('views')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const viewsByDay: Record<string, number> = {};
      recentViews?.forEach((view) => {
        const day = new Date(view.created_at).toLocaleDateString();
        viewsByDay[day] = (viewsByDay[day] || 0) + 1;
      });

      // Likes by day (last 30 days)
      const { data: recentLikes } = await supabase
        .from('likes')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const likesByDay: Record<string, number> = {};
      recentLikes?.forEach((like) => {
        const day = new Date(like.created_at).toLocaleDateString();
        likesByDay[day] = (likesByDay[day] || 0) + 1;
      });

      // Signups by day (last 30 days)
      const { data: recentSignups } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const signupsByDay: Record<string, number> = {};
      recentSignups?.forEach((p) => {
        const day = new Date(p.created_at).toLocaleDateString();
        signupsByDay[day] = (signupsByDay[day] || 0) + 1;
      });

      // Get top videos by views
      const { data: topVideos } = await supabase
        .from('videos')
        .select('id, title, views_count, likes_count')
        .order('views_count', { ascending: false })
        .limit(10);

      // Get top videos by likes
      const { data: topLikedVideos } = await supabase
        .from('videos')
        .select('id, title, views_count, likes_count')
        .order('likes_count', { ascending: false })
        .limit(10);

      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('videos')
        .select('id, title, status, created_at, profiles!videos_user_id_profiles_fkey(display_name)')
        .order('created_at', { ascending: false })
        .limit(10);

      // Videos by status
      const { data: allVideos } = await supabase
        .from('videos')
        .select('status');

      const videosByStatus: Record<string, number> = {};
      allVideos?.forEach((v) => {
        videosByStatus[v.status] = (videosByStatus[v.status] || 0) + 1;
      });

      // Build combined daily chart data (last 30 days)
      const allDays = new Set([
        ...Object.keys(viewsByDay),
        ...Object.keys(likesByDay),
        ...Object.keys(signupsByDay),
      ]);
      const dailyChart = Array.from(allDays)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((date) => ({
          date,
          views: viewsByDay[date] || 0,
          likes: likesByDay[date] || 0,
          signups: signupsByDay[date] || 0,
        }));

      return {
        totalViews: totalViews ?? 0,
        totalLikes: totalLikes ?? 0,
        totalComments: totalComments ?? 0,
        totalVideos: totalVideos ?? 0,
        totalUsers: totalUsers ?? 0,
        publishedVideos: publishedVideos ?? 0,
        pendingVideos: pendingVideos ?? 0,
        todayViews: todayViews ?? 0,
        todayLikes: todayLikes ?? 0,
        todayComments: todayComments ?? 0,
        todaySignups: todaySignups ?? 0,
        dailyChart,
        videosByStatus: Object.entries(videosByStatus).map(([status, count]) => ({ status, count })),
        topVideos: topVideos ?? [],
        topLikedVideos: topLikedVideos ?? [],
        recentActivity: recentActivity ?? [],
      };
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds for live stats
  });
}
