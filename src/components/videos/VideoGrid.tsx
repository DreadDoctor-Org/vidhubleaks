import { forwardRef } from 'react';
import { VideoCard } from './VideoCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Video {
  id: string;
  title: string;
  thumbnail_url?: string | null;
  duration?: number;
  views_count?: number;
  created_at: string;
  profiles?: { username?: string | null; display_name?: string | null } | null;
  categories?: { name?: string } | null;
}

interface VideoGridProps {
  videos?: Video[];
  isLoading?: boolean;
}

export const VideoGrid = forwardRef<HTMLDivElement, VideoGridProps>(
  ({ videos, isLoading }, ref) => {
    if (isLoading) {
      return (
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      );
    }

    if (!videos?.length) {
      return (
        <div ref={ref} className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-muted-foreground">No videos found</p>
          <p className="text-sm text-muted-foreground">Check back later for new content</p>
        </div>
      );
    }

    return (
      <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            title={video.title}
            thumbnailUrl={video.thumbnail_url}
            duration={video.duration ?? 0}
            viewsCount={video.views_count ?? 0}
            createdAt={video.created_at}
            username={video.profiles?.display_name ?? video.profiles?.username ?? 'Anonymous'}
            categoryName={video.categories?.name}
          />
        ))}
      </div>
    );
  }
);

VideoGrid.displayName = 'VideoGrid';
