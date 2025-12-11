import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export function VideoCard({
  id,
  title,
  thumbnailUrl,
  duration = 0,
  viewsCount = 0,
  createdAt,
  username,
  categoryName,
}: VideoCardProps) {
  return (
    <Link to={`/video/${id}`}>
      <Card className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300">
        <div className="relative aspect-video overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
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
        <CardContent className="p-3">
          <h3 className="font-medium line-clamp-2 text-sm mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{username}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {viewsCount.toLocaleString()}
              </span>
              <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          {categoryName && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {categoryName}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
