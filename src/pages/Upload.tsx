import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateVideo } from '@/hooks/useVideos';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload as UploadIcon, Video, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createVideo = useCreateVideo();
  const { data: categories } = useCategories();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!user) {
    navigate('/login');
    return null;
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setThumbnailFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Upload video file
      const videoPath = `${user.id}/${Date.now()}-${videoFile.name}`;
      const { error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoFile);

      if (videoError) throw videoError;
      setProgress(50);

      const { data: videoUrlData } = supabase.storage.from('videos').getPublicUrl(videoPath);
      
      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailPath = `${user.id}/${Date.now()}-${thumbnailFile.name}`;
        const { error: thumbError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbnailPath, thumbnailFile);

        if (thumbError) throw thumbError;
        
        const { data: thumbUrlData } = supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath);
        thumbnailUrl = thumbUrlData.publicUrl;
      }
      setProgress(75);

      // Create video record
      await createVideo.mutateAsync({
        user_id: user.id,
        title,
        description,
        slug: generateSlug(title),
        thumbnail_url: thumbnailUrl,
        category_id: categoryId || null,
        status: 'pending',
      });

      // Create video file record
      await supabase.from('video_files').insert({
        video_id: createVideo.data?.id,
        resolution: 'original',
        file_url: videoUrlData.publicUrl,
        file_size: videoFile.size,
        is_original: true,
      });

      setProgress(100);
      toast.success('Video uploaded successfully! It will be reviewed shortly.');
      navigate('/');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl px-4 py-8">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Upload Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video File */}
              <div className="space-y-2">
                <Label>Video File</Label>
                {videoFile ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    <Video className="h-5 w-5 text-primary" />
                    <span className="flex-1 truncate">{videoFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setVideoFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <Label>Thumbnail (optional)</Label>
                {thumbnailFile ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    <img
                      src={URL.createObjectURL(thumbnailFile)}
                      alt="Thumbnail preview"
                      className="h-10 w-16 object-cover rounded"
                    />
                    <span className="flex-1 truncate">{thumbnailFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setThumbnailFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <span className="text-sm text-muted-foreground">Click to upload thumbnail</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your video"
                  rows={4}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.filter(c => c.is_active).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Progress */}
              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Uploading... {progress}%
                  </p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full gradient-primary"
                disabled={uploading || !videoFile || !title}
              >
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
