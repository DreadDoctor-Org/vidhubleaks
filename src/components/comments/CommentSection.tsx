import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useComments, useCreateComment, useDeleteComment, type Comment } from '@/hooks/useComments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Reply, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  videoId: string;
}

export function CommentSection({ videoId }: CommentSectionProps) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments(videoId);
  const createComment = useCreateComment();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await createComment.mutateAsync({ videoId, content: newComment.trim() });
      setNewComment('');
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const totalCount = comments ? countComments(comments) : 0;

  return (
    <section className="border border-border rounded-lg p-4 md:p-6 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        {totalCount} Comment{totalCount !== 1 ? 's' : ''}
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!newComment.trim() || createComment.isPending}>
              {createComment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">Sign in</Link> to leave a comment.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} videoId={videoId} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
      )}
    </section>
  );
}

function CommentItem({ comment, videoId, depth = 0 }: { comment: Comment; videoId: string; depth?: number }) {
  const { user } = useAuth();
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await createComment.mutateAsync({ videoId, content: replyText.trim(), parentId: comment.id });
      setReplyText('');
      setReplying(false);
      toast.success('Reply posted');
    } catch {
      toast.error('Failed to post reply');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment.mutateAsync({ commentId: comment.id, videoId });
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const profile = comment.profiles;
  const isOwner = user?.id === comment.user_id;

  return (
    <div className={depth > 0 ? 'ml-6 md:ml-10 border-l-2 border-border pl-4' : ''}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {profile?.username?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{profile?.display_name || profile?.username || 'User'}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
          <div className="flex gap-2 mt-2">
            {user && depth < 3 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setReplying(!replying)}>
                <Reply className="h-3 w-3" /> Reply
              </Button>
            )}
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleteComment.isPending}
              >
                <Trash2 className="h-3 w-3" /> Delete
              </Button>
            )}
          </div>

          {replying && (
            <form onSubmit={handleReply} className="mt-2 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="resize-none text-sm"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setReplying(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={!replyText.trim() || createComment.isPending}>
                  {createComment.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Reply
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} videoId={videoId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function countComments(comments: Comment[]): number {
  return comments.reduce((sum, c) => sum + 1 + (c.replies ? countComments(c.replies) : 0), 0);
}
