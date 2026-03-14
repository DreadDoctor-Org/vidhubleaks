import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  replies?: Comment[];
}

export function useComments(videoId: string) {
  return useQuery({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_profiles_fkey (username, display_name, avatar_url)
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return buildCommentTree((data || []) as unknown as Comment[]);
    },
    enabled: !!videoId,
  });
}

function buildCommentTree(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  const roots: Comment[] = [];

  comments.forEach((c) => {
    map.set(c.id, { ...c, replies: [] });
  });

  comments.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ videoId, content, parentId }: { videoId: string; content: string; parentId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.from('comments').insert({
        video_id: videoId,
        user_id: user.id,
        content,
        parent_id: parentId || null,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.video_id] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, videoId }: { commentId: string; videoId: string }) => {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      return { videoId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.videoId] });
    },
  });
}
