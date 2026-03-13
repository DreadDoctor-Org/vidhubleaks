import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Eye, Clock, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  duration?: number;
  viewsCount?: number;
  createdAt: string;
  username?: string;
  categoryName?: string;
  isTrending?: boolean;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
}

export const VideoCard = forwardRef<HTMLAnchorElement, VideoCardProps>(
  ({ id, title, thumbnailUrl, duration = 0, viewsCount = 0, createdAt, username, categoryName, isTrending }, ref) => {
    return (
      <Link ref={ref} to={`/video/${id}`} className="group block">
        <Card className="overflow-hidden border-border/50 bg-card hover:border-primary/40 transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden flex-shrink-0">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <Play className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Play button on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
              <div className="rounded-full bg-primary/90 p-3 shadow-lg shadow-primary/30">
                <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
              </div>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
              <Clock className="h-2.5 w-2.5" />
              {formatDuration(duration)}
            </div>

            {/* Trending badge */}
            {isTrending && (
              <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded bg-destructive/90 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                <Flame className="h-2.5 w-2.5" />
                Trending
              </div>
            )}
          </div>

          {/* Info */}
          <CardContent className="p-2.5 flex-1 flex flex-col gap-1.5">
            <h3 className="font-medium line-clamp-2 text-sm leading-tight group-hover:text-primary transition-colors" title={title}>
              {title}
            </h3>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-auto">
              <span className="truncate max-w-[90px]">{username}</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  <Eye className="h-3 w-3" />
                  {formatViews(viewsCount)}
                </span>
                <span className="whitespace-nowrap hidden sm:inline">
                  {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }
);

VideoCard.displayName = 'VideoCard';
