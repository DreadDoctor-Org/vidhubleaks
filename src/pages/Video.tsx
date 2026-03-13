import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { VideoGrid } from '@/components/videos/VideoGrid';
import { useVideo, useRelatedVideos } from '@/hooks/useVideos';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareDialog } from '@/components/ShareDialog';
import {
  TopBannerAd,
  NativeBannerAd,
  StickyBottomAd,
  FloatingCornerAd,
  PopunderAd,
} from '@/components/ads';
import {
  Play,
  ThumbsUp,
  Eye,
  Calendar,
  Clock,
  Share2,
  Tag,
  MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Video() {
  const { id } = useParams<{ id: string }>();
  const { data: video, isLoading, error } = useVideo(id || '');
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tags, setTags] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const { data: relatedVideos } = useRelatedVideos(id || '', video?.category_id);

  useEffect(() => {
    if (video) {
      setLikesCount(video.likes_count || 0);
      recordView();
      if (user) checkIfLiked();
      fetchTags();
      setIsPlaying(false);
    }
  }, [video, user]);

  const recordView = async () => {
    if (!id) return;
    try {
      await supabase.from('views').insert({ video_id: id, user_id: user?.id || null });
    } catch (err) {
      console.error('Error recording view:', err);
    }
  };

  const checkIfLiked = async () => {
    if (!user || !id) return;
    const { data } = await supabase.from('likes').select('id').eq('video_id', id).eq('user_id', user.id).single();
    setIsLiked(!!data);
  };

  const fetchTags = async () => {
    if (!id) return;
    const { data } = await supabase.from('video_tags').select('tags(id, name, slug)').eq('video_id', id);
    if (data) setTags(data.map((vt: any) => vt.tags).filter(Boolean));
  };

  const handleLike = async () => {
    if (!user) { toast.error('Please sign in to like videos'); return; }
    if (!id) return;
    try {
      if (isLiked) {
        await supabase.from('likes').delete().eq('video_id', id).eq('user_id', user.id);
        setIsLiked(false);
        setLikesCount((p) => p - 1);
      } else {
        await supabase.from('likes').insert({ video_id: id, user_id: user.id });
        setIsLiked(true);
        setLikesCount((p) => p + 1);
      }
    } catch { toast.error('Failed to update like'); }
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
    setTimeout(() => videoRef.current?.play(), 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <TopBannerAd />
        <main className="mx-auto max-w-screen-xl px-3 md:px-6 py-6">
          <Skeleton className="w-full aspect-video rounded-lg mb-4" />
          <Skeleton className="h-7 w-2/3 mb-3" />
          <Skeleton className="h-4 w-1/3" />
        </main>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-screen-xl px-3 md:px-6 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
          <p className="text-muted-foreground mb-6">The video you're looking for doesn't exist or has been removed.</p>
          <Button asChild><Link to="/">Go Home</Link></Button>
        </main>
      </div>
    );
  }

  const videoFile = video.video_files?.find((f: any) => f.is_original) || video.video_files?.[0];
  const profile = video.profiles;
  const hasVideoFile = videoFile?.file_url;
  const hasEmbed = !!(video as any).embed_url;

  const pageTitle = `${video.title} - VidHub`;
  const pageDescription = video.description || `Watch ${video.title} on VidHub`;
  const getAbsoluteUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${window.location.origin}${url}`;
  };
  const thumbnailUrl = getAbsoluteUrl(video.thumbnail_url);
  const currentUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background pb-16">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={video.title} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="video.other" />
        <meta property="og:url" content={currentUrl} />
        {thumbnailUrl && <meta property="og:image" content={thumbnailUrl} />}
        {thumbnailUrl && <meta property="og:image:width" content="1280" />}
        {thumbnailUrl && <meta property="og:image:height" content="720" />}
        <meta name="twitter:card" content="player" />
        <meta name="twitter:title" content={video.title} />
        <meta name="twitter:description" content={pageDescription} />
        {thumbnailUrl && <meta name="twitter:image" content={thumbnailUrl} />}
        {hasVideoFile && <meta name="twitter:player" content={`${window.location.origin}/video/${id}`} />}
        {hasVideoFile && <meta name="twitter:player:width" content="1280" />}
        {hasVideoFile && <meta name="twitter:player:height" content="720" />}
        {hasVideoFile && <meta name="twitter:player:stream" content={videoFile.file_url} />}
        <meta name="twitter:site" content="@TweetPrince12" />
      </Helmet>

      <Header />
      <TopBannerAd />

      {/* Popunder script */}
      <PopunderAd />

      <main className="mx-auto max-w-screen-xl px-3 md:px-6 py-6 space-y-6">
        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer" onClick={!isPlaying ? handlePlayClick : undefined}>
          {hasEmbed ? (
            <iframe
              src={(video as any).embed_url}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen"
            />
          ) : hasVideoFile ? (
            <>
              {!isPlaying && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <img src={video.thumbnail_url || ''} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative rounded-full bg-primary/90 p-4 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                controls={isPlaying}
                className="w-full h-full"
                poster={video.thumbnail_url || undefined}
              >
                <source src={videoFile.file_url} type="video/mp4" />
              </video>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Video is being processed</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="space-y-4">
          <h1 className="text-xl md:text-2xl font-bold">{video.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{video.views_count?.toLocaleString() || 0} views</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
            {video.duration > 0 && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDuration(video.duration)}</span>}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant={isLiked ? 'default' : 'outline'} size="sm" onClick={handleLike} className="gap-1.5">
              <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)} className="gap-1.5">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Category & Tags */}
          <div className="flex flex-wrap gap-2">
            {video.categories && (
              <Link to={`/category/${video.categories.slug}`}>
                <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground">{video.categories.name}</Badge>
              </Link>
            )}
            {tags.map((tag) => (
              <Link key={tag.id} to={`/search?tag=${tag.slug}`}>
                <Badge variant="outline" className="gap-1 hover:bg-muted"><Tag className="h-3 w-3" />{tag.name}</Badge>
              </Link>
            ))}
          </div>

          {/* Creator */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">{profile?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{profile?.display_name || profile?.username || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">@{profile?.username}</p>
            </div>
          </div>

          {video.description && (
            <div className="p-3 rounded-lg bg-muted text-sm">
              <p className="whitespace-pre-wrap">{video.description}</p>
            </div>
          )}
        </div>

        {/* Native Ad */}
        <NativeBannerAd />

        {/* Related Videos */}
        <section aria-label="Related videos">
          <h2 className="text-lg font-bold mb-4">Related Videos</h2>
          <VideoGrid videos={relatedVideos} isLoading={!relatedVideos} skeletonCount={12} />
        </section>

        {/* Second Native Ad */}
        <NativeBannerAd />

        {/* Comments Placeholder */}
        <section className="border border-border rounded-lg p-6 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Comments</h3>
          <p className="text-sm text-muted-foreground">Comments coming soon</p>
        </section>
      </main>

      {/* Floating ads */}
      <FloatingCornerAd />
      <StickyBottomAd />

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} videoId={id || ''} title={video?.title || 'VidHub Video'} />
    </div>
  );
}
