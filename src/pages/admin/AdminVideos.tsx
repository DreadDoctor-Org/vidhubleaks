import { useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useVideos, useUpdateVideo, useDeleteVideo } from '@/hooks/useVideos';
import { VideoEditDialog } from '@/components/admin/VideoEditDialog';
import { AdminEmbedDialog } from '@/components/admin/AdminEmbedDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, Check, X, Trash2, Eye, Edit, Share2, Code, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  processing: 'bg-blue-500/20 text-blue-500',
  approved: 'bg-green-500/20 text-green-500',
  rejected: 'bg-red-500/20 text-red-500',
  published: 'bg-primary/20 text-primary',
};

export default function AdminVideos() {
  const [activeTab, setActiveTab] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editVideo, setEditVideo] = useState<any>(null);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const { data: videos, isLoading } = useVideos(activeTab === 'all' ? undefined : activeTab);
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();

  const handleShare = (video: any) => {
    const shareUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hello?id=${video.id}&site=${encodeURIComponent(window.location.origin)}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Video link copied to clipboard!');
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateVideo.mutateAsync({ 
        id, 
        status: status as 'pending' | 'processing' | 'approved' | 'rejected' | 'published',
        published_at: status === 'published' ? new Date().toISOString() : null,
      });
      toast.success(`Video ${status}`);
    } catch (error) {
      toast.error('Failed to update video status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVideo.mutateAsync(deleteId);
      toast.success('Video deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Videos</h1>
            <p className="text-muted-foreground">Manage and moderate all videos</p>
          </div>
          <Button onClick={() => setEmbedDialogOpen(true)} className="gap-2">
            <Code className="h-4 w-4" />
            Add Embed Video
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : videos?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No videos found
                      </TableCell>
                    </TableRow>
                  ) : (
                    videos?.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium max-w-[300px] truncate">
                          {video.title}
                        </TableCell>
                        <TableCell>
                          {(video.profiles as any)?.display_name ?? (video.profiles as any)?.username ?? 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[video.status]}>
                            {video.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{video.views_count?.toLocaleString()}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(`/video/${video.id}`, '_blank')}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditVideo(video)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(video)}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              {video.status !== 'published' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(video.id, 'published')}>
                                  <Check className="mr-2 h-4 w-4" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {video.status !== 'rejected' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(video.id, 'rejected')}>
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeleteId(video.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Video</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the video and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Video Dialog */}
        <VideoEditDialog
          video={editVideo}
          open={!!editVideo}
          onOpenChange={(open) => !open && setEditVideo(null)}
        />

        {/* Embed Video Dialog */}
        <AdminEmbedDialog
          open={embedDialogOpen}
          onOpenChange={setEmbedDialogOpen}
        />
      </main>
    </div>
  );
}
