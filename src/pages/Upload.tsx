import { useState, useCallback } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload as UploadIcon, Video, X, Loader2, Tag, Plus, Image } from 'lucide-react';
import { toast } from 'sonner';
import { BannerAd728 } from '@/components/ads';

export default function Upload() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const createVideo = useCreateVideo();
  const { data: categories } = useCategories();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [autoThumbnailBlob, setAutoThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Tags
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Fetch existing tags on mount
  useState(() => {
    supabase.from('tags').select('*').order('name').then(({ data }) => {
      if (data) setExistingTags(data);
    });
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  };

  // Generate thumbnail from video at a specific time (e.g., 1 second in)
  const generateThumbnailFromVideo = useCallback((file: File): Promise<{ blob: Blob; duration: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        // Seek to 1 second or 10% of video, whichever is smaller
        const seekTime = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        // Create canvas and draw the frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, duration: Math.round(video.duration) });
            } else {
              reject(new Error('Could not generate thumbnail'));
            }
            URL.revokeObjectURL(video.src);
          },
          'image/jpeg',
          0.8
        );
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Error loading video'));
      };

      video.src = URL.createObjectURL(file);
    });
  }, []);

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      setVideoFile(file);
      
      // Auto-generate thumbnail
      try {
        toast.info('Generating thumbnail...');
        const { blob, duration: videoDuration } = await generateThumbnailFromVideo(file);
        setAutoThumbnailBlob(blob);
        setThumbnailPreview(URL.createObjectURL(blob));
        setDuration(videoDuration);
        toast.success('Thumbnail generated automatically!');
      } catch (err) {
        console.error('Error generating thumbnail:', err);
        toast.error('Could not auto-generate thumbnail. Please upload one manually.');
        
        // Still extract duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          setDuration(Math.round(video.duration));
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
      }
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
      setAutoThumbnailBlob(null); // Clear auto-generated
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setAutoThumbnailBlob(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
  };

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed) && selectedTags.length < 10) {
      setSelectedTags([...selectedTags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
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
      
      // Upload thumbnail (auto-generated or manual)
      let thumbnailUrl = null;
      const thumbnailToUpload = thumbnailFile || (autoThumbnailBlob ? new File([autoThumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' }) : null);
      
      if (thumbnailToUpload) {
        const thumbnailPath = `${user.id}/${Date.now()}-thumbnail.jpg`;
        const { error: thumbError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbnailPath, thumbnailToUpload);

        if (thumbError) throw thumbError;
        
        const { data: thumbUrlData } = supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath);
        thumbnailUrl = thumbUrlData.publicUrl;
      }
      setProgress(70);

      // Create video record - auto-publish for admins
      const videoRecord = await createVideo.mutateAsync({
        user_id: user.id,
        title,
        description,
        slug: generateSlug(title),
        thumbnail_url: thumbnailUrl,
        category_id: categoryId || null,
        duration,
        status: 'pending',
        published_at: null,
      });

      setProgress(80);

      // Create video file record with the correct video_id
      await supabase.from('video_files').insert({
        video_id: videoRecord.id,
        resolution: 'original',
        file_url: videoUrlData.publicUrl,
        file_size: videoFile.size,
        is_original: true,
      });

      setProgress(90);

      // Handle tags
      for (const tagName of selectedTags) {
        // Check if tag exists
        let tag = existingTags.find((t) => t.name.toLowerCase() === tagName);
        
        if (!tag) {
          // Create new tag
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ name: tagName, slug: generateSlug(tagName) })
            .select()
            .single();
          
          if (newTag) tag = newTag;
        }

        if (tag) {
          // Link tag to video
          await supabase.from('video_tags').insert({
            video_id: videoRecord.id,
            tag_id: tag.id,
          });
        }
      }

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
      
      {/* Top Banner Ad */}
      <BannerAd728 />
      
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
                      onClick={() => {
                        setVideoFile(null);
                        clearThumbnail();
                        setDuration(0);
                      }}
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
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Thumbnail {autoThumbnailBlob && !thumbnailFile && <Badge variant="secondary" className="text-xs">Auto-generated</Badge>}
                </Label>
                {thumbnailPreview ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-16 w-28 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        {thumbnailFile ? thumbnailFile.name : 'Auto-generated from video'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click below to replace with custom thumbnail
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearThumbnail}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <span className="text-sm text-muted-foreground">Click to upload custom thumbnail</span>
                    <span className="text-xs text-muted-foreground">(Auto-generated when video is selected)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                )}
                {thumbnailPreview && (
                  <label className="inline-flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline">
                    <Plus className="h-4 w-4" />
                    Upload different thumbnail
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

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags (for SEO & search)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add tags (press Enter)"
                    disabled={selectedTags.length >= 10}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim() || selectedTags.length >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 10 tags to help users find your video
                </p>
              </div>

              {/* Duration Display */}
              {duration > 0 && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">
                    Video Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              )}

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

      {/* Bottom Banner Ad */}
      <BannerAd728 />
    </div>
  );
}
