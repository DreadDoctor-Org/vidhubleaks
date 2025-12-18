import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Eye, Clock } from 'lucide-react';
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
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const VideoCard = forwardRef<HTMLAnchorElement, VideoCardProps>(
  ({ id, title, thumbnailUrl, duration = 0, viewsCount = 0, createdAt, username, categoryName }, ref) => {
    return (
      <Link ref={ref} to={`/video/${id}`}>
        <Card className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
          <div className="relative aspect-video overflow-hidden flex-shrink-0">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
              <Clock className="h-3 w-3" />
              {formatDuration(duration)}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="rounded-full bg-primary p-3 glow-primary">
                <Play className="h-6 w-6 text-primary-foreground fill-primary-foreground" />
              </div>
            </div>
          </div>
          <CardContent className="p-3 flex-1 flex flex-col">
            <h3 className="font-medium line-clamp-1 text-sm mb-2 group-hover:text-primary transition-colors" title={title}>
              {title}
            </h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
              <span className="truncate max-w-[80px]">{username}</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {viewsCount.toLocaleString()}
                </span>
                <span className="whitespace-nowrap">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            {categoryName && (
              <span className="mt-2 text-xs w-fit inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                {categoryName}
              </span>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }
);

VideoCard.displayName = 'VideoCard';
