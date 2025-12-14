import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { useVideo } from '@/hooks/useVideos';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, 
  ThumbsUp, 
  Eye, 
  Calendar, 
  Clock, 
  Share2,
  Tag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { BannerAd728, NativeBannerAd, SidebarAd1, SidebarAd2 } from '@/components/ads';

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Video() {
  const { id } = useParams<{ id: string }>();
  const { data: video, isLoading, error } = useVideo(id || '');
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tags, setTags] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    if (video) {
      setLikesCount(video.likes_count || 0);
      // Record view
      recordView();
      // Check if user liked
      if (user) {
        checkIfLiked();
      }
      // Fetch tags
      fetchTags();
    }
  }, [video, user]);

  const recordView = async () => {
    if (!id) return;
    try {
      await supabase.from('views').insert({
        video_id: id,
        user_id: user?.id || null,
      });
    } catch (err) {
      console.error('Error recording view:', err);
    }
  };

  const checkIfLiked = async () => {
    if (!user || !id) return;
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('video_id', id)
      .eq('user_id', user.id)
      .single();
    setIsLiked(!!data);
  };

  const fetchTags = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('video_tags')
      .select('tags(id, name, slug)')
      .eq('video_id', id);
    if (data) {
      setTags(data.map((vt: any) => vt.tags).filter(Boolean));
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like videos');
      return;
    }
    if (!id) return;

    try {
      if (isLiked) {
        await supabase.from('likes').delete().eq('video_id', id).eq('user_id', user.id);
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        await supabase.from('likes').insert({ video_id: id, user_id: user.id });
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BannerAd728 />
        <main className="container px-4 py-8">
          <Skeleton className="w-full aspect-video rounded-lg mb-6" />
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-4 w-1/3" />
        </main>
        <BannerAd728 />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BannerAd728 />
        <main className="container px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">Video Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The video you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </main>
        <BannerAd728 />
      </div>
    );
  }

  // Find video file - prefer original, then any available file
  const videoFile = video.video_files?.find((f: any) => f.is_original) || video.video_files?.[0];
  const profile = video.profiles;
  const hasVideoFile = videoFile?.file_url;

  const pageTitle = `${video.title} - Vid Hub`;
  const pageDescription = video.description || `Watch ${video.title} on Vid Hub`;
  const thumbnailUrl = video.thumbnail_url || '';

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic Meta Tags for SEO and Twitter/X sharing */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={video.title} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="video.other" />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={video.title} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={thumbnailUrl} />
      </Helmet>

      <Header />
      
      {/* Top Banner Ad */}
      <BannerAd728 />
      
      <main className="container px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Container */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {hasVideoFile ? (
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={video.thumbnail_url || undefined}
                >
                  <source src={videoFile.file_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Video is being processed</p>
                    <p className="text-sm text-muted-foreground mt-2">Please check back later</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {video.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {video.views_count?.toLocaleString() || 0} views
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                </span>
                {video.duration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={isLiked ? 'default' : 'outline'}
                  onClick={handleLike}
                  className="gap-2"
                >
                  <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  {likesCount}
                </Button>
                <Button variant="outline" onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>

              {/* Category & Tags */}
              <div className="flex flex-wrap gap-2">
                {video.categories && (
                  <Link to={`/category/${video.categories.slug}`}>
                    <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground">
                      {video.categories.name}
                    </Badge>
                  </Link>
                )}
                {tags.map((tag) => (
                  <Link key={tag.id} to={`/search?tag=${tag.slug}`}>
                    <Badge variant="outline" className="gap-1 hover:bg-muted">
                      <Tag className="h-3 w-3" />
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link
                    to={`/channel/${profile?.username}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {profile?.display_name || profile?.username || 'Unknown'}
                  </Link>
                  <p className="text-sm text-muted-foreground">@{profile?.username}</p>
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-foreground whitespace-pre-wrap">{video.description}</p>
                </div>
              )}

              {/* Native Banner Ad below video */}
              <NativeBannerAd />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Sidebar Ad 1 */}
            <SidebarAd1 />
            
            <h3 className="font-semibold text-foreground">Related Videos</h3>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
            
            {/* Sidebar Ad 2 */}
            <SidebarAd2 />
          </div>
        </div>
      </main>

      {/* Bottom Banner Ad */}
      <BannerAd728 />
    </div>
  );
}
